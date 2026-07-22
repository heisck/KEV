-- Migration V14: Remove all mock / seeded user accounts and existing mock sessions/messages.
-- Keeps student directory, courses, and course enrollment schema intact.

truncate table notifications, messages, conversations, session_invigilators, attendance_records, exam_sessions cascade;
delete from users;
