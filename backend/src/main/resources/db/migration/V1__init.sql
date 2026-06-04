-- Baseline schema for KEV. AUTH ONLY — domain tables (rooms, courses, index
-- ranges, sessions) are added during the build phase, not in this setup phase.

create table users (
    id           uuid primary key     default gen_random_uuid(),
    email        varchar(320) not null,
    google_sub   varchar(255),
    display_name varchar(255),
    picture_url  varchar(1024),
    role         varchar(32)  not null default 'USER',
    created_at   timestamptz  not null default now(),
    updated_at   timestamptz  not null default now(),
    constraint uq_users_email      unique (email),
    constraint uq_users_google_sub unique (google_sub)
);

create index idx_users_email on users (email);
