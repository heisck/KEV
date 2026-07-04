-- Exam sessions created via Room Setup, joinable by session code.
create table exam_sessions (
    id                bigserial primary key,
    session_code      varchar(8)   not null, -- e.g. KEV-4F2A
    course_codes      text         not null, -- comma-separated
    building          varchar(120) not null,
    floor             varchar(40),
    room              varchar(60),
    index_range_start varchar(20),
    index_range_end   varchar(20),
    status            varchar(20)  not null default 'ACTIVE', -- ACTIVE | ENDED
    created_by        uuid         not null references users (id),
    started_at        timestamptz  not null default now(),
    ended_at          timestamptz,
    constraint uq_exam_sessions_session_code unique (session_code)
);

create index idx_exam_sessions_created_by on exam_sessions (created_by);

create table session_invigilators (
    id          bigserial   primary key,
    session_id  bigint      not null references exam_sessions (id),
    user_id     uuid        not null references users (id),
    assigned_by uuid        references users (id), -- null = joined by code
    joined_at   timestamptz not null default now(),
    constraint uq_session_invigilators unique (session_id, user_id)
);

create index idx_session_invigilators_user on session_invigilators (user_id);
create index idx_session_invigilators_assigned_by on session_invigilators (assigned_by);
