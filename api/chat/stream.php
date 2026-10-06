<?php
/**
 * Server-Sent Events (SSE) for Real-time Chat
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../models/ChatMessage.php';

// Set headers for SSE
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no');

setCORSHeaders();

// Authenticate user
try {
    $userData = authenticate();
    $userId = $userData['userId'];
    $isAdmin = $userData['role'] === 'admin';
} catch (Exception $e) {
    http_response_code(401);
    echo "data: " . json_encode(['error' => 'Unauthorized']) . "\n\n";
    flush();
    exit;
}

$ticketId = isset($_GET['ticket_id']) ? (int)$_GET['ticket_id'] : 0;

if ($ticketId <= 0) {
    echo "data: " . json_encode(['error' => 'Ticket ID required']) . "\n\n";
    flush();
    exit;
}

// Verify ticket access
$conn = getDBConnection();
$ticketStmt = $conn->prepare("SELECT user_id FROM tickets WHERE id = ?");
$ticketStmt->bind_param("i", $ticketId);
$ticketStmt->execute();
$ticket = $ticketStmt->get_result()->fetch_assoc();

if (!$ticket || (!$isAdmin && $ticket['user_id'] != $userId)) {
    echo "data: " . json_encode(['error' => 'Access denied']) . "\n\n";
    flush();
    exit;
}

// Send initial connection message
echo "data: " . json_encode(['type' => 'connected', 'message' => 'Connected to chat stream']) . "\n\n";
flush();

$chat = new ChatMessage();
$lastId = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;

while (true) {
    // Check for new messages
    $messages = $chat->getByTicketId($ticketId, $lastId, 10);
    
    if (!empty($messages)) {
        foreach ($messages as $message) {
            $lastId = max($lastId, $message['id']);
            echo "data: " . json_encode([
                'type' => 'message',
                'data' => $message
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

