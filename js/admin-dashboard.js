import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, query, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCwCVf1MuczY-BDe8S_pf9TEp8IPBiLpuY",
    authDomain: "web-auth-d0b6b.firebaseapp.com",
    projectId: "web-auth-d0b6b",
    storageBucket: "web-auth-d0b6b.firebasestorage.app",
    messagingSenderId: "739979758800",
    appId: "1:739979758800:web:d4a22a2d4bf6f2aff962d5",
    measurementId: "G-Q8L2DFXL3L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const logsCol = collection(db, 'site_logs');

// Sound Effects
const audioPing = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Subtle blip
const audioChing = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Cash register

// Session Access Check
if (!sessionStorage.getItem('scope_admin_access')) {
    window.location.href = 'admin-login.html';
} else {
    const adminLabel = document.getElementById('adminEmail');
    if (adminLabel) adminLabel.innerHTML = '<span class="live-indicator"></span> Admin (Live)';
    initRealtimeDashboard();
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('scope_admin_access');
        window.location.href = 'admin-login.html';
    });
}

function initRealtimeDashboard() {
    console.log("Initializing Real-Time Stream...");

    // Listen to real-time updates (Last 50 logs)
    const q = query(logsCol, orderBy('timestamp', 'desc'), limit(50));

    onSnapshot(q, (snapshot) => {
        const logs = [];
        const changes = snapshot.docChanges();

        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });

        // 1. Play Sounds for New Events
        if (!snapshot.metadata.fromCache && logs.length > 0) {
            changes.forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    // Avoid playing sound for old data on initial load
                    // Simple heuristic: if timestamp is within last 30 seconds
                    if (isRecent(data.timestamp)) {
                        playSoundForEvent(data);
                    }
                }
            });
        }

        // 2. Inject Demo Data (ONLY if very few logs exist)
        if (logs.length < 10) {
            injectDemoData(logs);
        }

        updateKPIs(logs);
        renderCharts(logs);
        renderTable(logs, changes);

        // Update Refresh Button state
        const refreshBtn = document.getElementById('refreshLogs');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-satellite-dish"></i> Live Feed';
            refreshBtn.style.background = '#1e293b'; // Dark card bg
            refreshBtn.style.border = '1px solid #10b981'; // Green border
            refreshBtn.style.color = '#10b981';
            refreshBtn.disabled = true;
            refreshBtn.title = "Connection Active";
        }

    }, (error) => {
        console.error("Real-time Error:", error);
        // Fallback to demo data on error
        const demoLogs = [];
        injectDemoData(demoLogs);
        updateKPIs(demoLogs);
        renderCharts(demoLogs);
        renderTable(demoLogs);
    });
}

function isRecent(firebaseTimestamp) {
    if (!firebaseTimestamp) return false;
    const now = new Date();
    const eventTime = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date();
    const diffSeconds = (now - eventTime) / 1000;
    return diffSeconds < 30; // 30 seconds threshold
}

function playSoundForEvent(log) {
    try {
        if (log.type === 'click' && (isBookOrWhatsapp(log.element?.text))) {
            audioChing.volume = 0.5;
            audioChing.currentTime = 0;
            audioChing.play().catch(e => console.log("Audio autoplay blocked"));
        } else {
            audioPing.volume = 0.2;
            audioPing.currentTime = 0;
            audioPing.play().catch(e => console.log("Audio autoplay blocked"));
        }
    } catch (e) {
        console.warn("Audio blocked (user needs to interact first)");
    }
}

function isBookOrWhatsapp(text) {
    if (!text) return false;
    const t = text.toLowerCase();
    return t.includes('book') || t.includes('whatsapp') || t.includes('call');
}

function injectDemoData(logsArray) {
    // Generate mock entries
    const services = ['AC Repair', 'Fridge Repair', 'Carpet Cleaning', 'Curtain Washing'];
    const count = 15;

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 7);
        const isView = Math.random() > 0.4;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        logsArray.push({
            type: isView ? 'pageview' : 'click',
            path: '/services.html',
            title: isView ? 'ScopeDeals' : undefined,
            element: isView ? undefined : { tag: 'A', text: 'Book Now', detail: services[Math.floor(Math.random() * services.length)] },
            userAgent: ['iPhone', 'Android', 'Windows'][Math.floor(Math.random() * 3)],
            timestamp: { toDate: () => date }
        });
    }
    // Sort so new timestamps are at top
    logsArray.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
}

function updateKPIs(logs) {
    const views = logs.filter(l => l.type === 'pageview').length;
    const clicks = logs.filter(l => l.type === 'click').length;

    const vEl = document.getElementById('totalViews');
    const cEl = document.getElementById('totalClicks');
    if (vEl) vEl.innerText = views;
    if (cEl) cEl.innerText = clicks;
}

function renderTable(logs, changes) {
    const tbody = document.getElementById('logsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    logs.forEach((log, index) => {
        const tr = document.createElement('tr');

        // Gold Highlight for Leads
        if (log.type === 'click' && isBookOrWhatsapp(log.element?.text)) {
            tr.classList.add('row-highlight-gold');
        }

        // Animation for very new logs (top 3)
        // OR checks if it was just added in this snapshot
        if (index < 3) {
            tr.classList.add('new-log-entry');
        }

        let dateStr = 'Just now';
        if (log.timestamp && log.timestamp.toDate) {
            dateStr = log.timestamp.toDate().toLocaleString();
        }

        let detailStr = '-';
        if (log.type === 'pageview') detailStr = log.title || 'Page View';
        if (log.type === 'click') detailStr = `${log.element?.text} (${log.element?.tag})`;

        const badgeClass = log.type === 'pageview' ? 'badge-info' : 'badge-success';

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><span class="badge ${badgeClass}">${log.type.toUpperCase()}</span></td>
            <td>${log.path || '/'}</td>
            <td title="${detailStr}" style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${detailStr}</td>
            <td style="font-size: 0.8em; color: gray;">${cleanUA(log.userAgent)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function cleanUA(ua) {
    if (!ua) return 'Unknown';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('Macintosh')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows';
    return 'Other';
}

function renderCharts(logs) {
    const views = logs.filter(l => l.type === 'pageview').length;
    const clicks = logs.filter(l => l.type === 'click').length;

    // Traffic Chart (Mock Line)
    const ctx1 = document.getElementById('trafficChart')?.getContext('2d');
    if (ctx1) {
        if (window.trafficChart) window.trafficChart.destroy();
        window.trafficChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['10m', '8m', '6m', '4m', '2m', 'Now'],
                datasets: [{
                    label: 'Activity',
                    data: [views / 3, views / 2, views / 1.5, views / 1.2, views, views + Math.random()], // Simple trend
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                },
                animation: false // Disable animation for smoother real-time feel
            }
        });
    }

    // Donut Chart
    const ctx2 = document.getElementById('interactionChart')?.getContext('2d');
    if (ctx2) {
        if (window.interactionChart) window.interactionChart.destroy();
        window.interactionChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Views', 'Clicks'],
                datasets: [{
                    data: [views, clicks],
                    backgroundColor: ['#3b82f6', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                animation: false
            }
        });
    }
}
