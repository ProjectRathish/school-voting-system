CREATE TABLE `candidates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `voter_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `symbol_name` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
  PRIMARY KEY (`id`),
  UNIQUE KEY `voter_id` (`voter_id`,`election_id`),
  KEY `post_id` (`post_id`),
  KEY `school_id` (`school_id`),
  KEY `election_id` (`election_id`),
  CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`voter_id`) REFERENCES `voters` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidates_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidates_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  CONSTRAINT `candidates_ibfk_4` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) DEFAULT NULL,
  `section_id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `election_id` (`election_id`),
  KEY `section_id` (`section_id`),
  CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `election_officer_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `election_id` int(11) NOT NULL,
  `booth_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `election_id` (`election_id`,`user_id`),
  KEY `booth_id` (`booth_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `election_officer_assignments_ibfk_1` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  CONSTRAINT `election_officer_assignments_ibfk_2` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`),
  CONSTRAINT `election_officer_assignments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `elections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('DRAFT','CONFIGURING','READY','ACTIVE','PAUSED','CLOSED') DEFAULT 'DRAFT',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `election_code` varchar(50) DEFAULT NULL,
  `nomination_open` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `election_code` (`election_code`),
  KEY `school_id` (`school_id`),
  KEY `fk_election_creator` (`created_by`),
  CONSTRAINT `elections_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `fk_election_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `polling_booths` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `booth_number` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booth_number_school` (`school_id`,`booth_number`),
  KEY `school_id` (`school_id`),
  CONSTRAINT `polling_booths_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `candidate_classes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`candidate_classes`)),
  `voting_classes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`voting_classes`)),
  `gender_rule` enum('ANY','M','F') DEFAULT 'ANY',
  `priority` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `school_id` (`school_id`,`election_id`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `school_enquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name` varchar(200) NOT NULL,
  `contact_person` varchar(150) NOT NULL,
  `contact_email` varchar(150) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `schools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logo` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `plan_id` int(11) DEFAULT NULL,
  `subscription_status` enum('ACTIVE','EXPIRED','TRIAL') DEFAULT 'ACTIVE',
  `subscription_expiry` datetime DEFAULT NULL,
  `custom_max_voters` int(11) DEFAULT NULL,
  `custom_max_elections` int(11) DEFAULT NULL,
  `custom_max_booths` int(11) DEFAULT NULL,
  `custom_max_machines` int(11) DEFAULT NULL,
  `custom_max_officers` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `code_2` (`code`),
  KEY `fk_school_plan` (`plan_id`),
  CONSTRAINT `fk_school_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_section` (`school_id`,`election_id`,`name`),
  KEY `fk_sections_election` (`election_id`),
  CONSTRAINT `fk_sections_election` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sections_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `max_voters` int(11) NOT NULL,
  `max_elections` int(11) NOT NULL,
  `max_booths` int(11) NOT NULL DEFAULT 5,
  `max_machines` int(11) NOT NULL DEFAULT 10,
  `max_officers` int(11) NOT NULL DEFAULT 5,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','SCHOOL_ADMIN','BOOTH_OFFICER') NOT NULL,
  `must_change_password` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `booth_id` int(11) DEFAULT NULL,
  `temp_password` varchar(50) DEFAULT NULL,
  `plain_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_school_username` (`school_id`,`username`),
  KEY `fk_user_booth` (`booth_id`),
  CONSTRAINT `fk_user_booth` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `voters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `admission_no` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `class_id` int(11) NOT NULL,
  `division` varchar(50) DEFAULT NULL,
  `sex` enum('M','F') NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `has_voted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_blocked` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `election_id` (`election_id`,`admission_no`),
  KEY `school_id` (`school_id`),
  KEY `class_id` (`class_id`),
  CONSTRAINT `voters_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `voters_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  CONSTRAINT `voters_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2804 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `candidate_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `voter_class_id` int(11) DEFAULT NULL,
  `voter_section_id` int(11) DEFAULT NULL,
  `voter_sex` enum('M','F') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `school_id` (`school_id`),
  KEY `election_id` (`election_id`),
  KEY `post_id` (`post_id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `fk_vote_class` (`voter_class_id`),
  KEY `fk_vote_section` (`voter_section_id`),
  CONSTRAINT `fk_vote_class` FOREIGN KEY (`voter_class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vote_section` FOREIGN KEY (`voter_section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  CONSTRAINT `votes_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `votes_ibfk_4` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `voting_machines` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_id` int(11) NOT NULL,
  `booth_id` int(11) NOT NULL,
  `machine_name` varchar(100) NOT NULL,
  `machine_code` varchar(50) NOT NULL,
  `machine_token` varchar(255) NOT NULL,
  `status` enum('FREE','BUSY','OFFLINE') DEFAULT 'FREE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `current_voter_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `machine_code` (`machine_code`),
  UNIQUE KEY `machine_token` (`machine_token`),
  UNIQUE KEY `unique_machine_name_per_booth` (`booth_id`,`machine_name`),
  KEY `school_id` (`school_id`),
  KEY `fk_vm_voter` (`current_voter_id`),
  CONSTRAINT `fk_vm_voter` FOREIGN KEY (`current_voter_id`) REFERENCES `voters` (`id`) ON DELETE SET NULL,
  CONSTRAINT `voting_machines_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  CONSTRAINT `voting_machines_ibfk_3` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

