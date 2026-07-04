-- One live attendance row per (session, student); removal flips status,
-- re-adding flips it back and refreshes method/timestamps.
create table attendance_records (
    id            bigserial   primary key,
    session_id    bigint      not null references exam_sessions (id),
    student_id    bigint      not null references directory_students (id),
    method        varchar(10) not null, -- NFC | QR | MANUAL | FACE
    status        varchar(12) not null default 'CHECKED_IN', -- CHECKED_IN | REMOVED
    checked_in_by uuid        not null references users (id),
    checked_in_at timestamptz not null default now(),
    removed_by    uuid        references users (id),
    removed_at    timestamptz,
    constraint uq_attendance_session_student unique (session_id, student_id)
);

create index idx_attendance_session on attendance_records (session_id);
