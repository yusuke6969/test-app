const scriptURL = "https://script.google.com/macros/s/AKfycbytpTwLhZQiBx4MDHVRQB8f2pDfHx2e2zvANyQR0Df7kk3Z10S2E33W165RXuM-BDkVQw/exec";

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
  div.innerHTML = 
    <strong>${entry.date}</strong> - ${entry.shop} - ${entry.staff} - ${entry.category} - ¥${entry.amount}
    <br>${entry.memo}
    <button onclick="deleteEntry('${entry.id}', this)">削除</button>
  ;
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



GASコードURLはhttps://script.google.com/macros/library/d/1o7Lfpu8xjMlpJ6LN7VIwH2TqrNelV9f75537vL4d-CutqzB7ZY7a_nIS/21　GASコード中身はfunction doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const data = JSON.parse(e.postData.contents);

  // 削除処理
  if (data.mode === "delete") {
    const idToDelete = data.id;
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0].toString() === idToDelete) {
        sheet.deleteRow(i + 1);
        return createCorsResponse({ status: "deleted", id: idToDelete });
      }
    }
    return createCorsResponse({ status: "not_found", id: idToDelete });
  }

  // 通常登録
  const id = new Date().getTime().toString();
  sheet.appendRow([
    id,
    data.date,
    data.shop,
    data.staff,
    data.category,
    Number(data.amount),
    data.memo
  ]);

  return createCorsResponse({ status: "success", id: id });
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const records = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((key, i) => obj[key] = row[i]);
    return obj;
  });
  return createCorsResponse(records);
}

// 共通CORS対応
function createCorsResponse(content) {
  return ContentService
    .createTextOutput(JSON.stringify(content))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}






