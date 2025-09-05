CREATE TABLE "public"."appointment" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" uuid NOT NULL,
    "schedule_to" timestamptz NOT NULL,
    "status" varchar NOT NULL DEFAULT 'scheduled',
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON UPDATE cascade ON DELETE cascade
);
