
-- Define all of our initial database schema in this file.
-- This would be ran for every type of environment we intend on running the system.
CREATE TABLE Users
(
	FirstName NVARCHAR(30),
	LastName NVARCHAR(30),
	Email NVARCHAR(30) PRIMARY KEY
);

CREATE TABLE AuctionResults
(
	Id INT AUTO_INCREMENT PRIMARY KEY,
	WinnerEmail NVARCHAR(30) NULL,
	INDEX auction_result_winner_index (WinnerEmail),
        FOREIGN KEY (WinnerEmail)
	REFERENCES Users(Email)
	ON DELETE CASCADE,

	WasSold TINYINT(1),
	IsClosed TINYINT(1)
);


CREATE TABLE Items
(
	Id INT AUTO_INCREMENT PRIMARY KEY,
	Name NVARCHAR(40) NOT NULL,
	SellerEmail NVARCHAR(30) NOT NULL,
	MaxBidPrice Numeric(15,2) NOT NULL,
	Category NVARCHAR(30) NOT NULL,
	AuctionResultId INT NOT NULL,
	StartPrice NUMERIC(15, 2) NOT NULL,

	EndDate DATETIME NOT NULL,

	INDEX item_user_index (SellerEmail),
        FOREIGN KEY (SellerEmail)
	REFERENCES Users(Email)
	ON DELETE CASCADE,

	INDEX item_auction_result_index (AuctionResultId),
        FOREIGN KEY (AuctionResultId)
	REFERENCES AuctionResults(Id)
	ON DELETE CASCADE
);


CREATE TABLE Bids
(
	Id INT AUTO_INCREMENT PRIMARY KEY,
	Amount NUMERIC(15,2) NOT NULL,
	UserEmail NVARCHAR(30) NOT NULL,
	TimeStamp DATETIME NOT NULL,
	ItemId INT NOT NULL,
	
	INDEX bid_user_index (UserEmail),
        FOREIGN KEY (UserEmail)
	REFERENCES Users(Email)
	ON DELETE CASCADE,

	INDEX bid_item_index (ItemId),
        FOREIGN KEY (ItemId)
	REFERENCES Items(Id)
	ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER AddNewBid
BEFORE INSERT ON Bids
FOR EACH ROW BEGIN
	 IF (NEW.Amount <= (SELECT MAX(Amount) FROM Bids WHERE ItemId = NEW.ItemId)) THEN
	    SET NEW.UserEmail = NULL; -- force a null fk so as to stop insert.
	 END IF;

	 IF ((SELECT COUNT(i.Id) FROM AuctionResults a
	 JOIN Items i on i.AuctionResultId = a.Id
	 WHERE a.IsClosed = 1 AND i.Id = NEW.ItemId
	 LIMIT 1) = 1) THEN
	       SET NEW.UserEmail = NULL;
	 END IF;
END;

$$
