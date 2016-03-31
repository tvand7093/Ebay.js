

-- This seeds a database with test data
-- Typically, this is done for developers

USE Development;

DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS AuctionResults;
DROP TABLE IF EXISTS Bids;

SOURCE schema.sql

