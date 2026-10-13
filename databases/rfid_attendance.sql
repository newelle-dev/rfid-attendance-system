-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 27, 2025 at 11:08 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rfid_attendance`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `employee_id` varchar(50) NOT NULL COMMENT 'Ashima ID',
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','security','hr') NOT NULL DEFAULT 'admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` datetime DEFAULT NULL COMMENT 'Records the timestamp of user''s most recent login'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `username`, `employee_id`, `password`, `role`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'super admin', 'superadmin', '00-00000', '$2b$10$Uwe5YP0FF4qJu6u2VSjiQOgYpbC9FoqbBTbt6G1rCFGtwvVLxEcpK', 'superadmin', '2025-06-24 05:22:47', '2025-06-24 06:18:44', '2025-06-24 14:18:44'),
(2, 'admin', 'admin', '01-00000', '$2b$10$eAeJ.6L6aS1cq1tfVPT4n.aiHcPiTWUE2Ec9Z7kOgIBHfwhVoTYHK', 'admin', '2025-06-23 07:41:23', '2025-06-24 05:34:10', NULL),
(3, 'jerico calrosssss', 'jcarlos', '22-04019', '$2b$10$aiCr3EsHqAnN1u3BEGIdhuZqxyOr1y51mAfT.o5olRN/a8C.iNvLq', 'admin', '2025-06-24 05:26:50', '2025-06-27 08:59:07', '2025-06-27 16:59:07'),
(4, 'security', 'security', '02-00000', '$2b$10$7KT94vGFYEz7URgChn74SuL0y2KzaNwYAtFJtD77MsYHX/gQb8BR6', 'security', '2025-06-24 05:30:25', '2025-06-24 06:17:05', '2025-06-24 14:17:05'),
(5, 'human resources', 'hr123', '03-00000', '$2b$10$XLgtklv418rslbq4.825OO45CG58JKgWo9KcCb8EWb5QI9R0l3inO', 'hr', '2025-06-24 05:30:58', '2025-06-24 05:42:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(20) DEFAULT NULL,
  `log_type` varchar(10) DEFAULT NULL,
  `in_time` datetime DEFAULT NULL,
  `out_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
(32, ' MCI CLARUS CLERICAL'),
(61, 'ACCOUNTING DEPARTMENT'),
(39, 'ADHERE'),
(13, 'ADMIN-MEDICAL'),
(50, 'BPOAAS'),
(16, 'CLEAR INSIGHTS'),
(59, 'DAIRY QUEEN'),
(4, 'DARWIN CX'),
(14, 'DIGITAL MEDIA SOLUTIONS'),
(9, 'FACILITY & MAINTENANCE DEPARTMENT'),
(24, 'FINANCE DEPARTMENT'),
(22, 'GLC-WBI VOICE'),
(19, 'HALE GROVES PITTMAN YARDEN'),
(36, 'HFMED'),
(26, 'HR DEPARTMENT'),
(55, 'IBTM'),
(5, 'IT DEPARTMENT'),
(27, 'KUTLER TAX'),
(54, 'LEARNING & DEVELOPMENT DEPARTMENT'),
(3, 'MANAGEMENT'),
(53, 'MCI - VALOR 3PC'),
(47, 'MCI CLARUS CLERICAL'),
(45, 'MCI-ACCOUNTING'),
(7, 'MCI-BPOAAS CUSTCARE'),
(15, 'MCI-BPOAAS IBTM'),
(12, 'MCI-BROOKS BROTHERS'),
(11, 'MCI-CHIPOTLE'),
(33, 'MCI-EDDIE BAUER'),
(44, 'MCI-FINANCE'),
(35, 'MCI-GRAVIS'),
(37, 'MCI-IT HELP'),
(42, 'MCI-MARKETFORCE DAIRY QUEEN'),
(23, 'MCI-MYSTERY SHOPPER'),
(1, 'MCI-REAL TIME ANALYST'),
(46, 'MCI-ROOF MARKETPLACE-DVO'),
(17, 'MCI-RPO'),
(43, 'MCI-SHARED'),
(28, 'MCI-SQL'),
(48, 'MCI-UNITED UNIFORM'),
(10, 'MCI-VALOR ADMIN'),
(31, 'MCI-VALOR COLLECTIONS'),
(21, 'NATIONAL FLOOD SERVICES'),
(29, 'OCX CXOPS'),
(51, 'OPERATIONS'),
(58, 'PRRS - COLLECTION'),
(38, 'RECRUITMENT'),
(60, 'REGENCY FURNITURE'),
(8, 'SAFETY SERVICES COMPANY'),
(2, 'SAVE TEAM'),
(40, 'SECURITY DEPARTMENT'),
(41, 'SHUTTLE SERVICE'),
(52, 'VALOR COLLECTIONAGENT'),
(49, 'VICI'),
(20, 'WARE TEAM');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `ashima_id` varchar(12) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL,
  `photo` longblob DEFAULT NULL,
  `emp_stat` varchar(12) DEFAULT NULL,
  `status` enum('active','inactive','resigned') DEFAULT 'active',
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `last_active` datetime DEFAULT NULL,
  `leader` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `ashima_id`, `name`, `rfid_tag`, `photo`, `emp_stat`, `status`, `department_id`, `position_id`, `last_active`, `leader`) VALUES
(114, '21-03493', 'ARBY CRISOSTOMO DELOS REYES', '1336003435', NULL, 'Regular', 'active', 19, 42, NULL, NULL),
(115, '21-03494', 'ARIANE ROSE ADONA PANGILINAN', '1331911259', NULL, 'Regular', 'active', 19, 42, NULL, NULL),
(116, '21-03518', 'REMIE SAPERO POLISTICO', '1339379931', 0x00, 'Regular', 'active', 36, 42, NULL, NULL),
(124, '21-03604', 'DESCARTES MORIAL ORA', NULL, 0x00, 'Regular', 'active', 28, 32, NULL, NULL),
(125, '21-03629', 'MARIA BIANCA RANIN GONZALES', '1340460219', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(127, '21-03635', 'CHESCA MAGNO ROMERO', '1330828699', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(129, '21-03638', 'JOSEPH RITZ FLORES BAUTISTA', '1339151035', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(130, '21-03639', 'REYMARK CALMA DIMLA', '1340447403', NULL, 'Regular', 'active', 23, 42, NULL, NULL),
(132, '21-03742', 'KENNETH LAPIRA VERSOZA', '1339740715', 0x00, 'Regular', 'active', 36, 42, NULL, NULL),
(136, '22-03801', 'SYDNEY MANACMUL PASIA', '1339389579', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(137, '22-03808', 'ODESA PASCUBILLO RECIO', '1337851019', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(142, '22-03835', 'ROSAN DISUASIDO MANOY', '1333209579', 0x00, 'Regular', 'active', 21, 42, NULL, NULL);
INSERT INTO `employees` (`id`, `ashima_id`, `name`, `rfid_tag`, `photo`, `emp_stat`, `status`, `department_id`, `position_id`, `last_active`, `leader`) VALUES
(145, '22-03869', 'HANNA EUNICE TAGURAN VICENTA', '1338950011', 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(149, '22-03950', 'EMELOU GUINSATAO LASCONA', NULL, 0x00, 'Regular', 'active', 20, 43, NULL, NULL);
INSERT INTO `employees` (`id`, `ashima_id`, `name`, `rfid_tag`, `photo`, `emp_stat`, `status`, `department_id`, `position_id`, `last_active`, `leader`) VALUES
(165, '22-04056', 'JAYDELYN LOIS SADSAD LOBO', '1336733771', 0x00, 'Regular', 'active', 11, 42, NULL, NULL),
(168, '22-04084', 'ZERNAN LUAR CUAY', '1338427387', 0x00, 'Regular', 'active', 12, 42, NULL, NULL),
(175, '22-04130', 'RAYMOND FABIAN GATUS', '1333151899', 0x00, 'Regular', 'active', 11, 42, NULL, 134),
(177, '22-04148', 'YOKO LABITAG KONDO', '1340256267', 0x00, 'Regular', 'active', 23, 42, NULL, NULL),
(185, '22-04229', 'SANDRA MAE SOLIJON DE VERA', '0542068640', 0x00, 'Regular', 'active', 11, 42, NULL, NULL),
(196, '22-04282', 'JOHN NICCO BERBEGAL DARACAN', '1234', 0x00, 'regular', 'active', 4, 42, NULL, 117),
(197, '22-04283', 'JENNIFER RIVERA CALILUNG', '0553248144', 0x00, 'Regular', 'active', 36, 42, NULL, NULL),
(199, '22-04307', 'SANDRO ALEJANDRO SANTOS', NULL, 0x00, 'Regular', 'active', 33, 10, NULL, NULL),
(206, '22-04340', 'PERLA BAUTISTA GONZALES', '0539535248', 0x00, 'Regular', 'active', 11, 42, NULL, NULL),
(213, '23-04446', 'CHRISTIAN ROBIN GATBONTON WIJANGCO', NULL, 0x00, 'Regular', 'active', 11, 42, NULL, NULL),
(214, '23-04451', 'XHIERENZ MEDINA MACABENTA', '0545309072', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(215, '23-04461', 'ROSELLE AGBAN TOLENTINO', NULL, 0x00, 'Regular', 'active', 21, 42, NULL, NULL),
(217, '23-04478', 'MARITES PIOQUINTO SANTOS', NULL, 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(218, '23-04485', 'LUISITO PINEDA GARCIA', NULL, 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(221, '23-04512', 'STACY MARTINEZ CABILING', '0544789648', 0x00, 'regular', 'active', 4, 2, NULL, 117),
(223, '23-04541', 'NICOLE MARIANO DIZON', '1942675946', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(232, '23-04631', 'JONNARIE AREVALO AGUILUS', NULL, 0x00, 'Regular', 'active', 11, 42, NULL, NULL),
(235, '23-04654', 'FIAH CERBA QUINTON', '1849423386', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(240, '23-04714', 'PRINCESS APRIL ANNE CARREON GATUS', '0541395600', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(241, '23-04719', 'ARNEL ORTIZ MELCHOR', '1931761706', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(245, '23-04741', 'JAYVIE AGA-AB DADIVAS', NULL, 0x00, 'Regular', 'active', 39, 52, NULL, NULL),
(253, '23-04783', 'DIANE NEOBEL VALENCIA CRUZ', '1846407002', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(255, '23-04795', 'HAROLD LUNA ESGUERRA', NULL, 0x00, 'Regular', 'active', 39, 56, NULL, NULL),
(258, '23-04808', 'GENESIE MIZPAH BOMBAY DIMLA', '0543570832', 0x00, 'Regular', 'active', 7, 42, NULL, NULL),
(259, '23-04809', 'SHENEL ANYA MARIA PERALTA MAYNIGO', '0545088400', 0x00, 'Regular', 'active', 20, 22, NULL, NULL),
(262, '23-04826', 'ANGEL OFIAZA ACIERTO JR', NULL, 0x00, 'Probationary', 'active', 7, 42, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_leader` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `name`, `is_leader`) VALUES
(1, 'CAMPAIGN MANAGER ASSISTANT', 0),
(2, 'QA ANALYST', 0),
(3, 'TEAM LEADER', 1),
(6, 'SR. PROGRAMMER', 0),
(7, 'ADMIN-SECURITY', 0),
(9, 'VIRTUAL ASSISTANT', 0),
(10, 'OJR TEAM LEADER', 1),
(11, 'MAINTENANCE', 0),
(12, 'OJR HEAD TRAINING MANAGER', 0),
(13, 'IT SUPERVISOR', 0),
(14, 'OPERATIONS MANAGER', 0),
(15, 'COMPANY DOCTOR', 0),
(16, 'QA VERIFIER', 0),
(17, 'VALOR REPORTS ANALYST', 0),
(19, 'JRI QUALITY ASSURANCE', 0),
(20, 'TRAINING MANAGER', 0),
(21, 'QA MANAGER', 0),
(22, 'WORK FORCE ANALYST', 0),
(24, 'ACCOUNTING AND FINANCE OFFICER', 0),
(25, 'CHIEF FINANCIAL OFFICER', 0),
(26, 'ACCOUNTS RECEIVABLE', 0),
(27, 'CHIEF EXECUTIVE OFFICER', 1),
(28, 'ADMIN AND FINANCE STAFF', 0),
(29, 'HR & ADMIN OFFICER', 0),
(30, 'KTR SPECIALIST', 0),
(31, 'BILLING AND COLLECTION OFFICER', 0),
(32, 'PROGRAMMER', 0),
(33, 'SOFTWARE AUTOMATION ENGINEER', 0),
(34, 'SENIOR TEAM LEADER', 1),
(35, 'TRAINER', 0),
(36, 'IT MANAGER', 1),
(37, 'HR & ADMIN ASSISTANT', 0),
(38, 'VALOR ADMIN', 0),
(39, 'SENIOR OPERATIONS MANAGER', 0),
(40, 'OJR QA', 0),
(41, 'OJR ACCOUNT MANAGER', 0),
(42, 'PERFORMANCE SPECIALIST / CALL CENTER OPS.', 0),
(43, 'REPORT ANALYST', 0),
(44, 'JR. PROGRAMMER', 0),
(45, 'IT HELPDESK', 0),
(46, 'OJR RECRUITMENT SUPERVISOR', 0),
(48, 'COMPANY NURSE', 0),
(50, 'JR. NETWORK ENGINEER', 0),
(51, 'OJR TRAINER', 0),
(52, 'SOCIAL MEDIA MANAGER', 0),
(53, 'RECRUITMENT ASSOCIATE', 0),
(54, 'ALPHALIST- EE PAYABLES', 0),
(55, 'DISBURSEMENT- TAX COMPLIANCE', 0),
(56, 'DATA ANALYST', 0),
(57, 'OJR WFA', 0),
(58, 'TECHNICAL WRITER', 0),
(59, 'OJR TA', 0),
(60, 'SECURITY', 0),
(61, 'SECURITY PERSONNEL', 0),
(62, 'SHUTTLE DRIVER', 0),
(63, 'MAINTENANCE TEAM LEADER', 1),
(64, 'TECHNICAL WRITER/EDITOR', 0),
(65, 'TALENT ACQUSITION SPECIALIST', 0),
(66, 'STAFF ACCOUNTANT', 0),
(67, 'SENIOR ACCOUNTANT', 0),
(68, 'RECRUITMENT SPECIALIST', 0),
(69, 'CONTROLLER', 1),
(70, 'HR COMPENSATION AND BENEFITS ADMINISTRATOR', 0),
(71, 'HR MANAGER', 0),
(72, 'HR SUPERVISOR', 1),
(75, 'ELECTRICIAN', 0),
(76, 'ACCOUNTING STAFF', 0),
(78, 'WFA', 0),
(80, 'WAH', 0),
(128, 'MAINTENANCE SUPERVISOR', 0),
(129, 'DIRECTOR OF OPERATIONS', 0),
(130, 'IT SUPPORT', 0),
(131, 'PURCHASING STAFF', 0),
(132, 'FINANCE MANAGER', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `employee_id` (`employee_id`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
