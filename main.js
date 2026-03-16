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
    const userSuffix = document.getElementById('userSuffix');

    const langKoBtn = document.getElementById('langKo');
    const langEnBtn = document.getElementById('langEn');

    // Intention UI
    const intentionInputArea = document.getElementById('intentionInputArea');
    const intentionDisplay = document.getElementById('intentionDisplay');
    const currentIntentionText = document.getElementById('currentIntention');
    const intentionInput = document.getElementById('intentionInput');
    const saveIntentionBtn = document.getElementById('saveIntention');
    const editIntentionBtn = document.getElementById('editIntention');
    const intentionBackground = document.getElementById('intentionBackground');

    // Translations
    const translations = {
        ko: {
            title: "묵주기도달력",
            login: "구글 로그인",
            logout: "로그아웃",
            userSuffix: "님",
            intentionTitle: "기도 목적",
            intentionPlaceholder: "이 기도를 바치는 목적을 작성해주세요... (예: 가족의 건강, 평화, 감사의 기도 등)",
            saveIntention: "목적 설정",
            edit: "수정",
            settingsTitle: "기본 설정",
            durationLabel: "기도 기간(일): ",
            saveSettings: "설정 저장",
            alarmTitle: "알람 설정",
            setAlarm: "알람 설정",
            clearAlarm: "알람 해제",
            testAlarm: "알림 테스트",
            alarmUnset: "알람이 설정되지 않았습니다.",
            alarmSet: "알람이 {}로 설정되었습니다.",
            listTitle: "기도 일정",
            listView: "목록 보기",
            calendarView: "달력 보기",
            resetProgress: "진행 상황 초기화",
            resetConfirm: "정말로 모든 진행 상황을 초기화하시겠습니까?",
            dayTitle: "{}일차",
            mysteryTitle: "신비",
            completed: "기도 완료",
            notSet: "날짜 미설정",
            overdue: "(미완료)",
            futureAlert: "미래의 기도는 미리 완료할 수 없습니다.",
            intentionAlert: "기도 목적을 입력해주세요.",
            firebaseAlert: "구글 로그인 기능은 Firebase 설정(API Key 등)이 필요합니다.\n현재는 데모 모드로 전환됩니다.",
            mysteries: ['환희의 신비', '빛의 신비', '고통의 신비', '영광의 신비'],
            weekdays: ['일', '월', '화', '수', '목', '금', '토'],
            monthFormat: "{}년 {}월"
        },
        en: {
            title: "Rosary Calendar",
            login: "Google Login",
            logout: "Logout",
            userSuffix: "",
            intentionTitle: "Prayer Intention",
            intentionPlaceholder: "Write your intention for this prayer... (e.g., family health, peace, gratitude, etc.)",
            saveIntention: "Set Intention",
            edit: "Edit",
            settingsTitle: "Basic Settings",
            durationLabel: "Duration (days): ",
            saveSettings: "Save Settings",
            alarmTitle: "Alarm Settings",
            setAlarm: "Set Alarm",
            clearAlarm: "Clear Alarm",
            testAlarm: "Test Notification",
            alarmUnset: "Alarm is not set.",
            alarmSet: "Alarm set for {}.",
            listTitle: "Prayer Schedule",
            listView: "List View",
            calendarView: "Calendar View",
            resetProgress: "Reset Progress",
            resetConfirm: "Are you sure you want to reset all progress?",
            dayTitle: "Day {}",
            mysteryTitle: "Mystery",
            completed: "Completed",
            notSet: "Date not set",
            overdue: "(Overdue)",
            futureAlert: "You cannot complete future prayers in advance.",
            intentionAlert: "Please enter your prayer intention.",
            firebaseAlert: "Google Login requires Firebase configuration (API Keys, etc.).\nSwitching to demo mode.",
            mysteries: ['Joyful Mysteries', 'Luminous Mysteries', 'Sorrowful Mysteries', 'Glorious Mysteries'],
            weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            monthFormat: "{} / {}"
        }
    };

    // State
    let currentLang = localStorage.getItem('currentLang') || 'ko';
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
    
    applyLanguage();
    updateIntentionUI();
    updateView();
    updateAlarmStatus();

    // Language Events
    langKoBtn.addEventListener('click', () => {
        currentLang = 'ko';
        localStorage.setItem('currentLang', currentLang);
        applyLanguage();
        renderCurrentView();
    });

    langEnBtn.addEventListener('click', () => {
        currentLang = 'en';
        localStorage.setItem('currentLang', currentLang);
        applyLanguage();
        renderCurrentView();
    });

    function applyLanguage() {
        const t = translations[currentLang];
        document.title = t.title;
        document.querySelector('h1').innerText = t.title;
        loginBtn.innerText = t.login;
        logoutBtn.innerText = t.logout;
        userSuffix.innerText = t.userSuffix;

        document.querySelector('#intentionSection h2').innerText = t.intentionTitle;
        intentionInput.placeholder = t.intentionPlaceholder;
        saveIntentionBtn.innerText = t.saveIntention;
        editIntentionBtn.innerText = t.edit;

        document.querySelector('.settings h2').innerText = t.settingsTitle;
        document.querySelector('label[for="prayerDuration"]').innerText = t.durationLabel;
        document.querySelector('.settings h3:nth-of-type(1)').innerText = t.settingsTitle; // Using nth-of-type might be brittle, but for now
        setSettingsBtn.innerText = t.saveSettings;
        
        // Settings headings
        const settingHeadings = document.querySelectorAll('.setting-group h3');
        if (settingHeadings.length >= 1) settingHeadings[0].innerText = t.settingsTitle; // This is actually "Duration and Start Date" in original
        // Let's be more specific
        settingHeadings[0].innerText = currentLang === 'ko' ? "기도 기간 및 시작 날짜" : "Duration & Start Date";
        if (settingHeadings.length >= 2) settingHeadings[1].innerText = t.alarmTitle;

        setAlarmBtn.innerText = t.setAlarm;
        clearAlarmBtn.innerText = t.clearAlarm;
        testNotificationBtn.innerText = t.testAlarm;
        
        document.getElementById('listTitle').innerText = t.listTitle;
        listViewBtn.innerText = t.listView;
        calendarViewBtn.innerText = t.calendarView;
        resetProgressBtn.innerText = t.resetProgress;

        // Calendar weekdays
        const calendarWeekdaysHeader = document.querySelector('.calendar-days-header');
        if (calendarWeekdaysHeader) {
            calendarWeekdaysHeader.innerHTML = t.weekdays.map(w => `<span>${w}</span>`).join('');
        }

        // Active state for lang buttons
        langKoBtn.classList.toggle('active', currentLang === 'ko');
        langEnBtn.classList.toggle('active', currentLang === 'en');

        updateAlarmStatus();
    }

    function renderCurrentView() {
        if (currentView === 'list') {
            renderGrid();
        } else {
            renderCalendar();
        }
    }

    // Mysteries Rotation
    const mysteries = () => translations[currentLang].mysteries;

    // Background Images Mapping
    const bgImages = {
        '가족': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        'family': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
        '평화': 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&w=800&q=80',
        'peace': 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&w=800&q=80',
        '감사': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
        'thanks': 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80',
        '건강': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        'health': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        'default': 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80'
    };

    // Intention Events
    saveIntentionBtn.addEventListener('click', () => {
        prayerIntention = intentionInput.value.trim();
        if (prayerIntention) {
            localStorage.setItem('prayerIntention', prayerIntention);
            updateIntentionUI();
            syncWithCloud();
        } else {
            alert(translations[currentLang].intentionAlert);
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
        const lowerIntention = prayerIntention.toLowerCase();
        for (const [keyword, url] of Object.entries(bgImages)) {
            if (lowerIntention.includes(keyword)) {
                selectedBg = url;
                break;
            }
        }
        intentionBackground.style.backgroundImage = `url('${selectedBg}')`;
    }

    // Mock Firebase Auth
    loginBtn.addEventListener('click', () => {
        alert(translations[currentLang].firebaseAlert);
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
        currentUser = { uid: "demo123", displayName: currentLang === 'ko' ? "사용자" : "User" };
        userNameDisplay.innerText = currentUser.displayName;
        userProfile.classList.remove('hidden');
        loginBtn.classList.add('hidden');
        syncWithCloud();
    }

    function syncWithCloud() {
        if (!currentUser) return;
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

    // Views Events
    listViewBtn.addEventListener('click', () => {
        currentView = 'list';
        localStorage.setItem('currentView', currentView);
        updateView();
    });

    calendarViewBtn.addEventListener('click', () => {
        currentView = 'calendar';
        localStorage.setItem('currentView', currentView);
        updateView();
    });

    // Render List View
    function renderGrid() {
        const t = translations[currentLang];
        daysGrid.innerHTML = '';
        const start = startDate ? new Date(startDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 1; i <= prayerDuration; i++) {
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            
            let isOverdue = false;
            let isFuture = false;
            let dateStr = t.notSet;
            if (start) {
                const currentDayDate = new Date(start);
                currentDayDate.setDate(start.getDate() + (i - 1));
                currentDayDate.setHours(0, 0, 0, 0);
                
                dateStr = currentDayDate.toLocaleDateString(currentLang === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', day: 'numeric', weekday: 'short' });
                
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
            
            const mystery = t.mysteries[(i - 1) % 4];

            dayCard.innerHTML = `
                <div>
                    <h3>${t.dayTitle.replace('{}', i)}</h3>
                    <p class="day-date">${dateStr}${isOverdue ? ` <span class="overdue-label">${t.overdue}</span>` : ''}</p>
                </div>
                <p class="day-mystery">${mystery}</p>
                <div>
                    <input type="checkbox" id="day${i}" ${completedDays.includes(i) ? 'checked' : ''} ${isFuture && !completedDays.includes(i) ? 'disabled' : ''}>
                    <label for="day${i}">${t.completed}</label>
                </div>
            `;
            
            dayCard.addEventListener('click', (e) => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'LABEL') {
                    const checkbox = dayCard.querySelector('input');
                    if (checkbox.disabled) {
                        alert(t.futureAlert);
                        return;
                    }
                    checkbox.checked = !checkbox.checked;
                    toggleDay(i, checkbox.checked);
                }
            });

            dayCard.querySelector('input').addEventListener('change', (e) => {
                if (e.target.checked && isFuture) {
                    alert(t.futureAlert);
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
        const t = translations[currentLang];
        calendarGrid.innerHTML = '';
        const start = startDate ? new Date(startDate) : new Date();
        const startYear = start.getFullYear();
        const startMonth = start.getMonth();
        
        calendarMonth.innerText = t.monthFormat.replace('{}', startYear).replace('{}', startMonth + 1);

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
                        dayElem.innerHTML += `<span class="overdue-dot">!</span>`;
                    }
                    
                    const mystery = t.mysteries[(prayerDayNum - 1) % 4];
                    dayElem.innerHTML += `
                        <span class="date-num">${d}</span>
                        <span class="day-num-tag">${prayerDayNum}</span>
                        <div class="prayer-info">${mystery}</div>
                    `;
                    
                    dayElem.addEventListener('click', () => {
                        const isCompletedNow = completedDays.includes(prayerDayNum);
                        if (!isCompletedNow && isFuture) {
                            alert(t.futureAlert);
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
            
            if (currentDayDate.getTime() === today.getTime()) {
                dayElem.style.border = '2px solid var(--accent-color)';
            }
            
            calendarGrid.appendChild(dayElem);
        }
    }

    function toggleDay(day, isCompleted) {
        const t = translations[currentLang];
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
                    alert(t.futureAlert);
                    return;
                }
            }
            if (!completedDays.includes(day)) completedDays.push(day);
        } else {
            completedDays = completedDays.filter(d => d !== day);
        }
        saveToLocalStorage();
        syncWithCloud();
        renderCurrentView();
    }

    // Settings Events
    setSettingsBtn.addEventListener('click', () => {
        startDate = startDateInput.value;
        prayerDuration = parseInt(prayerDurationInput.value);
        if (startDate && prayerDuration > 0) {
            saveToLocalStorage();
            syncWithCloud();
            renderCurrentView();
        }
    });

    // Alarm Events
    setAlarmBtn.addEventListener('click', () => {
        alarmTime = alarmTimeInput.value;
        if (alarmTime) {
            localStorage.setItem('alarmTime', alarmTime);
            updateAlarmStatus();
            if (Notification.permission !== "granted") {
                Notification.requestPermission();
            }
        }
    });

    clearAlarmBtn.addEventListener('click', () => {
        alarmTime = "";
        localStorage.removeItem('alarmTime');
        alarmTimeInput.value = "";
        updateAlarmStatus();
    });

    testNotificationBtn.addEventListener('click', () => {
        if (Notification.permission === "granted") {
            new Notification(translations[currentLang].title, {
                body: "알림 테스트입니다.",
                icon: "/favicon.ico"
            });
        } else {
            Notification.requestPermission();
        }
    });

    function updateAlarmStatus() {
        const t = translations[currentLang];
        if (alarmTime) {
            alarmStatus.innerText = t.alarmSet.replace('{}', alarmTime);
        } else {
            alarmStatus.innerText = t.alarmUnset;
        }
    }

    resetProgressBtn.addEventListener('click', () => {
        if (confirm(translations[currentLang].resetConfirm)) {
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

    // Simple Alarm Check
    setInterval(() => {
        if (!alarmTime) return;
        
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === alarmTime && now.getSeconds() === 0) {
            if (Notification.permission === "granted") {
                new Notification(translations[currentLang].title, {
                    body: translations[currentLang].completed + "?",
                    icon: "/favicon.ico"
                });
            }
        }
    }, 1000);
});
