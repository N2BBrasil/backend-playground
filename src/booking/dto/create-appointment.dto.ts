import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator'

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'Patient ID is required' })
  @IsUUID('4', { message: 'Patient ID must be a valid UUID' })
  patient_id: string

  @IsNotEmpty({ message: 'Schedule date is required' })
  @IsDateString({}, { message: 'Schedule date must be a valid ISO 8601 date string' })
  schedule_to: string
}
