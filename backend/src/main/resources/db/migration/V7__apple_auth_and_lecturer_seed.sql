alter table users add column apple_sub varchar(255);
alter table users add constraint uq_users_apple_sub unique (apple_sub);
