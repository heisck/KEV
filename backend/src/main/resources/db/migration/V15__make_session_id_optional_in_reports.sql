-- Migration V15: Make session_id optional for general reports
alter table student_reports alter column session_id drop not null;
