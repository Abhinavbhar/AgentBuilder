package db

var Ddl string = `CREATE TABLE IF NOT EXISTS Users (
    userId INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscription VARCHAR(50),
    chatBotNumber INT,
    picture VARCHAR(255),
    name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS ChatBot (
    userId INT PRIMARY KEY REFERENCES Users(userId),
    dataAddress VARCHAR(255),
    usedMessageMonthly INT DEFAULT 0,
    allowedChatsPerMonth INT DEFAULT 0,
    title VARCHAR(255),
    desciption TEXT
);
`
