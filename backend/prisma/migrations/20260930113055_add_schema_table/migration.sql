-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('WAITING_FOR_PAYMENT', 'WAITING_FOR_ADMIN_CONFIRMATION', 'DONE', 'REJECTED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('CREDIT', 'DEBIT', 'REFUND', 'REFERRAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('TRANSACTION_ACCEPTED', 'TRANSACTION_REJECTED', 'TRANSACTION_EXPIRED', 'TRANSACTION_CANCELED', 'GENERAL');

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "phone" TEXT NOT NULL,
    "profile_picture" TEXT,
    "referral_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "organizer_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" BIGINT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" BIGINT NOT NULL,
    "max_discount" BIGINT,
    "quota" INTEGER NOT NULL,
    "used_quantity" INTEGER NOT NULL DEFAULT 0,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "referenceType" TEXT NOT NULL,
    "reference_id" BIGINT NOT NULL,
    "remaining_amount" BIGINT NOT NULL,
    "expired_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "transaction_id" BIGINT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_users" (
    "id" BIGSERIAL NOT NULL,
    "referrer_id" BIGINT NOT NULL,
    "referred_user_id" BIGINT NOT NULL,
    "reward_points" BIGINT NOT NULL DEFAULT 10000,
    "coupon_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_transactions" (
    "id" BIGSERIAL NOT NULL,
    "transaction_code" TEXT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "event_id" BIGINT NOT NULL,
    "voucher_id" BIGINT,
    "coupon_id" BIGINT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'WAITING_FOR_PAYMENT',
    "subTotal" BIGINT NOT NULL,
    "point_discount" BIGINT NOT NULL DEFAULT 0,
    "voucher_discount" BIGINT NOT NULL DEFAULT 0,
    "coupon_discount" BIGINT NOT NULL DEFAULT 0,
    "total_amount" BIGINT NOT NULL,
    "checked_in_at" TIMESTAMP(3),
    "payment_proof_deadline" TIMESTAMP(3),
    "admin_confirmation_deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_items" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "ticket_id" BIGINT NOT NULL,
    "price" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subTotal" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_proofs" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" BIGSERIAL NOT NULL,
    "transaction_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "categories_name_idx" ON "categories"("name");

-- CreateIndex
CREATE INDEX "events_organizer_id_idx" ON "events"("organizer_id");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "events"("category_id");

-- CreateIndex
CREATE INDEX "events_name_idx" ON "events"("name");

-- CreateIndex
CREATE INDEX "events_location_idx" ON "events"("location");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_user_id_idx" ON "coupons"("user_id");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "tickets_event_id_idx" ON "tickets"("event_id");

-- CreateIndex
CREATE INDEX "tickets_price_idx" ON "tickets"("price");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_event_id_idx" ON "vouchers"("event_id");

-- CreateIndex
CREATE INDEX "vouchers_code_idx" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "vouchers_start_at_end_at_idx" ON "vouchers"("start_at", "end_at");

-- CreateIndex
CREATE INDEX "point_transactions_user_id_idx" ON "point_transactions"("user_id");

-- CreateIndex
CREATE INDEX "point_transactions_type_idx" ON "point_transactions"("type");

-- CreateIndex
CREATE INDEX "point_transactions_expired_at_idx" ON "point_transactions"("expired_at");

-- CreateIndex
CREATE INDEX "point_transactions_reference_id_idx" ON "point_transactions"("reference_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_key" ON "password_reset_token"("token");

-- CreateIndex
CREATE INDEX "password_reset_token_user_id_idx" ON "password_reset_token"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_token_expired_at_idx" ON "password_reset_token"("expired_at");

-- CreateIndex
CREATE UNIQUE INDEX "referral_users_coupon_id_key" ON "referral_users"("coupon_id");

-- CreateIndex
CREATE INDEX "referral_users_referrer_id_idx" ON "referral_users"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "referral_users_referred_user_id_key" ON "referral_users"("referred_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_transactions_transaction_code_key" ON "event_transactions"("transaction_code");

-- CreateIndex
CREATE INDEX "event_transactions_user_id_idx" ON "event_transactions"("user_id");

-- CreateIndex
CREATE INDEX "event_transactions_event_id_idx" ON "event_transactions"("event_id");

-- CreateIndex
CREATE INDEX "event_transactions_voucher_id_idx" ON "event_transactions"("voucher_id");

-- CreateIndex
CREATE INDEX "event_transactions_coupon_id_idx" ON "event_transactions"("coupon_id");

-- CreateIndex
CREATE INDEX "event_transactions_status_idx" ON "event_transactions"("status");

-- CreateIndex
CREATE INDEX "event_transactions_payment_proof_deadline_idx" ON "event_transactions"("payment_proof_deadline");

-- CreateIndex
CREATE INDEX "event_transactions_admin_confirmation_deadline_idx" ON "event_transactions"("admin_confirmation_deadline");

-- CreateIndex
CREATE INDEX "event_transactions_created_at_idx" ON "event_transactions"("created_at");

-- CreateIndex
CREATE INDEX "transaction_items_transaction_id_idx" ON "transaction_items"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_items_ticket_id_idx" ON "transaction_items"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_proofs_transaction_id_key" ON "payment_proofs"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_transaction_id_key" ON "review"("transaction_id");

-- CreateIndex
CREATE INDEX "review_transaction_id_idx" ON "review"("transaction_id");

-- CreateIndex
CREATE INDEX "review_user_id_idx" ON "review"("user_id");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "event_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_users" ADD CONSTRAINT "referral_users_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_users" ADD CONSTRAINT "referral_users_referred_user_id_fkey" FOREIGN KEY ("referred_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_users" ADD CONSTRAINT "referral_users_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_transactions" ADD CONSTRAINT "event_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_transactions" ADD CONSTRAINT "event_transactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_transactions" ADD CONSTRAINT "event_transactions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_transactions" ADD CONSTRAINT "event_transactions_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "event_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_proofs" ADD CONSTRAINT "payment_proofs_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "event_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "event_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
