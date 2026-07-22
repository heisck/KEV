-- V10: Grow the mock UITS directory to ~200 students, seed a course catalogue,
-- enrol every student in their programme+level courses, and add more lecturers.
-- Deterministic + set-based so the seed is reproducible and small.

-- 1. Students 10953041..10953200. Programme/level cycle through the 12 combos
--    already used in V6; names, photos, fees and enrolment derive from the index.
insert into directory_students (index_number, full_name, programme, level, photo_url, enrolled, fees_status)
select
    '10953' || lpad(n::text, 3, '0'),
    (array['Kwame','Ama','Kofi','Akosua','Yaw','Abena','Kwabena','Adwoa','Kojo','Esi',
           'Yaa','Kwesi','Afia','Kwaku','Akua','Nana','Maame','Kwadwo','Adjoa','Yoofi'])[1 + (n % 20)]
        || ' ' ||
    (array['Mensah','Osei','Boateng','Amankwah','Asante','Owusu','Frimpong','Agyemang','Antwi','Danquah',
           'Nkrumah','Yeboah','Sarpong','Bonsu','Ampofo','Asare','Bempah','Takyi','Bediako','Sarfo'])[1 + ((n / 20) % 20)],
    p.programme,
    p.level,
    'http://localhost:8080/images/'
        || (array['student_ama.jpg','student_kwame.jpg','student_efua.jpg','student_yaw.jpg','student_akosua.jpg'])[1 + (n % 5)],
    (n % 25) <> 0,
    case when n % 10 = 0 then 'OWING' when n % 5 = 0 then 'PARTIAL' else 'PAID' end
from generate_series(41, 200) as g(n)
join (values
    (0,  'BSc Computer Science',        300),
    (1,  'BSc Information Technology',   300),
    (2,  'BSc Computer Engineering',     300),
    (3,  'BSc Mathematics',              200),
    (4,  'BSc Statistics',               200),
    (5,  'BSc Actuarial Science',        200),
    (6,  'BSc Business Administration',  400),
    (7,  'BSc Accounting',               400),
    (8,  'BSc Finance',                  400),
    (9,  'BSc Biomedical Engineering',   100),
    (10, 'BSc Materials Engineering',    100),
    (11, 'BSc Food Process Engineering', 100)
) as p(k, programme, level) on p.k = n % 12;

-- 2. Course catalogue: three courses per programme, keyed to its level.
insert into courses (code, title, programme, level) values
('CS301',   'Data Structures & Algorithms',   'BSc Computer Science',        300),
('CS303',   'Operating Systems',              'BSc Computer Science',        300),
('CS305',   'Database Systems',               'BSc Computer Science',        300),
('IT301',   'Web Technologies',               'BSc Information Technology',   300),
('IT303',   'Network Administration',         'BSc Information Technology',   300),
('IT305',   'Information Security',            'BSc Information Technology',   300),
('CE301',   'Digital Systems Design',         'BSc Computer Engineering',     300),
('CE303',   'Microprocessors',                'BSc Computer Engineering',     300),
('CE305',   'Embedded Systems',               'BSc Computer Engineering',     300),
('MATH201', 'Real Analysis',                  'BSc Mathematics',             200),
('MATH203', 'Linear Algebra',                 'BSc Mathematics',             200),
('MATH205', 'Differential Equations',         'BSc Mathematics',             200),
('STAT201', 'Probability Theory',             'BSc Statistics',              200),
('STAT203', 'Statistical Inference',          'BSc Statistics',              200),
('STAT205', 'Regression Analysis',            'BSc Statistics',              200),
('ACT201',  'Financial Mathematics',          'BSc Actuarial Science',       200),
('ACT203',  'Life Contingencies',             'BSc Actuarial Science',       200),
('ACT205',  'Actuarial Statistics',           'BSc Actuarial Science',       200),
('BUS401',  'Strategic Management',           'BSc Business Administration', 400),
('BUS403',  'Operations Management',          'BSc Business Administration', 400),
('BUS405',  'Marketing Management',           'BSc Business Administration', 400),
('ACC401',  'Financial Reporting',            'BSc Accounting',              400),
('ACC403',  'Auditing',                       'BSc Accounting',              400),
('ACC405',  'Taxation',                       'BSc Accounting',              400),
('FIN401',  'Corporate Finance',              'BSc Finance',                 400),
('FIN403',  'Investment Analysis',            'BSc Finance',                 400),
('FIN405',  'Financial Risk Management',      'BSc Finance',                 400),
('BME101',  'Introduction to Biomedical Engineering', 'BSc Biomedical Engineering', 100),
('BME103',  'Human Anatomy & Physiology',     'BSc Biomedical Engineering',  100),
('BME105',  'Engineering Mathematics I',      'BSc Biomedical Engineering',  100),
('MSE101',  'Introduction to Materials Science', 'BSc Materials Engineering', 100),
('MSE103',  'Chemistry for Engineers',        'BSc Materials Engineering',   100),
('MSE105',  'Engineering Mathematics I',      'BSc Materials Engineering',   100),
('FPE101',  'Introduction to Food Engineering', 'BSc Food Process Engineering', 100),
('FPE103',  'Food Chemistry',                 'BSc Food Process Engineering', 100),
('FPE105',  'Engineering Mathematics I',      'BSc Food Process Engineering', 100);

-- 3. Enrol every student (original 40 + new) in the courses for their programme/level.
insert into student_courses (student_id, course_id)
select s.id, c.id
from directory_students s
join courses c on c.programme = s.programme and c.level = s.level;


