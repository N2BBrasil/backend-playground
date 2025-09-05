import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BookingController } from './booking.controller'
import { BookingService } from './booking.service'
import { HasuraGraphqlService } from './services/hasura-graphql.service'
import { WebhookController } from './webhook/webhook.controller'

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [BookingController, WebhookController],
  providers: [BookingService, HasuraGraphqlService],
  exports: [BookingService],
})
export class BookingModule {}
