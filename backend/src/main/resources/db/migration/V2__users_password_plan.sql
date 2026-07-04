-- Email/password auth for admins + FREE/PREMIUM plan tier.
alter table users add column password_hash varchar(100);
alter table users add column plan varchar(20) not null default 'FREE';
