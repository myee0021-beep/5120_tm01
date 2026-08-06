-- ==================================
-- Test 1: Insert Test User Profile
-- Persona: Azman, 48 years old, Male, Selangor
-- ==================================
INSERT INTO User_Profile
(age, sex, state, created_at)
VALUES
(48, 'Male', 'Selangor', NOW());
SELECT *
FROM User_Profile;


-- ==================================
-- Test 2: Insert Health Assessment
-- Smoker, last checkup 2018
-- ==================================

INSERT INTO Health_Assessment
(user_id, smoking, last_checkup_year, assessment_date)
VALUES
(
    (SELECT user_id 
     FROM User_Profile
     WHERE age = 48
     AND sex = 'Male'
     AND state = 'Selangor'
     ORDER BY user_id DESC
     LIMIT 1),
     
    'Yes',
    2018,
    NOW()
);

SELECT *
FROM Health_Assessment;


-- ==================================
-- Test 3: Find Mortality Risk
-- Age 48 belongs to 41-59 group
-- ==================================

SELECT *
FROM Mortality
WHERE age_group = '41-59'
AND cause = 'Ischaemic heart disease';

-- ==================================
-- Test 4: Insert Risk Result
-- Automatically find mortality_id
-- ==================================

INSERT INTO Risk_Result
(
    assessment_id,
    mortality_id,
    leading_risk,
    risk_percentage,
    explanation,
    generated_date
)

SELECT
    (
        SELECT assessment_id
        FROM Health_Assessment
        ORDER BY assessment_id DESC
        LIMIT 1
    ),

    mortality_id,

    cause,

    share_pct,

    'Based on Malaysian mortality data, middle-aged males have higher risk associated with cardiovascular disease.',

    NOW()

FROM Mortality

WHERE age_group = '41-59'
AND cause = 'Ischaemic heart disease';


SELECT *
FROM Risk_Result;



-- ==================================
-- Test 5: Find Screening Program
-- Smoker aged 48
-- ==================================

SELECT *
FROM Screening_Program
WHERE program_code IN
(
    'socso_hsp',
    'mquit'
);



-- ==================================
-- Test 6: Life Expectancy Query
-- Male aged 60
-- ==================================

SELECT *
FROM Life_Expectancy
WHERE age = 60
AND sex = 'Male';



-- ==================================
-- Test 7: Full User Risk View
-- ==================================

SELECT
    u.age,
    u.sex,
    u.state,
    h.smoking,
    h.last_checkup_year,
    r.leading_risk,
    r.risk_percentage,
    r.explanation

FROM User_Profile u

JOIN Health_Assessment h
ON u.user_id = h.user_id

JOIN Risk_Result r
ON h.assessment_id = r.assessment_id;