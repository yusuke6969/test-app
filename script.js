document.getElementById('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const data = {
    date: document.getElementById('date').value,
    store: document.getElementById('store').value,
    staff: document.getElementById('staff').value,
    amount: document.getElementById('amount').value,
    category: document.getElementById('category').value,
    memo: document.getElementById('memo').value
  };

  const webhookUrl = 'https://script.google.com/macros/s/【ここにWebアプリURLを貼る】/exec';

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const resultText = await res.text();
    document.getElementById('result').innerText = '送信成功: ' + resultText;
  } catch (err) {
    document.getElementById('result').innerText = '送信失敗: ' + err.message;
  }
});
