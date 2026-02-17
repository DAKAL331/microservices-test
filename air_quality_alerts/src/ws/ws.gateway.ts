import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class WsGateway {
  private readonly logger = new Logger(WsGateway.name);

  @WebSocketServer()
  server: Server;

  emit(event: string, payload: any) {
    this.logger.log(`Broadcasting event "${event}"`);
    this.server.emit(event, payload);
  }
}
