<?php
/**
 * Server-Sent Events (SSE) for Real-time Notifications
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';

// Set headers for SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable buffering in Nginx

// CORS headers
setCORSHeaders();

// Authenticate user
try {
    $userData = authenticate();
    $userId = $userData['userId'];
} catch (Exception $e) {
    http_response_code(401);
    echo "data: " . json_encode(['error' => 'Unauthorized']) . "\n\n";
    flush();
    exit;
}

// Send initial connection message
echo "data: " . json_encode(['type' => 'connected', 'message' => 'Connected to notification stream']) . "\n\n";
flush();

// Keep connection alive and check for new notifications
$lastId = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;
$conn = getDBConnection();

while (true) {
    // Check for new notifications
    $stmt = $conn->prepare(
        "SELECT id, type, title, message, link, created_at 
         FROM notifications 
         WHERE user_id = ? AND id > ? AND is_read = FALSE
         ORDER BY created_at DESC 
         LIMIT 10"
    );
    $stmt->bind_param("ii", $userId, $lastId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $notifications = [];
    while ($row = $result->fetch_assoc()) {
        $notifications[] = $row;
        $lastId = max($lastId, $row['id']);
    }
    
    if (!empty($notifications)) {
        foreach ($notifications as $notification) {
            echo "data: " . json_encode([
                'type' => 'notification',
                'data' => $notification
            ], JSON_UNESCAPED_UNICODE) . "\n\n";
            flush();
        }
    }
    
    // Send heartbeat every 30 seconds
    if (time() % 30 == 0) {
        echo "data: " . json_encode(['type' => 'heartbeat']) . "\n\n";
        flush();
    }
    
    // Sleep to prevent excessive CPU usage
    sleep(2);
    
    // Check if client disconnected
    if (connection_aborted()) {
        break;
    }
}

