CREATE TABLE "boards" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "board_id" varchar(36);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_board_id_boards_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_board_id_unique" UNIQUE("board_id");