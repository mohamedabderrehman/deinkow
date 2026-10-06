<?php
/**
 * Dashboard Analytics API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/cache.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $userData = authenticate();
    $userId = $userData['userId'];
    $isAdmin = $userData['role'] === 'admin';
} catch (Exception $e) {
    Response::unauthorized($e->getMessage());
}

$conn = getDBConnection();
$period = isset($_GET['period']) ? $_GET['period'] : '30'; // days
$period = max(7, min(365, (int)$period));

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $cacheKey = Cache::key('analytics', $userId, $isAdmin ? 'admin' : 'user', $period);
    $cached = Cache::get($cacheKey);
    
    if ($cached !== null) {
        Response::success($cached);
    }
    
    $analytics = [];
    
    if ($isAdmin) {
        // Admin analytics
        $analytics = [
            'users' => getAdminUserStats($conn, $period),
            'tickets' => getAdminTicketStats($conn, $period),
            'payments' => getAdminPaymentStats($conn, $period),
            'projects' => getAdminProjectStats($conn, $period),
            'revenue' => getAdminRevenueStats($conn, $period)
        ];
    } else {
        // User analytics
        $analytics = [
            'projects' => getUserProjectStats($conn, $userId, $period),
            'tickets' => getUserTicketStats($conn, $userId, $period),
            'activity' => getUserActivityStats($conn, $userId, $period)
        ];
    }
    
    // Cache for 5 minutes
    Cache::set($cacheKey, $analytics, 300);
    
    Response::success($analytics);
} else {
    Response::error('Method not allowed', 405);
}

// Helper functions
function getAdminUserStats($conn, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_users,
            COUNT(CASE WHEN subscription_type = 'vip' THEN 1 END) as vip_users,
            COUNT(CASE WHEN subscription_type = 'api' THEN 1 END) as api_users
         FROM users"
    );
    $stmt->bind_param("i", $period);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getAdminTicketStats($conn, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_tickets
         FROM tickets"
    );
    $stmt->bind_param("i", $period);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getAdminPaymentStats($conn, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as total_revenue,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_payments
         FROM payment_requests"
    );
    $stmt->bind_param("i", $period);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getAdminProjectStats($conn, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
         FROM tickets
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)"
    );
    $stmt->bind_param("i", $period);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getAdminRevenueStats($conn, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as revenue
         FROM payment_requests
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC"
    );
    $stmt->bind_param("i", $period);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $revenue = [];
    while ($row = $result->fetch_assoc()) {
        $revenue[] = $row;
    }
    
    return $revenue;
}

function getUserProjectStats($conn, $userId, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
            COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as recent
         FROM tickets
         WHERE user_id = ?"
    );
    $stmt->bind_param("ii", $period, $userId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getUserTicketStats($conn, $userId, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread,
            COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as recent
         FROM notifications
         WHERE user_id = ?"
    );
    $stmt->bind_param("ii", $period, $userId);
    $stmt->execute();
    return $stmt->get_result()->fetch_assoc();
}

function getUserActivityStats($conn, $userId, $period) {
    $stmt = $conn->prepare(
        "SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
         FROM activity_logs
         WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
         GROUP BY DATE(created_at)
         ORDER BY date DESC"
    );
    $stmt->bind_param("ii", $userId, $period);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $activity = [];
    while ($row = $result->fetch_assoc()) {
        $activity[] = $row;
    }
    
    return $activity;
}

