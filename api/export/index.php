<?php
/**
 * Export Data API (PDF, Excel)
 */

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
require_once __DIR__ . '/../utils/response.php';

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

$format = isset($_GET['format']) ? $_GET['format'] : 'excel'; // excel or pdf
$type = isset($_GET['type']) ? $_GET['type'] : 'tickets'; // tickets, payments, users, etc.

if (!in_array($format, ['excel', 'pdf'])) {
    Response::validationError(['format' => 'Must be excel or pdf']);
}

$conn = getDBConnection();

if ($format === 'excel') {
    exportExcel($conn, $type, $userId, $isAdmin);
} else {
    exportPDF($conn, $type, $userId, $isAdmin);
}

function exportExcel($conn, $type, $userId, $isAdmin) {
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $type . '_' . date('Y-m-d') . '.xlsx"');
    
    // Simple CSV export (can be upgraded to use PhpSpreadsheet library)
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $type . '_' . date('Y-m-d') . '.csv"');
    
    $output = fopen('php://output', 'w');
    
    // Add BOM for UTF-8
    fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
    
    if ($type === 'tickets') {
        if ($isAdmin) {
            $stmt = $conn->prepare(
                "SELECT t.id, t.subject, t.status, t.priority, t.created_at, u.username, u.email
                 FROM tickets t
                 JOIN users u ON t.user_id = u.id
                 ORDER BY t.created_at DESC"
            );
        } else {
            $stmt = $conn->prepare(
                "SELECT id, subject, status, priority, created_at
                 FROM tickets
                 WHERE user_id = ?
                 ORDER BY created_at DESC"
            );
            $stmt->bind_param("i", $userId);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        // Headers
        fputcsv($output, ['ID', 'Subject', 'Status', 'Priority', 'Created At', 'Username', 'Email']);
        
        while ($row = $result->fetch_assoc()) {
            fputcsv($output, [
                $row['id'],
                $row['subject'],
                $row['status'],
                $row['priority'],
                $row['created_at'],
                $row['username'] ?? '',
                $row['email'] ?? ''
            ]);
        }
    } elseif ($type === 'payments' && $isAdmin) {
        $stmt = $conn->prepare(
            "SELECT pr.id, pr.amount, pr.cryptocurrency, pr.status, pr.created_at, u.username, u.email
             FROM payment_requests pr
             JOIN users u ON pr.user_id = u.id
             ORDER BY pr.created_at DESC"
        );
        $stmt->execute();
        $result = $stmt->get_result();
        
        fputcsv($output, ['ID', 'Amount', 'Cryptocurrency', 'Status', 'Created At', 'Username', 'Email']);
        
        while ($row = $result->fetch_assoc()) {
            fputcsv($output, [
                $row['id'],
                $row['amount'],
                $row['cryptocurrency'],
                $row['status'],
                $row['created_at'],
                $row['username'],
                $row['email']
            ]);
        }
    } elseif ($type === 'users' && $isAdmin) {
        $stmt = $conn->prepare(
            "SELECT id, username, email, role, subscription_type, subscription_status, created_at
             FROM users
             ORDER BY created_at DESC"
        );
        $stmt->execute();
        $result = $stmt->get_result();
        
        fputcsv($output, ['ID', 'Username', 'Email', 'Role', 'Subscription Type', 'Subscription Status', 'Created At']);
        
        while ($row = $result->fetch_assoc()) {
            fputcsv($output, [
                $row['id'],
                $row['username'],
                $row['email'],
                $row['role'],
                $row['subscription_type'],
                $row['subscription_status'],
                $row['created_at']
            ]);
        }
    }
    
    fclose($output);
    exit;
}

function exportPDF($conn, $type, $userId, $isAdmin) {
    // Simple HTML to PDF (can be upgraded to use TCPDF or DomPDF)
    header('Content-Type: text/html; charset=utf-8');
    
    echo '<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>' . $type . ' Report</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background-color: #f2f2f2; }
        @media print {
            body { margin: 0; }
            @page { size: A4; margin: 1cm; }
        }
    </style>
</head>
<body>
    <h1>' . ucfirst($type) . ' Report - ' . date('Y-m-d') . '</h1>
    <table>
        <thead>
            <tr>';
    
    if ($type === 'tickets') {
        echo '<th>ID</th><th>Subject</th><th>Status</th><th>Priority</th><th>Created At</th>';
        if ($isAdmin) {
            echo '<th>Username</th><th>Email</th>';
        }
        
        echo '</tr></thead><tbody>';
        
        if ($isAdmin) {
            $stmt = $conn->prepare(
                "SELECT t.id, t.subject, t.status, t.priority, t.created_at, u.username, u.email
                 FROM tickets t
                 JOIN users u ON t.user_id = u.id
                 ORDER BY t.created_at DESC"
            );
        } else {
            $stmt = $conn->prepare(
                "SELECT id, subject, status, priority, created_at
                 FROM tickets
                 WHERE user_id = ?
                 ORDER BY created_at DESC"
            );
            $stmt->bind_param("i", $userId);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        
        while ($row = $result->fetch_assoc()) {
            echo '<tr>';
            echo '<td>' . htmlspecialchars($row['id']) . '</td>';
            echo '<td>' . htmlspecialchars($row['subject']) . '</td>';
            echo '<td>' . htmlspecialchars($row['status']) . '</td>';
            echo '<td>' . htmlspecialchars($row['priority']) . '</td>';
            echo '<td>' . htmlspecialchars($row['created_at']) . '</td>';
            if ($isAdmin) {
                echo '<td>' . htmlspecialchars($row['username']) . '</td>';
                echo '<td>' . htmlspecialchars($row['email']) . '</td>';
            }
            echo '</tr>';
        }
    }
    
    echo '</tbody></table>
    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>';
    
    exit;
}

