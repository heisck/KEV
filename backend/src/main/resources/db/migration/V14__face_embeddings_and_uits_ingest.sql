-- V14: Precomputed face embeddings + real UITS-sourced photos.
--
-- Face matching previously re-derived a reference embedding from a JPEG on every
-- single comparison, so a 1:N roster scan cost N image fetches and 2N model runs.
-- Embeddings are constant per student, so they are computed once at ingest and
-- stored here; scan time becomes one probe embedding plus N dot products.

alter table directory_students
    add column if not exists face_embedding     bytea,
    add column if not exists face_det_score     real,
    add column if not exists face_model_version varchar(64),
    add column if not exists face_embedded_at   timestamptz,
    -- Identity in the external UITS system, so re-syncs update rather than duplicate.
    add column if not exists uits_id            varchar(64),
    add column if not exists nfc_code           varchar(64);

-- Partial index: the backfill only ever scans for rows still missing an embedding.
create index if not exists idx_directory_students_face_pending
    on directory_students (id)
    where face_embedding is null;

create unique index if not exists uq_directory_students_uits_id
    on directory_students (uits_id)
    where uits_id is not null;

-- V8 pointed all 40 seeded students at five shared stub portraits served from the
-- backend's own static folder. Five faces across forty identities guarantees false
-- matches, and the files are being deleted, so the rows would 404. Clear them: a
-- null photo_url means "not yet synced from UITS" and is skipped by the backfill.
alter table directory_students alter column photo_url drop not null;

update directory_students
   set photo_url = null
 where photo_url like '%/images/student_%.jpg';
