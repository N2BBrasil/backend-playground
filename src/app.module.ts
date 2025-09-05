import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BookingModule } from './booking/booking.module'
import { GlobalModule } from './global/global.module'

@Module({
  imports: [GlobalModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
