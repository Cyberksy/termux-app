<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/functions.php';
start_secure_session();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= esc(APP_NAME) ?></title>
  <link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
  <script defer src="<?= BASE_URL ?>/assets/js/app.js"></script>
</head>
<body>
