document.addEventListener('DOMContentLoaded', () => {

    /* ---------- animated count-up for stat numbers ---------- */
    document.querySelectorAll('.stat-number').forEach((el) => {
        const target = parseFloat(el.dataset.target);
        if (Number.isNaN(target)) return;

        const isDecimal = target % 1 !== 0;
        const duration = 900;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const value = target * eased;
            el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    });

    /* ---------- charts ---------- */
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#86868b';

    const sessionsCtx = document.getElementById('sessionsChart');
    if (sessionsCtx) {
        new Chart(sessionsCtx, {
            type: 'line',
            data: {
                labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Sessions',
                    data: [1, 2, 1, 3, 2, 3],
                    borderColor: '#0070f3',
                    backgroundColor: 'rgba(0, 112, 243, 0.08)',
                    pointBackgroundColor: '#0070f3',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.35,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                animation: { duration: 900, easing: 'easeOutCubic' },
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const balanceCtx = document.getElementById('balanceChart');
    if (balanceCtx) {
        new Chart(balanceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Offered', 'Wanted'],
                datasets: [{
                    data: [4, 3],
                    backgroundColor: ['#ff5a3c', '#00a896'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                cutout: '68%',
                animation: { duration: 900, easing: 'easeOutCubic' },
                plugins: { legend: { display: false } }
            }
        });
    }
});