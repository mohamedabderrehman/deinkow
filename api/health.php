<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'demoMode' => DEMO_MODE,
    'recaptchaSiteKey' => getenv('RECAPTCHA_SITE_KEY') ?: '',
    'message' => 'Deinkow API is running',
    'timestamp' => date('Y-m-d H:i:s')
]);

