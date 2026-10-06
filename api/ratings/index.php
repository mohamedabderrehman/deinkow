<?php
/**
 * Ratings API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/pagination.php';
require_once __DIR__ . '/../models/Rating.php';

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
$rating = new Rating();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ticketId = isset($_GET['ticket_id']) ? (int)$_GET['ticket_id'] : 0;
    
    if ($ticketId <= 0) {
        Response::validationError(['ticket_id' => 'Required'], 'Ticket ID is required');
    }
    
    // Get rating summary
    $summary = $rating->getByTicketId($ticketId);
    
    // Get user's rating if exists
    $userRating = $rating->getUserRating($ticketId, $userId);
    
    // Get all ratings with pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 10;
    
    // Get total count
    $countStmt = $conn->prepare("SELECT COUNT(*) as total FROM project_ratings WHERE ticket_id = ?");
    $countStmt->bind_param("i", $ticketId);
    $countStmt->execute();
    $total = $countStmt->get_result()->fetch_assoc()['total'];
    
    $pagination = Pagination::getPagination($page, $perPage, $total);
    $ratings = $rating->getAllByTicketId($ticketId, $page, $perPage);
    
    Response::success([
        'summary' => $summary,
        'user_rating' => $userRating,
        'ratings' => $ratings,
        'pagination' => $pagination
    ]);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (empty($data['ticket_id']) || empty($data['rating'])) {
        Response::validationError([
            'ticket_id' => 'Required',
            'rating' => 'Required'
        ]);
    }
    
    $ticketId = (int)$data['ticket_id'];
    $ratingValue = (int)$data['rating'];
    $comment = $data['comment'] ?? null;
    
    // Validate rating (1-5)
    if ($ratingValue < 1 || $ratingValue > 5) {
        Response::validationError(['rating' => 'Must be between 1 and 5']);
    }
    
    // Verify ticket belongs to user
    $ticketStmt = $conn->prepare("SELECT id FROM tickets WHERE id = ? AND user_id = ?");
    $ticketStmt->bind_param("ii", $ticketId, $userId);
    $ticketStmt->execute();
    if (!$ticketStmt->get_result()->fetch_assoc()) {
        Response::forbidden('Ticket not found or access denied');
    }
    
    $ratingId = $rating->createOrUpdate($ticketId, $userId, $ratingValue, $comment);
    
    if ($ratingId) {
        Response::success(['rating_id' => $ratingId], 'Rating saved', 201);
    } else {
        Response::error('Failed to save rating', 500);
    }
    
} else {
    Response::error('Method not allowed', 405);
}

