<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../includes/header.php';
require_role(['student']);
$stmt = db()->prepare('SELECT c.code, c.title, c.unit, r.score FROM results r JOIN courses c ON c.id=r.course_id WHERE r.student_id=?');
$stmt->execute([$_SESSION['user']['id']]);
$results = $stmt->fetchAll();
$gpa = calc_gpa($results);
?>
<div class="layout"><aside class="sidebar"><h3>Student</h3><a href="dashboard.php">Dashboard</a><a href="courses.php">Course Registration</a><a href="profile.php">Profile</a><a href="<?= BASE_URL ?>/auth/logout.php">Logout</a></aside>
<main class="main"><button id="dark-toggle">🌙</button><h2>Welcome <?= esc($_SESSION['user']['full_name']) ?></h2>
<div class="grid"><div class="card"><h4>Current GPA</h4><p><?= esc((string)$gpa) ?></p></div><div class="card"><h4>Notifications</h4><ul id="notif-feed"></ul></div></div>
<div class="card"><h3>Results</h3><table><tr><th>Code</th><th>Course</th><th>Unit</th><th>Score</th></tr><?php foreach($results as $r): ?><tr><td><?= esc($r['code']) ?></td><td><?= esc($r['title']) ?></td><td><?= esc($r['unit']) ?></td><td><?= esc($r['score']) ?></td></tr><?php endforeach; ?></table></div>
</main></div>
<?php require_once __DIR__ . '/../includes/footer.php'; ?>
