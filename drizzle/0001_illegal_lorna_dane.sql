CREATE TABLE `books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`isbn` varchar(20) NOT NULL,
	`genre` varchar(100) NOT NULL,
	`category` varchar(100) NOT NULL,
	`publisher` varchar(255),
	`publishedYear` int,
	`totalCopies` int NOT NULL DEFAULT 1,
	`availableCopies` int NOT NULL DEFAULT 1,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_isbn_unique` UNIQUE(`isbn`)
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookId` int NOT NULL,
	`memberId` int NOT NULL,
	`borrowDate` timestamp NOT NULL DEFAULT (now()),
	`dueDate` date NOT NULL,
	`returnDate` date,
	`status` enum('active','returned','overdue') NOT NULL DEFAULT 'active',
	`isOverdue` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memberId` varchar(50) NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(20),
	`address` text,
	`joinDate` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `members_id` PRIMARY KEY(`id`),
	CONSTRAINT `members_memberId_unique` UNIQUE(`memberId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('borrow','return','fine','book_added','book_deleted','member_registered') NOT NULL,
	`bookId` int,
	`memberId` int,
	`loanId` int,
	`amount` decimal(10,2),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
