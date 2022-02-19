drop table if exists todos;
create table todos (
    id varchar,
    "text" text,
    done boolean default false,
    added_dttm timestamp default now()   
);

insert into todos (id, text)
values ('1', 'Write HTML');

insert into todos (id, text)
values ('2', 'Write CSS');

insert into todos (id, text)
values ('3', 'Write JS');

insert into todos (id, text, done)
values ('4', 'Setup environment', true);

drop table if exists session_ids;
create table session_ids (
    id varchar primary key,
    params json,
    valid_to timestamp,
    user_id varchar
);

create index session_valid_to_ix on session_ids (valid_to);

drop table if exists users;
create table users (
    id varchar,
    username varchar,
    password varchar,
    added_dttm timestamp default now()
);