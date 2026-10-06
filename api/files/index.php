<?php
/**
 * Project Files API
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../models/ProjectFile.php';

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
$fileManager = new ProjectFile();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $ticketId = isset($_GET['ticket_id']) ? (int)$_GET['ticket_id'] : 0;
    
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
    
    $files = $fileManager->getByTicketId($ticketId);
    Response::success($files);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Upload file
    if (empty($_FILES['file'])) {
        Response::validationError(['file' => 'Required'], 'File is required');
    }
    
    $ticketId = isset($_POST['ticket_id']) ? (int)$_POST['ticket_id'] : 0;
    
    if ($ticketId <= 0) {
        Response::validationError(['ticket_id' => 'Required'], 'Ticket ID is required');
    }
    
    // Verify ticket belongs to user
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
    
    $uploadedBy = $isAdmin ? 'admin' : 'user';
    $result = $fileManager->upload($ticketId, $userId, $_FILES['file'], $uploadedBy);
    
    if ($result['success']) {
        Response::success($result, 'File uploaded successfully', 201);
    } else {
        Response::error($result['message'], 400);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $fileId = isset($data['file_id']) ? (int)$data['file_id'] : 0;
    
    if ($fileId <= 0) {
        Response::validationError(['file_id' => 'Required'], 'File ID is required');
    }
    
    // Get file info to check permissions
    $fileStmt = $conn->prepare(
        "SELECT pf.*, t.user_id as ticket_user_id 
         FROM project_files pf
         JOIN tickets t ON pf.ticket_id = t.id
         WHERE pf.id = ?"
    );
    $fileStmt->bind_param("i", $fileId);
    $fileStmt->execute();
    $file = $fileStmt->get_result()->fetch_assoc();
    
    if (!$file) {
        Response::notFound('File not found');
    }
    
    // Check permission
    if (!$isAdmin && $file['user_id'] != $userId && $file['ticket_user_id'] != $userId) {
        Response::forbidden('Access denied');
    }
    
    if ($fileManager->delete($fileId, $userId)) {
        Response::success(['file_id' => $fileId], 'File deleted successfully');
    } else {
        Response::error('Failed to delete file', 500);
    }
    
} else {
    Response::error('Method not allowed', 405);
}

