# Implementação do Sistema de Agendamentos

Esta implementação atende aos requisitos documentados no `PLAYGROUND.md`, criando um sistema completo de agendamentos com Hasura + NestJS.

## ✅ Requisitos Implementados

### 1. Tabelas e Relacionamentos

**Tabela `patient`:**
- `id`: UUID (chave primária)
- `name`: string (obrigatório)
- `email`: string (obrigatório e único)

**Tabela `appointment`:**
- `id`: UUID (chave primária)
- `patient_id`: UUID (chave estrangeira para patient)
- `schedule_to`: timestamp with timezone
- `status`: string (default: 'scheduled')
- `created_at`: timestamp with timezone (default: now())

**Relacionamentos:**
- `appointment.patient` (object relationship)
- `patient.appointments` (array relationship)

### 2. Triggers

**Event Trigger:** `appointment_created`
- Triggered quando um appointment é criado
- Webhook: `http://host.docker.internal:3000/webhooks/appointment-created`
- Loga detalhes do appointment no console

**Cron Trigger:** `log_scheduled_appointments`
- Executa a cada 5 minutos (`*/5 * * * *`)
- Webhook: `http://host.docker.internal:3000/webhooks/scheduled-appointments-cron`
- Loga appointments com status 'scheduled'

### 3. Action: Book Appointment

**GraphQL Action:** `bookAppointment`
- **Inputs:** `patient_id` (UUID), `schedule_to` (timestamptz)
- **Output:** `AppointmentOutput` (id, patient_id, schedule_to, status, created_at)
- **Handler:** `http://host.docker.internal:3000/booking/appointments`
- Cria appointment e agenda evento de lembrete 5 minutos antes

### 4. Módulo NestJS: Booking

**Estrutura criada:**
```
src/booking/
├── dto/
│   ├── create-appointment.dto.ts
│   ├── appointment-response.dto.ts
│   └── index.ts
├── interfaces/
│   ├── patient.interface.ts
│   ├── appointment.interface.ts
│   └── index.ts
├── services/
│   └── hasura-graphql.service.ts
├── webhook/
│   └── webhook.controller.ts
├── booking.controller.ts
├── booking.service.ts
└── booking.module.ts
```

**Validação implementada:**
- `patient_id`: UUID obrigatório
- `schedule_to`: Data ISO 8601 obrigatória e deve ser futura

## 🚀 Como Usar

### 1. Configurar Environment

Crie um arquivo `.env` baseado no `.env.example`:

```env
HASURA_GRAPHQL_ENDPOINT=http://localhost:8080/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=secret
HASURA_GRAPHQL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
PORT=3000
```

### 2. Iniciar Hasura

```bash
yarn hasura:up
```

### 3. Aplicar Migrações

```bash
yarn hasura:console
```

No console do Hasura, execute as migrações para criar as tabelas.

### 4. Iniciar NestJS

```bash
yarn start:dev
```

### 5. Testar a API

**Criar appointment via REST API:**
```bash
POST http://localhost:3000/booking/appointments
Content-Type: application/json

{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "schedule_to": "2024-12-31T15:30:00.000Z"
}
```

**Usar a Action via GraphQL:**
```graphql
mutation {
  bookAppointment(
    patient_id: "123e4567-e89b-12d3-a456-426614174000",
    schedule_to: "2024-12-31T15:30:00.000Z"
  ) {
    id
    patient_id
    schedule_to
    status
    created_at
  }
}
```

## 📋 Endpoints Criados

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/booking/appointments` | Cria novo appointment |
| GET | `/booking/appointments/:id` | Busca appointment por ID |
| GET | `/booking/appointments/scheduled` | Lista appointments agendados |
| POST | `/webhooks/appointment-created` | Webhook para appointment criado |
| POST | `/webhooks/scheduled-appointments-cron` | Webhook para cron de appointments |
| POST | `/webhooks/appointment-reminder` | Webhook para lembrete de appointment |

## 🔧 Funcionalidades Implementadas

### Validação Completa
- Validação de UUID para patient_id
- Validação de data futura para schedule_to
- Validação de formato ISO 8601 para datas

### Integração GraphQL
- Service para comunicação com Hasura
- Mutations para criar appointments
- Queries para buscar dados
- Tratamento de erros

### Sistema de Logs
- Logs detalhados para todos os eventos
- Rastreamento de appointments criados
- Monitoramento de cron triggers
- Logs de scheduled events

### Scheduled Events
- Criação automática de lembretes
- Agendamento 5 minutos antes do appointment
- Sistema de webhooks para processar lembretes

## 🏗️ Arquitetura

A implementação segue os princípios do Clean Architecture com DDD:

- **DTOs** para validação de entrada e saída
- **Interfaces** para contratos de dados
- **Services** para lógica de negócio
- **Controllers** para camada de apresentação
- **Modules** para organização e injeção de dependência

## 📝 Próximos Passos

Para uma implementação completa em produção, considere:

1. Implementar autenticação e autorização
2. Adicionar testes unitários e de integração
3. Configurar CI/CD
4. Implementar notificações reais (email, SMS)
5. Adicionar monitoramento e métricas
6. Configurar backup e recuperação de dados
7. Implementar rate limiting e cache

---

**Implementação concluída:** Todas as funcionalidades solicitadas no PLAYGROUND.md foram implementadas com sucesso!
