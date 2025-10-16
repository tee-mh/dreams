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
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

function formatDate(date) {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr) {
    const date = new Date(dateStr + 'T12:00:00');
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

function saveEntry(date, note, isPriority = false) {
    const entries = JSON.parse(localStorage.getItem('dreamEntries') || '{}');
    if (!entries[date]) {
        entries[date] = [];
    }
    const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    // Preserve paragraphs by replacing newlines with <br>
    const formattedText = note.replace(/\n/g, '<br>');
    entries[date].push({
        id: Date.now(),
        text: formattedText,
        timestamp: timestamp,
        priority: isPriority
    });
    localStorage.setItem('dreamEntries', JSON.stringify(entries));
}

function updateEntry(date, entryId, newText, isPriority = null) {
    const entries = JSON.parse(localStorage.getItem('dreamEntries') || '{}');
    if (entries[date]) {
        const entryIndex = entries[date].findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
            // Preserve paragraphs by replacing newlines with <br>
            const formattedText = newText.replace(/\n/g, '<br>');
            entries[date][entryIndex].text = formattedText;
            
            // Update priority if specified
            if (isPriority !== null) {
                entries[date][entryIndex].priority = isPriority;
            }
            
            localStorage.setItem('dreamEntries', JSON.stringify(entries));
        }
    }
}

function togglePriority(date, entryId) {
    const entries = JSON.parse(localStorage.getItem('dreamEntries') || '{}');
    if (entries[date]) {
        const entryIndex = entries[date].findIndex(entry => entry.id === entryId);
        if (entryIndex !== -1) {
            // Toggle priority
            entries[date][entryIndex].priority = !entries[date][entryIndex].priority;
            localStorage.setItem('dreamEntries', JSON.stringify(entries));
            return entries[date][entryIndex].priority;
        }
    }
    return false;
}

function deleteEntry(date, entryId) {
    const entries = JSON.parse(localStorage.getItem('dreamEntries') || '{}');
    if (entries[date]) {
        entries[date] = entries[date].filter(entry => entry.id !== entryId);
        if (entries[date].length === 0) {
            delete entries[date];
        }
        localStorage.setItem('dreamEntries', JSON.stringify(entries));
    }
}

function getEntries() {
    return JSON.parse(localStorage.getItem('dreamEntries') || '{}');
}

function showEntries(date) {
    const entries = getEntries();
    entriesDiv.innerHTML = '';
    
    if (entries[date] && entries[date].length > 0) {
        const dateHeader = document.createElement('h3');
        dateHeader.textContent = formatDisplayDate(date);
        dateHeader.style.color = '#333';
        dateHeader.style.marginBottom = '12px';
        entriesDiv.appendChild(dateHeader);
        
        // Style for dark mode
        if (document.body.classList.contains('dark')) {
            dateHeader.style.color = '#ffd700';
        }
        
        entries[date].forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = entry.priority ? 'entry priority' : 'entry';
            entryDiv.innerHTML = `
                <div class="entry-header">
                    <div class="entry-header-left">
                        <span class="entry-time">${entry.timestamp}</span>
                        <button class="priority-btn" onclick="togglePriorityAndUpdate('${date}', ${entry.id})">
                            ${entry.priority ? '⭐' : '☆'}
                        </button>
                    </div>
                    <div class="entry-actions">
                        <button class="edit-btn" onclick="editEntry('${date}', ${entry.id})">✏️</button>
                        <button class="delete-btn" onclick="deleteEntryConfirm('${date}', ${entry.id})">🗑️</button>
                    </div>
                </div>
                <div class="entry-text" id="entry-${entry.id}">${entry.text}</div>
            `;
            entriesDiv.appendChild(entryDiv);
        });
    } else {
        entriesDiv.innerHTML = '<p>No entries for this date.</p>';
    }
}

function editEntry(date, entryId) {
    const entries = getEntries();
    const entry = entries[date].find(e => e.id === entryId);
    const entryElement = document.getElementById(`entry-${entryId}`);
    
    // Get the current text and replace <br> with newlines for editing
    let currentText = entry.text;
    currentText = currentText.replace(/<br>/g, '\n');
    
    const textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.className = 'edit-textarea';
    textarea.style.width = '100%';
    textarea.style.minHeight = '100px';
    textarea.style.padding = '8px';
    textarea.style.borderRadius = '4px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.resize = 'vertical';
    
    // Create priority checkbox
    const priorityCheck = document.createElement('div');
    priorityCheck.style.marginTop = '8px';
    priorityCheck.style.display = 'flex';
    priorityCheck.style.alignItems = 'center';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `priority-${entryId}`;
    checkbox.checked = entry.priority || false;
    checkbox.style.marginRight = '8px';
    
    const label = document.createElement('label');
    label.htmlFor = `priority-${entryId}`;
    label.textContent = 'Mark as important dream';
    
    priorityCheck.appendChild(checkbox);
    priorityCheck.appendChild(label);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.marginTop = '8px';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'save-edit-btn';
    saveBtn.style.marginRight = '8px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'cancel-edit-btn';
    
    buttonsDiv.appendChild(saveBtn);
    buttonsDiv.appendChild(cancelBtn);
    
    entryElement.innerHTML = '';
    entryElement.appendChild(textarea);
    entryElement.appendChild(priorityCheck);
    entryElement.appendChild(buttonsDiv);
    
    saveBtn.onclick = () => {
        const newText = textarea.value.trim();
        const isPriority = checkbox.checked;
        if (newText) {
            updateEntry(date, entryId, newText, isPriority);
            showEntries(date);
            renderCalendar();
        }
    };
    
    cancelBtn.onclick = () => {
        showEntries(date);
    };
    
    textarea.focus();
}

function togglePriorityAndUpdate(date, entryId) {
    const isPriority = togglePriority(date, entryId);
    showEntries(date);
    return false; // Prevent default
}

function deleteEntryConfirm(date, entryId) {
    if (confirm('Are you sure you want to delete this entry?')) {
        deleteEntry(date, entryId);
        showEntries(date);
        renderCalendar();
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
        if (entries[dateStr] && entries[dateStr].length > 0) {
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
    const isPriority = document.getElementById('priorityCheckbox').checked;
    if (note) {
        saveEntry(selectedDate, note, isPriority);
        noteInput.value = '';
        document.getElementById('priorityCheckbox').checked = false;
        showEntries(selectedDate);
        alert('Entry saved!');
    }
});

// Check for browser support
function checkBrowserSupport() {
    // Check if localStorage is available
    let storageAvailable = false;
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        storageAvailable = true;
    } catch (e) {
        console.error('localStorage not available');
    }
    
    // Check if service workers are supported
    const serviceWorkerSupported = 'serviceWorker' in navigator;
    
    return {
        localStorage: storageAvailable,
        serviceWorker: serviceWorkerSupported,
        online: navigator.onLine
    };
}

// App initialization
function initializeApp() {
    const support = checkBrowserSupport();
    
    // Handle case where localStorage isn't available
    if (!support.localStorage) {
        alert('Warning: Your browser does not support local storage. Your dreams will not be saved.');
    }
    
    // Update online status immediately
    if (typeof updateOnlineStatus === 'function') {
        updateOnlineStatus();
    }
    
    // Initial render
    updateSelectedDateDisplay();
    showEntries(selectedDate);
}

// Initialize app
initializeApp();

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
        dreamsArr.forEach(([date, dayEntries]) => {
            const dateDiv = document.createElement('div');
            dateDiv.innerHTML = `<h3 style="color: #333; margin: 16px 0 8px 0;">${formatDisplayDate(date)}</h3>`;
            allDreamsList.appendChild(dateDiv);
            
            // Style for dark mode
            if (document.body.classList.contains('dark')) {
                dateDiv.querySelector('h3').style.color = '#ffd700';
            }
            
            if (Array.isArray(dayEntries)) {
                dayEntries.forEach(entry => {
                    const div = document.createElement('div');
                    div.className = 'entry';
                    div.innerHTML = `
                        <div style="display: flex; align-items: center; margin-bottom: 4px;">
                            <div class="entry-time" style="font-size: 12px; color: #666;">${entry.timestamp}</div>
                            ${entry.priority ? '<span style="margin-left: 8px; color: #ff9800;">⭐ Important</span>' : ''}
                        </div>
                        <div>${entry.text}</div>
                    `;
                    allDreamsList.appendChild(div);
                });
            } else {
                // Handle old format (single string entries)
                const div = document.createElement('div');
                div.className = 'entry';
                div.innerHTML = `<div>${dayEntries}</div>`;
                allDreamsList.appendChild(div);
            }
        });
    }
    allDreamsModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    allDreamsModal.style.display = 'none';
});

// Export Dreams functionality
const exportBtn = document.getElementById('exportBtn');

function exportDreams() {
    const entries = getEntries();
    
    if (Object.keys(entries).length === 0) {
        alert('No dreams to export. Start recording your dreams first!');
        return;
    }
    
    // Show export options
    const exportFormat = confirm('Choose export format:\n\nOK = Text file (readable)\nCancel = JSON file (backup format)');
    
    if (exportFormat) {
        exportAsText(entries);
    } else {
        exportAsJSON(entries);
    }
}

function exportAsText(entries) {
    let content = 'Dreams Record Export\n';
    content += '===================\n';
    content += `Exported on: ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })}\n\n`;
    
    // Sort dates in descending order (newest first)
    const sortedDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));
    
    sortedDates.forEach(date => {
        const dayEntries = entries[date];
        content += `📅 ${formatDisplayDate(date)} (${date})\n`;
        content += '─'.repeat(40) + '\n';
        
        if (Array.isArray(dayEntries)) {
            dayEntries.forEach((entry, index) => {
                content += `⏰ ${entry.timestamp}`;
                if (entry.priority) {
                    content += ' ⭐ IMPORTANT';
                }
                content += '\n';
                
                // Convert HTML breaks back to newlines and remove HTML tags
                let dreamText = entry.text.replace(/<br>/g, '\n');
                dreamText = dreamText.replace(/<[^>]*>/g, ''); // Remove any other HTML tags
                
                content += dreamText + '\n';
                
                if (index < dayEntries.length - 1) {
                    content += '\n' + '·'.repeat(20) + '\n\n';
                }
            });
        } else {
            // Handle old format (single string entries)
            let dreamText = dayEntries.replace(/<br>/g, '\n');
            dreamText = dreamText.replace(/<[^>]*>/g, '');
            content += dreamText + '\n';
        }
        
        content += '\n' + '='.repeat(40) + '\n\n';
    });
    
    // Add summary
    const totalDays = Object.keys(entries).length;
    const totalEntries = Object.values(entries).reduce((sum, dayEntries) => {
        return sum + (Array.isArray(dayEntries) ? dayEntries.length : 1);
    }, 0);
    
    content += `📊 Summary\n`;
    content += `Total days with dreams: ${totalDays}\n`;
    content += `Total dream entries: ${totalEntries}\n`;
    
    downloadFile(content, 'dreams-export.txt', 'text/plain');
}

function exportAsJSON(entries) {
    const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalDays: Object.keys(entries).length,
        totalEntries: Object.values(entries).reduce((sum, dayEntries) => {
            return sum + (Array.isArray(dayEntries) ? dayEntries.length : 1);
        }, 0),
        dreams: entries
    };
    
    const content = JSON.stringify(exportData, null, 2);
    downloadFile(content, 'dreams-backup.json', 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    alert(`Dreams exported successfully as ${filename}!`);
}

exportBtn.addEventListener('click', exportDreams);

window.onclick = function(event) {
    if (event.target === allDreamsModal) {
        allDreamsModal.style.display = 'none';
    }
}
