<?php
/**
 * Real-time Chat API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../models/ChatMessage.php';

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
$chat = new ChatMessage();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get messages
    $ticketId = isset($_GET['ticket_id']) ? (int)$_GET['ticket_id'] : 0;
    $lastId = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;
    
    if ($ticketId <= 0) {
        Response::validationError(['ticket_id' => 'Required'], 'Ticket ID is required');
    }
    
    // Verify ticket access
    $ticketStmt = $conn->prepare("SELECT user_id FROM tickets WHERE id = ?");
    $ticketStmt->bind_param("i", $ticketId);
    $ticketStmt->execute();
    $ticket = $ticketStmt->get_result()->fetch_assoc();
    
    if (!$ticket) {
        Response::notFound('Ticket not found');
    }
    
    if (!$isAdmin && $ticket['user_id'] != $userId) {
        Response::forbidden('Access denied');
    }
    
    $messages = $chat->getByTicketId($ticketId, $lastId);
    $unreadCount = $chat->getUnreadCount($ticketId, $userId, $isAdmin);
    
    Response::success([
        'messages' => $messages,
        'unread_count' => $unreadCount
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Send message
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['ticket_id']) || empty($data['message'])) {
        Response::validationError([
            'ticket_id' => 'Required',
            'message' => 'Required'
        ]);
    }
    
    $ticketId = (int)$data['ticket_id'];
    $message = trim($data['message']);
    
    if (strlen($message) === 0) {
        Response::validationError(['message' => 'Message cannot be empty']);
    }
    
    // Verify ticket access
    $ticketStmt = $conn->prepare("SELECT user_id FROM tickets WHERE id = ?");
    $ticketStmt->bind_param("i", $ticketId);
    $ticketStmt->execute();
    $ticket = $ticketStmt->get_result()->fetch_assoc();
    
    if (!$ticket) {
        Response::notFound('Ticket not found');
    }
    
    if (!$isAdmin && $ticket['user_id'] != $userId) {
        Response::forbidden('Access denied');
    }
    
    $messageId = $chat->send($ticketId, $userId, $message, $isAdmin);
    
    if ($messageId) {
        // Mark messages as read for the sender
        $chat->markAsRead($ticketId, $userId, $isAdmin);
        
        Response::success(['message_id' => $messageId], 'Message sent', 201);
    } else {
        Response::error('Failed to send message', 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Mark as read
    $data = json_decode(file_get_contents('php://input'), true);
    $ticketId = isset($data['ticket_id']) ? (int)$data['ticket_id'] : 0;
    
    if ($ticketId <= 0) {
        Response::validationError(['ticket_id' => 'Required'], 'Ticket ID is required');
    }
    
    if ($chat->markAsRead($ticketId, $userId, $isAdmin)) {
        Response::success(['ticket_id' => $ticketId], 'Messages marked as read');
    } else {
        Response::error('Failed to mark messages as read', 500);
    }
    
} else {
    Response::error('Method not allowed', 405);
}

