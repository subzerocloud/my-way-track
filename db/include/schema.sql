
drop table if exists opportunities;


create table opportunities (
    id integer primary key autoincrement,
    position_title text not null,
    company_name text not null,
    company_website text,
    company_size text check( company_size in ('very-small', 'small', 'medium', 'large', 'enterprise', 'large-enterprise') ),
    company_contacts text,
    sentiment integer check( sentiment between 0 and 5 ),
    sentiment_detail text,
    work_arrangement text check( work_arrangement in ('full-time', 'part-time') ),
    employment_type text check( employment_type in ('permanent', 'contract', 'temporary', 'internship') ),
    compensation text,
    location text,
    is_remote boolean,
    external_url text,
    description text,
    close_reason text check( close_reason in ('accepted', 'declined', 'withdrawn', 'other') ),
    additional_detail text,
    stage_ids json,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
);

create trigger update_updated_at 
after update on opportunities
for each row
begin
    update opportunities set updated_at = current_timestamp where id = old.id;
end;


drop table if exists stages;
create table stages (
    id integer primary key autoincrement,
    stage_name text,
    order_index integer
);

insert into stages (id, stage_name, order_index) values
    -- application
    (1, 'applied', 1),
    (2, 'contacted by company', 2),
    (3, 'contacted by external recruiter', 3),
    (4, 'recruiter screen', 4),
    -- screening
    (5, 'hiring manager screen', 5),
    (6, 'take home assignment', 6),
    (7, 'screening interview', 7),

    -- interview
    (8, 'interview', 8),
    -- offer
    (9, 'reference check', 9),
    (10, 'verbal offer', 10),
    (11, 'written offer', 11);

