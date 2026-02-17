import { Module } from '@nestjs/common';
import { MessagingModule } from '../messaging';
import { PublisherService } from './publisher.service';

@Module({
  imports: [MessagingModule],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}
