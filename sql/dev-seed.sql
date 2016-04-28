

-- This seeds a database with test data
-- Typically, this is done for developers
-- NOTE: This needs to be ran using the root user account.

DROP DATABASE IF EXISTS Development;

CREATE DATABASE Development;
GRANT ALL PRIVILEGES ON Development.* TO 'developer'@'%';

USE Development

SOURCE schema.sql

INSERT INTO Users VALUES ('tyler', 'vanderhoef', 'tyler@gmail.com');
INSERT INTO Users VALUES ('matt', 'burris', 'matt@yahoo.com');

INSERT INTO AuctionResults VALUES(1, NULL, 0, 0);
INSERT INTO AuctionResults VALUES(2, NULL, 0, 0);

INSERT INTO Items VALUES (1, 'Garden Gnome', 'matt@yahoo.com', 3.50, 'Gardening', 1, 2.00, '2016-5-24 08:10:13');
INSERT INTO Items VALUES (2, 'PS4', 'tyler@gmail.com', 250, 'Gaming', 2, 100.00, '2016-4-29 19:15:00');

INSERT INTO Bids VALUES(1, 151.30, 'tyler@gmail.com', NOW(), 2);


