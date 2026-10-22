(function () {
  'use strict';

  var form = document.getElementById('login-form');
  var passwordInput = document.getElementById('password');
  var revealBtn = document.getElementById('reveal-btn');
  var submitBtn = document.getElementById('submit-btn');
  var statusBox = document.getElementById('status');

  var i18n = {};
  try {
    var node = document.getElementById('login-i18n');
    if (node && node.textContent) {
      i18n = JSON.parse(node.textContent);
    }
  } catch (err) {
    console.warn('Unable to read login strings:', err);
  }

  function t(key, fallback) {
    var value = i18n[key];
    if (typeof value === 'string' && value.length) return value;
    return fallback;
  }

  function setStatus(message, kind) {
    statusBox.textContent = message;
    statusBox.className = 'status is-visible ' + (kind === 'error' ? 'is-error' : 'is-info');
  }

  function clearStatus() {
    statusBox.textContent = '';
    statusBox.className = 'status';
  }

  function safeNext() {
    var params = new URLSearchParams(window.location.search);
    var next = params.get('next') || '';
    if (next.charAt(0) !== '/' || next.charAt(1) === '/') return '/cms';
    return next;
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.textContent = busy ? t('busyLabel', 'Authenticating…') : t('submitLabel', 'Enter Matrix');
  }

  revealBtn.addEventListener('click', function () {
    var isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    revealBtn.textContent = isHidden ? t('hideLabel', 'Hide') : t('revealLabel', 'Show');
    revealBtn.setAttribute('aria-label', isHidden ? t('hideAriaLabel', 'Hide passphrase') : t('revealAriaLabel', 'Show passphrase'));
    passwordInput.focus();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();

    var password = passwordInput.value;
    if (!password) {
      setStatus(t('errorEmpty', 'Enter the admin passphrase to continue.'), 'error');
      passwordInput.focus();
      return;
    }

    setBusy(true);

    fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password: password })
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          var msg = result.body && result.body.message ? result.body.message : t('errorAuth', 'Authentication failed.');
          setStatus(msg, 'error');
          setBusy(false);
          passwordInput.select();
          return;
        }
        setStatus(t('statusSuccess', 'Authenticated. Opening the CMS Matrix…'), 'info');
        window.location.assign(safeNext());
      })
      .catch(function () {
        setStatus(t('errorNetwork', 'Network error. Check that the server is running.'), 'error');
        setBusy(false);
      });
  });

  // Already signed in? Skip the form.
  fetch('/api/v1/auth/session', { credentials: 'same-origin' })
    .then(function (response) { return response.json(); })
    .then(function (body) {
      if (body && body.data && body.data.authenticated) {
        window.location.assign(safeNext());
      } else if (body && body.data && body.data.authConfigured === false) {
        setStatus(t('errorNotConfigured', 'Admin access is not configured on the server. Set ADMIN_PASSWORD in .env and restart.'), 'error');
      }
    })
    .catch(function () { /* stay on the form */ });
})();
