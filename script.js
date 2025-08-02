const scriptURL = "https://script.google.com/macros/s/AKfycbyfUfR3CAzXOVnhhOYQQZO0ijklVS-_hgjiznnFMje0AUGqun55vLfN8J6_6A9lHRXU4w/exec";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.addEventListener('click', () => handleSubmit(btn.dataset.category));
  });

  loadEntries(); // スプレッドシートから取得
});

function handleSubmit(category) {
  const date = document.getElementById('date').value;
  const shop = document.getElementById('shop').value;
  const staff = document.getElementById('staff').value;
  const amount = document.getElementById('amount').value;
  const memo = document.getElementById('memo').value;
  const id = Date.now().toString();

  const data = { id, date, shop, staff, category, amount, memo };

  renderEntry(data);

  // 入力リセット
  document.getElementById('amount').value = '';
  document.getElementById('memo').value = '';

  // スプレッドシートに送信
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
      log.innerHTML = "";
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

  // GASに削除リクエスト
  fetch(scriptURL, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: 'delete', id })
  });
}



