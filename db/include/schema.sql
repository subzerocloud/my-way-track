


drop table if exists todos;


create table todos (
    id integer primary key autoincrement,
    title text not null,
    done boolean default 0 not null,
    user_id text not null default (jwt() ->> 'sub')
);



