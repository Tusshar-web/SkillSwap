document.addEventListener('DOMContentLoaded', () => {

    const grid = document.querySelector('.card-grid');
    const cards = Array.from(document.querySelectorAll('.user-card'));
    const searchInput = document.querySelector('.search-input');
    const dropdowns = document.querySelectorAll('.filter-dropdown');
    const filterForm = document.querySelector('.filter-bar');

    /* build an empty-state placeholder once */
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-results';
    emptyState.textContent = 'No partners match your filters yet — try widening your search.';
    grid.insertAdjacentElement('afterend', emptyState);

    const applyFilters = () => {
        const query = searchInput.value.trim().toLowerCase();
        const level = dropdowns[0].value.toLowerCase();
        const minRating = parseFloat(dropdowns[1].value) || 0;

        let visibleCount = 0;

        cards.forEach((card) => {
            const name = (card.dataset.name || '').toLowerCase();
            const skills = (card.dataset.skills || '').toLowerCase();
            const levels = (card.dataset.levels || '').toLowerCase();
            const rating = parseFloat(card.dataset.rating) || 0;

            const matchesQuery = !query || name.includes(query) || skills.includes(query);
            const matchesLevel = !level || levels.includes(level);
            const matchesRating = rating >= minRating;

            const isMatch = matchesQuery && matchesLevel && matchesRating;
            card.classList.toggle('is-hidden', !isMatch);
            if (isMatch) visibleCount += 1;
        });

        emptyState.classList.toggle('is-visible', visibleCount === 0);
    };

    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    dropdowns.forEach((dropdown) => dropdown.addEventListener('change', applyFilters));

    /* ---------- request exchange button ---------- */
    document.querySelectorAll('.card-footer .btn').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.classList.contains('is-sent') || button.classList.contains('is-loading')) return;

            const originalText = button.textContent;
            button.classList.add('is-loading');

            setTimeout(() => {
                button.classList.remove('is-loading');
                button.classList.add('is-sent');
                button.textContent = 'Request Sent ✓';
            }, 700);
        });
    });
});