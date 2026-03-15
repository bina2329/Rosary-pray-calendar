// NOTE: Firebase SDK must be included in index.html for this to work.
// Since we are in a simple static setup, we'll use the CDN version in index.html first.

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const daysGrid = document.getElementById('daysGrid');
    const alarmTimeInput = document.getElementById('alarmTime');
    const setAlarmBtn = document.getElementById('setAlarm');
    const clearAlarmBtn = document.getElementById('clearAlarm');
    const alarmStatus = document.getElementById('alarmStatus');
    const testNotificationBtn = document.getElementById('testNotification');
    const resetProgressBtn = document.getElementById('resetProgress');
    const startDateInput = document.getElementById('startDate');
    const prayerDurationInput = document.getElementById('prayerDuration');
    const setSettingsBtn = document.getElementById('setSettings');
    
    const listView = document.getElementById('listView');
    const calendarView = document.getElementById('calendarView');
    const listViewBtn = document.getElementById('listViewBtn');
    const calendarViewBtn = document.getElementById('calendarViewBtn');
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarMonth = document.getElementById('calendarMonth');

    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const userNameDisplay = document.getElementById('userName');

    // Mysteries Rotation
    const mysteries = ['환희의 신비', '빛의 신비', '고통의 신비', '영광의 신비'];

    // State
    let completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
    let alarmTime = localStorage.getItem('alarmTime') || "";
    let startDate = localStorage.getItem('startDate') || "";
    let prayerDuration = parseInt(localStorage.getItem('prayerDuration')) || 9;
    let currentView = localStorage.getItem('currentView') || 'list';
    let currentUser = null;

    // Initialize UI
    alarmTimeInput.value = alarmTime;
    startDateInput.value = startDate;
    prayerDurationInput.value = prayerDuration;
    
    updateView();
    updateAlarmStatus();

    // Mock Firebase Auth (Since we can't fully configure Firebase without keys)
    // In a real app, you'd use firebase.auth() and firebase.firestore()
    
    loginBtn.addEventListener('click', () => {
        alert("구글 로그인 기능은 Firebase 설정(API Key 등)이 필요합니다.\n현재는 데모 모드로 전환됩니다.");
        loginAsDemo();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        userProfile.classList.add('hidden');
        loginBtn.classList.remove('hidden');
        loadLocalData();
        updateView();
    });

    function loginAsDemo() {
        currentUser = { uid: "demo123", displayName: "사용자" };
        userNameDisplay.innerText = currentUser.displayName;
        userProfile.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        // In real app: fetch from Firestore
        syncWithCloud();
    }

    function syncWithCloud() {
        if (!currentUser) return;
        // Mocking cloud sync
        console.log("Syncing with cloud for user:", currentUser.uid);
        saveToLocalStorage(); // Keep local in sync
    }

    function loadLocalData() {
        completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
        startDate = localStorage.getItem('startDate') || "";
        prayerDuration = parseInt(localStorage.getItem('prayerDuration')) || 9;
        
        startDateInput.value = startDate;
        prayerDurationInput.value = prayerDuration;
    }

    function saveToLocalStorage() {
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
        localStorage.setItem('startDate', startDate);
        localStorage.setItem('prayerDuration', prayerDuration);
        localStorage.setItem('currentView', currentView);
        localStorage.setItem('alarmTime', alarmTime);
    }

    function updateView() {
        if (currentView === 'list') {
            listView.classList.remove('hidden');
            calendarView.classList.add('hidden');
            listViewBtn.classList.add('active');
            calendarViewBtn.classList.remove('active');
            renderGrid();
        } else {
            listView.classList.add('hidden');
            calendarView.classList.remove('hidden');
            listViewBtn.classList.remove('active');
            calendarViewBtn.classList.add('active');
            renderCalendar();
        }
    }

    // Render List View
    function renderGrid() {
        daysGrid.innerHTML = '';
        const start = startDate ? new Date(startDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= prayerDuration; i++) {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            let isOverdue = false;
            let dateStr = "날짜 미설정";
            if (start) {
                const currentDayDate = new Date(start);
                currentDayDate.setDate(start.getDate() + (i - 1));
                currentDayDate.setHours(0, 0, 0, 0);
                
                dateStr = currentDayDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
                
                if (currentDayDate < today && !completedDays.includes(i)) {
                    isOverdue = true;
                }
            }
            
            if (completedDays.includes(i)) {
                dayCard.classList.add('completed');
            } else if (isOverdue) {
                dayCard.classList.add('overdue');
            }
            
            const mystery = mysteries[(i - 1) % 4];

            dayCard.innerHTML = `
                <div>
                    <h3>${i}일차</h3>
                    <p class="day-date">${dateStr}${isOverdue ? ' <span class="overdue-label">(미완료)</span>' : ''}</p>
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

    // Render Calendar View
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const start = startDate ? new Date(startDate) : new Date();
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        
        calendarMonth.innerText = `${startYear}년 ${startMonth + 1}월`;

        const firstDayOfMonth = new Date(startYear, startMonth, 1).getDay();
        const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day';
            calendarGrid.appendChild(emptyDay);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = 1; d <= daysInMonth; d++) {
            const currentDayDate = new Date(startYear, startMonth, d);
            const dayElem = document.createElement('div');
            dayElem.className = 'calendar-day';
            
            if (startDate) {
                const startD = new Date(startDate);
                startD.setHours(0,0,0,0);
                const currentD = new Date(currentDayDate);
                currentD.setHours(0,0,0,0);
                
                const diffTime = currentD - startD;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays < prayerDuration) {
                    const prayerDayNum = diffDays + 1;
                    dayElem.classList.add('prayer-day');
                    
                    const isCompleted = completedDays.includes(prayerDayNum);
                    const isOverdue = currentD < today && !isCompleted;
                    
                    if (isCompleted) {
                        dayElem.classList.add('completed');
                    } else if (isOverdue) {
                        dayElem.classList.add('overdue');
                    }
                    
                    const mystery = mysteries[(prayerDayNum - 1) % 4];
                    dayElem.innerHTML = `
                        <span class="date-num">${d}</span>
                        <span class="day-num-tag">${prayerDayNum}일차</span>
                        <div class="prayer-info">${mystery}</div>
                        ${isOverdue ? '<div class="overdue-dot">!</div>' : ''}
                    `;
                    
                    dayElem.addEventListener('click', () => {
                        const isCompleted = completedDays.includes(prayerDayNum);
                        toggleDay(prayerDayNum, !isCompleted);
                    });
                } else {
                    dayElem.innerHTML = `<span class="date-num">${d}</span>`;
                }
            } else {
                dayElem.innerHTML = `<span class="date-num">${d}</span>`;
            }
            
            calendarGrid.appendChild(dayElem);
        }
    }

    function toggleDay(day, isCompleted) {
        if (isCompleted) {
            if (!completedDays.includes(day)) completedDays.push(day);
        } else {
            completedDays = completedDays.filter(d => d !== day);
        }
        saveToLocalStorage();
        syncWithCloud();
        if (currentView === 'list') renderGrid();
        else renderCalendar();
    }

    // View Switching
    listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        saveToLocalStorage();
        updateView();
    });

    calendarViewBtn.addEventListener('click', () => {
        currentView = 'calendar';
        saveToLocalStorage();
        updateView();
    });

    // Settings Logic
    setAlarmBtn.addEventListener('click', () => {
        alarmTime = alarmTimeInput.value;
        if (!alarmTime) {
            alert("알람 시간을 선택해주세요. 알람을 원하지 않으시면 '알람 해제'를 눌러주세요.");
            return;
        }
        saveToLocalStorage();
        updateAlarmStatus();
        requestNotificationPermission();
        alert(`매일 ${alarmTime}분에 알람이 설정되었습니다.`);
    });

    clearAlarmBtn.addEventListener('click', () => {
        alarmTime = "";
        alarmTimeInput.value = "";
        saveToLocalStorage();
        updateAlarmStatus();
        alert("알람이 해제되었습니다.");
    });

    setSettingsBtn.addEventListener('click', () => {
        startDate = startDateInput.value;
        prayerDuration = parseInt(prayerDurationInput.value) || 9;
        
        saveToLocalStorage();
        syncWithCloud();
        updateView();
        alert("설정이 저장되었습니다.");
    });

    function updateAlarmStatus() {
        if (alarmTime) {
            alarmStatus.innerText = `매일 ${alarmTime}에 알람이 울립니다.`;
        } else {
            alarmStatus.innerText = "알람이 설정되지 않았습니다.";
        }
    }

    function requestNotificationPermission() {
        if (!("Notification" in window)) return;
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
            requestNotificationPermission();
        }
    });

    resetProgressBtn.addEventListener('click', () => {
        if (confirm("모든 진행 상황을 초기화할까요?")) {
            completedDays = [];
            startDate = "";
            prayerDuration = 9;
            saveToLocalStorage();
            syncWithCloud();
            startDateInput.value = "";
            prayerDurationInput.value = 9;
            updateView();
        }
    });

    setInterval(() => {
        if (!alarmTime) return;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        if (currentTime === alarmTime) {
            if (Notification.permission === "granted" && !window.lastNotifiedMinute) {
                new Notification("묵주기도 시간", {
                    body: "오늘의 묵주기도를 바칠 시간입니다.",
                    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913451.png"
                });
                window.lastNotifiedMinute = currentTime;
            }
        } else {
            window.lastNotifiedMinute = null;
        }
    }, 30000);
});
