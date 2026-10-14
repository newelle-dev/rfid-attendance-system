-- ========================================================
-- RFID Attendance System — Unified Database Schema
-- Certified Production Schema & Initial Seed Data
-- ========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Database Initialization
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `rfid_attendance` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `rfid_attendance`;

-- --------------------------------------------------------
-- Table: admin_users
-- Portal administrative accounts and role assignments
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `employee_id` varchar(50) NOT NULL COMMENT 'Ashima ID - unique identifier',
  `password` varchar(255) NOT NULL COMMENT 'Bcrypt-hashed password',
  `role` enum('superadmin','admin','security','hr') NOT NULL DEFAULT 'admin',
  `last_login` datetime DEFAULT NULL COMMENT 'Timestamp of user most recent login',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `employee_id` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: departments
-- Company organizational departments
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: positions
-- Employee job designations and leadership flags
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_leader` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 if position has leadership/supervisor responsibilities',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: employees
-- Master employee roster, RFID association, and hierarchy
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` varchar(12) NOT NULL COMMENT 'Unique employee identifier (XX-XXXXX format)',
  `name` varchar(150) NOT NULL,
  `rfid_tag` varchar(50) DEFAULT NULL COMMENT 'Hardware RFID card UID',
  `photo` longblob DEFAULT NULL COMMENT 'Binary employee photograph',
  `emp_stat` varchar(12) DEFAULT 'Regular' COMMENT 'Employment status (Regular, Probationary, etc.)',
  `status` enum('active','inactive','resigned') NOT NULL DEFAULT 'active',
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `leader` int(11) DEFAULT NULL COMMENT 'Self-referencing supervisor employee ID',
  `last_active` datetime DEFAULT NULL COMMENT 'Timestamp of most recent RFID scan or check-in',
  `hire_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ashima_id` (`ashima_id`),
  UNIQUE KEY `rfid_tag` (`rfid_tag`),
  KEY `department_id` (`department_id`),
  KEY `position_id` (`position_id`),
  KEY `leader` (`leader`),
  KEY `status` (`status`),
  CONSTRAINT `employees_department_fk` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employees_position_fk` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `employees_leader_fk` FOREIGN KEY (`leader`) REFERENCES `employees` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: attendance_logs
-- Paired punch events recorded from RFID kiosk terminals
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `attendance_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ashima_id` varchar(20) NOT NULL COMMENT 'References employees.ashima_id',
  `log_type` varchar(10) NOT NULL DEFAULT 'IN' COMMENT 'Current punch status: IN or OUT',
  `in_time` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Time of arrival/punch in',
  `out_time` datetime DEFAULT NULL COMMENT 'Time of departure/punch out (NULL while clocked in)',
  PRIMARY KEY (`id`),
  KEY `idx_attendance_ashima` (`ashima_id`),
  KEY `idx_attendance_in_time` (`in_time`),
  KEY `idx_attendance_log_type` (`log_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table: role_permissions
-- Role-based access control (RBAC) permission matrix
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('superadmin','admin','security','hr') NOT NULL,
  `module` varchar(100) NOT NULL COMMENT 'Module name (employees_management, data_management, account_logins, attendance_logs, role_permissions)',
  `permission` json NOT NULL COMMENT 'Access descriptor: {"access": true}',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_module` (`role`, `module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Performance Indexes
-- --------------------------------------------------------

CREATE INDEX `idx_employee_name` ON `employees` (`name`);
CREATE INDEX `idx_employee_department_status` ON `employees` (`department_id`, `status`);

-- --------------------------------------------------------
-- Seed Data: Default Admin Accounts
-- Passwords:
--   superadmin: superadmin123
--   admin:      admin123
--   security:   security123
--   hr:         hr123
-- --------------------------------------------------------

INSERT INTO `admin_users` (`name`, `username`, `employee_id`, `password`, `role`) VALUES
('Super Administrator', 'superadmin', '00-00000', '$2b$10$ev2A6anoA5kFzTQ3VapWlekUZc9ysutzMPUFfJsmrPA1gGqH.kXDe', 'superadmin'),
('System Administrator', 'admin', '01-00000', '$2b$10$W5tSqCZZqbweJj6tLhcbReUABy7z9VQbMUJxidfpiqOjZKFOWJeX.', 'admin'),
('Security Officer', 'security', '02-00000', '$2b$10$CZZr9GgIAAUWFScqOGz8ouKKjUHqLRr85Ibam1jmXfesI7LIivENe', 'security'),
('Human Resources Manager', 'hr', '03-00000', '$2b$10$/FLsvs4Fjvu9jW1ibBy19.XSLbk0ME46.PrjMnxT8SPnoZy2pHg6q', 'hr')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`);

-- --------------------------------------------------------
-- Seed Data: Role Permissions Matrix
-- --------------------------------------------------------

INSERT INTO `role_permissions` (`role`, `module`, `permission`) VALUES
('superadmin', 'employees_management', '{"access": true}'),
('superadmin', 'data_management', '{"access": true}'),
('superadmin', 'account_logins', '{"access": true}'),
('superadmin', 'attendance_logs', '{"access": true}'),
('superadmin', 'role_permissions', '{"access": true}'),

('admin', 'employees_management', '{"access": true}'),
('admin', 'data_management', '{"access": true}'),
('admin', 'account_logins', '{"access": true}'),
('admin', 'attendance_logs', '{"access": true}'),

('security', 'attendance_logs', '{"access": true}'),

('hr', 'attendance_logs', '{"access": true}'),
('hr', 'employees_management', '{"access": true}')
ON DUPLICATE KEY UPDATE
  `permission` = VALUES(`permission`),
  `updated_at` CURRENT_TIMESTAMP;

-- --------------------------------------------------------
-- Seed Data: Starter Departments
-- --------------------------------------------------------

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'IT DEPARTMENT'),
(2, 'HR DEPARTMENT'),
(3, 'ACCOUNTING DEPARTMENT'),
(4, 'SECURITY DEPARTMENT'),
(5, 'OPERATIONS')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- --------------------------------------------------------
-- Seed Data: Starter Positions
-- --------------------------------------------------------

INSERT INTO `positions` (`id`, `name`, `is_leader`) VALUES
(1, 'SYSTEM ADMINISTRATOR', 0),
(2, 'TEAM LEADER', 1),
(3, 'PROGRAMMER', 0),
(4, 'HR OFFICER', 0),
(5, 'ACCOUNTANT', 0),
(6, 'SECURITY GUARD', 0),
(7, 'OPERATIONS MANAGER', 1)
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `is_leader` = VALUES(`is_leader`);

-- --------------------------------------------------------
-- Seed Data: Employees
-- --------------------------------------------------------

INSERT INTO `employees` (`id`, `ashima_id`, `name`, `rfid_tag`, `emp_stat`, `status`, `department_id`, `position_id`, `leader`, `last_active`, `hire_date`) VALUES
-- Administrative personnel linked to admin_users
(1, '00-00000', 'Super Administrator', '1000000001', 'Regular', 'active', 1, 1, NULL, NOW() - INTERVAL 10 MINUTE, '2023-01-15'),
(2, '01-00000', 'System Administrator', '1000000002', 'Regular', 'active', 1, 1, 1, NOW() - INTERVAL 25 MINUTE, '2023-03-01'),
(3, '02-00000', 'Security Officer', '1000000003', 'Regular', 'active', 4, 6, 1, NOW() - INTERVAL 35 MINUTE, '2023-06-10'),
(4, '03-00000', 'Human Resources Manager', '1000000004', 'Regular', 'active', 2, 4, 1, NOW() - INTERVAL 45 MINUTE, '2023-02-20'),

-- Department leaders and team members
(5, '24-00101', 'Marcus Vance', 'RFID-IT-001', 'Regular', 'active', 1, 2, 1, NOW() - INTERVAL 1 HOUR, '2023-04-12'),
(6, '24-00102', 'Elena Rostova', 'RFID-IT-002', 'Regular', 'active', 1, 3, 5, NOW() - INTERVAL 2 HOUR, '2023-08-01'),
(7, '24-00103', 'David Chen', 'RFID-IT-003', 'Probationary', 'active', 1, 3, 5, NOW() - INTERVAL 3 HOUR, '2024-01-10'),
(8, '24-00201', 'Sophia Alcantara', 'RFID-HR-001', 'Regular', 'active', 2, 4, 4, NOW() - INTERVAL 4 HOUR, '2023-09-15'),
(9, '24-00301', 'Alexander Cruz', 'RFID-ACC-001', 'Regular', 'active', 3, 5, 1, NOW() - INTERVAL 2 HOUR, '2023-05-18'),
(10, '24-00501', 'Grace Villanueva', 'RFID-OPS-001', 'Regular', 'active', 5, 7, 1, NOW() - INTERVAL 1 HOUR, '2023-02-01'),
(11, '24-00401', 'Rodrigo Santos', 'RFID-SEC-001', 'Regular', 'active', 4, 6, 3, NOW() - INTERVAL 5 HOUR, '2023-11-05'),
(12, '24-00104', 'Aria Montgomery', 'RFID-IT-004', 'Probationary', 'inactive', 1, 3, 5, NOW() - INTERVAL 3 DAY, '2024-03-01')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `rfid_tag` = VALUES(`rfid_tag`),
  `emp_stat` = VALUES(`emp_stat`),
  `status` = VALUES(`status`),
  `department_id` = VALUES(`department_id`),
  `position_id` = VALUES(`position_id`),
  `leader` = VALUES(`leader`),
  `last_active` = VALUES(`last_active`),
  `hire_date` = VALUES(`hire_date`);

-- --------------------------------------------------------
-- Seed Data: Attendance Logs (Sample Activity)
-- --------------------------------------------------------

INSERT INTO `attendance_logs` (`ashima_id`, `log_type`, `in_time`, `out_time`) VALUES
-- Yesterday's logs (paired completed shifts)
('24-00101', 'OUT', CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:02:15'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:05:42')),
('24-00102', 'OUT', CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:28:10'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:31:05')),
('24-00201', 'OUT', CONCAT(CURDATE() - INTERVAL 1 DAY, ' 07:55:00'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 16:45:22')),
('24-00301', 'OUT', CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:58:19'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 18:02:11')),
('24-00501', 'OUT', CONCAT(CURDATE() - INTERVAL 1 DAY, ' 08:12:30'), CONCAT(CURDATE() - INTERVAL 1 DAY, ' 17:15:00')),

-- Today's completed shifts (OUT)
('24-00101', 'OUT', CONCAT(CURDATE(), ' 08:05:12'), CONCAT(CURDATE(), ' 17:02:45')),
('24-00201', 'OUT', CONCAT(CURDATE(), ' 07:58:40'), CONCAT(CURDATE(), ' 16:30:15')),
('24-00401', 'OUT', CONCAT(CURDATE(), ' 07:45:00'), CONCAT(CURDATE(), ' 16:00:30')),

-- Today's currently active check-ins (IN, out_time IS NULL)
('24-00102', 'IN', CONCAT(CURDATE(), ' 08:30:22'), NULL),
('24-00103', 'IN', CONCAT(CURDATE(), ' 08:45:10'), NULL),
('24-00301', 'IN', CONCAT(CURDATE(), ' 09:02:54'), NULL),
('24-00501', 'IN', CONCAT(CURDATE(), ' 08:10:05'), NULL);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
