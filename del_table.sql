-- Drop tables in the correct order to prevent foreign key constraint errors
DROP TABLE IF EXISTS account_login_status CASCADE;
DROP TABLE IF EXISTS firebase_messaging_token CASCADE;
DROP TABLE IF EXISTS register_account CASCADE;
DROP TABLE IF EXISTS user_heart_rate_data CASCADE;
DROP TABLE IF EXISTS user_run_data CASCADE;
DROP TABLE IF EXISTS exercise_guide_image CASCADE;
DROP TABLE IF EXISTS exercise_muscle_group CASCADE;
DROP TABLE IF EXISTS muscle_group CASCADE;
DROP TABLE IF EXISTS exercise CASCADE;
DROP TABLE IF EXISTS account CASCADE;