import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common'

interface AppointmentCreatedPayload {
  event: {
    session_variables: Record<string, unknown>
    op: string
    data: {
      old: null
      new: {
        id: string
        patient_id: string
        schedule_to: string
        status: string
        created_at: string
      }
    }
  }
  created_at: string
  id: string
  delivery_info: {
    max_retries: number
    current_retry: number
  }
  trigger: {
    name: string
  }
  table: {
    schema: string
    name: string
  }
}

interface CronTriggerPayload {
  scheduled_time: string
  payload: Record<string, unknown>
  created_at: string
  id: string
}

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  @Post('appointment-created')
  @HttpCode(HttpStatus.OK)
  async handleAppointmentCreated(@Body() payload: AppointmentCreatedPayload): Promise<{ message: string }> {
    try {
      this.logger.log('=== APPOINTMENT CREATED WEBHOOK ===')
      this.logger.log(`Trigger: ${payload.trigger.name}`)
      this.logger.log(`Event ID: ${payload.id}`)
      this.logger.log(`Operation: ${payload.event.op}`)
      this.logger.log(`Table: ${payload.table.schema}.${payload.table.name}`)

      const appointmentData = payload.event.data.new
      this.logger.log('Appointment Details:')
      this.logger.log(`- ID: ${appointmentData.id}`)
      this.logger.log(`- Patient ID: ${appointmentData.patient_id}`)
      this.logger.log(`- Scheduled To: ${appointmentData.schedule_to}`)
      this.logger.log(`- Status: ${appointmentData.status}`)
      this.logger.log(`- Created At: ${appointmentData.created_at}`)

      this.logger.log('===============================')

      return { message: 'Appointment creation logged successfully' }
    } catch (error) {
      this.logger.error(`Error processing appointment created webhook: ${error.message}`, error.stack)
      throw error
    }
  }

  @Post('scheduled-appointments-cron')
  @HttpCode(HttpStatus.OK)
  async handleScheduledAppointmentsCron(@Body() payload: CronTriggerPayload): Promise<{ message: string }> {
    try {
      this.logger.log('=== SCHEDULED APPOINTMENTS CRON TRIGGER ===')
      this.logger.log(`Event ID: ${payload.id}`)
      this.logger.log(`Scheduled Time: ${payload.scheduled_time}`)
      this.logger.log(`Created At: ${payload.created_at}`)

      // Here we would normally query the database for scheduled appointments
      // For demonstration, we'll log that the cron was triggered
      this.logger.log('Processing all appointments with status "scheduled"')
      this.logger.log('This would typically query the database and process each scheduled appointment')

      this.logger.log('=======================================')

      return { message: 'Scheduled appointments processed successfully' }
    } catch (error) {
      this.logger.error(`Error processing scheduled appointments cron: ${error.message}`, error.stack)
      throw error
    }
  }

  @Post('appointment-reminder')
  @HttpCode(HttpStatus.OK)
  async handleAppointmentReminder(@Body() payload: any): Promise<{ message: string }> {
    try {
      this.logger.log('=== APPOINTMENT REMINDER WEBHOOK ===')
      this.logger.log(`Event ID: ${payload.id || 'N/A'}`)
      this.logger.log(`Scheduled Time: ${payload.scheduled_time || 'N/A'}`)

      if (payload.payload) {
        const reminderPayload = JSON.parse(payload.payload)
        this.logger.log('Reminder Details:')
        this.logger.log(`- Appointment ID: ${reminderPayload.appointment_id}`)
        this.logger.log(`- Patient ID: ${reminderPayload.patient_id}`)
        this.logger.log(`- Scheduled For: ${reminderPayload.scheduled_for}`)
        this.logger.log(`- Reminder Type: ${reminderPayload.reminder_type}`)
      }

      this.logger.log('This is where you would send notifications (email, SMS, push, etc.)')
      this.logger.log('===================================')

      return { message: 'Appointment reminder processed successfully' }
    } catch (error) {
      this.logger.error(`Error processing appointment reminder: ${error.message}`, error.stack)
      throw error
    }
  }
}
