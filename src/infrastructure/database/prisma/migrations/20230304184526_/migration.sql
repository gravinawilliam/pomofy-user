-- CreateTable
CREATE TABLE "users" (
    "email" VARCHAR NOT NULL,
    "facebook_account_id" VARCHAR,
    "google_account_id" VARCHAR,
    "password" VARCHAR NOT NULL,
    "is_email_validated" BOOLEAN NOT NULL DEFAULT false,
    "id" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_forgot_password" (
    "value" VARCHAR NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "expirationDate" TIMESTAMPTZ NOT NULL,
    "id" VARCHAR NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "tokens_forgot_password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_facebook_account_id_key" ON "users"("facebook_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_account_id_key" ON "users"("google_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_forgot_password_user_id_key" ON "tokens_forgot_password"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_forgot_password_id_key" ON "tokens_forgot_password"("id");
