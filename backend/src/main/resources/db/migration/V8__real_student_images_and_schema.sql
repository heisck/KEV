-- V8: Add full domain schema fields (lecturer attributes, session details, notifications, chat) and point student photos to real AI images.

-- 1. Enhance users table for Lecturers / Admins
alter table users add column if not exists lecturer_id varchar(50);
alter table users add column if not exists personal_email varchar(320);
alter table users add column if not exists phone varchar(50);
alter table users add column if not exists status varchar(20) not null default 'ACTIVE';
alter table users add column if not exists is_active boolean not null default true;
alter table users add column if not exists created_by_admin uuid references users(id);
alter table users add column if not exists last_login timestamptz;

create index if not exists idx_users_lecturer_id on users (lecturer_id);
create index if not exists idx_users_status on users (status);

-- 2. Enhance exam_sessions for multi-step creation and live status
alter table exam_sessions add column if not exists title varchar(255);
alter table exam_sessions add column if not exists session_password varchar(32);
alter table exam_sessions add column if not exists exam_date date;
alter table exam_sessions add column if not exists start_time varchar(20);
alter table exam_sessions add column if not exists end_time varchar(20);
alter table exam_sessions add column if not exists verification_methods varchar(100) default 'FACE,QR,MANUAL';

-- 3. Enhance session_invigilators for roles (CREATOR vs INVIGILATOR)
alter table session_invigilators add column if not exists role varchar(32) not null default 'INVIGILATOR';

-- 4. Enhance attendance_records for verification tracking
alter table attendance_records add column if not exists verification_status varchar(20) not null default 'VERIFIED';

-- 5. Notifications table
create table if not exists notifications (
    id          bigserial primary key,
    user_id     uuid        not null references users (id),
    title       varchar(255) not null,
    message     text         not null,
    type        varchar(50)  not null default 'INFO',
    read        boolean      not null default false,
    created_at  timestamptz  not null default now()
);

create index if not exists idx_notifications_user_id on notifications (user_id);

-- 6. Conversations and Messages tables for Lecturer directory messaging
create table if not exists conversations (
    id          bigserial primary key,
    user1_id    uuid not null references users (id),
    user2_id    uuid not null references users (id),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    constraint uq_conversations_users unique (user1_id, user2_id)
);

create table if not exists messages (
    id              bigserial primary key,
    conversation_id bigint not null references conversations (id),
    sender_id       uuid not null references users (id),
    content         text not null,
    read            boolean not null default false,
    created_at      timestamptz not null default now()
);

create index if not exists idx_messages_conversation on messages (conversation_id);
create index if not exists idx_messages_sender on messages (sender_id);

-- 7. Update directory_students photo_url from placeholder links to real hosted AI student images
update directory_students set photo_url = 'http://localhost:8080/images/student_ama.jpg' where index_number in ('10953001', '10953006', '10953011', '10953016', '10953021', '10953026', '10953031', '10953036');
update directory_students set photo_url = 'http://localhost:8080/images/student_kwame.jpg' where index_number in ('10953002', '10953007', '10953012', '10953017', '10953022', '10953027', '10953032', '10953037');
update directory_students set photo_url = 'http://localhost:8080/images/student_efua.jpg' where index_number in ('10953003', '10953008', '10953013', '10953018', '10953023', '10953028', '10953033', '10953038');
update directory_students set photo_url = 'http://localhost:8080/images/student_yaw.jpg' where index_number in ('10953004', '10953009', '10953014', '10953019', '10953024', '10953029', '10953034', '10953039');
update directory_students set photo_url = 'http://localhost:8080/images/student_akosua.jpg' where index_number in ('10953005', '10953010', '10953015', '10953020', '10953025', '10953030', '10953035', '10953040');

-- 8. Seed some real upcoming / ongoing / completed sessions and invigilators
update users set phone = '+233 24 123 4567', personal_email = 'dr.kwame@gmail.com', lecturer_id = 'LEC-001', status = 'ACTIVE', is_active = true where email = 'lecturer@kev.app';

insert into users (email, display_name, role, plan, password_hash, lecturer_id, personal_email, phone, status, is_active)
values ('ama.mensah@knust.edu.gh', 'Dr. Ama Mensah', 'LECTURER', 'FREE',
        '$2b$10$TZ7A8ea6EDI2wbqEWFotTeN68uRzWI64/JqAorcbxPl9gXKHBdHWC', 'LEC-002', 'ama.m@gmail.com', '+233 20 987 6543', 'ACTIVE', true)
on conflict (email) do nothing;

insert into users (email, display_name, role, plan, password_hash, lecturer_id, personal_email, phone, status, is_active)
values ('kofi.appiah@knust.edu.gh', 'Prof. Kofi Appiah', 'LECTURER', 'FREE',
        '$2b$10$TZ7A8ea6EDI2wbqEWFotTeN68uRzWI64/JqAorcbxPl9gXKHBdHWC', 'LEC-003', 'kofi.appiah@yahoo.com', '+233 54 321 0987', 'ACTIVE', true)
on conflict (email) do nothing;
