import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as amazonmq from 'aws-cdk-lib/aws-amazonmq';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class AirQualityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ──────────────────────────────────────────
    // Networking
    // ──────────────────────────────────────────
    const vpc = new ec2.Vpc(this, 'AirQualityVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // ──────────────────────────────────────────
    // Database — PostgreSQL (RDS)
    // ──────────────────────────────────────────
    const database = new rds.DatabaseInstance(this, 'AirQualityDb', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      databaseName: 'air_quality_alerts',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // ──────────────────────────────────────────
    // Messaging — Amazon MQ (RabbitMQ)
    // ──────────────────────────────────────────
    const rabbitmqSg = new ec2.SecurityGroup(this, 'RabbitMqSg', {
      vpc,
      description: 'Security group for Amazon MQ RabbitMQ broker',
    });
    rabbitmqSg.addIngressRule(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(5671));

    const broker = new amazonmq.CfnBroker(this, 'RabbitMqBroker', {
      brokerName: 'air-quality-rabbitmq',
      engineType: 'RABBITMQ',
      engineVersion: '3.13',
      hostInstanceType: 'mq.t3.micro',
      deploymentMode: 'SINGLE_INSTANCE',
      publiclyAccessible: false,
      autoMinorVersionUpgrade: true,
      subnetIds: [vpc.privateSubnets[0].subnetId],
      securityGroups: [rabbitmqSg.securityGroupId],
      users: [
        {
          username: 'admin',
          password: 'change-me-in-secrets-manager',
        },
      ],
    });

    // ──────────────────────────────────────────
    // Compute — ECS Fargate Cluster
    // ──────────────────────────────────────────
    const cluster = new ecs.Cluster(this, 'AirQualityCluster', {
      vpc,
      clusterName: 'air-quality-cluster',
    });

    // --- Alerts Service ---
    const alertsTaskDef = new ecs.FargateTaskDefinition(this, 'AlertsTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    alertsTaskDef.addContainer('AlertsContainer', {
      image: ecs.ContainerImage.fromAsset('../air_quality_alerts'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'alerts' }),
      environment: {
        PORT: '3000',
        RABBITMQ_QUEUE: 'air_quality_alerts',
      },
      portMappings: [{ containerPort: 3000 }],
    });

    const alertsService = new ecs.FargateService(this, 'AlertsService', {
      cluster,
      taskDefinition: alertsTaskDef,
      desiredCount: 1,
    });

    database.connections.allowDefaultPortFrom(alertsService);

    // --- Collector Service ---
    const collectorTaskDef = new ecs.FargateTaskDefinition(this, 'CollectorTaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    collectorTaskDef.addContainer('CollectorContainer', {
      image: ecs.ContainerImage.fromAsset('../air_quality_collector'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'collector' }),
      environment: {
        RABBITMQ_QUEUE: 'air_quality_alerts',
        POLL_INTERVAL_MS: '10000',
        PORT: '3000',
      },
      portMappings: [{ containerPort: 3000 }],
    });

    new ecs.FargateService(this, 'CollectorService', {
      cluster,
      taskDefinition: collectorTaskDef,
      desiredCount: 1,
    });

    // ──────────────────────────────────────────
    // Dashboard — S3 + CloudFront
    // ──────────────────────────────────────────
    const dashboardBucket = new s3.Bucket(this, 'DashboardBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new cloudfront.Distribution(this, 'DashboardCdn', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(dashboardBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
    });

    new s3deploy.BucketDeployment(this, 'DeployDashboard', {
      sources: [s3deploy.Source.asset('../dashboard/dist')],
      destinationBucket: dashboardBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // ──────────────────────────────────────────
    // Outputs
    // ──────────────────────────────────────────
    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Dashboard CloudFront URL',
    });

    new cdk.CfnOutput(this, 'RabbitMqBrokerId', {
      value: broker.ref,
      description: 'Amazon MQ Broker ID',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.dbInstanceEndpointAddress,
      description: 'RDS PostgreSQL endpoint',
    });
  }
}
