/* WEBFLEX Core App Script - Local-first demo with online sync */
const KEYS = {
  users: 'webflex_users',
  session: 'webflex_session',
  posts: 'webflex_posts',
  messages: 'webflex_messages',
  queue: 'webflex_queue'
};

const $ = (sel) => document.querySelector(sel);
const getJSON = (k, fallback = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const now = () => new Date().toISOString();

function ensureSeedData() {
  if (!localStorage.getItem(KEYS.posts)) {
    setJSON(KEYS.posts, [{
      id: crypto.randomUUID(),
      author: 'WEBFLEX Team',
      text: 'Welcome to WEBFLEX — your hybrid social space.',
      media: null,
      createdAt: now(),
      status: 'synced'
    }]);
  }
}

function getSession() { return JSON.parse(localStorage.getItem(KEYS.session) || 'null'); }

function setBadge() {
  const badge = $('#network-badge');
  if (!badge) return;
  badge.textContent = navigator.onLine ? 'Online Mode' : 'Offline Mode';
  badge.style.color = navigator.onLine ? '#9effa2' : '#ffd700';
  const queued = getJSON(KEYS.queue).length;
  const queueCount = $('#queue-count');
  if (queueCount) queueCount.textContent = queued ? `Queued sync: ${queued}` : 'All synced';
}

function routeGuard() {
  const page = location.pathname.split('/').pop();
  if ((page === 'dashboard.html' || page === 'chat.html') && !getSession()) {
    location.href = 'index.html';
  }
}

function initAuth() {
  const signupForm = $('#signup-form');
  if (!signupForm) return;
  const loginForm = $('#login-form');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const authStatus = $('#auth-status');

  tabButtons.forEach((btn) => btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.dataset.tab;
    signupForm.classList.toggle('active', target === 'signup');
    loginForm.classList.toggle('active', target === 'login');
  }));

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const users = getJSON(KEYS.users);
    const user = {
      id: crypto.randomUUID(),
      name: $('#signup-name').value.trim(),
      email: $('#signup-email').value.trim().toLowerCase(),
      password: $('#signup-password').value
    };
    if (users.some((u) => u.email === user.email)) {
      authStatus.textContent = 'Account already exists. Please login.';
      return;
    }
    users.push(user);
    setJSON(KEYS.users, users);
    localStorage.setItem(KEYS.session, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    location.href = 'dashboard.html';
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const users = getJSON(KEYS.users);
    const email = $('#login-email').value.trim().toLowerCase();
    const password = $('#login-password').value;
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      authStatus.textContent = 'Invalid credentials.';
      return;
    }
    localStorage.setItem(KEYS.session, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    location.href = 'dashboard.html';
  });
}

function toDataURL(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result, type: file.type });
    reader.readAsDataURL(file);
  });
}

function queueForSync(item) {
  const queue = getJSON(KEYS.queue);
  queue.push(item);
  setJSON(KEYS.queue, queue);
  setBadge();
}

function syncData() {
  const queue = getJSON(KEYS.queue);
  if (!queue.length || !navigator.onLine) return;

  const posts = getJSON(KEYS.posts);
  const messages = getJSON(KEYS.messages);

  queue.forEach((entry) => {
    if (entry.kind === 'post') {
      const post = posts.find((p) => p.id === entry.id);
      if (post) post.status = 'synced';
    }
    if (entry.kind === 'message') {
      const msg = messages.find((m) => m.id === entry.id);
      if (msg) msg.status = 'synced';
    }
  });

  setJSON(KEYS.posts, posts);
  setJSON(KEYS.messages, messages);
  setJSON(KEYS.queue, []);
  renderFeed();
  renderChat();
  setBadge();
}

function showOfflineMode() {
  setBadge();
}

function renderFeed() {
  const feedEl = $('#feed-list');
  if (!feedEl) return;
  const posts = getJSON(KEYS.posts).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  feedEl.innerHTML = posts.map((post) => `
    <article class="feed-item">
      <div class="post-head"><span>${post.author}</span><span>${new Date(post.createdAt).toLocaleString()}</span></div>
      <p>${post.text}</p>
      ${renderMedia(post.media)}
      <small class="muted">Status: ${post.status || 'sent'}</small>
    </article>
  `).join('');
}

function renderMedia(media) {
  if (!media?.src) return '';
  if (media.type.startsWith('image/')) return `<img src="${media.src}" alt="post media" />`;
  return `<video src="${media.src}" controls></video>`;
}

function initDashboard() {
  if (!$('#publish-post')) return;
  const session = getSession();
  if (session) {
    $('#user-name').textContent = session.name;
    $('#user-email').textContent = session.email;
  }

  let draftMedia = null;

  $('#post-media').addEventListener('change', async (e) => {
    draftMedia = await toDataURL(e.target.files[0]);
    $('#media-preview').innerHTML = renderMedia(draftMedia);
  });

  $('#publish-post').addEventListener('click', () => {
    const text = $('#post-text').value.trim();
    if (!text && !draftMedia) return;
    const post = {
      id: crypto.randomUUID(),
      author: session?.name || 'Anonymous',
      text,
      media: draftMedia,
      createdAt: now(),
      status: navigator.onLine ? 'sent' : 'queued'
    };
    const posts = getJSON(KEYS.posts);
    posts.push(post);
    setJSON(KEYS.posts, posts);
    if (!navigator.onLine) queueForSync({ kind: 'post', id: post.id });

    $('#post-text').value = '';
    $('#post-media').value = '';
    draftMedia = null;
    $('#media-preview').innerHTML = '';
    renderFeed();
    setBadge();
  });

  $('#logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem(KEYS.session);
    location.href = 'index.html';
  });

  renderFeed();
}

function renderChat() {
  const chatWindow = $('#chat-window');
  if (!chatWindow) return;
  const msgs = getJSON(KEYS.messages).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
  chatWindow.innerHTML = msgs.map((m) => `
    <div class="bubble ${m.sender === 'me' ? 'me' : 'them'}">
      <div>${m.text || ''}</div>
      ${renderMedia(m.media)}
      <div class="message-meta">${m.status || 'sent'} • ${new Date(m.createdAt).toLocaleTimeString()}</div>
    </div>
  `).join('');
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function simulateReply() {
  const indicator = $('#typing-indicator');
  if (!indicator) return;
  indicator.classList.add('show');
  setTimeout(() => {
    indicator.classList.remove('show');
    const messages = getJSON(KEYS.messages);
    messages.push({
      id: crypto.randomUUID(),
      sender: 'them',
      text: 'Got it. WEBFLEX sync is looking premium ✨',
      media: null,
      createdAt: now(),
      status: 'sent'
    });
    setJSON(KEYS.messages, messages);
    renderChat();
  }, 1100);
}

function initChat() {
  if (!$('#chat-form')) return;
  let draftMedia = null;
  $('#chat-media').addEventListener('change', async (e) => {
    draftMedia = await toDataURL(e.target.files[0]);
    $('#chat-media-preview').innerHTML = renderMedia(draftMedia);
  });

  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#chat-input').value.trim();
    if (!text && !draftMedia) return;

    const message = {
      id: crypto.randomUUID(),
      sender: 'me',
      text,
      media: draftMedia,
      createdAt: now(),
      status: navigator.onLine ? 'sent' : 'sending...'
    };

    const messages = getJSON(KEYS.messages);
    messages.push(message);
    setJSON(KEYS.messages, messages);

    if (!navigator.onLine) {
      message.status = 'queued';
      setJSON(KEYS.messages, messages);
      queueForSync({ kind: 'message', id: message.id });
    } else {
      simulateReply();
    }

    $('#chat-input').value = '';
    $('#chat-media').value = '';
    draftMedia = null;
    $('#chat-media-preview').innerHTML = '';
    renderChat();
    setBadge();
  });

  renderChat();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('SW registration failed:', err.message);
    });
  }
}

window.addEventListener('online', syncData);
window.addEventListener('offline', showOfflineMode);

document.addEventListener('DOMContentLoaded', () => {
  ensureSeedData();
  routeGuard();
  initAuth();
  initDashboard();
  initChat();
  setBadge();
  registerServiceWorker();
});
