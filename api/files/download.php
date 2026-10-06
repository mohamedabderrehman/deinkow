<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils/auth.php';
try { $user=authenticate(); } catch (Exception $e) { http_response_code(401); exit; }
$id=filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id || $id<1) { http_response_code(400); exit; }
$conn=getDBConnection();
$stmt=$conn->prepare('SELECT pf.*, t.user_id AS owner_id FROM project_files pf JOIN tickets t ON t.id=pf.ticket_id WHERE pf.id=?');
$stmt->bind_param('i',$id); $stmt->execute(); $file=$stmt->get_result()->fetch_assoc();
if (!$file) { http_response_code(404); exit; }
if ($user['role']!=='admin' && (int)$user['userId']!==(int)$file['owner_id']) { http_response_code(403); exit; }
$base=realpath(__DIR__.'/../../uploads/projects');
$path=realpath(__DIR__.'/../../'.$file['file_path']);
if (!$base || !$path || !str_starts_with($path,$base.DIRECTORY_SEPARATOR) || !is_file($path)) { http_response_code(404); exit; }
header('Content-Type: application/octet-stream');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: private, no-store');
header("Content-Disposition: attachment; filename*=UTF-8''".rawurlencode(basename($file['file_name'])));
header('Content-Length: '.filesize($path));
readfile($path);
