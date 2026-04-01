export const BUTTON_STYLES = `
  #mylib-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 14px 28px;
    background: #111111;
    color: #FFFFFF;
    border: 2px solid #111111;
    border-radius: 10px;
    font-family: system-ui, sans-serif;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    letter-spacing: 0.5px;
    line-height: 1;
    white-space: nowrap;
  }

  #mylib-btn:hover {
    background: #333333;
    border-color: #333333;
  }

  #mylib-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  #mylib-btn.connected {
    background: rgba(0, 0, 0, 0.05);
    color: #111111;
    border-color: #111111;
  }

  #mylib-btn.connected:hover {
    background: rgba(0, 0, 0, 0.12);
  }
`;

export const MODAL_OVERRIDE_STYLES = `
  /* Override modal styles from your SDK if needed */
  .mylib-modal {
    z-index: 2147483647 !important;
  }
  .mylib-modal > section {
    border-radius: 16px !important;
    overflow: hidden !important;
  }
  .mylib-modal footer {
    display: none !important;
  }
`;
