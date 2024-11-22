CREATE TABLE IF NOT EXISTS exercise (
    id SERIAL PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,
    calor INT NOT NULL, -- Calories burned in the exercise
    duration INTERVAL NOT NULL, -- Duration of the exercise
    guide TEXT, -- Instructions or guide for the exercise
    difficulty VARCHAR(12) CHECK (difficulty IN ('beginner', 'intermediate', 'advance'))
);
CREATE TABLE IF NOT EXISTS muscle_group (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL unique
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
    user_age INT CHECK (age > 0),
    user_height NUMERIC(5, 2), -- Height in cm
    user_weight NUMERIC(5, 2),  -- Weight in kg
    user_password varchar (150) not null
);

CREATE TABLE if not exists plan (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(id) ON DELETE CASCADE,
    exercise_id INT REFERENCES Exercise(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL, -- The date for the "plan for today" list
    completed BOOLEAN DEFAULT FALSE
);

create table if not exists register_account (
  user_name varchar (50) not null,
  user_email varchar (100) not null,
  user_password varchar (100) not null,
  constraint unique_user_name unique (user_name, user_email)
);

create table if not exists firebase_messaging_token (
  firebase_token text not null,
  account_id int not null,
  FOREIGN KEY (account_id) REFERENCES account(id),
  constraint pk_firebase_token_account_id unique (firebase_token, account_id)
);

create table if not exists account_login_status (
  user_email varchar (100) primary key,
  session_token varchar (500) not null,
  FOREIGN KEY (user_email) REFERENCES account(user_email),
  constraint unique_login unique (user_email, session_token)
);