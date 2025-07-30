const logDisplay = document.getElementById("logDisplay");
const adminView = document.getElementById("adminView");
const balanceDisplay = document.getElementById("balance");
const summaryArea = document.getElementById("summaryArea");
let currentBalance = 0;
let records = JSON.parse(localStorage.getItem("records") || "[]");

const GAS_URL = "https://script.google.com/macros/s/AKfycbw1VCo15tfwtVYPNowUE04QuN11IzJflXnPflxP2o1OyZhBFkFHMP6nUM2HF0mcwJ8V6g/exec";

const categoryData = {
  "バックスバー": [["🪙", "チケット売上"], ["🥃", "ボトル売上"], ["🍶", "酒仕入れ"], ["🥬", "食材仕入れ"],
                    ["🧻", "消耗品"], ["🍱", "ランチ食材仕入れ"], ["🧼", "ランチ消耗品"], ["📦", "その他支払い"]],
  "豚汁屋": [["💰", "売上"], ["🥩", "肉仕入"], ["🥕", "野菜仕入"], ["🍚", "米仕入"],
             ["🧂", "その他食材仕入れ"], ["🍶", "酒類仕入れ"], ["🧻", "消耗品"], ["📦", "その他支払い"]]
};

function updateCategoryButtons() {
  const store = document.getElementById("store").value;
  const container = document.getElementById("categoryButtons");
  container.innerHTML = "";
  categoryData[store].forEach(([icon, label]) => {
    const btn = document.createElement("button");
    btn.innerText = `${icon} ${label}`;
    btn.onclick = () => addEntry(label, icon);
    container.appendChild(btn);
  });
}

function addEntry(category, icon) {
  const date = document.getElementById("date").value;
  const store = document.getElementById("store").value;
  const staff = document.getElementById("staff").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const memo = document.getElementById("memo").value;

  if (!amount || isNaN(amount)) {
    alert("金額は必須です（数値）");
    return;
  }

  const type = category.includes("売上") ? "売上" : "支出";
  if (type === "売上") currentBalance += amount;
  else currentBalance -= amount;
  balanceDisplay.textContent = currentBalance;

  const record = { date, store, staff, category, amount, memo, icon, type };
  records.push(record);
  saveToLocal();
  sendToGAS(record);

  const div = document.createElement("div");
  div.className = "entry";
  div.innerHTML = `<span>${icon} ${category}：${memo ? memo + ' ' : ''}¥${amount}（${store}・${staff}・${date}）</span>
                   <button onclick="deleteEntry(${records.length - 1})">🗑</button>`;
  logDisplay.appendChild(div);

  document.getElementById("amount").value = "";
  document.getElementById("memo").value = "";
}

function sendToGAS(record) {
  fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });
}

function deleteEntry(index) {
  records.splice(index, 1);
  saveToLocal();
  renderLog();
}

function saveToLocal() {
  localStorage.setItem("records", JSON.stringify(records));
}

function renderLog() {
  logDisplay.innerHTML = "";
  currentBalance = 0;
  records.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "entry";
    const type = r.category.includes("売上") ? "売上" : "支出";
    if (type === "売上") currentBalance += r.amount;
    else currentBalance -= r.amount;

    div.innerHTML = `<span>${r.icon} ${r.category}：${r.memo ? r.memo + ' ' : ''}¥${r.amount}（${r.store}・${r.staff}・${r.date}）</span>
                     <button onclick="deleteEntry(${i})">🗑</button>`;
    logDisplay.appendChild(div);
  });
  balanceDisplay.textContent = currentBalance;
}

function checkAdmin() {
  const pass = document.getElementById("adminPass").value;
  if (pass === "6969") {
    adminView.classList.remove("hidden");
    alert("管理者モードが有効になりました");
  } else {
    alert("パスワードが間違っています");
  }
}

function showDailySummary() {
  const selectedDate = document.getElementById("summaryDate").value;
  const filtered = records.filter(r => r.date === selectedDate);
  if (filtered.length === 0) {
    summaryArea.textContent = "該当データなし";
    return;
  }
  let text = `📅 ${selectedDate} の集計\n`;
  filtered.forEach(r => {
    text += `・${r.category}: ¥${r.amount}${r.memo ? "（" + r.memo + "）" : ""}\n`;
  });
  summaryArea.textContent = text;
}

function showMonthlySummary() {
  const selectedMonth = document.getElementById("summaryMonth").value;
  const filtered = records.filter(r => r.date.startsWith(selectedMonth));
  if (filtered.length === 0) {
    summaryArea.textContent = "該当データなし";
    return;
  }
  const sums = {};
  filtered.forEach(r => {
    if (!sums[r.category]) sums[r.category] = 0;
    sums[r.category] += r.amount;
  });
  let text = `📆 ${selectedMonth} の月間集計\n`;
  for (const [cat, amt] of Object.entries(sums)) {
    text += `・${cat}: ¥${amt}\n`;
  }
  summaryArea.textContent = text;
}

document.getElementById("date").valueAsDate = new Date();
updateCategoryButtons();
renderLog();
