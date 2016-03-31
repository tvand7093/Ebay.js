
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

	INDEX bid_user_index (UserEmail),
        FOREIGN KEY (UserEmail)
	REFERENCES Users(Email)
	ON DELETE CASCADE
);
