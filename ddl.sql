drop table todos;
create table todos (
    id varchar(64),
    "text" text,
    done boolean default false,
    added_dttm timestamp default now()   
);