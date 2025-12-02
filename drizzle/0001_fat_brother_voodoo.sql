ALTER TABLE "users" ADD COLUMN "username" varchar(30) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fullname" varchar(120) NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" varchar;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";