-- V16: Remove every seeded account. Accounts are provisioned by an administrator
-- (AdminService.createLecturer) and the first administrator comes from the
-- KEV_ADMIN_* environment (AdminBootstrap) — nothing ships with a login baked in.
--
-- These 14 rows carried two bcrypt hashes committed to the repo in V6/V7/V8/V10
-- ("Admin@1234" and "Lecturer@1234"), so anyone with the source could sign in as an
-- administrator against any deployment that ran the seed.
--
-- Matched by the exact seeded addresses rather than by password hash: an operator who
-- rotated one of these passwords in-app still gets the account removed, which is the
-- point — the account itself is the liability, not the password on it.

create temporary table seeded_users on commit drop as
select id from users where email in (
    'admin@kev.app',                 -- V6  ADMIN
    'lecturer@kev.app',              -- V7  LEC-001
    'ama.mensah@knust.edu.gh',       -- V8  LEC-002
    'kofi.appiah@knust.edu.gh',      -- V8  LEC-003
    'yaw.boateng@knust.edu.gh',      -- V10 LEC-004
    'abena.osei@knust.edu.gh',       -- V10 LEC-005
    'kwaku.adjei@knust.edu.gh',      -- V10 LEC-006
    'efua.danso@knust.edu.gh',       -- V10 LEC-007
    'kojo.asante@knust.edu.gh',      -- V10 LEC-008
    'adwoa.frimpong@knust.edu.gh',   -- V10 LEC-009
    'kwabena.owusu@knust.edu.gh',    -- V10 LEC-010
    'akosua.mensah@knust.edu.gh',    -- V10 LEC-011
    'yaw.amankwah@knust.edu.gh',     -- V10 LEC-012
    'esi.nkrumah@knust.edu.gh'       -- V10 LEC-013
);

-- Sessions those accounts created go too: their roster, invigilators and reports are
-- all demo artefacts, and exam_sessions.created_by is NOT NULL so they cannot be orphaned.
create temporary table seeded_sessions on commit drop as
select id from exam_sessions where created_by in (select id from seeded_users);

-- Children first. student_report_reads also cascades from student_reports, but a seeded
-- user may have read a report that is itself staying.
delete from student_report_reads
 where user_id in (select id from seeded_users)
    or report_id in (select id from student_reports
                      where author_id in (select id from seeded_users)
                         or session_id in (select id from seeded_sessions));

delete from student_reports
 where author_id in (select id from seeded_users)
    or session_id in (select id from seeded_sessions);

-- removed_by is nullable (keep the record, drop the reference); checked_in_by is not.
update attendance_records set removed_by = null
 where removed_by in (select id from seeded_users);

delete from attendance_records
 where session_id in (select id from seeded_sessions)
    or checked_in_by in (select id from seeded_users);

update session_invigilators set assigned_by = null
 where assigned_by in (select id from seeded_users);

delete from session_invigilators
 where session_id in (select id from seeded_sessions)
    or user_id in (select id from seeded_users);

delete from messages
 where sender_id in (select id from seeded_users)
    or conversation_id in (select id from conversations
                            where user1_id in (select id from seeded_users)
                               or user2_id in (select id from seeded_users));

delete from conversations
 where user1_id in (select id from seeded_users)
    or user2_id in (select id from seeded_users);

delete from notifications where user_id in (select id from seeded_users);

delete from exam_sessions where id in (select id from seeded_sessions);

-- Self-referencing FK: a real lecturer provisioned by the seeded admin keeps their row.
update users set created_by_admin = null
 where created_by_admin in (select id from seeded_users);

delete from users where id in (select id from seeded_users);
