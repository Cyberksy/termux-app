<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
start_secure_session();
header('Content-Type: application/json');
$userId = $_SESSION['user']['id'] ?? 0;
$stmt = db()->prepare('SELECT message FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
$stmt->execute([$userId]);
echo json_encode($stmt->fetchAll());
