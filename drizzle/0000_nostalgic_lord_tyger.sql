CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_states" (
	"state" text PRIMARY KEY NOT NULL,
	"shop" text NOT NULL,
	"plan" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"custom_domain" text,
	"status" text DEFAULT 'trialing' NOT NULL,
	"plan" text DEFAULT 'basic' NOT NULL,
	"shopify_store_domain" text NOT NULL,
	"shopify_storefront_token" text NOT NULL,
	"shopify_admin_token" text,
	"shopify_api_version" text DEFAULT '2025-01' NOT NULL,
	"branding" jsonb NOT NULL,
	"theme" jsonb NOT NULL,
	"seo" jsonb NOT NULL,
	"integrations" jsonb NOT NULL,
	"banners" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"current_period_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"topic" text NOT NULL,
	"tenant_id" text,
	"processed" boolean DEFAULT false NOT NULL,
	"payload" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "admin_users_tenant_idx" ON "admin_users" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_custom_domain_idx" ON "tenants" USING btree ("custom_domain");--> statement-breakpoint
CREATE INDEX "tenants_shopify_domain_idx" ON "tenants" USING btree ("shopify_store_domain");--> statement-breakpoint
CREATE INDEX "tenants_stripe_customer_idx" ON "tenants" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "webhook_events_source_idx" ON "webhook_events" USING btree ("source");