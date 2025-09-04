# Playground

## Tables and Relationships

Create a new table called `patient` with the following columns:

- id: string
- name: string
- email: string

Create a new table called `appointment` with the following columns:

- id: string
- patient_id: string
- schedule_to: timestamp with timezone
- status: string
- created_at: timestamp with timezone

Create relationships

- appointment => patient
- patient => appointments

## Triggers
Create a event trigger that logs the details of the appointment to the console when an appointment is created.
Create a cron trigger that logs all appointments with status `scheduled` to the console.

## Actions
Book Appointment: Create an action that creates an appointment and schedules a One-off Schedule Event five minutes before the appointment date.

### NestJS

Create a module named `booking` with a service that contains the business logic for the appointment creation and scheduling.

    Inputs:
        patient_id
        schedule_to

Create a validation for the inputs of the appointment creation.
