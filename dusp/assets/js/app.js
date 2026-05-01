document.addEventListener('DOMContentLoaded', () => {
  const darkBtn = document.getElementById('dark-toggle');
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  darkBtn?.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });

  const notif = document.getElementById('notif-feed');
  if (notif) {
    setInterval(async () => {
      const res = await fetch('/dusp/auth/notifications.php');
      if (!res.ok) return;
      const data = await res.json();
      notif.innerHTML = data.map(n => `<li>${n.message}</li>`).join('');
    }, 12000);
  }
});
