CREATE TABLE IF NOT EXISTS exercise (
    id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,
    image VARCHAR(100), -- Unique name for the image
    calor INT NOT NULL, -- Calories burned in the exercise
    duration INT NOT NULL, -- Duration of the exercise
    guide TEXT, -- Instructions or guide for the exercise
    difficulty VARCHAR(12) CHECK (difficulty IN ('beginner', 'intermediate', 'advance'))
);

CREATE TABLE IF NOT EXISTS muscle_group (
    id SERIAL PRIMARY KEY,
    muscle_group_name VARCHAR(50) NOT NULL unique
);

CREATE TABLE IF NOT EXISTS exercise_muscle_group (
    exercise_id INT NOT NULL,
    muscle_group_id INT NOT NULL,
    PRIMARY KEY (exercise_id, muscle_group_id),
    FOREIGN KEY (exercise_id) REFERENCES exercise (id) ON DELETE CASCADE,
    FOREIGN KEY (muscle_group_id) REFERENCES muscle_group (id) ON DELETE CASCADE
);

CREATE table if not exists account (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_age INT CHECK (user_age > 0),
    user_height NUMERIC(5, 2), -- Height in cm
    user_weight NUMERIC(5, 2),  -- Weight in kg
    user_password varchar (150) not null
    --user_image varchar(100)
);

CREATE TABLE IF NOT EXISTS user_favorite_exercise (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- The user who marked the exercise as favorite
    exercise_id INT NOT NULL, -- The exercise marked as favorite
    favorited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of when the exercise was favorited
    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
    UNIQUE (user_id, exercise_id) -- Prevent duplicates of the same exercise for the same user
);

-- Table for tracking user run data at specific dates and times
CREATE TABLE IF NOT EXISTS user_run_data (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    run_date TIMESTAMP NOT NULL, -- Date and time of the run start 
    distance NUMERIC(5, 2) NOT NULL, -- Distance in km
    steps_count INT NOT NULL, -- Number of steps
    duration INT NOT NULL, -- Duration of the run as seconds
    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
    UNIQUE (user_id, run_date) -- Ensure only one run entry per timestamp for each user
);

-- Table for tracking user heart rate data at specific dates and times
CREATE TABLE IF NOT EXISTS user_heart_rate_data (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    measured_at TIMESTAMP NOT NULL, -- Date and time the heart rate was measured
    heart_rate INT NOT NULL, -- Heart rate in beats per minute
    stress_level INT NOT null,
    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
    UNIQUE (user_id, measured_at) -- Ensure only one heart rate entry per timestamp for each user
);

CREATE TABLE IF NOT EXISTS exercise_guide_image (
    id SERIAL PRIMARY KEY,
    exercise_id INT NOT NULL,
    image_name VARCHAR(100) NOT NULL, -- Unique name for the image
    image_order INT NOT NULL, -- Order of the image in the sequence
    FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
    UNIQUE (exercise_id, image_order), -- Ensure unique order per exercise
    UNIQUE (exercise_id, image_name) -- Ensure unique image name per exercise
);


create table if not exists d (
  user_id INT primary key,
  session_token varchar (500) not null,
  FOREIGN KEY (user_id) REFERENCES account(id),
  constraint unique_login unique (user_id, session_token)
);

-- Table for tracking user exercises done at specific dates and times
--CREATE TABLE IF NOT EXISTS user_exercise_activity (
--    id SERIAL PRIMARY KEY,
--    user_id INT NOT NULL,
--    exercise_id INT NOT NULL,
--    completed_at TIMESTAMP NOT NULL, -- Date and time the exercise was completed
--    FOREIGN KEY (user_id) REFERENCES account(id) ON DELETE CASCADE,
--    FOREIGN KEY (exercise_id) REFERENCES exercise(id) ON DELETE CASCADE,
--    UNIQUE (user_id, exercise_id, completed_at) -- Prevent duplicate entries for the same exercise at the same time
--);

