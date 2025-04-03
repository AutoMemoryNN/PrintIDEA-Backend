CREATE TYPE "public"."org_roles_enum" AS ENUM('admin', 'member', 'leader');--> statement-breakpoint
CREATE TYPE "public"."task_priorities" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status_enum" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'client');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"status" "task_status_enum" DEFAULT 'pending' NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"priority" "task_priorities" DEFAULT 'low' NOT NULL,
	"organization_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"tag" varchar(50),
	"priority" "task_priorities",
	"init_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "task_status_enum" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"project_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_organizations" (
	"user_id" varchar(36) NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"role" "org_roles_enum" NOT NULL,
	CONSTRAINT "users_organizations_user_id_organization_id_pk" PRIMARY KEY("user_id","organization_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"alias" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"role" "user_roles_enum" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_user_organization_user" ON "users_organizations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_organization_org" ON "users_organizations" USING btree ("organization_id");