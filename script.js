const scriptURL = "https://script.google.com/macros/s/AKfycbyZxcpjdJ9mlz7CpsH2a8buf7tOA0xPhbWYwVFjhScZzm0lKWBlnO3R4HWSCFDIrsC4LQ/exec";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.addEventListener('click', () => handleSubmit(btn.dataset.category));
  });

  loadEntries(); // ← スプレッドシートから読み込むよう変更
});

function handleSubmit(category) {
  const date = document.getElementById('date').value;
  const shop = document.getElementById('shop').value;
  const staff = document.getElementById('staff').value;
  const amount = document.getElementById('amount').value;
  const memo = document.getElementById('memo').value;
  const id = Date.now().toString();

  const data = {
    id, date, shop, staff, category, amount, memo
  };

  renderEntry(data); // 表示だけ（ローカル保存しない）

  // フォームリセット
  document.getElementById('amount').value = '';
  document.getElementById('memo').value = '';

  // スプレッドシート送信
  fetch(scriptURL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

function loadEntries() {
  fetch(scriptURL)
    .then(res => res.json())
    .then(entries => {
      const log = document.getElementById('log');
      log.innerHTML = ""; // いったんクリア
      entries.forEach(renderEntry);
    })
    .catch(error => console.error("読み込みエラー:", error));
}

function renderEntry(entry) {
  const log = document.getElementById('log');
  const div = document.createElement('div');
  div.className = 'entry';
  div.dataset.id = entry.id;
  div.innerHTML = `
    <strong>${entry.date}</strong> - ${entry.shop} - ${entry.staff} - ${entry.category} - ¥${entry.amount}
    <br>${entry.memo}
    <button onclick="deleteEntry('${entry.id}', this)">削除</button>
  `;
  log.prepend(div);
}

function deleteEntry(id, button) {
  // 表示削除
  const entryDiv = button.closest('.entry');
  if (entryDiv) entryDiv.remove();

  // GAS削除送信
  fetch(scriptURL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: 'delete', id })
  });
}
