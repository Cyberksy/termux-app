<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
start_secure_session();
$msg='';
if($_SERVER['REQUEST_METHOD']==='POST'){
 verify_csrf();
 $full=trim($_POST['full_name']??'');$email=filter_var(trim($_POST['email']??''),FILTER_VALIDATE_EMAIL);
 $pass=$_POST['password']??'';$role=$_POST['role']??'student';
 if($full && $email && strlen($pass)>=8 && in_array($role,ROLES,true)){
  $stmt=db()->prepare('INSERT INTO users(full_name,email,password_hash,role) VALUES(?,?,?,?)');
  $stmt->execute([$full,$email,password_hash($pass,PASSWORD_BCRYPT),$role]);
  $msg='Registration successful.';
 }
}
require_once __DIR__ . '/../includes/header.php'; ?>
<div class="container"><div class="card"><h2>Register</h2><p><?= esc($msg) ?></p>
<form method="POST"><input type="hidden" name="csrf_token" value="<?= esc(csrf_token()) ?>">
<input name="full_name" placeholder="Full name" required><input type="email" name="email" required><input type="password" name="password" minlength="8" required>
<select name="role"><option value="student">Student</option><option value="lecturer">Lecturer</option></select>
<button>Create Account</button></form></div></div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
