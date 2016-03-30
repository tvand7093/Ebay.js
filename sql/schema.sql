
-- TODO:
-- Define all of our initial database schema in this file.
-- This would be ran for every type of environment we intend on running the system.


CREATE TABLE Users
(
	FirstName nvarchar(30),
	LastName nvarchar(30),
	IsDeveloper tinyint,
	PRIMARY KEY(FirstName, LastName)
);
