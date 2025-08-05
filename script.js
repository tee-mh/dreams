// Simple calendar and entry app using localStorage
const entryForm = document.getElementById('entryForm');
const noteInput = document.getElementById('note');
const entriesDiv = document.getElementById('entries');
const calendarGrid = document.getElementById('calendar-grid');
const monthYear = document.getElementById('monthYear');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');
const showCalendarBtn = document.getElementById('showCalendarBtn');
const calendarModal = document.getElementById('calendarModal');
const closeCalendarModal = document.getElementById('closeCalendarModal');
const selectedDateDisplay = document.getElementById('selectedDateDisplay');

let currentDate = new Date();
let selectedDate = getToday();

function getToday() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const today = getToday();
    if (dateStr === today) {
        return 'Today';
    }
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

function updateSelectedDateDisplay() {
    selectedDateDisplay.textContent = formatDisplayDate(selectedDate);
}

function saveEntry(date, note) {
    const entries = JSON.parse(localStorage.getItem('dreamEntries') || '{}');
    entries[date] = note;
    localStorage.setItem('dreamEntries', JSON.stringify(entries));
}

function getEntries() {
    return JSON.parse(localStorage.getItem('dreamEntries') || '{}');
}

function showEntries(date) {
    const entries = getEntries();
    entriesDiv.innerHTML = '';
    if (entries[date]) {
        const entry = document.createElement('div');
        entry.className = 'entry';
        entry.innerHTML = `<div class="entry-date">${formatDisplayDate(date)}</div><div>${entries[date]}</div>`;
        entriesDiv.appendChild(entry);
    } else {
        entriesDiv.innerHTML = '<p>No entry for this date.</p>';
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const entries = getEntries();
    
    // Set month/year header
    monthYear.textContent = new Date(year, month).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Clear calendar grid
    calendarGrid.innerHTML = '';
    
    // Add weekday headers
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-weekday';
        dayElement.textContent = day;
        calendarGrid.appendChild(dayElement);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = date.getDate();
        
        const dateStr = formatDate(date);
        
        // Add classes
        if (date.getMonth() !== month) {
            dayElement.classList.add('other-month');
        }
        if (dateStr === getToday()) {
            dayElement.classList.add('today');
        }
        if (dateStr === selectedDate) {
            dayElement.classList.add('selected');
        }
        if (entries[dateStr]) {
            dayElement.classList.add('has-entry');
        }
        
        // Don't allow future dates
        if (date > today) {
            dayElement.style.opacity = '0.3';
            dayElement.style.cursor = 'not-allowed';
        } else {
            dayElement.addEventListener('click', () => {
                selectedDate = dateStr;
                updateSelectedDateDisplay();
                showEntries(selectedDate);
                calendarModal.style.display = 'none';
                renderCalendar(); // Re-render to update selection
            });
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Calendar modal functionality
showCalendarBtn.addEventListener('click', () => {
    calendarModal.style.display = 'block';
    renderCalendar();
});

closeCalendarModal.addEventListener('click', () => {
    calendarModal.style.display = 'none';
});

window.onclick = function(event) {
    if (event.target === calendarModal) {
        calendarModal.style.display = 'none';
    }
    if (event.target === allDreamsModal) {
        allDreamsModal.style.display = 'none';
    }
}

prevMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

entryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const note = noteInput.value.trim();
    if (note) {
        saveEntry(selectedDate, note);
        noteInput.value = '';
        showEntries(selectedDate);
        alert('Entry saved!');
    }
});

// Initial render
updateSelectedDateDisplay();
showEntries(selectedDate);

// Dark mode toggle functionality
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

// Show All Dreams functionality
const showAllBtn = document.getElementById('showAllBtn');
const allDreamsModal = document.getElementById('allDreamsModal');
const allDreamsList = document.getElementById('allDreamsList');
const closeModal = document.getElementById('closeModal');

showAllBtn.addEventListener('click', () => {
    const entries = getEntries();
    allDreamsList.innerHTML = '';
    if (Object.keys(entries).length === 0) {
        allDreamsList.innerHTML = '<p>No dreams recorded yet.</p>';
    } else {
        const dreamsArr = Object.entries(entries).sort((a, b) => b[0].localeCompare(a[0]));
        dreamsArr.forEach(([date, note]) => {
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `<div class="entry-date">${date}</div><div>${note}</div>`;
            allDreamsList.appendChild(div);
        });
    }
    allDreamsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    allDreamsModal.style.display = 'none';
});

window.onclick = function(event) {
    if (event.target === allDreamsModal) {
        allDreamsModal.style.display = 'none';
    }
}
