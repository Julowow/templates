// State Connector v1.0.0 — No-code DOM binding for Webflow & friends
// Usage: <script src="https://your-app.com/state-connector.js"></script>
// DOM: data-mywidget="user-name|user-balance|balance-wrapper|log-out|status"
// API: window.MyWidgetState.connect(), .disconnect(), .getUser()

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION
  // ============================================================

  var WIDGET_NAME = 'MyWidgetState';
  var PREFIX = 'mywidget';
  var WIDGET_BASE_URL = window.MYWIDGET_URL || 'https://your-app.vercel.app';
  var CONNECT_PATH = '/embed/connect';
  var STORAGE_KEY = 'mywidget_user';

  var TRUSTED_ORIGINS = [
    'https://your-app.com',
    'https://www.your-app.com',
    'https://your-app.vercel.app',
  ];

  // ============================================================
  // OVERLAY STYLES (for connect modal)
  // ============================================================

  var OVERLAY_STYLES = '\
    .' + PREFIX + '-connect-overlay {\
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;\
      background: rgba(0,0,0,0.85);\
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);\
      z-index: 999999;\
      display: flex; align-items: center; justify-content: center;\
      opacity: 0; animation: ' + PREFIX + '-connect-in 0.3s forwards;\
    }\
    @keyframes ' + PREFIX + '-connect-in { to { opacity: 1; } }\
    .' + PREFIX + '-connect-overlay.closing {\
      animation: ' + PREFIX + '-connect-out 0.3s forwards;\
    }\
    @keyframes ' + PREFIX + '-connect-out { to { opacity: 0; } }\
    .' + PREFIX + '-connect-iframe {\
      width: 100%; height: 100%; border: none; background: transparent;\
    }\
  ';

  // ============================================================
  // LOCAL STORAGE
  // ============================================================

  function getStoredUser() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  }

  function storeUser(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (e) { /* ignore */ }
  }

  function clearUser() {
    try { localStorage.removeItem(STORAGE_KEY); }
    catch (e) { /* ignore */ }
  }

  // ============================================================
  // DOM HELPERS
  // ============================================================

  function truncateAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  function formatBalance(balance) {
    if (balance === null || balance === undefined) return '0';
    var num = Number(balance);
    var parts = num.toFixed(3).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var dec = parts[1].replace(/0+$/, '');
    return dec ? parts[0] + '.' + dec : parts[0];
  }

  // ============================================================
  // DOM BINDING — Map data-mywidget attributes to user state
  // ============================================================

  function updateDOM(userData) {
    // User display name / address
    document.querySelectorAll('[data-' + PREFIX + '="user-name"]').forEach(function(el) {
      el.textContent = userData ? truncateAddress(userData.address) : 'Connect';
    });

    // Balance display
    document.querySelectorAll('[data-' + PREFIX + '="user-balance"]').forEach(function(el) {
      el.textContent = userData ? formatBalance(userData.balance) : '';
    });

    // Balance wrapper visibility
    document.querySelectorAll('[data-' + PREFIX + '="balance-wrapper"]').forEach(function(el) {
      el.style.display = userData ? 'flex' : 'none';
    });

    // Status text
    document.querySelectorAll('[data-' + PREFIX + '="status"]').forEach(function(el) {
      el.textContent = userData ? (userData.status || 'connected') : '';
    });

    // Logout button
    document.querySelectorAll('[data-' + PREFIX + '="log-out"]').forEach(function(el) {
      el.style.display = userData ? 'flex' : 'none';
    });
  }

  // ============================================================
  // OVERLAY (connect modal)
  // ============================================================

  function injectStyles() {
    if (document.getElementById(PREFIX + '-connect-styles')) return;
    var style = document.createElement('style');
    style.id = PREFIX + '-connect-styles';
    style.textContent = OVERLAY_STYLES;
    document.head.appendChild(style);
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') closeOverlay();
  }

  function openOverlay() {
    if (getStoredUser()) return; // already connected
    closeOverlay();
    injectStyles();

    var overlay = document.createElement('div');
    overlay.className = PREFIX + '-connect-overlay';
    overlay.id = PREFIX + '-connect-overlay';

    var iframe = document.createElement('iframe');
    iframe.className = PREFIX + '-connect-iframe';
    iframe.src = WIDGET_BASE_URL + CONNECT_PATH + '?fresh=1';
    iframe.allow = 'accelerometer; autoplay; camera; gyroscope; payment; storage-access';

    overlay.appendChild(iframe);
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeOverlay();
    });

    document.addEventListener('keydown', handleEscapeKey);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
  }

  function closeOverlay() {
    var overlay = document.getElementById(PREFIX + '-connect-overlay');
    if (!overlay) return;

    overlay.classList.add('closing');
    setTimeout(function() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeKey);
    }, 300);
  }

  // ============================================================
  // CONNECT / DISCONNECT
  // ============================================================

  function handleDisconnect() {
    clearUser();
    updateDOM(null);

    // Spawn hidden iframe to clear session on embed origin
    var logoutFrame = document.createElement('iframe');
    logoutFrame.style.cssText = 'position:absolute;width:0;height:0;border:none;opacity:0;pointer-events:none';
    logoutFrame.src = WIDGET_BASE_URL + CONNECT_PATH + '?logout=1';
    document.body.appendChild(logoutFrame);
    setTimeout(function() { logoutFrame.remove(); }, 5000);

    window.dispatchEvent(new CustomEvent(PREFIX + ':disconnected'));
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  function handleMessage(event) {
    if (!TRUSTED_ORIGINS.includes(event.origin)) return;
    var msg = event.data || {};

    if (msg.type === 'LOGIN_SUCCESS' && msg.data && msg.data.address) {
      var userData = {
        address: msg.data.address,
        balance: msg.data.balance || 0,
        status: msg.data.status || 'connected',
      };
      storeUser(userData);
      updateDOM(userData);
      closeOverlay();
      window.dispatchEvent(new CustomEvent(PREFIX + ':connected', { detail: userData }));
    }

    if (msg.type === 'LOGOUT') {
      handleDisconnect();
      closeOverlay();
    }

    if (msg.type === 'CLOSE') {
      closeOverlay();
    }
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    // Bind connect buttons
    document.querySelectorAll('[data-' + PREFIX + '="user-name"]').forEach(function(el) {
      var clickTarget = el.closest('a, button') || el;
      clickTarget.addEventListener('click', function(e) {
        e.preventDefault();
        if (!getStoredUser()) openOverlay();
      });
    });

    // Bind logout buttons
    document.querySelectorAll('[data-' + PREFIX + '="log-out"]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        handleDisconnect();
      });
    });

    window.addEventListener('message', handleMessage);

    // Restore saved state
    updateDOM(getStoredUser());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window[WIDGET_NAME] = {
    connect: openOverlay,
    disconnect: handleDisconnect,
    getUser: getStoredUser,
    version: '1.0.0',
  };
})();
