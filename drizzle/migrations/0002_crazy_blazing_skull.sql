ALTER TYPE "public"."org_role" ADD VALUE 'leader';--> statement-breakpoint
ALTER TABLE "organizations" DROP CONSTRAINT "organizations_leader_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "users_organizations" DROP CONSTRAINT "users_organizations_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_organizations" ADD CONSTRAINT "users_organizations_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "leader_id";