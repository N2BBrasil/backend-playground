import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { Appointment } from '../interfaces'

const CREATE_APPOINTMENT_MUTATION = `
  mutation CreateAppointment($patient_id: uuid!, $schedule_to: timestamptz!, $status: String!) {
    insert_appointment_one(object: {
      patient_id: $patient_id,
      schedule_to: $schedule_to,
      status: $status
    }) {
      id
      patient_id
      schedule_to
      status
      created_at
    }
  }
`

const CREATE_SCHEDULED_EVENT_MUTATION = `
  mutation CreateScheduledEvent($webhook_url: String!, $scheduled_time: timestamptz!, $payload: json!) {
    create_scheduled_event(args: {
      webhook: $webhook_url,
      schedule_at: $scheduled_time,
      payload: $payload
    }) {
      event_id
    }
  }
`

const GET_SCHEDULED_APPOINTMENTS_QUERY = `
  query GetScheduledAppointments {
    appointment(where: {status: {_eq: "scheduled"}}) {
      id
      patient_id
      schedule_to
      status
      created_at
    }
  }
`

@Injectable()
export class HasuraGraphqlService {
  private readonly logger = new Logger(HasuraGraphqlService.name)
  private readonly hasuraEndpoint: string
  private readonly hasuraAdminSecret: string

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.hasuraEndpoint = this.configService.get('HASURA_GRAPHQL_ENDPOINT', 'http://localhost:8080/v1/graphql')
    this.hasuraAdminSecret = this.configService.get('HASURA_GRAPHQL_ADMIN_SECRET', '12345')

    this.logger.log(`GraphQL client initialized with endpoint: ${this.hasuraEndpoint}`)
  }

  async createAppointment(patient_id: string, schedule_to: string, status: string = 'scheduled'): Promise<Appointment> {
    try {
      this.logger.log(`Creating appointment for patient ${patient_id} at ${schedule_to}`)

      const variables = {
        patient_id,
        schedule_to,
        status,
      }

      const response = await firstValueFrom(
        this.httpService.post(
          this.hasuraEndpoint,
          {
            query: CREATE_APPOINTMENT_MUTATION,
            variables,
          },
          {
            headers: {
              'x-hasura-admin-secret': this.hasuraAdminSecret,
              'Content-Type': 'application/json',
            },
          },
        ),
      )

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`)
      }

      const appointment = response.data.data.insert_appointment_one
      this.logger.log(`Appointment created with ID: ${appointment.id}`)
      return appointment
    } catch (error) {
      this.logger.error(`Error creating appointment: ${error.message}`, error.stack)
      throw new Error(`Failed to create appointment: ${error.message}`)
    }
  }

  async createScheduledEvent(webhookUrl: string, scheduledTime: string, payload: Record<string, any>): Promise<string> {
    try {
      this.logger.log(`Creating scheduled event for ${scheduledTime}`)

      const variables = {
        webhook_url: webhookUrl,
        scheduled_time: scheduledTime,
        payload: JSON.stringify(payload),
      }

      // Note: This mutation might not work directly with Hasura as scheduled events
      // creation via GraphQL might not be available. This is for demonstration.
      // In practice, you might need to use Hasura's REST API for scheduled events.

      this.logger.log(`Scheduled event would be created with payload: ${JSON.stringify(variables)}`)

      // For now, we'll simulate the event creation
      const eventId = `event_${Date.now()}`
      this.logger.log(`Simulated scheduled event created with ID: ${eventId}`)
      return eventId
    } catch (error) {
      this.logger.error(`Error creating scheduled event: ${error.message}`, error.stack)
      throw new Error(`Failed to create scheduled event: ${error.message}`)
    }
  }

  async getScheduledAppointments(): Promise<Appointment[]> {
    try {
      this.logger.log('Fetching scheduled appointments')

      const response = await firstValueFrom(
        this.httpService.post(
          this.hasuraEndpoint,
          {
            query: GET_SCHEDULED_APPOINTMENTS_QUERY,
          },
          {
            headers: {
              'x-hasura-admin-secret': this.hasuraAdminSecret,
              'Content-Type': 'application/json',
            },
          },
        ),
      )

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`)
      }

      const appointments = response.data.data.appointment
      this.logger.log(`Found ${appointments.length} scheduled appointments`)
      return appointments
    } catch (error) {
      this.logger.error(`Error fetching scheduled appointments: ${error.message}`, error.stack)
      throw new Error(`Failed to fetch scheduled appointments: ${error.message}`)
    }
  }
}
