-- ========================================================
-- RFID Attendance System — Seed Default Admin Users
-- Certified Production Seed Data for Portal Administrative Roles
-- ========================================================

USE `rfid_attendance`;

INSERT INTO `admin_users` (`name`, `username`, `employee_id`, `password`, `role`) VALUES
('Super Administrator', 'superadmin', '00-00000', '$2b$10$I7bcaL4LkMKRhoa90P5KFuv4OGI23Oxrt5LPaUbPplXrLcPSXFKo6', 'superadmin'),
('System Administrator', 'admin', '01-00000', '$2b$10$YRalM3eO2ctSkuuYIz2TIeCM3NXJnuYBzwT3gO0Ab5XC8GIoGEYP.', 'admin'),
('Security Guard', 'security', '02-00000', '$2b$10$hlXTM8EiE32K.xZJwvn2pu/9neFlvqv3aJFiMz5uUIePxGs4fYISG', 'security'),
('HR Manager', 'hr', '03-00000', '$2b$10$xhq1YDlDahlJuPabncD06eEx2rgvPloGiGH6kigdEcisPthT2H5qO', 'hr')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `password` = VALUES(`password`),
  `role` = VALUES(`role`);
