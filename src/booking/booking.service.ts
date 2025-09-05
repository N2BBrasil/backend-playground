import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { AppointmentResponseDto, CreateAppointmentDto } from './dto'
import { Appointment } from './interfaces'
import { HasuraGraphqlService } from './services/hasura-graphql.service'

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name)

  constructor(private readonly hasuraService: HasuraGraphqlService) {}

  async createAppointment(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const { patient_id, schedule_to } = createAppointmentDto

    try {
      // Validate that the appointment is scheduled for a future date
      const appointmentDate = new Date(schedule_to)
      const now = new Date()

      if (appointmentDate <= now) {
        throw new BadRequestException('Appointment must be scheduled for a future date')
      }

      this.logger.log(`Creating appointment for patient ${patient_id} at ${schedule_to}`)

      // Create the appointment in the database via Hasura GraphQL
      const appointment = await this.hasuraService.createAppointment(patient_id, schedule_to, 'scheduled')

      // Schedule a one-off event 5 minutes before the appointment
      await this.scheduleReminderEvent(appointment)

      // Convert to response DTO
      const response: AppointmentResponseDto = {
        id: appointment.id,
        patient_id: appointment.patient_id,
        schedule_to: appointment.schedule_to,
        status: appointment.status,
        created_at: appointment.created_at,
      }

      this.logger.log(`Appointment created successfully with ID: ${appointment.id}`)
      return response
    } catch (error) {
      this.logger.error(`Error creating appointment: ${error.message}`, error.stack)
      throw error
    }
  }

  private async scheduleReminderEvent(appointment: Appointment): Promise<void> {
    const appointmentDate = new Date(appointment.schedule_to)
    const reminderDate = new Date(appointmentDate.getTime() - 5 * 60 * 1000) // 5 minutes before

    // Check if reminder should be scheduled (only if it's in the future)
    if (reminderDate > new Date()) {
      this.logger.log(`Scheduling reminder event for appointment ${appointment.id} at ${reminderDate.toISOString()}`)

      const webhookUrl = 'http://host.docker.internal:3000/webhooks/appointment-reminder'
      const payload = {
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        scheduled_for: appointment.schedule_to,
        reminder_type: 'appointment_reminder',
      }

      try {
        const eventId = await this.hasuraService.createScheduledEvent(webhookUrl, reminderDate.toISOString(), payload)

        this.logger.log(`Reminder scheduled: Event ${eventId} created for appointment ${appointment.id}`)
      } catch (error) {
        this.logger.warn(`Failed to schedule reminder for appointment ${appointment.id}: ${error.message}`)
      }
    } else {
      this.logger.warn(`Cannot schedule reminder for appointment ${appointment.id} - reminder time is in the past`)
    }
  }

  async getAppointmentById(id: string): Promise<AppointmentResponseDto | null> {
    this.logger.log(`Fetching appointment with ID: ${id}`)

    // Here we would normally fetch from database via Hasura GraphQL
    // For now, returning null as placeholder
    return null
  }

  async getScheduledAppointments(): Promise<AppointmentResponseDto[]> {
    try {
      this.logger.log('Fetching all scheduled appointments')

      const appointments = await this.hasuraService.getScheduledAppointments()

      // Convert to response DTOs
      const response = appointments.map(appointment => ({
        id: appointment.id,
        patient_id: appointment.patient_id,
        schedule_to: appointment.schedule_to,
        status: appointment.status,
        created_at: appointment.created_at,
      }))

      this.logger.log(`Found ${response.length} scheduled appointments`)
      return response
    } catch (error) {
      this.logger.error(`Error fetching scheduled appointments: ${error.message}`, error.stack)
      throw error
    }
  }
}
