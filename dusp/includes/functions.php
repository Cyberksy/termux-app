<?php

declare(strict_types=1);

function start_secure_session(): void {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0, 'path' => '/', 'secure' => !empty($_SERVER['HTTPS']),
            'httponly' => true, 'samesite' => 'Lax'
        ]);
        session_start();
    }

    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        session_unset();
        session_destroy();
        header('Location: ' . BASE_URL . '/auth/login.php?expired=1');
        exit;
    }
    $_SESSION['last_activity'] = time();
}

function esc(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }

function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf(): void {
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(400);
        exit('Invalid CSRF token');
    }
}

function require_role(array $roles): void {
    if (empty($_SESSION['user']) || !in_array($_SESSION['user']['role'], $roles, true)) {
        header('Location: ' . BASE_URL . '/auth/login.php');
        exit;
    }
}

function calc_gpa(array $rows): float {
    $totalUnits = 0; $weighted = 0;
    foreach ($rows as $r) {
        $unit = (int)$r['unit']; $score = (float)$r['score'];
        $point = $score >= 70 ? 5 : ($score >= 60 ? 4 : ($score >= 50 ? 3 : ($score >= 45 ? 2 : ($score >= 40 ? 1 : 0))));
        $totalUnits += $unit; $weighted += $unit * $point;
    }
    return $totalUnits ? round($weighted / $totalUnits, 2) : 0.0;
}
