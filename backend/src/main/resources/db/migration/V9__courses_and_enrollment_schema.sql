-- V9: Course catalogue + student ↔ course enrolment (many-to-many).
-- directory_students previously carried only programme + level; a student takes
-- several courses, so model them explicitly. Read via DirectoryStudent.courses.

create table courses (
    id         bigserial    primary key,
    code       varchar(20)  not null, -- e.g. CS301
    title      varchar(160) not null,
    programme  varchar(120) not null, -- owning programme (matches directory_students.programme)
    level      smallint     not null, -- 100..700
    created_at timestamptz  not null default now(),
    constraint uq_courses_code unique (code)
);

create index idx_courses_programme_level on courses (programme, level);

create table student_courses (
    student_id bigint not null references directory_students (id) on delete cascade,
    course_id  bigint not null references courses (id) on delete cascade,
    primary key (student_id, course_id)
);

create index idx_student_courses_course on student_courses (course_id);
