

-- This seeds a database with test data
-- Typically, this is done for developers

USE Development;

DELETE FROM Bids;
DELETE FROM Items;
DELETE FROM AuctionResults;
DELETE FROM Users;

DROP TABLE IF EXISTS Bids;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS AuctionResults;
DROP TABLE IF EXISTS Users;

SOURCE schema.sql

INSERT INTO Users VALUES ('tyler', 'vanderhoef', 'tyler@gmail.com');
INSERT INTO Users VALUES ('matt', 'burris', 'matt@yahoo.com');

INSERT INTO AuctionResults VALUES(1, 'tyler@gmail.com', 1, 1);
INSERT INTO AuctionResults VALUES(2, NULL, 0, 0);

INSERT INTO Items VALUES (1, 'Garden Gnome', 'matt@yahoo.com', 3.50, 'Gardening', 1, 2.00, NOW());
INSERT INTO Items VALUES (2, 'PS4', 'tyler@gmail.com', 250, 'Gaming', 2, 100.00, NOW());

INSERT INTO Bids VALUES(1, 2.50, 'tyler@gmail.com', NOW(), 1);
