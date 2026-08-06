-- SaringKu Database Cleanup Script
-- PostgreSQL (Neon)
-- Remove all SaringKu tables for testing


DROP TABLE IF EXISTS Risk_Result CASCADE;

DROP TABLE IF EXISTS Health_Assessment CASCADE;

DROP TABLE IF EXISTS Clinic CASCADE;

DROP TABLE IF EXISTS User_Profile CASCADE;

DROP TABLE IF EXISTS Mortality CASCADE;

DROP TABLE IF EXISTS Life_Expectancy CASCADE;

DROP TABLE IF EXISTS Screening_Program CASCADE;


-- Check remaining tables

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';