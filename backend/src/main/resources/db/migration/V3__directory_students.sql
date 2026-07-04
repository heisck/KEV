-- Simulated university directory (UITS mock). Replaced by a real integration later;
-- the application only reads it through the UniversityDirectory interface.
create table directory_students (
    id           bigserial primary key,
    index_number varchar(20)  not null,
    full_name    varchar(160) not null,
    programme    varchar(120) not null,
    level        smallint     not null,
    photo_url    varchar(512) not null,
    enrolled     boolean      not null default true,
    fees_status  varchar(20)  not null, -- PAID | PARTIAL | OWING
    created_at   timestamptz  not null default now(),
    updated_at   timestamptz  not null default now(),
    constraint uq_directory_students_index_number unique (index_number)
);

create index idx_directory_students_index_number on directory_students (index_number);
