-- Database Updates for New Features
-- Run this SQL to add new tables for notifications, ratings, files, chat, and analytics

-- ============================================
-- 1. Notifications System (Server-Sent Events)
-- ============================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `type` ENUM('ticket_update', 'project_status', 'message', 'payment', 'system') DEFAULT 'system',
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `link` VARCHAR(500) NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_read` (`user_id`, `is_read`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Project Ratings System
-- ============================================
CREATE TABLE IF NOT EXISTS `project_ratings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` TINYINT NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_rating` (`ticket_id`, `user_id`),
  INDEX `idx_ticket` (`ticket_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Project Files System
-- ============================================
CREATE TABLE IF NOT EXISTS `project_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `file_type` VARCHAR(100) NOT NULL,
  `uploaded_by` ENUM('user', 'admin') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_ticket` (`ticket_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Real-time Chat System
-- ============================================
CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `is_admin` BOOLEAN DEFAULT FALSE,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`ticket_id`) REFERENCES `tickets`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_ticket_created` (`ticket_id`, `created_at`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Analytics & Statistics
-- ============================================
CREATE TABLE IF NOT EXISTS `analytics_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `event_type` VARCHAR(50) NOT NULL,
  `event_data` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_event_type` (`event_type`),
  INDEX `idx_created` (`created_at`),
  INDEX `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Cache Table for Performance
-- ============================================
CREATE TABLE IF NOT EXISTS `cache` (
  `cache_key` VARCHAR(255) PRIMARY KEY,
  `cache_value` LONGTEXT NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Additional Indexes for Performance
-- ============================================
-- Add indexes to existing tables for better query performance

-- Tickets table indexes
ALTER TABLE `tickets` ADD INDEX IF NOT EXISTS `idx_user_status` (`user_id`, `status`);
ALTER TABLE `tickets` ADD INDEX IF NOT EXISTS `idx_status_created` (`status`, `created_at` DESC);
ALTER TABLE `tickets` ADD INDEX IF NOT EXISTS `idx_priority` (`priority`);

-- Ticket replies indexes
ALTER TABLE `ticket_replies` ADD INDEX IF NOT EXISTS `idx_ticket_created` (`ticket_id`, `created_at` DESC);
ALTER TABLE `ticket_replies` ADD INDEX IF NOT EXISTS `idx_admin` (`is_admin`);

-- Users table additional indexes
ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_role` (`role`);
ALTER TABLE `users` ADD INDEX IF NOT EXISTS `idx_created` (`created_at`);

-- Payment requests indexes
ALTER TABLE `payment_requests` ADD INDEX IF NOT EXISTS `idx_user_status` (`user_id`, `status`);
ALTER TABLE `payment_requests` ADD INDEX IF NOT EXISTS `idx_created_status` (`created_at`, `status`);

-- Subscriptions indexes
ALTER TABLE `subscriptions` ADD INDEX IF NOT EXISTS `idx_user_status` (`user_id`, `payment_status`);
ALTER TABLE `subscriptions` ADD INDEX IF NOT EXISTS `idx_end_date` (`end_date`);

