drop table if exists todos;
create table todos (
    id varchar(64),
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
    id varchar(64),
    valid_to timestamp,
    user_id varchar(64)
);

drop table if exists users;
create table users (
    id varchar(64),
    username varchar(64),
    password varchar(64),
    added_dttm timestamp default now()
);