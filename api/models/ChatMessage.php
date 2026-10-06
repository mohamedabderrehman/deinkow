<?php
require_once __DIR__ . '/../config.php';

class ChatMessage {
    private $conn;
    
    public function __construct() {
        $this->conn = getDBConnection();
    }
    
    /**
     * Send message
     */
    public function send($ticketId, $userId, $message, $isAdmin = false) {
        $stmt = $this->conn->prepare(
            "INSERT INTO chat_messages (ticket_id, user_id, message, is_admin) 
             VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("iisi", $ticketId, $userId, $message, $isAdmin);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Get messages for ticket
     */
    public function getByTicketId($ticketId, $lastId = 0, $limit = 50) {
        $stmt = $this->conn->prepare(
            "SELECT cm.*, u.username, u.profile_picture
             FROM chat_messages cm
             JOIN users u ON cm.user_id = u.id
             WHERE cm.ticket_id = ? AND cm.id > ?
             ORDER BY cm.created_at ASC
             LIMIT ?"
        );
        $stmt->bind_param("iii", $ticketId, $lastId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        
        return $messages;
    }
    
    /**
     * Mark messages as read
     */
    public function markAsRead($ticketId, $userId, $isAdmin = false) {
        $stmt = $this->conn->prepare(
            "UPDATE chat_messages 
             SET is_read = TRUE 
             WHERE ticket_id = ? AND is_admin != ? AND is_read = FALSE"
        );
        $isAdminInt = $isAdmin ? 1 : 0;
        $stmt->bind_param("ii", $ticketId, $isAdminInt);
        return $stmt->execute();
    }
    
    /**
     * Get unread count
     */
    public function getUnreadCount($ticketId, $userId, $isAdmin = false) {
        $stmt = $this->conn->prepare(
            "SELECT COUNT(*) as count 
             FROM chat_messages 
             WHERE ticket_id = ? AND is_admin != ? AND is_read = FALSE"
        );
        $isAdminInt = $isAdmin ? 1 : 0;
        $stmt->bind_param("ii", $ticketId, $isAdminInt);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        return (int)$result['count'];
    }
}

