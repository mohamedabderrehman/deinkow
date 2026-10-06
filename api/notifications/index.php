<?php
/**
 * Notifications API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/pagination.php';
require_once __DIR__ . '/../utils/cache.php';

setCORSHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

try {
    $userData = authenticate();
    $userId = $userData['userId'];
} catch (Exception $e) {
    Response::unauthorized($e->getMessage());
}

$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get notifications with pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 20;
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    // Build query
    $whereClause = "user_id = ?";
    $params = [$userId];
    $types = "i";
    
    if ($unreadOnly) {
        $whereClause .= " AND is_read = FALSE";
    }
    
    // Get total count
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM notifications WHERE $whereClause");
    if ($unreadOnly) {
        $countStmt->bind_param("i", $userId);
    } else {
        $countStmt->bind_param("i", $userId);
    }
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_assoc()['total'];
    
    // Get pagination
    $pagination = Pagination::getPagination($page, $perPage, $total);
    
    // Get notifications
    $query = "SELECT id, type, title, message, link, is_read, created_at 
              FROM notifications 
              WHERE $whereClause
              ORDER BY created_at DESC 
              LIMIT ? OFFSET ?";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param("iii", $userId, $pagination['per_page'], $pagination['offset']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
    }
    
    Response::paginated($notifications, $pagination);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Mark notification as read
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['notification_id'])) {
        Response::validationError(['notification_id' => 'Required'], 'Notification ID is required');
    }
    
    $notificationId = (int)$data['notification_id'];
    
    $stmt = $conn->prepare(
        "UPDATE notifications SET is_read = TRUE 
         WHERE id = ? AND user_id = ?"
    );
    $stmt->bind_param("ii", $notificationId, $userId);
    $stmt->execute();
    
    if ($stmt->affected_rows > 0) {
        Response::success(['notification_id' => $notificationId], 'Notification marked as read');
    } else {
        Response::error('Notification not found', 404);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Mark all as read
    $stmt = $conn->prepare(
        "UPDATE notifications SET is_read = TRUE 
         WHERE user_id = ? AND is_read = FALSE"
    );
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    
    Response::success(['updated' => $stmt->affected_rows], 'All notifications marked as read');
    
} else {
    Response::error('Method not allowed', 405);
}

