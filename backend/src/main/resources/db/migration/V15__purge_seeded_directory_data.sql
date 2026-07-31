-- V15: Purge the fabricated UITS directory. The roster now comes from the real
-- external UITS system (see UitsClient / RosterIngestService), so the ~200 invented
-- students, the 36 invented courses and their enrolments are not just dead weight:
-- they are indistinguishable from real records at the API boundary and would be
-- offered up as scannable candidates during a live exam.
--
-- Discriminator is `uits_id is null`, not an index-number range. Every row that has
-- genuinely been synced gets a uits_id (RosterIngestService.applyIncoming), and the
-- sync adopts a pre-existing row by index number — so a seeded row that turned out to
-- match a real student has already been claimed and keeps its data here.

-- attendance_records.student_id and student_reports.student_id are NOT NULL / no
-- cascade, so their demo rows have to go first. student_courses and
-- student_report_reads cascade on their own.
delete from attendance_records
 where student_id in (select id from directory_students where uits_id is null);

delete from student_reports
 where student_id in (select id from directory_students where uits_id is null);

delete from directory_students where uits_id is null;

-- Every course row was invented by V10; UITS carries identity only and there is no
-- course/enrolment feed yet. Enrolments cascade from courses.
delete from courses;
