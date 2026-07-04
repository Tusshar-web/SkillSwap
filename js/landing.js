document.addEventListener('DOMContentLoaded', () => {
    // 1. DYNAMIC STATS COUNTER ANIMATION
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // The lower the slower

    const startCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                // Get the target number from text content (removing '+' or characters if any)
                const targetText = counter.innerText;
                const target = parseInt(targetText.replace(/[^0-9]/g, ''), 10);
                const current = parseInt(counter.innerText, 10) || 0;

                // Determine the increment step size
                const increment = Math.ceil(target / speed);

                if (current < target) {
                    // Check if it originally had a '+' sign
                    const hasPlus = targetText.includes('+');
                    counter.innerText = (current + increment) + (hasPlus ? '+' : '');
                    setTimeout(updateCount, 1);
                } else {
                    counter.innerText = targetText; // Ensure exact final text stays
                }
            };
            updateCount();
        });
    };

    // Run the counter animation on load
    startCounters();

    // 2. SMOOTH SCROLLING FOR HERO BUTTONS
    const ctaButton = document.querySelector('.hero .btn-primary');
    const exploreSection = document.querySelector('.features-grid, .steps-section');

    if (ctaButton && exploreSection) {
        ctaButton.addEventListener('click', (e) => {
            // Only scroll smoothly if it's linking to a section hash instead of a new page
            const href = ctaButton.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                exploreSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});