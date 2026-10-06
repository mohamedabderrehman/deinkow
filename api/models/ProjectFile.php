<?php
require_once __DIR__ . '/../config.php';

class ProjectFile {
    private $conn;
    private $uploadDir;
    
    public function __construct() {
        $this->conn = getDBConnection();
        $this->uploadDir = __DIR__ . '/../../uploads/projects/';
        
        // Create upload directory if not exists
        if (!is_dir($this->uploadDir)) {
            @mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * Upload file
     */
    public function upload($ticketId, $userId, $file, $uploadedBy = 'user') {
        // Validate file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                        'application/zip', 'text/plain', 'application/x-zip-compressed'];
        $maxSize = 10 * 1024 * 1024; // 10MB
        
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'message' => 'Invalid upload'];
        }
        $file['type'] = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
        $safeTypes = ['jpg'=>'image/jpeg', 'jpeg'=>'image/jpeg', 'png'=>'image/png', 'gif'=>'image/gif', 'pdf'=>'application/pdf', 'zip'=>'application/zip', 'txt'=>'text/plain'];
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!isset($safeTypes[$extension]) || $safeTypes[$extension] !== $file['type'] || !in_array($file['type'], $allowedTypes)) {
            return ['success' => false, 'message' => 'File type not allowed'];
        }
        
        if ($file['size'] > $maxSize) {
            return ['success' => false, 'message' => 'File size exceeds 10MB'];
        }
        
        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = bin2hex(random_bytes(24)) . '.' . $extension;
        $filepath = $this->uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'message' => 'Failed to upload file'];
        }
        
        // Save to database
        $stmt = $this->conn->prepare(
            "INSERT INTO project_files (ticket_id, user_id, file_name, file_path, file_size, file_type, uploaded_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        
        $relativePath = 'uploads/projects/' . $filename;
        $stmt->bind_param("iississ", $ticketId, $userId, $file['name'], $relativePath, 
                         $file['size'], $file['type'], $uploadedBy);
        
        if ($stmt->execute()) {
            return [
                'success' => true,
                'file_id' => $this->conn->insert_id,
                'file_path' => $relativePath,
                'file_name' => $file['name']
            ];
        }
        
        // Delete file if database insert failed
        @unlink($filepath);
        return ['success' => false, 'message' => 'Failed to save file record'];
    }
    
    /**
     * Get files by ticket ID
     */
    public function getByTicketId($ticketId) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM project_files 
             WHERE ticket_id = ? 
             ORDER BY created_at DESC"
        );
        $stmt->bind_param("i", $ticketId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $files = [];
        while ($row = $result->fetch_assoc()) {
            $files[] = $row;
        }
        
        return $files;
    }
    
    /**
     * Delete file
     */
    public function delete($fileId, $userId) {
        // Get file info
        $stmt = $this->conn->prepare(
            "SELECT file_path, user_id FROM project_files WHERE id = ?"
        );
        $stmt->bind_param("i", $fileId);
        $stmt->execute();
        $file = $stmt->get_result()->fetch_assoc();
        
        if (!$file) {
            return false;
        }
        
        // Check permission (user can only delete their own files, admin can delete any)
        // This should be checked in the API endpoint
        
        // Delete file from disk
        $fullPath = __DIR__ . '/../../' . $file['file_path'];
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
        
        // Delete from database
        $deleteStmt = $this->conn->prepare("DELETE FROM project_files WHERE id = ?");
        $deleteStmt->bind_param("i", $fileId);
        return $deleteStmt->execute();
    }
}

