CREATE TABLE "public"."patient" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "name" varchar NOT NULL,
    "email" varchar NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("email")
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;
