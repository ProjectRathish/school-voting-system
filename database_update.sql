-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2026 at 01:18 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_voting_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `voter_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `symbol` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `symbol_name` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) DEFAULT NULL,
  `section_id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `school_id`, `election_id`, `section_id`, `name`, `created_at`) VALUES
(48, 31, NULL, 19, '7', '2026-03-21 15:45:42'),
(49, 31, NULL, 20, '1', '2026-03-23 15:59:38'),
(50, 31, NULL, 20, '2', '2026-03-23 15:59:46'),
(51, 31, NULL, 20, '3', '2026-03-23 15:59:52'),
(52, 31, NULL, 20, '4', '2026-03-23 15:59:59'),
(53, 31, NULL, 21, '5', '2026-03-23 16:00:05'),
(54, 31, NULL, 21, '6', '2026-03-23 16:00:11'),
(55, 31, NULL, 21, '7', '2026-03-23 16:00:18'),
(56, 31, NULL, 22, '8', '2026-03-23 16:00:24'),
(57, 31, NULL, 22, '9', '2026-03-23 16:00:31'),
(58, 31, NULL, 22, '10', '2026-03-23 16:00:39'),
(59, 31, NULL, 23, '11', '2026-03-23 16:00:46'),
(60, 31, NULL, 23, '12', '2026-03-23 16:00:57'),
(61, 31, 20, 24, 'Grade 1', '2026-05-08 09:53:55'),
(62, 31, 20, 24, 'Grade 2', '2026-05-08 09:54:08'),
(63, 31, 20, 24, 'Grade 3', '2026-05-08 09:54:18'),
(64, 31, 20, 24, 'Grade 4', '2026-05-08 09:54:32'),
(65, 31, 20, 25, 'Grade 5', '2026-05-08 09:54:44'),
(66, 31, 20, 25, 'Grade 6', '2026-05-08 09:54:53'),
(67, 31, 20, 25, 'Grade 7', '2026-05-08 09:55:06'),
(68, 31, 20, 26, 'Grade 8', '2026-05-08 09:55:14'),
(69, 31, 20, 26, 'Grade 9', '2026-05-08 09:55:23'),
(70, 31, 20, 26, 'Grade 10', '2026-05-08 09:55:35'),
(71, 31, 20, 27, 'Grade 11', '2026-05-08 09:55:44'),
(72, 31, 20, 27, 'Grade 12', '2026-05-08 09:55:54');

-- --------------------------------------------------------

--
-- Table structure for table `elections`
--

CREATE TABLE `elections` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('DRAFT','CONFIGURING','READY','ACTIVE','PAUSED','CLOSED') DEFAULT 'DRAFT',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `election_code` varchar(50) DEFAULT NULL,
  `nomination_open` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `elections`
--

INSERT INTO `elections` (`id`, `school_id`, `name`, `start_time`, `end_time`, `status`, `created_by`, `created_at`, `election_code`, `nomination_open`) VALUES
(20, 31, 'School Parliament Election 2026-27', '2026-05-09 00:00:00', '2026-05-09 01:00:00', 'CONFIGURING', 29, '2026-04-08 11:30:36', 'SPE0001-EL014', 1);

-- --------------------------------------------------------

--
-- Table structure for table `election_officer_assignments`
--

CREATE TABLE `election_officer_assignments` (
  `id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `booth_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `polling_booths`
--

CREATE TABLE `polling_booths` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `booth_number` varchar(50) NOT NULL,
  `location` varchar(255) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `candidate_classes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`candidate_classes`)),
  `voting_classes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`voting_classes`)),
  `gender_rule` enum('ANY','M','F') DEFAULT 'ANY'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `school_id`, `election_id`, `name`, `created_at`, `candidate_classes`, `voting_classes`, `gender_rule`) VALUES
(13, 31, 9, 'School Captain - Boy', '2026-03-17 11:40:38', '[30,33,35]', '[30]', 'ANY'),
(14, 31, 9, 'School Captain - Girl', '2026-03-18 10:10:47', '[40,41]', '[36,37,38,39,31,30,40,41]', 'ANY'),
(15, 31, 9, 'Sports Captain - Boy', '2026-03-18 10:50:22', '[32,30]', '[32,30]', 'ANY'),
(29, 31, 14, 'School Captain - Boy', '2026-04-07 10:19:37', '[30,33,35]', '[30]', 'ANY'),
(30, 31, 14, 'School Captain - Girl', '2026-04-07 10:19:37', '[40,41]', '[36,37,38,39,31,30,40,41]', 'ANY'),
(31, 31, 14, 'Sports Captain - Boy', '2026-04-07 10:19:37', '[32,30]', '[32,30]', 'ANY'),
(32, 31, 15, 'School Captain - Boy', '2026-04-07 10:28:05', '[30,33,35]', '[30]', 'ANY'),
(33, 31, 15, 'School Captain - Girl', '2026-04-07 10:28:05', '[40,41]', '[36,37,38,39,31,30,40,41]', 'ANY'),
(34, 31, 15, 'Sports Captain - Boy', '2026-04-07 10:28:05', '[32,30]', '[32,30]', 'ANY'),
(35, 31, 17, 'School Captain - Boy', '2026-04-07 10:38:12', '[30,33,35]', '[30]', 'ANY'),
(36, 31, 17, 'School Captain - Girl', '2026-04-07 10:38:12', '[40,41]', '[36,37,38,39,31,30,40,41]', 'ANY'),
(37, 31, 17, 'Sports Captain - Boy', '2026-04-07 10:38:12', '[32,30]', '[32,30]', 'ANY'),
(41, 31, 20, 'School Captain', '2026-05-08 09:56:54', '[72]', '[61,62,63,64,65,66,67,68,69,70,71,72]', 'ANY'),
(42, 31, 20, 'School Vice Captain', '2026-05-08 09:57:43', '[71,72]', '[67,68,69,70,71,72,66,65]', 'ANY'),
(43, 31, 20, 'Junior Captain', '2026-05-08 09:58:09', '[67]', '[65,66,67]', 'ANY'),
(44, 31, 20, 'Kiddies Captain', '2026-05-08 09:58:34', '[64]', '[61,62,63,64]', 'ANY'),
(45, 31, 20, 'Sports Captain Boy', '2026-05-08 09:59:43', '[68,69,70]', '[65,66,67,68,69,70,71,72]', 'M'),
(46, 31, 20, 'Sports Captain Girl', '2026-05-08 10:00:33', '[68,69,70]', '[65,66,67,68,69,70,71,72]', 'F'),
(47, 31, 20, 'Arts Secretary Boy', '2026-05-08 10:01:21', '[68,69,70]', '[65,66,67,68,69,70,71,72]', 'ANY'),
(48, 31, 20, 'Arts Secretary Girl', '2026-05-08 10:03:38', '[68,69,70]', '[65,66,67,68,69,70,71,72]', 'ANY');

-- --------------------------------------------------------

--
-- Table structure for table `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `logo` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schools`
--

INSERT INTO `schools` (`id`, `name`, `contact_person`, `code`, `location`, `created_at`, `logo`, `phone`, `email`, `address`) VALUES
(31, 'ISS English Medium Senior Secondary School', 'IT-Support', 'SPE0001', 'Perinthalmanna', '2026-03-17 10:47:29', '/uploads/school-logo/SPE0001.png', '9090909090', 'issemsonline@gmail.com', '');

-- --------------------------------------------------------

--
-- Table structure for table `school_enquiries`
--

CREATE TABLE `school_enquiries` (
  `id` int(11) NOT NULL,
  `school_name` varchar(200) NOT NULL,
  `contact_person` varchar(150) NOT NULL,
  `contact_email` varchar(150) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_enquiries`
--

INSERT INTO `school_enquiries` (`id`, `school_name`, `contact_person`, `contact_email`, `contact_phone`, `location`, `message`, `status`, `created_at`) VALUES
(9, 'ISS English Medium Senior Secondary School', 'Principal', 'issems@gmail.com', '9876543210', 'Perinthalmanna', 'Interested in school parliament election', 'APPROVED', '2026-03-05 09:41:31'),
(10, 'Sree Valluvanad Vidya Niketan', 'Principal', 'svvn@gmail.com', '9876543210', 'Perinthalmanna', 'Interested in school parliament election', 'APPROVED', '2026-03-05 09:41:54'),
(11, 'Sacred Heart CMI', 'Principal', 'cmi@gmail.com', '9876543210', 'Perinthalmanna', 'Interested in school parliament election', 'APPROVED', '2026-03-05 09:42:11'),
(12, 'St Joeph School', 'Principal', 'stj@gmail.com', '9876543210', 'Perinthalmanna', 'Interested in school parliament election', 'APPROVED', '2026-03-05 09:42:32'),
(13, 'Silver Mount International School', 'Principal', 'smis@gmail.com', '9876543210', 'Perinthalmanna', 'Interested in school parliament election', 'APPROVED', '2026-03-05 09:43:07'),
(14, 'Jaamiya School', 'Sajjd', 'sajjad@gmail.com', '+1234567890', 'Perinthalmanna', 'We would like to utilize this for our upcoming student elections.', 'APPROVED', '2026-03-16 11:23:19');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`id`, `school_id`, `election_id`, `name`, `created_at`) VALUES
(19, 31, NULL, 'UP', '2026-03-21 15:43:40'),
(20, 31, NULL, 'LP', '2026-03-23 15:58:14'),
(21, 31, NULL, 'UP', '2026-03-23 15:58:24'),
(22, 31, NULL, 'HS', '2026-03-23 15:58:32'),
(23, 31, NULL, 'HSS', '2026-03-23 15:58:39'),
(24, 31, 20, 'LP', '2026-05-08 09:52:54'),
(25, 31, 20, 'UP', '2026-05-08 09:53:01'),
(26, 31, 20, 'HS', '2026-05-08 09:53:08'),
(27, 31, 20, 'HSS', '2026-05-08 09:53:19');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('SUPER_ADMIN','SCHOOL_ADMIN','BOOTH_OFFICER') NOT NULL,
  `must_change_password` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `booth_id` int(11) DEFAULT NULL,
  `temp_password` varchar(50) DEFAULT NULL,
  `plain_password` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `school_id`, `username`, `password_hash`, `role`, `must_change_password`, `created_at`, `booth_id`, `temp_password`, `plain_password`) VALUES
(16, NULL, 'SUPER_ADMIN', '$2b$10$fLISWpfimf8hkyT9fwmZBuaLlCBFGze7nnBXNM1mDCRN/mcmsWL2.', 'SUPER_ADMIN', 0, '2026-03-05 10:40:03', NULL, NULL, NULL),
(29, 31, 'SPE0001', '$2b$10$rN13Xf402dmY3AIQqefB1e0REXzkjPn8x8lXUOViIIpAohpS8o20q', 'SCHOOL_ADMIN', 0, '2026-03-17 10:47:29', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `voters`
--

CREATE TABLE `voters` (
  `id` int(11) NOT NULL,
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
  `is_blocked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `votes`
--

CREATE TABLE `votes` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `voter_class_id` int(11) DEFAULT NULL,
  `voter_section_id` int(11) DEFAULT NULL,
  `voter_sex` enum('M','F') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voting_machines`
--

CREATE TABLE `voting_machines` (
  `id` int(11) NOT NULL,
  `school_id` int(11) NOT NULL,
  `election_id` int(11) NOT NULL,
  `booth_id` int(11) NOT NULL,
  `machine_name` varchar(100) NOT NULL,
  `machine_code` varchar(50) NOT NULL,
  `machine_token` varchar(255) NOT NULL,
  `status` enum('FREE','BUSY','OFFLINE') DEFAULT 'FREE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `current_voter_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `voter_id` (`voter_id`,`election_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `election_id` (`election_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `election_id` (`election_id`),
  ADD KEY `section_id` (`section_id`);

--
-- Indexes for table `elections`
--
ALTER TABLE `elections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `election_code` (`election_code`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `fk_election_creator` (`created_by`);

--
-- Indexes for table `election_officer_assignments`
--
ALTER TABLE `election_officer_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `election_id` (`election_id`,`user_id`),
  ADD KEY `booth_id` (`booth_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `polling_booths`
--
ALTER TABLE `polling_booths`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `election_id` (`election_id`,`booth_number`),
  ADD KEY `school_id` (`school_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `school_id` (`school_id`,`election_id`,`name`);

--
-- Indexes for table `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`);

--
-- Indexes for table `school_enquiries`
--
ALTER TABLE `school_enquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_section` (`school_id`,`election_id`,`name`),
  ADD KEY `fk_sections_election` (`election_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_school_username` (`school_id`,`username`),
  ADD KEY `fk_user_booth` (`booth_id`);

--
-- Indexes for table `voters`
--
ALTER TABLE `voters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `election_id` (`election_id`,`admission_no`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `class_id` (`class_id`);

--
-- Indexes for table `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `election_id` (`election_id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `candidate_id` (`candidate_id`),
  ADD KEY `fk_vote_class` (`voter_class_id`),
  ADD KEY `fk_vote_section` (`voter_section_id`);

--
-- Indexes for table `voting_machines`
--
ALTER TABLE `voting_machines`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `machine_code` (`machine_code`),
  ADD UNIQUE KEY `machine_token` (`machine_token`),
  ADD UNIQUE KEY `unique_machine_name_per_booth` (`booth_id`,`machine_name`),
  ADD KEY `school_id` (`school_id`),
  ADD KEY `election_id` (`election_id`),
  ADD KEY `fk_vm_voter` (`current_voter_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `elections`
--
ALTER TABLE `elections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `election_officer_assignments`
--
ALTER TABLE `election_officer_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `polling_booths`
--
ALTER TABLE `polling_booths`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `school_enquiries`
--
ALTER TABLE `school_enquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `voters`
--
ALTER TABLE `voters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=893;

--
-- AUTO_INCREMENT for table `votes`
--
ALTER TABLE `votes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `voting_machines`
--
ALTER TABLE `voting_machines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`voter_id`) REFERENCES `voters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidates_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidates_ibfk_3` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `candidates_ibfk_4` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `classes_ibfk_3` FOREIGN KEY (`section_id`) REFERENCES `sections` (`id`);

--
-- Constraints for table `elections`
--
ALTER TABLE `elections`
  ADD CONSTRAINT `elections_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `fk_election_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `election_officer_assignments`
--
ALTER TABLE `election_officer_assignments`
  ADD CONSTRAINT `election_officer_assignments_ibfk_1` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `election_officer_assignments_ibfk_2` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`),
  ADD CONSTRAINT `election_officer_assignments_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `polling_booths`
--
ALTER TABLE `polling_booths`
  ADD CONSTRAINT `polling_booths_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `polling_booths_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `fk_sections_election` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sections_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_booth` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`);

--
-- Constraints for table `voters`
--
ALTER TABLE `voters`
  ADD CONSTRAINT `voters_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `voters_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `voters_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`);

--
-- Constraints for table `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `fk_vote_class` FOREIGN KEY (`voter_class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_vote_section` FOREIGN KEY (`voter_section_id`) REFERENCES `sections` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `votes_ibfk_3` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  ADD CONSTRAINT `votes_ibfk_4` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`);

--
-- Constraints for table `voting_machines`
--
ALTER TABLE `voting_machines`
  ADD CONSTRAINT `fk_vm_voter` FOREIGN KEY (`current_voter_id`) REFERENCES `voters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `voting_machines_ibfk_1` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`),
  ADD CONSTRAINT `voting_machines_ibfk_2` FOREIGN KEY (`election_id`) REFERENCES `elections` (`id`),
  ADD CONSTRAINT `voting_machines_ibfk_3` FOREIGN KEY (`booth_id`) REFERENCES `polling_booths` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
