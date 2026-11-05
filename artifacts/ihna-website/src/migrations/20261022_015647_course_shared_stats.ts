import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "course_shared_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "_course_shared_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "course_shared_stats" ADD CONSTRAINT "course_shared_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."course_shared"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_course_shared_v_version_stats" ADD CONSTRAINT "_course_shared_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_course_shared_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "course_shared_stats_order_idx" ON "course_shared_stats" USING btree ("_order");
  CREATE INDEX "course_shared_stats_parent_id_idx" ON "course_shared_stats" USING btree ("_parent_id");
  CREATE INDEX "_course_shared_v_version_stats_order_idx" ON "_course_shared_v_version_stats" USING btree ("_order");
  CREATE INDEX "_course_shared_v_version_stats_parent_id_idx" ON "_course_shared_v_version_stats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "course_shared_stats" CASCADE;
  DROP TABLE "_course_shared_v_version_stats" CASCADE;`)
}
