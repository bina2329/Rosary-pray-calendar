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

    // Intention UI
    const intentionInputArea = document.getElementById('intentionInputArea');
    const intentionDisplay = document.getElementById('intentionDisplay');
    const currentIntentionText = document.getElementById('currentIntention');
    const intentionInput = document.getElementById('intentionInput');
    const saveIntentionBtn = document.getElementById('saveIntention');
    const editIntentionBtn = document.getElementById('editIntention');
    const intentionBackground = document.getElementById('intentionBackground');

    // Mysteries Rotation
    const mysteries = ['환희의 신비', '빛의 신비', '고통의 신비', '영광의 신비'];

    // Background Images Mapping
    const bgImages = {
        '가족': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        '평화': 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&w=800&q=80',
        '감사': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
        '건강': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        'default': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80'
    };

    // State
    let completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
    let alarmTime = localStorage.getItem('alarmTime') || "";
    let startDate = localStorage.getItem('startDate') || "";
    let prayerDuration = parseInt(localStorage.getItem('prayerDuration')) || 9;
    let currentView = localStorage.getItem('currentView') || 'list';
    let prayerIntention = localStorage.getItem('prayerIntention') || "";
    let currentUser = null;

    // Initialize UI
    alarmTimeInput.value = alarmTime;
    startDateInput.value = startDate;
    prayerDurationInput.value = prayerDuration;
    
    updateIntentionUI();
    updateView();
    updateAlarmStatus();

    // Intention Events
    saveIntentionBtn.addEventListener('click', () => {
        prayerIntention = intentionInput.value.trim();
        if (prayerIntention) {
            localStorage.setItem('prayerIntention', prayerIntention);
            updateIntentionUI();
            syncWithCloud();
        } else {
            alert("기도 목적을 입력해주세요.");
        }
    });

    editIntentionBtn.addEventListener('click', () => {
        intentionInputArea.classList.remove('hidden');
        intentionDisplay.classList.add('hidden');
        intentionInput.value = prayerIntention;
    });

    function updateIntentionUI() {
        if (prayerIntention) {
            currentIntentionText.innerText = prayerIntention;
            intentionDisplay.classList.remove('hidden');
            intentionInputArea.classList.add('hidden');
            updateIntentionBackground();
        } else {
            intentionDisplay.classList.add('hidden');
            intentionInputArea.classList.remove('hidden');
            intentionBackground.style.backgroundImage = `url('${bgImages.default}')`;
        }
    }

    function updateIntentionBackground() {
        let selectedBg = bgImages.default;
        for (const [keyword, url] of Object.entries(bgImages)) {
            if (prayerIntention.includes(keyword)) {
                selectedBg = url;
                break;
            }
        }
        intentionBackground.style.backgroundImage = `url('${selectedBg}')`;
    }

    // Mock Firebase Auth (Since we can't fully configure Firebase without keys)
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
        updateIntentionUI();
    });

    function loginAsDemo() {
        currentUser = { uid: "demo123", displayName: "사용자" };
        userNameDisplay.innerText = currentUser.displayName;
        userProfile.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        syncWithCloud();
    }

    function syncWithCloud() {
        if (!currentUser) return;
        console.log("Syncing with cloud for user:", currentUser.uid);
        saveToLocalStorage(); 
    }

    function loadLocalData() {
        completedDays = JSON.parse(localStorage.getItem('completedDays')) || [];
        startDate = localStorage.getItem('startDate') || "";
        prayerDuration = parseInt(localStorage.getItem('prayerDuration')) || 9;
        prayerIntention = localStorage.getItem('prayerIntention') || "";
        
        startDateInput.value = startDate;
        prayerDurationInput.value = prayerDuration;
    }

    function saveToLocalStorage() {
        localStorage.setItem('completedDays', JSON.stringify(completedDays));
        localStorage.setItem('startDate', startDate);
        localStorage.setItem('prayerDuration', prayerDuration);
        localStorage.setItem('currentView', currentView);
        localStorage.setItem('alarmTime', alarmTime);
        localStorage.setItem('prayerIntention', prayerIntention);
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
            let isFuture = false;
            let dateStr = "날짜 미설정";
            if (start) {
                const currentDayDate = new Date(start);
                currentDayDate.setDate(start.getDate() + (i - 1));
                currentDayDate.setHours(0, 0, 0, 0);
                
                dateStr = currentDayDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
                
                if (currentDayDate < today && !completedDays.includes(i)) {
                    isOverdue = true;
                } else if (currentDayDate > today) {
                    isFuture = true;
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
                    <input type="checkbox" id="day${i}" ${completedDays.includes(i) ? 'checked' : ''} ${isFuture && !completedDays.includes(i) ? 'disabled' : ''}>
                    <label for="day${i}">기도 완료</label>
                </div>
            `;
            
            dayCard.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                    const checkbox = dayCard.querySelector('input');
                    if (checkbox.disabled) {
                        alert("미래의 기도는 미리 완료할 수 없습니다.");
                        return;
                    }
                    checkbox.checked = !checkbox.checked;
                    toggleDay(i, checkbox.checked);
                }
            });

            dayCard.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked && isFuture) {
                    alert("미래의 기도는 미리 완료할 수 없습니다.");
                    e.target.checked = false;
                    return;
                }
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
                    const isFuture = currentD > today;
                    
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
                        const isCompletedNow = completedDays.includes(prayerDayNum);
                        if (!isCompletedNow && isFuture) {
                            alert("미래의 기도는 미리 완료할 수 없습니다.");
                            return;
                        }
                        toggleDay(prayerDayNum, !isCompletedNow);
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
            // Safety check for future dates
            if (startDate) {
                const start = new Date(startDate);
                const targetDate = new Date(start);
                targetDate.setDate(start.getDate() + (day - 1));
                targetDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (targetDate > today) {
                    alert("미래의 기도는 미리 완료할 수 없습니다.");
                    return;
                }
            }
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
            prayerIntention = "";
            saveToLocalStorage();
            syncWithCloud();
            startDateInput.value = "";
            prayerDurationInput.value = 9;
            updateView();
            updateIntentionUI();
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
