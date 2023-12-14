
insert into opportunities (id, position_title, company_name, company_website, company_size, company_contacts, sentiment, sentiment_detail, work_arrangement, employment_type, compensation, location, is_remote, external_url, description, close_reason, additional_detail, stage_ids, created_at, updated_at) values
    (1, 'Software Engineer', 'Google', 'https://google.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '100k', 'Mountain View, CA', 1, 'https://google.com', 'Great company', 'declined', null, '[1]', '2023-10-01 00:00:00', '2023-11-10 00:00:00'),
    (2, 'Software Engineer', 'Facebook', 'https://facebook.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '120k', 'Mountain View, CA', 1, 'https://facebook.com', 'Great company', 'accepted', null, '[1,2]', '2023-10-02 00:00:00', '2023-11-15 00:00:00'),
    (3, 'Software Engineer', 'Amazon', 'https://amazon.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '140k', 'Mountain View, CA', 1, 'https://amazon.com', 'Great company', null, null, '[1,2,3]', '2023-10-05 00:00:00', '2023-11-20 00:00:00'),
    (4, 'Software Engineer', 'Microsoft', 'https://microsoft.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '100k', 'Mountain View, CA', 1, 'https://microsoft.com', 'Great company', null, null, '[1,2,3,4]', '2023-10-20 00:00:00', '2023-11-25 00:00:00'),
    (5, 'Software Engineer', 'Apple', 'https://apple.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '180k', 'Mountain View, CA', 1, 'https://apple.com', 'Great company', null, null, '[1,2,3,4,5]', '2023-11-01 00:00:00', '2023-11-30 00:00:00'),
    (6, 'Software Engineer', 'Netflix', 'https://netflix.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '150k', 'Mountain View, CA', 1, 'https://netflix.com', 'Great company', null, null, '[1,2,3,4,5,6]', '2023-11-02 00:00:00', '2023-12-01 00:00:00'),
    (7, 'Software Engineer', 'Tesla', 'https://tesla.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '120k', 'Mountain View, CA', 1, 'https://tesla.com', 'Great company', null, null, '[1,2,3,4,5,6,7]', '2023-11-03 00:00:00', '2023-12-05 00:00:00'),
    (8, 'Software Engineer', 'Uber', 'https://uber.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '130k', 'Mountain View, CA', 1, 'https://uber.com', 'Great company', null, null, '[1,2,3,4,5,6,7,8]', '2023-11-04 00:00:00', '2023-12-10 00:00:00'),
    (9, 'Software Engineer', 'Airbnb', 'https://airbnb.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '140k', 'Mountain View, CA', 1, 'https://airbnb.com', 'Great company', null, null, '[1,2,3,4,5,6,7,8,9]', '2023-11-05 00:00:00', '2023-12-15 00:00:00'),
    (10, 'Software Engineer', 'Lyft', 'https://lyft.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '120k', 'Mountain View, CA', 1, 'https://lyft.com', 'Great company', null, null, '[1,2,3,4,5,6,7,8,9,10]', '2023-11-06 00:00:00', '2023-12-20 00:00:00'),
    (11, 'Software Engineer', 'Twitter', 'https://twitter.com', 'large-enterprise', 'John Doe', 5, 'Great company', 'full-time', 'permanent', '130k', 'Mountain View, CA', 0, 'https://twitter.com', 'Great company', null, null, '[1,2,3,4,5,6,7,8,9,10,11]', '2023-11-07 00:00:00', '2023-12-25 00:00:00');

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


