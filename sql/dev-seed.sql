

-- This seeds a database with test data
-- Typically, this is done for developers

USE Development;

DROP TABLE IF EXISTS Users;

SOURCE schema.sql

INSERT INTO Users
VALUES ('Tyler', 'Vanderhoef', 1);

INSERT INTO Users
VALUES ('Matt', 'Burris', 1);

INSERT INTO Users
VALUES ('Chris', 'Willette', 0);


SELECT * FROM Users;
