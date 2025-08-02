const scriptURL = "https://script.google.com/macros/s/AKfycbyZxcpjdJ9mlz7CpsH2a8buf7tOA0xPhbWYwVFjhScZzm0lKWBlnO3R4HWSCFDIrsC4LQ/exec";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.addEventListener('click', () => handleSubmit(btn.dataset.category));
  });

  loadEntries();
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

  // 表示と保存
  saveToLocal(data);
  renderEntry(data);

  // フォームリセット
  document.getElementById('amount').value = '';
  document.getElementById('memo').value = '';

  // スプレッドシート送信
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

function saveToLocal(entry) {
  let entries = JSON.parse(localStorage.getItem('entries')) || [];
  entries.push(entry);
  localStorage.setItem('entries', JSON.stringify(entries));
}

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem('entries')) || [];
  entries.forEach(renderEntry);
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
  // ローカル削除
  let entries = JSON.parse(localStorage.getItem('entries')) || [];
  entries = entries.filter(e => e.id !== id);
  localStorage.setItem('entries', JSON.stringify(entries));

  // 表示削除
  const entryDiv = button.closest('.entry');
  if (entryDiv) entryDiv.remove();

  // GAS削除送信
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify({ mode: 'delete', id })
  });
}





