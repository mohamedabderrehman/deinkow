<?php
require_once __DIR__ . '/../config.php';

class Rating {
    private $conn;
    
    public function __construct() {
        $this->conn = getDBConnection();
    }
    
    /**
     * Create or update rating
     */
    public function createOrUpdate($ticketId, $userId, $rating, $comment = null) {
        $stmt = $this->conn->prepare(
            "INSERT INTO project_ratings (ticket_id, user_id, rating, comment) 
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
             rating = VALUES(rating),
             comment = VALUES(comment),
             updated_at = NOW()"
        );
        $stmt->bind_param("iiis", $ticketId, $userId, $rating, $comment);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Get rating by ticket ID
     */
    public function getByTicketId($ticketId) {
        $stmt = $this->conn->prepare(
            "SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings,
             COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
             COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
             COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
             COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
             COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
             FROM project_ratings 
             WHERE ticket_id = ?"
        );
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
    
    /**
     * Get user rating for ticket
     */
    public function getUserRating($ticketId, $userId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM project_ratings 
             WHERE ticket_id = ? AND user_id = ?"
        );
        $stmt->bind_param("ii", $ticketId, $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
    
    /**
     * Get all ratings for ticket with pagination
     */
    public function getAllByTicketId($ticketId, $page = 1, $perPage = 10) {
        $offset = ($page - 1) * $perPage;
        
        $stmt = $this->conn->prepare(
            "SELECT pr.*, u.username, u.profile_picture
             FROM project_ratings pr
             JOIN users u ON pr.user_id = u.id
             WHERE pr.ticket_id = ?
             ORDER BY pr.created_at DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->bind_param("iii", $ticketId, $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $ratings = [];
        while ($row = $result->fetch_assoc()) {
            $ratings[] = $row;
        }
        
        return $ratings;
    }
}

