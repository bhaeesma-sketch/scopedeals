import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

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
const auth = getAuth(app);
const logsCol = collection(db, 'site_logs');

// Session Access Check (Simple PIN Token)
if (!sessionStorage.getItem('scope_admin_access')) {
    // Redirect if not unlocked via PIN
    window.location.href = 'admin-login.html';
} else {
    // Logged in
    document.getElementById('adminEmail').innerText = "Admin (Unlocked)";
    loadDashboardData();
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('scope_admin_access');
    window.location.href = 'admin-login.html';
});

async function loadDashboardData() {
    try {
        console.log("Fetching logs...");
        // Fetch recent 100 logs
        const q = query(logsCol, orderBy('timestamp', 'desc'), limit(100));
        const snapshot = await getDocs(q);

        const logs = [];
        snapshot.forEach(doc => {
            logs.push({ id: doc.id, ...doc.data() });
        });

        updateKPIs(logs);
        renderCharts(logs);
        renderTable(logs);

    } catch (error) {
        console.error("Error fetching logs:", error);
        if (error.code === 'failed-precondition') {
            // Index might be missing?
            alert("Firestore Index might be required for sorting. Check console.");
        }
    }
}

function updateKPIs(logs) {
    const totalViews = logs.filter(l => l.type === 'pageview').length;
    const totalClicks = logs.filter(l => l.type === 'click').length;

    document.getElementById('totalViews').innerText = totalViews + (logs.length === 100 ? '+' : '');
    document.getElementById('totalClicks').innerText = totalClicks + (logs.length === 100 ? '+' : '');
}

function renderTable(logs) {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No logs found</td></tr>';
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');

        let dateStr = 'N/A';
        if (log.timestamp && log.timestamp.toDate) {
            dateStr = log.timestamp.toDate().toLocaleString();
        } else if (log.timestamp) {
            // Handle client-side timestamp fallback if needed, or server timestamp latency
            dateStr = "Just now";
        }

        let detailStr = '-';
        if (log.type === 'pageview') {
            detailStr = log.title || 'Page Load';
        } else if (log.type === 'click' && log.element) {
            detailStr = `Click on <${log.element.tag}> "${log.element.text}"`;
        }

        const badgeClass = log.type === 'pageview' ? 'badge-info' : 'badge-success';

        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><span class="badge ${badgeClass}">${log.type.toUpperCase()}</span></td>
            <td>${log.path}</td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${detailStr}">${detailStr}</td>
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

let trafficChartInstance = null;
let interactionChartInstance = null;

function renderCharts(logs) {
    // Traffic Chart (Views over time - simplified)
    const ctx1 = document.getElementById('trafficChart').getContext('2d');

    // Group by time (e.g., minute or hour) - simplistic bucket
    // For demo, just showing simple distribution
    const views = logs.filter(l => l.type === 'pageview');
    const clicks = logs.filter(l => l.type === 'click');

    if (trafficChartInstance) trafficChartInstance.destroy();
    if (interactionChartInstance) interactionChartInstance.destroy();

    trafficChartInstance = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: Array.from({ length: 10 }, (_, i) => `T-${10 - i}`), // Placeholder time
            datasets: [{
                label: 'Views',
                data: Array(10).fill(0).map(() => Math.floor(Math.random() * 5) + views.length / 10), // Mock data for visual as we don't have enough history yet
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#94a3b8' } }
            },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });

    // Interaction Donut
    const ctx2 = document.getElementById('interactionChart').getContext('2d');
    interactionChartInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: ['Views', 'Clicks'],
            datasets: [{
                data: [views.length, clicks.length],
                backgroundColor: ['#3b82f6', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } }
            }
        }
    });
}

// Refresh button
document.getElementById('refreshLogs').addEventListener('click', loadDashboardData);

// Mobile Sidebar Toggle
const toggleBtn = document.getElementById('mobileToggle');
const sidebar = document.querySelector('.sidebar');
const overlay = document.getElementById('sidebarOverlay');

if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    });
}

if (overlay) {
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
    });
}
