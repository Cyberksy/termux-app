<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
start_secure_session();
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    if ($email && $password) {
        $stmt = db()->prepare('SELECT id, full_name, email, role, password_hash FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password_hash'])) {
            session_regenerate_id(true);
            $_SESSION['user'] = $user;
            header('Location: ' . BASE_URL . '/' . $user['role'] . '/dashboard.php');
            exit;
        }
    }
    $error = 'Invalid credentials';
}
require_once __DIR__ . '/../includes/header.php';
?>
<div class="container"><div class="card"><h2>Login</h2><?php if($error): ?><p><?= esc($error) ?></p><?php endif; ?>
<form method="POST"><input type="hidden" name="csrf_token" value="<?= esc(csrf_token()) ?>">
<input type="email" name="email" placeholder="Email" required><input type="password" name="password" placeholder="Password" required>
<button type="submit">Login</button></form><p><a href="register.php">Register</a></p></div></div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
