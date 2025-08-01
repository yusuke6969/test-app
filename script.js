const GAS_URL = "https://script.google.com/macros/s/AKfycbyrGUfqrNl-v63eFbVox-ZthBWIEtT63kaJXWrz9aaErX_Po17W1XtX_DA-kdBX-T-qBg/exec";

const dateInput = document.getElementById("date");
const shopSelect = document.getElementById("shop");
const staffSelect = document.getElementById("staff");
const amountInput = document.getElementById("amount");
const memoInput = document.getElementById("memo");
const adminPassInput = document.getElementById("adminPass");

const entryList = document.getElementById("entryList");
const popup = document.getElementById("popup");
const popupContent = document.getElementById("popupContent");
const closePopup = document.getElementById("closePopup");

const showTodayBtn = document.getElementById("showTodaySummary");
const showMonthlyBtn = document.getElementById("showMonthlySummary");

const categoryButtons = document.querySelectorAll(".category-button");

dateInput.valueAsDate = new Date();

// イベント登録（カテゴリボタン）
categoryButtons.forEach(button => {
  button.addEventListener("click", () => {
    const category = button.dataset.category;
    const amount = amountInput.value.trim();
    if (!amount) {
      alert("金額を入力してください。");
      return;
    }

    const data = {
      id: Date.now().toString(),
      date: dateInput.value,
      shop: shopSelect.value,
      staff: staffSelect.value,
      category: category,
      amount: amount,
      memo: memoInput.value.trim()
    };

    sendData(data);
  });
});

function sendData(data) {
  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(res => {
      if (res.status === "success") {
        saveToLocal(data);
        renderEntries();
        resetForm();
      } else {
        alert("送信エラー: " + JSON.stringify(res));
      }
    })
    .catch(err => alert("通信エラー: " + err.message));
}

function saveToLocal(entry) {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  records.push(entry);
  localStorage.setItem("records", JSON.stringify(records));
}

function renderEntries() {
  entryList.innerHTML = "";
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  records.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `
      <strong>${entry.date}</strong> | ${entry.shop} | ${entry.staff}<br />
      ${entry.category}：${entry.amount} 円<br />
      メモ：${entry.memo}
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "削除";
    delBtn.onclick = () => deleteEntry(entry.id);
    div.appendChild(delBtn);
    entryList.appendChild(div);
  });
}

function deleteEntry(id) {
  fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "delete", id })
  })
    .then(res => res.json())
    .then(res => {
      if (res.status === "deleted") {
        const records = JSON.parse(localStorage.getItem("records") || "[]");
        const updated = records.filter(r => r.id !== id);
        localStorage.setItem("records", JSON.stringify(updated));
        renderEntries();
      } else {
        alert("削除失敗：" + res.status);
      }
    })
    .catch(err => alert("通信エラー: " + err.message));
}

function resetForm() {
  amountInput.value = "";
  memoInput.value = "";
}

// 日別集計（今日のみ）
showTodayBtn.addEventListener("click", () => {
  const today = dateInput.value;
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const todayRecords = records.filter(r => r.date === today);

  const summary = {};
  let income = 0, expenses = 0;
  todayRecords.forEach(r => {
    const amt = Number(r.amount);
    summary[r.category] = (summary[r.category] || 0) + amt;
    if (r.category.includes("売上")) income += amt;
    else expenses += amt;
  });

  let html = `<h2>${today} の日別集計</h2>`;
  for (const [cat, val] of Object.entries(summary)) {
    html += `<p>${cat}：${val.toLocaleString()} 円</p>`;
  }
  html += `<hr><p><strong>残高：</strong> ${(income - expenses).toLocaleString()} 円</p>`;
  if (!todayRecords.length) html += "<p>本日の入力はまだありません。</p>";
  popupContent.innerHTML = html;
  popup.classList.remove("hidden");
});

// 月別集計（管理者）
showMonthlyBtn.addEventListener("click", () => {
  const records = JSON.parse(localStorage.getItem("records") || "[]");
  const month = dateInput.value.substring(0, 7);
  const monthRecords = records.filter(r => r.date.startsWith(month));

  const summary = {};
  monthRecords.forEach(r => {
    if (!summary[r.category]) summary[r.category] = [];
    summary[r.category].push(Number(r.amount));
  });

  let html = `<h2>${month} の月別集計</h2>`;
  for (const [cat, values] of Object.entries(summary)) {
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    html += `<p>${cat}：合計 ${total.toLocaleString()} 円 ／ 平均 ${avg.toFixed(1)} 円</p>`;
  }
  if (!monthRecords.length) html += "<p>今月の入力はまだありません。</p>";
  popupContent.innerHTML = html;
  popup.classList.remove("hidden");
});

// 管理者認証（パスワード 6969）
adminPassInput.addEventListener("input", () => {
  if (adminPassInput.value === "6969") {
    showMonthlyBtn.classList.remove("hidden");
  } else {
    showMonthlyBtn.classList.add("hidden");
  }
});

closePopup.addEventListener("click", () => {
  popup.classList.add("hidden");
});

// 初期描画
renderEntries();

