<?php
/**
 * Create Notification (Admin/System use)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

try {
    $userData = authenticate();
    // Only admins can create notifications manually
    // System can create notifications via this endpoint without auth check
    $isAdmin = $userData['role'] === 'admin';
} catch (Exception $e) {
    // Allow system notifications without auth
    $isAdmin = false;
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['user_id']) || empty($data['title']) || empty($data['message'])) {
    Response::validationError([
        'user_id' => 'Required',
        'title' => 'Required',
        'message' => 'Required'
    ]);
}

$conn = getDBConnection();
$userId = (int)$data['user_id'];
$type = $data['type'] ?? 'system';
$title = $data['title'];
$message = $data['message'];
$link = $data['link'] ?? null;

// Validate type
$allowedTypes = ['ticket_update', 'project_status', 'message', 'payment', 'system'];
if (!in_array($type, $allowedTypes)) {
    $type = 'system';
}

$stmt = $conn->prepare(
    "INSERT INTO notifications (user_id, type, title, message, link) 
     VALUES (?, ?, ?, ?, ?)"
);
$stmt->bind_param("issss", $userId, $type, $title, $message, $link);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    $notificationId = $conn->insert_id;
    Response::success(['notification_id' => $notificationId], 'Notification created', 201);
} else {
    Response::error('Failed to create notification', 500);
}

