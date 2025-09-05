import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, ValidationPipe } from '@nestjs/common'
import { BookingService } from './booking.service'
import { AppointmentResponseDto, CreateAppointmentDto } from './dto'

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('appointments')
  @HttpCode(HttpStatus.CREATED)
  async createAppointment(
    @Body(ValidationPipe) { input: createAppointmentDto }: { input: CreateAppointmentDto },
  ): Promise<AppointmentResponseDto> {
    return this.bookingService.createAppointment(createAppointmentDto)
  }

  @Get('appointments/:id')
  async getAppointment(@Param('id') id: string): Promise<AppointmentResponseDto | null> {
    return this.bookingService.getAppointmentById(id)
  }

  @Get('appointments/scheduled')
  async getScheduledAppointments(): Promise<AppointmentResponseDto[]> {
    return this.bookingService.getScheduledAppointments()
  }
}
