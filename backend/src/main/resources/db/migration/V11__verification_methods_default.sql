-- V11: Align verification-method default with the app's capture set (FACE/NFC/MANUAL).
-- V8 introduced the column with default 'FACE,QR,MANUAL'; the live scan hub never
-- offered QR and needs NFC. Change the default and normalise existing default rows.

alter table exam_sessions alter column verification_methods set default 'FACE,NFC,MANUAL';

update exam_sessions
set verification_methods = 'FACE,NFC,MANUAL'
where verification_methods = 'FACE,QR,MANUAL';
