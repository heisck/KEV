create table student_reports (
    id         bigserial   primary key,
    session_id bigint      not null references exam_sessions (id),
    student_id bigint      not null references directory_students (id),
    author_id  uuid        not null references users (id),
    message    text        not null,
    created_at timestamptz not null default now(),
    constraint chk_student_reports_message check (char_length(trim(message)) between 1 and 2000)
);

create table student_report_reads (
    id         bigserial   primary key,
    report_id  bigint      not null references student_reports (id) on delete cascade,
    user_id    uuid        not null references users (id),
    read_at    timestamptz not null default now(),
    constraint uq_student_report_reads unique (report_id, user_id)
);

create index idx_student_reports_session_created on student_reports (session_id, created_at desc);
create index idx_student_reports_author on student_reports (author_id);
create index idx_student_report_reads_user on student_report_reads (user_id, report_id);
