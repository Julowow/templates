// Widget Loader v1.0.0
// Usage: <script src="https://your-app.com/widget-loader.js"></script>
// Buttons: <button data-mywidget-open="feature-a|feature-b">...</button>
// API: window.MyWidget.open('feature-a'), window.MyWidget.close()

(function() {
  'use strict';

  // ============================================================
  // CONFIGURATION — Customize for your project
  // ============================================================

  var WIDGET_NAME = 'MyWidget';
  var WIDGET_PREFIX = 'mywidget';
  var WIDGET_BASE_URL = window.MYWIDGET_URL || 'https://your-app.vercel.app';

  var WIDGET_PATHS = {
    'feature-a': '/embed/feature-a',
    'feature-b': '/embed/feature-b',
    'connect':   '/embed/connect',
  };

  var TRUSTED_ORIGINS = [
    'https://your-app.com',
    'https://www.your-app.com',
    'https://your-app.vercel.app',
  ];

  // ============================================================
  // OVERLAY STYLES
  // ============================================================

  var OVERLAY_STYLES = '\
    .' + WIDGET_PREFIX + '-overlay {\
      position: fixed;\
      top: 0; left: 0; right: 0; bottom: 0;\
      background: rgba(0, 0, 0, 0.85);\
      backdrop-filter: blur(8px);\
      -webkit-backdrop-filter: blur(8px);\
      z-index: 999999;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      padding: 20px;\
      opacity: 0;\
      animation: ' + WIDGET_PREFIX + '-fade-in 0.3s forwards;\
    }\
    @keyframes ' + WIDGET_PREFIX + '-fade-in { to { opacity: 1; } }\
    .' + WIDGET_PREFIX + '-overlay.closing {\
      animation: ' + WIDGET_PREFIX + '-fade-out 0.3s forwards;\
    }\
    @keyframes ' + WIDGET_PREFIX + '-fade-out { to { opacity: 0; } }\
    .' + WIDGET_PREFIX + '-container {\
      position: relative;\
      width: 100%;\
      max-width: 420px;\
      height: 650px;\
      max-height: 90vh;\
      border-radius: 16px;\
      overflow: hidden;\
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\
      transform: scale(0.95);\
      animation: ' + WIDGET_PREFIX + '-scale-in 0.3s forwards;\
    }\
    @keyframes ' + WIDGET_PREFIX + '-scale-in { to { transform: scale(1); } }\
    .' + WIDGET_PREFIX + '-overlay.closing .' + WIDGET_PREFIX + '-container {\
      animation: ' + WIDGET_PREFIX + '-scale-out 0.3s forwards;\
    }\
    @keyframes ' + WIDGET_PREFIX + '-scale-out { to { transform: scale(0.95); } }\
    .' + WIDGET_PREFIX + '-iframe {\
      width: 100%; height: 100%; border: none; display: block;\
    }\
    .' + WIDGET_PREFIX + '-close {\
      position: absolute; top: 16px; right: 16px;\
      width: 40px; height: 40px; border-radius: 50%;\
      background: rgba(0,0,0,0.7); border: 2px solid rgba(255,255,255,0.2);\
      color: white; font-size: 24px; line-height: 1;\
      cursor: pointer; z-index: 10;\
      display: flex; align-items: center; justify-content: center;\
      transition: all 0.2s ease;\
      backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);\
    }\
    .' + WIDGET_PREFIX + '-close:hover {\
      background: rgba(0,0,0,0.9);\
      border-color: rgba(255,255,255,0.4);\
      transform: scale(1.1);\
    }\
  ';

  // ============================================================
  // CORE FUNCTIONS
  // ============================================================

  function injectStyles() {
    if (document.getElementById(WIDGET_PREFIX + '-styles')) return;
    var style = document.createElement('style');
    style.id = WIDGET_PREFIX + '-styles';
    style.textContent = OVERLAY_STYLES;
    document.head.appendChild(style);
  }

  function createOverlay(widgetType) {
    var overlay = document.createElement('div');
    overlay.className = WIDGET_PREFIX + '-overlay';
    overlay.id = WIDGET_PREFIX + '-overlay';

    var container = document.createElement('div');
    container.className = WIDGET_PREFIX + '-container';

    var closeButton = document.createElement('button');
    closeButton.className = WIDGET_PREFIX + '-close';
    closeButton.innerHTML = '\u00d7';
    closeButton.setAttribute('aria-label', 'Close widget');
    closeButton.onclick = closeWidget;

    var iframe = document.createElement('iframe');
    iframe.className = WIDGET_PREFIX + '-iframe';
    iframe.src = WIDGET_BASE_URL + WIDGET_PATHS[widgetType];
    iframe.allow = 'accelerometer; autoplay; camera; gyroscope; payment; storage-access';
    iframe.setAttribute('loading', 'lazy');

    container.appendChild(closeButton);
    container.appendChild(iframe);
    overlay.appendChild(container);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeWidget();
    });

    document.addEventListener('keydown', handleEscapeKey);
    return overlay;
  }

  function handleEscapeKey(e) {
    if (e.key === 'Escape') closeWidget();
  }

  function openWidget(widgetType) {
    if (!WIDGET_PATHS[widgetType]) {
      console.error('[' + WIDGET_NAME + '] Invalid widget type: ' + widgetType);
      return;
    }

    closeWidget();
    injectStyles();

    var overlay = createOverlay(widgetType);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    window.addEventListener('message', handleIframeMessage);

    console.log('[' + WIDGET_NAME + '] Widget opened: ' + widgetType);
  }

  function closeWidget() {
    var overlay = document.getElementById(WIDGET_PREFIX + '-overlay');
    if (!overlay) return;

    overlay.classList.add('closing');
    setTimeout(function() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscapeKey);
      window.removeEventListener('message', handleIframeMessage);
    }, 300);
  }

  // ============================================================
  // MESSAGE HANDLING — Customize for your message types
  // ============================================================

  function handleIframeMessage(event) {
    if (!TRUSTED_ORIGINS.includes(event.origin)) return;

    var data = event.data || {};

    switch (data.type) {
      case 'WIDGET_SUCCESS':
        console.log('[' + WIDGET_NAME + '] Success:', data.payload);
        window.dispatchEvent(new CustomEvent(WIDGET_PREFIX + ':success', { detail: data.payload }));
        setTimeout(closeWidget, 3000);
        break;

      case 'WIDGET_ERROR':
        console.error('[' + WIDGET_NAME + '] Error:', data.error);
        window.dispatchEvent(new CustomEvent(WIDGET_PREFIX + ':error', { detail: { error: data.error } }));
        break;

      case 'WIDGET_CLOSE':
        closeWidget();
        break;

      // Add your custom message types here
    }
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    var buttons = document.querySelectorAll('[data-' + WIDGET_PREFIX + '-open]');
    buttons.forEach(function(button) {
      var widgetType = button.getAttribute('data-' + WIDGET_PREFIX + '-open');
      button.addEventListener('click', function(e) {
        e.preventDefault();
        openWidget(widgetType);
      });
    });

    console.log('[' + WIDGET_NAME + '] Loader initialized. Found ' + buttons.length + ' button(s).');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window[WIDGET_NAME] = {
    open: openWidget,
    close: closeWidget,
    version: '1.0.0'
  };
})();
