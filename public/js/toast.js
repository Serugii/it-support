/*************************************************
 * TOAST — сповіщення
 *************************************************/
function showToast(message) {
  const div = document.createElement('div');

  div.textContent = message;
  div.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #e74c3c;
    color: white;
    padding: 10px 15px;
    border-radius: 8px;
    z-index: 9999;
  `;

  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
