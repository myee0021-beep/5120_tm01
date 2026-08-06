-- SaringKu Database Creation Script
-- PostgreSQL version for Neon
-- Create database
-- (Database is already created in Neon, no need to create)
-- Select database
-- (Neon SQL Editor is already connected to the database)
-- 1. Mortality Table
CREATE TABLE Mortality (
    mortality_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year INTEGER NOT NULL,
    age_group VARCHAR(20),
    sex VARCHAR(20),
    state VARCHAR(50),
    cause VARCHAR(100),
    deaths INTEGER,
    share_pct DECIMAL(5,2)
);


-- 2. Life Expectancy Table
CREATE TABLE Life_Expectancy (
    life_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    year INTEGER NOT NULL,
    age INTEGER,
    sex VARCHAR(20),
    remaining_years DECIMAL(5,2)
);


-- 3. User Profile Table
CREATE TABLE User_Profile (

    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    age INTEGER,

    sex VARCHAR(20),

    state VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


-- 4. Health Assessment Table
CREATE TABLE Health_Assessment (

    assessment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    smoking VARCHAR(20),

    last_checkup_year INTEGER,

    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_assessment_user

    FOREIGN KEY (user_id)

    REFERENCES User_Profile(user_id)

    ON DELETE CASCADE

);


-- 5. Risk Result Table
CREATE TABLE Risk_Result (

    risk_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    assessment_id INTEGER NOT NULL,

    mortality_id INTEGER,

    leading_risk VARCHAR(100),

    risk_percentage DECIMAL(5,2),

    explanation TEXT,

    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,


    CONSTRAINT fk_risk_assessment

    FOREIGN KEY (assessment_id)

    REFERENCES Health_Assessment(assessment_id)

    ON DELETE CASCADE,


    CONSTRAINT fk_risk_mortality

    FOREIGN KEY (mortality_id)

    REFERENCES Mortality(mortality_id)

);


-- 6. Screening Program Table
CREATE TABLE Screening_Program (

    program_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    program_code VARCHAR(50),

    name_en VARCHAR(100),

    name_bm VARCHAR(100),

    provider VARCHAR(100),

    cost_rm DECIMAL(5,2),

    covers TEXT,

    how_to_access TEXT,

    url VARCHAR(255),

    copy_en TEXT,

    copy_bm TEXT

);


-- 7. Clinic Table
CREATE TABLE Clinic (

    clinic_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    program_id INTEGER NOT NULL,

    clinic_name VARCHAR(100),

    state VARCHAR(50),

    district VARCHAR(50),


    CONSTRAINT fk_clinic_program

    FOREIGN KEY(program_id)

    REFERENCES Screening_Program(program_id)

    ON DELETE CASCADE

);


-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
