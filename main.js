document.addEventListener('DOMContentLoaded', () => {
    const daysGrid = document.getElementById('daysGrid');
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmBtn = document.getElementById('setAlarm');
    const alarmStatus = document.getElementById('alarmStatus');
    const testNotificationBtn = document.getElementById('testNotification');
    const resetProgressBtn = document.getElementById('resetProgress');
    const startDateInput = document.getElementById('startDate');
    const setStartDateBtn = document.getElementById('setStartDate');

    // Mysteries Rotation
    const mysteries = ['환희의 신비', '빛의 신비', '고통의 신비', '영광의 신비'];

    // State
    let completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
    let alarmTime = localStorage.getItem('alarmTime') || "";
    let startDate = localStorage.getItem('startDate') || "";

    // Initialize UI
    alarmTimeInput.value = alarmTime;
    startDateInput.value = startDate;
    renderGrid();
    updateAlarmStatus();

    // Render 9-day grid
    function renderGrid() {
        daysGrid.innerHTML = '';
        const start = startDate ? new Date(startDate) : null;

        for (let i = 1; i <= 9; i++) {
            const dayCard = document.createElement('div');
            dayCard.className = `day-card ${completedDays.includes(i) ? 'completed' : ''}`;
            
            // Calculate Date and Mystery
            let dateStr = "날짜 미설정";
            if (start) {
                const currentDayDate = new Date(start);
                currentDayDate.setDate(start.getDate() + (i - 1));
                dateStr = currentDayDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
            }
            
            const mystery = mysteries[(i - 1) % 4];

            dayCard.innerHTML = `
                <div>
                    <h3>${i}일차</h3>
                    <p class="day-date">${dateStr}</p>
                </div>
                <p class="day-mystery">${mystery}</p>
                <div>
                    <input type="checkbox" id="day${i}" ${completedDays.includes(i) ? 'checked' : ''}>
                    <label for="day${i}">기도 완료</label>
                </div>
            `;
            
            dayCard.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                    const checkbox = dayCard.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                    toggleDay(i, checkbox.checked);
                }
            });

            dayCard.querySelector('input').addEventListener('change', (e) => {
                toggleDay(i, e.target.checked);
            });

            daysGrid.appendChild(dayCard);
        }
    }

    function toggleDay(day, isCompleted) {
        if (isCompleted) {
            if (!completedDays.includes(day)) completedDays.push(day);
        } else {
            completedDays = completedDays.filter(d => d !== day);
        }
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
        renderGrid();
    }

    // Settings Logic
    setAlarmBtn.addEventListener('click', () => {
        alarmTime = alarmTimeInput.value;
        if (!alarmTime) {
            alert("알람 시간을 선택해주세요.");
            return;
        }
        localStorage.setItem('alarmTime', alarmTime);
        updateAlarmStatus();
        requestNotificationPermission();
        alert(`매일 ${alarmTime}분에 알람이 설정되었습니다.`);
    });

    setStartDateBtn.addEventListener('click', () => {
        startDate = startDateInput.value;
        if (!startDate) {
            alert("시작 날짜를 선택해주세요.");
            return;
        }
        localStorage.setItem('startDate', startDate);
        renderGrid();
        alert("기도 시작 날짜가 설정되었습니다.");
    });

    function updateAlarmStatus() {
        if (alarmTime) {
            alarmStatus.innerText = `매일 ${alarmTime}에 알람이 울립니다.`;
        } else {
            alarmStatus.innerText = "알람이 설정되지 않았습니다.";
        }
    }

    function requestNotificationPermission() {
        if (!("Notification" in window)) {
            alert("이 브라우저는 알림 기능을 지원하지 않습니다.");
            return;
        }
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }

    testNotificationBtn.addEventListener('click', () => {
        if (Notification.permission === "granted") {
            new Notification("묵주기도 알림 테스트", {
                body: "묵주기도를 바칠 시간입니다!",
                icon: "https://cdn-icons-png.flaticon.com/512/2913/2913451.png"
            });
        } else {
            alert("알림 권한을 허용해주세요.");
            requestNotificationPermission();
        }
    });

    resetProgressBtn.addEventListener('click', () => {
        if (confirm("모든 진행 상황을 초기화할까요?")) {
            completedDays = [];
            startDate = "";
            localStorage.removeItem('completedDays');
            localStorage.removeItem('startDate');
            startDateInput.value = "";
            renderGrid();
        }
    });

    // Background check for alarm
    setInterval(() => {
        if (!alarmTime) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === alarmTime) {
            if (Notification.permission === "granted" && !window.lastNotifiedMinute) {
                new Notification("묵주기도 시간", {
                    body: "오늘의 9일 묵주기도를 바칠 시간입니다.",
                    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913451.png"
                });
                window.lastNotifiedMinute = currentTime;
            }
        } else {
            window.lastNotifiedMinute = null;
        }
    }, 30000);
});
