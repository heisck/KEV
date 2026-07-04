-- Apple sign-in linkage + a seeded lecturer (lecturers are pre-provisioned;
-- there is no self-registration). Password: Lecturer@1234
alter table users add column apple_sub varchar(255);
alter table users add constraint uq_users_apple_sub unique (apple_sub);

insert into users (email, display_name, role, plan, password_hash)
values ('lecturer@kev.app', 'Dr. Kwame Mensah', 'LECTURER', 'FREE',
        '$2b$10$TZ7A8ea6EDI2wbqEWFotTeN68uRzWI64/JqAorcbxPl9gXKHBdHWC');
