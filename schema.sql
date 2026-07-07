


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."generate_unique_join_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_code TEXT;
    is_unique BOOLEAN := FALSE;
    -- Characters allowed (Omitting easily confused letters like I, O, 1, 0)
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    code_length INTEGER := 6;
BEGIN
    -- Only generate a code if the user didn't explicitly provide one
    IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
        WHILE NOT is_unique LOOP
            -- 1. Generate a random 6-character string
            new_code := '';
            FOR i IN 1..code_length LOOP
                new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
            END LOOP;
            
            -- 2. Convert to uppercase for clean consistency
            new_code := UPPER(new_code);

            -- 3. Check if this code already exists in the quizzes table
            SELECT NOT EXISTS (
                SELECT 1 FROM public.quizzes WHERE join_code = new_code
            ) INTO is_unique;
        END LOOP;

        -- 4. Assign the generated code to the new row record
        NEW.join_code := new_code;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_unique_join_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE
  raw_meta   jsonb   := NEW.raw_user_meta_data;
  full_nm    text;
  avatar     text;
  initials   text;
  is_google  boolean;
  name_parts text[];
BEGIN
  -- 1. Primary check: Is the current provider Google?
  is_google := (NEW.raw_app_meta_data->>'provider') = 'google';

  -- 2. Backup check: Does this user have a Google identity linked in auth.identities?
  -- This catches cases where the metadata update hasn't propagated yet.
  IF NOT is_google THEN
    SELECT EXISTS (
      SELECT 1 FROM auth.identities 
      WHERE user_id = NEW.id AND provider = 'google'
    ) INTO is_google;
  END IF;

  -- 3. If Google is detected, prepare the profile data
  IF is_google THEN
    full_nm := COALESCE(
      raw_meta->>'full_name',
      raw_meta->>'name',
      NEW.email
    );

    avatar := raw_meta->>'avatar_url';

    name_parts := string_to_array(trim(full_nm), ' ');
    initials := UPPER(
      LEFT(name_parts[1], 1) ||
      CASE
        WHEN array_length(name_parts, 1) > 1
        THEN LEFT(name_parts[array_length(name_parts, 1)], 1)
        ELSE ''
      END
    );
  END IF;

  -- 4. Upsert into profiles
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    avatar_initials,
    connected_google,
    created_at
  )
  VALUES (
    NEW.id,
    full_nm,
    NEW.email,
    avatar,
    initials,
    is_google,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Flip to TRUE if they ever connect Google, and keep it TRUE.
    connected_google = EXCLUDED.connected_google OR public.profiles.connected_google,
    
    -- Only fill these if they are currently NULL (prevents overwriting user's manual setup)
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    avatar_initials = COALESCE(public.profiles.avatar_initials, EXCLUDED.avatar_initials);

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_profile_role_sync"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Handle Student Role
    IF NEW.role = 'student' THEN
        INSERT INTO public.students (user_id, student_code)
        VALUES (
            NEW.id, 
            'STU-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)) -- Generates a unique, clean student_code
        )
        ON CONFLICT (user_id) DO NOTHING; -- Prevents errors if row already exists
        
    -- Handle Teacher Role
    ELSIF NEW.role = 'teacher' THEN
        INSERT INTO public.teachers (user_id, teacher_code)
        VALUES (
            NEW.id, 
            'TCH-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8)) -- Generates a unique teacher_code
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_profile_role_sync"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_initials"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- 1. Check if full_name exists and isn't empty
  IF NEW.full_name IS NOT NULL AND TRIM(NEW.full_name) <> '' THEN
    -- 2. Split by space, take first letter of each word, limit to 2, and aggregate
    NEW.avatar_initials := (
      SELECT upper(string_agg(letter, ''))
      FROM (
        SELECT substring(name_part from 1 for 1) as letter
        FROM unnest(string_to_array(trim(NEW.full_name), ' ')) AS name_part
        WHERE name_part <> '' -- Ignore extra spaces
        LIMIT 2
      ) AS parts
    );
  ELSE
    -- 3. Fallback if name is missing
    NEW.avatar_initials := '??';
  END IF;

  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."handle_user_initials"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_google_only_account"("user_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  has_password text;
  is_google_linked boolean;
BEGIN
  -- 1. Check if they have a password in the Auth table
  SELECT encrypted_password INTO has_password
  FROM auth.users
  WHERE email = user_email;

  -- 2. Check if they have connected Google in your Profile table
  SELECT connected_google INTO is_google_linked
  FROM public.profiles
  WHERE email = user_email;

  -- A "Google Only" account has NO password AND Google is linked
  RETURN (has_password IS NULL OR has_password = '') AND COALESCE(is_google_linked, false);
END;
$$;


ALTER FUNCTION "public"."is_google_only_account"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_modified_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_modified_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."behavioral_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "icon_type" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "generated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."behavioral_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."institutions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."institutions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "subject" "text",
    "body" "text" NOT NULL,
    "is_read" boolean DEFAULT false NOT NULL,
    "sent_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text",
    "body" "text",
    "icon" "text",
    "tag" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_read" boolean DEFAULT true NOT NULL,
    "kind" "text"
);

ALTER TABLE ONLY "public"."notifications" REPLICA IDENTITY FULL;


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "institution_id" "uuid",
    "full_name" "text",
    "email" "text" NOT NULL,
    "role" "text",
    "avatar_url" "text",
    "avatar_initials" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_login_at" timestamp with time zone,
    "department" "text",
    "primary_subject" "text",
    "class_size" smallint,
    "grade_level" "text",
    "student_id" "text",
    "subject" "text",
    "connected_google" boolean DEFAULT false NOT NULL,
    "two_factor_enabled" boolean DEFAULT false,
    "two_factor_method" "text" DEFAULT 'email'::"text",
    "email_notifications" boolean DEFAULT true,
    "push_notifications" boolean DEFAULT true,
    "sms_alerts" boolean DEFAULT false,
    "profile_visibility" "text" DEFAULT 'public'::"text",
    "dark_mode" "text" DEFAULT 'light'::"text",
    "language" "text" DEFAULT 'en-us'::"text",
    "connected_microsoft" boolean DEFAULT false,
    "password_last_changed_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_responses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "student_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "selected_option" "text",
    "time_spent_sec" integer,
    "flagged_for_review" boolean DEFAULT false NOT NULL,
    "text_response" "text",
    "is_correct" boolean
);


ALTER TABLE "public"."question_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "question" "text" NOT NULL,
    "type" "text" NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "marks" integer DEFAULT 1 NOT NULL,
    "options" "jsonb",
    "answer" "text",
    "topic" "text"
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_affiliations" (
    "student_id" "uuid" NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT '''available''::text'::"text" NOT NULL
);


ALTER TABLE "public"."quiz_affiliations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "quiz_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "score" integer DEFAULT 0 NOT NULL,
    "percentage" double precision,
    "status" "text" DEFAULT 'in_progress'::"text" NOT NULL,
    "avg_time_per_question_sec" integer,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submitted_at" timestamp with time zone,
    "time_spent_seconds" integer
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "difficulty" character varying(50),
    "duration_minutes" integer,
    "passing_marks" integer,
    "join_code" "text",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "question_count" integer DEFAULT 0 NOT NULL,
    "participant_count" integer DEFAULT 0 NOT NULL,
    "cover_gradient" "text",
    "topics" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    "total_marks" integer,
    "grading_type" "text"
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."student_teacher_affiliations" (
    "teacher_id" "uuid",
    "student_id" "uuid"
);


ALTER TABLE "public"."student_teacher_affiliations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."students" (
    "user_id" "uuid" NOT NULL,
    "student_code" "text" NOT NULL,
    "overall_percentile" numeric(5,2) DEFAULT 0.00,
    "top_percentile" numeric(5,2) DEFAULT 0.00,
    "accuracy_rate" numeric(5,2) DEFAULT 0.00,
    "top_subject" character varying(255),
    CONSTRAINT "chk_accuracy_rate" CHECK (("accuracy_rate" <= 100.00)),
    CONSTRAINT "chk_overall_percentile" CHECK (("overall_percentile" <= 100.00)),
    CONSTRAINT "chk_top_percentile" CHECK (("top_percentile" <= 100.00))
);


ALTER TABLE "public"."students" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subject_affiliations" (
    "subject_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "taken_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."subject_affiliations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "code" character varying(100) NOT NULL,
    "slug" character varying(255) NOT NULL,
    "description" "text",
    "icon_name" character varying(100),
    "color_theme" character varying(50) DEFAULT 'slate'::character varying,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teachers" (
    "user_id" "uuid" NOT NULL,
    "teacher_code" "text" NOT NULL,
    "students_avg_performance" real,
    "change_in_performance" real
);


ALTER TABLE "public"."teachers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."behavioral_insights"
    ADD CONSTRAINT "behavioral_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."institutions"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_responses"
    ADD CONSTRAINT "question_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_responses"
    ADD CONSTRAINT "question_responses_student_id_question_id_key" UNIQUE ("student_id", "question_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_join_code_key" UNIQUE ("join_code");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_affiliations"
    ADD CONSTRAINT "student_quiz_unique" UNIQUE ("student_id", "quiz_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_student_code_key" UNIQUE ("student_code");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_code_unique" UNIQUE ("code");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_teacher_code_key" UNIQUE ("teacher_code");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "behavioral_insights_student_id_idx" ON "public"."behavioral_insights" USING "btree" ("student_id");



CREATE INDEX "messages_recipient_id_idx" ON "public"."messages" USING "btree" ("recipient_id");



CREATE INDEX "messages_sender_id_idx" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "question_responses_attempt_id_idx" ON "public"."question_responses" USING "btree" ("student_id");



CREATE INDEX "questions_quiz_id_idx" ON "public"."questions" USING "btree" ("quiz_id");



CREATE INDEX "quiz_attempts_quiz_id_idx" ON "public"."quiz_attempts" USING "btree" ("quiz_id");



CREATE INDEX "quiz_attempts_student_id_idx" ON "public"."quiz_attempts" USING "btree" ("student_id");



CREATE INDEX "quizzes_creator_id_idx" ON "public"."quizzes" USING "btree" ("creator_id");



CREATE INDEX "quizzes_join_code_idx" ON "public"."quizzes" USING "btree" ("join_code");



CREATE INDEX "quizzes_status_idx" ON "public"."quizzes" USING "btree" ("status");



CREATE INDEX "quizzes_subject_id_idx" ON "public"."quizzes" USING "btree" ("subject_id");



CREATE INDEX "student_quizzes_quiz_id_idx" ON "public"."quiz_affiliations" USING "btree" ("quiz_id");



CREATE INDEX "student_quizzes_student_id_idx" ON "public"."quiz_affiliations" USING "btree" ("student_id");



CREATE INDEX "students_user_id_idx" ON "public"."students" USING "btree" ("user_id");



CREATE INDEX "teachers_user_id_idx" ON "public"."teachers" USING "btree" ("user_id");



CREATE INDEX "users_organization_id_idx" ON "public"."profiles" USING "btree" ("institution_id");



CREATE OR REPLACE TRIGGER "on_profile_initials_update" BEFORE INSERT OR UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_user_initials"();



CREATE OR REPLACE TRIGGER "on_profile_role_sync" AFTER INSERT OR UPDATE OF "role" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_profile_role_sync"();



CREATE OR REPLACE TRIGGER "trigger_assign_quiz_join_code" BEFORE INSERT ON "public"."quizzes" FOR EACH ROW EXECUTE FUNCTION "public"."generate_unique_join_code"();



CREATE OR REPLACE TRIGGER "update_subjects_modtime" BEFORE UPDATE ON "public"."subjects" FOR EACH ROW EXECUTE FUNCTION "public"."update_modified_column"();



ALTER TABLE ONLY "public"."behavioral_insights"
    ADD CONSTRAINT "behavioral_insights_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_responses"
    ADD CONSTRAINT "question_responses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_responses"
    ADD CONSTRAINT "question_responses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id");



ALTER TABLE ONLY "public"."quiz_affiliations"
    ADD CONSTRAINT "quiz_affiliations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_affiliations"
    ADD CONSTRAINT "student_quizzes_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."student_teacher_affiliations"
    ADD CONSTRAINT "student_teacher_affiliations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."student_teacher_affiliations"
    ADD CONSTRAINT "student_teacher_affiliations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("user_id");



ALTER TABLE ONLY "public"."students"
    ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subject_affiliations"
    ADD CONSTRAINT "subject_affiliations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."students"("user_id");



ALTER TABLE ONLY "public"."subject_affiliations"
    ADD CONSTRAINT "subject_affiliations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."teachers"("user_id");



ALTER TABLE ONLY "public"."teachers"
    ADD CONSTRAINT "teachers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Allow authenticated users to view subjects" ON "public"."subjects" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow creators to delete their own subjects" ON "public"."subjects" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Allow creators to update their own subjects" ON "public"."subjects" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "created_by")) WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Allow instructors or admins to insert subjects" ON "public"."subjects" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Allow read for authenticated users" ON "public"."questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone authenticated can create notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."institutions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."quizzes" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for authenticated users only" ON "public"."institutions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Quiz creator can manage questions" ON "public"."questions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."quizzes" "q"
  WHERE (("q"."id" = "questions"."quiz_id") AND ("q"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Quiz creator can view attempts" ON "public"."quiz_attempts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."quizzes" "q"
  WHERE (("q"."id" = "quiz_attempts"."quiz_id") AND ("q"."creator_id" = "auth"."uid"())))));



CREATE POLICY "Students can insert their responses" ON "public"."question_responses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Students can join a subject" ON "public"."subject_affiliations" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "student_id"));



CREATE POLICY "Students can leave a subject" ON "public"."subject_affiliations" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "student_id"));



CREATE POLICY "Students can manage their own attempts" ON "public"."quiz_attempts" TO "authenticated" USING (("student_id" = "auth"."uid"()));



CREATE POLICY "Students can view teacher data" ON "public"."teachers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'student'::"text")))));



CREATE POLICY "Students can view their own affiliations" ON "public"."subject_affiliations" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "student_id"));



CREATE POLICY "Students can view their own profile data" ON "public"."students" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Students can view their own quiz affiliations" ON "public"."quiz_affiliations" FOR SELECT USING (("student_id" = "auth"."uid"()));



CREATE POLICY "Teachers can manage quizzes" ON "public"."quizzes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."teachers"
  WHERE (("teachers"."user_id" = "auth"."uid"()) AND ("teachers"."user_id" = "quizzes"."creator_id"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."teachers"
  WHERE ("teachers"."user_id" = "auth"."uid"()))));



CREATE POLICY "Teachers can view all student data" ON "public"."students" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))));



CREATE POLICY "Teachers can view their own profile data" ON "public"."teachers" TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Teachers have full access to student quizzes" ON "public"."quiz_affiliations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'teacher'::"text")))));



CREATE POLICY "Users can delete their own notifications" ON "public"."notifications" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own student-teacher affiliations" ON "public"."student_teacher_affiliations" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "teacher_id") OR (( SELECT "auth"."uid"() AS "uid") = "student_id")));



ALTER TABLE "public"."behavioral_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."institutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages: anyone can send" ON "public"."messages" FOR INSERT WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "messages: read own" ON "public"."messages" FOR SELECT USING ((("sender_id" = "auth"."uid"()) OR ("recipient_id" = "auth"."uid"())));



CREATE POLICY "messages: recipient can update is_read" ON "public"."messages" FOR UPDATE USING (("recipient_id" = "auth"."uid"()));



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_affiliations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."student_teacher_affiliations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."students" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subject_affiliations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teachers" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."generate_unique_join_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_join_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_join_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_profile_role_sync"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_profile_role_sync"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_profile_role_sync"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_initials"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_initials"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_initials"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_google_only_account"("user_email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_google_only_account"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_google_only_account"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_modified_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."behavioral_insights" TO "anon";
GRANT ALL ON TABLE "public"."behavioral_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."behavioral_insights" TO "service_role";



GRANT ALL ON TABLE "public"."institutions" TO "anon";
GRANT ALL ON TABLE "public"."institutions" TO "authenticated";
GRANT ALL ON TABLE "public"."institutions" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_responses" TO "anon";
GRANT ALL ON TABLE "public"."question_responses" TO "authenticated";
GRANT ALL ON TABLE "public"."question_responses" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_affiliations" TO "anon";
GRANT ALL ON TABLE "public"."quiz_affiliations" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_affiliations" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";



GRANT ALL ON TABLE "public"."student_teacher_affiliations" TO "anon";
GRANT ALL ON TABLE "public"."student_teacher_affiliations" TO "authenticated";
GRANT ALL ON TABLE "public"."student_teacher_affiliations" TO "service_role";



GRANT ALL ON TABLE "public"."students" TO "anon";
GRANT ALL ON TABLE "public"."students" TO "authenticated";
GRANT ALL ON TABLE "public"."students" TO "service_role";



GRANT ALL ON TABLE "public"."subject_affiliations" TO "anon";
GRANT ALL ON TABLE "public"."subject_affiliations" TO "authenticated";
GRANT ALL ON TABLE "public"."subject_affiliations" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON TABLE "public"."teachers" TO "anon";
GRANT ALL ON TABLE "public"."teachers" TO "authenticated";
GRANT ALL ON TABLE "public"."teachers" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































