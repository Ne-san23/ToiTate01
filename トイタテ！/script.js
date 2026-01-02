// ==================================================
// 設定エリア
// ==================================================
// ★ここにGASのURLを貼り付けてください
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbziLyrMK17cOy3q4YTUPIGp3xyBQkgXURkEJ3pK7cg_s252Gt6U0deTm6rQtRZr4uwidA/exec'; 
// ==================================================

const questionInput = document.getElementById('questionInput');
const checkBtn = document.getElementById('checkBtn');
const resultArea = document.getElementById('resultArea');
const loadingSpinner = document.getElementById('loading');
const resultIcon = document.getElementById('resultIcon');
const resultTitle = document.getElementById('resultTitle');
const resultDetail = document.getElementById('resultDetail');

// ガチャ用要素
const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');
const btnC = document.getElementById('btnC');
const topicDisplay = document.getElementById('topicDisplay');
const topicText = document.getElementById('topicText');

// ▼ ガチャボタンのイベント設定 ▼
btnA.addEventListener('click', () => fetchTopic('パターンA'));
btnB.addEventListener('click', () => fetchTopic('パターンB'));
btnC.addEventListener('click', () => fetchTopic('パターンC'));

// お題を取得する関数
async function fetchTopic(pattern) {
    // UIをロード中にする
    topicDisplay.classList.remove('hidden');
    topicText.textContent = "お題を引いています...";
    topicText.style.color = "#888";

    // パターンCだけは「ペア取得」のアクションにする
    const actionType = (pattern === 'パターンC') ? 'getTopicPair' : 'getTopic';

    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({
                action: actionType,
                level: pattern
            })
        });

        const data = await response.json();

        // 成功したら表示
        topicText.style.color = "#333";
        if (pattern === 'パターンC') {
            topicText.innerHTML = `${data.topic1} <span style="font-size:12px; color:#888;">×</span> ${data.topic2}`;
        } else {
            topicText.textContent = data.topic;
        }

    } catch (error) {
        topicText.textContent = "通信エラー（再試行してください）";
        topicText.style.color = "red";
    }
}


// ▼ 判定ボタンのイベント設定 ▼
checkBtn.addEventListener('click', async () => {
    const question = questionInput.value;
    if (!question.trim()) { alert("問いを入力してください！"); return; }

    showLoading(true);
    hideResult();

    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }, 
            body: JSON.stringify({
                action: 'check',
                question: question
            })
        });

        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        showResult(data);

    } catch (error) {
        showResult({
            status: 'error',
            feedback_title: '通信エラー',
            feedback_detail: '通信に失敗しました。もう一度お試しください。'
        });
    } finally {
        showLoading(false);
    }
});

function showResult(data) {
    resultArea.classList.remove('hidden');
    resultTitle.classList.remove('status-s', 'status-a', 'status-b', 'status-error');
    
    let iconChar = '';
    let statusClass = '';

    switch (data.status) {
        case 'S': iconChar = '🏆 S'; statusClass = 'status-s'; break;
        case 'A': iconChar = '✨ A'; statusClass = 'status-a'; break;
        case 'B': iconChar = '🔍 B'; statusClass = 'status-b'; break;
        default: iconChar = '⚠️'; statusClass = 'status-error'; break;
    }

    resultIcon.textContent = iconChar;
    resultTitle.textContent = data.feedback_title;
    resultTitle.classList.add(statusClass);
    resultDetail.textContent = data.feedback_detail;
}

function hideResult() { resultArea.classList.add('hidden'); }
function showLoading(isLoading) {
    if (isLoading) { checkBtn.disabled = true; loadingSpinner.classList.remove('hidden'); }
    else { checkBtn.disabled = false; loadingSpinner.classList.add('hidden'); }
}