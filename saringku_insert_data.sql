-- ==================================
-- Insert Mortality Data
-- "source": "DOSM, Statistics on Causes of Death, Malaysia 2025 (deaths registered 2024, coded ICD-11)",
-- "url": "https://www.dosm.gov.my/portal-main/release-document-log?release_document_id=17726",
-- "denominator": "133,844 medically certified deaths (67.3% of 198,992 total deaths)",
-- "caveat": "32.7% of deaths are not medically certified, weakest in rural districts. Do not present district figures as precise.",
-- "TODO": "Fill remaining states from the full release tables. Values below are confirmed from the press release."
-- ==================================


INSERT INTO Mortality
(year, age_group, sex, state, cause, deaths, share_pct)
VALUES
(2024, NULL, NULL, 'Malaysia',
 'Ischaemic heart disease', 17421, 13.0),

(2024, NULL, NULL, 'Malaysia',
 'Pneumonia', 15332, 11.5),

(2024, NULL, NULL, 'Malaysia',
 'Diabetes mellitus', 6929, 5.2),

(2024, NULL, NULL, 'Malaysia',
 'Transport accidents', 4428, 3.3);


INSERT INTO Mortality
(year, age_group, sex, state, cause, deaths, share_pct)
VALUES
(2024, '0-14', NULL, 'Malaysia',
 'Pneumonia', 244, 5.6),

(2024, '15-40', NULL, 'Malaysia',
 'Transport accidents', 2547, 20.0),

(2024, '41-59', NULL, 'Malaysia',
 'Ischaemic heart disease', 5380, 17.6),

(2024, '60+', NULL, 'Malaysia',
 'Pneumonia', 11989, 13.9);


INSERT INTO Mortality
(year, age_group, sex, state, cause, deaths, share_pct)
VALUES
(2024, NULL, 'Male', 'Malaysia',
 'Ischaemic heart disease', 12112, 15.3),

(2024, NULL, 'Female', 'Malaysia',
 'Pneumonia', 6776, 12.4);


INSERT INTO Mortality
(year, age_group, sex, state, cause, deaths, share_pct)
VALUES
(2024, NULL, NULL, 'Selangor',
 'Ischaemic heart disease', 3038, NULL),

(2024, NULL, NULL, 'Johor',
 'Ischaemic heart disease', 2620, NULL),

(2024, NULL, NULL, 'Kedah',
 'Ischaemic heart disease', 2349, NULL);



-- ==================================
-- Insert Life Expectancy Data
-- source": "DOSM, Abridged Life Tables Malaysia, 2025 (released 30 September 2025)",
-- "url": "https://www.dosm.gov.my/portal-main/release-content/abridged-life-tables-malaysia-2025",
-- "unit": "remaining years of life expectancy",
-- "TODO": "Add the full single-age and per-state tables from the release. Values below are confirmed anchors."
-- ==================================


INSERT INTO Life_Expectancy
(year, age, sex, remaining_years)
VALUES
(2023, 0, 'All', 74.0),
(2023, 0, 'Male', 71.7),
(2023, 0, 'Female', 76.6),

(2024, 0, 'All', 74.9),
(2024, 0, 'Male', 72.7),
(2024, 0, 'Female', 77.6),

(2025, 0, 'All', 75.3),
(2025, 0, 'Male', 73.1),
(2025, 0, 'Female', 77.9);


INSERT INTO Life_Expectancy
(year, age, sex, remaining_years)
VALUES
(2025, 15, 'Male', 58.8),
(2025, 15, 'Female', 63.6),

(2025, 60, 'Male', 18.8),
(2025, 60, 'Female', 21.6),

(2025, 65, 'Male', 15.3),
(2025, 65, 'Female', 17.6);



-- ==================================
-- Insert Screening Program Data
-- note": "Written and maintained by the team. Not a download. Update this file when scheme rules change; no code changes required."
-- ==================================


INSERT INTO Screening_Program
(
    program_code,
    name_en,
    name_bm,
    provider,
    cost_rm,
    covers,
    how_to_access,
    url,
    copy_en,
    copy_bm
)
VALUES

(
'socso_hsp',
'SOCSO Health Screening Programme',
'Program Saringan Kesihatan PERKESO',
'PERKESO / SOCSO',
0,
'Blood pressure, Blood sugar, Cholesterol, BMI and physical check, Doctor consultation',
'Download the SEHATi app, register, check eligibility, then book at a panel clinic with MyKad',
'https://sehati.perkeso.gov.my',
'Free full screening. You have paid for this since your first payslip.',
'Saringan penuh percuma. Anda telah membayarnya sejak slip gaji pertama anda.'
),


(
'peka_b40',
'PeKa B40',
'PeKa B40',
'ProtectHealth / Ministry of Health',
0,
'Health screening, Essential medical aid, Cancer treatment incentive, Transport incentive',
'Check eligibility and register through ProtectHealth',
'https://protecthealth.com.my',
'Free health screening for B40 households aged 40 and over.',
'Saringan kesihatan percuma untuk isi rumah B40 berumur 40 tahun ke atas.'
),


(
'klinik_kesihatan',
'Klinik Kesihatan check',
'Pemeriksaan Klinik Kesihatan',
'Ministry of Health Malaysia',
1,
'Blood pressure, Blood sugar, Cholesterol',
'Walk in to any public health clinic with MyKad',
'https://www.moh.gov.my',
'Basic checks from RM1 at any public clinic. No appointment needed.',
'Pemeriksaan asas dari RM1 di mana-mana klinik kesihatan. Tanpa temujanji.'
),


(
'mquit',
'mQuit smoking cessation support',
'Sokongan berhenti merokok mQuit',
'Ministry of Health Malaysia',
0,
'Counselling, Nicotine replacement where indicated',
'Attend an mQuit clinic; list available through MOH',
'https://www.moh.gov.my',
'Covered quit-smoking support at participating clinics.',
'Sokongan berhenti merokok yang ditanggung di klinik terpilih.'
);