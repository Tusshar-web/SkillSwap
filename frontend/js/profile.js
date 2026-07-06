document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. PHOTO UPLOAD INTERACTIVITY
    // ==========================================
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const photoRemove = document.getElementById('photo-remove');

    if (photoInput) {
        photoInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    photoPreview.src = e.target.result;
                    photoPreview.hidden = false;
                    photoPlaceholder.hidden = true;
                    photoRemove.hidden = false;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (photoRemove) {
        photoRemove.addEventListener('click', () => {
            photoInput.value = '';
            photoPreview.src = '';
            photoPreview.hidden = true;
            photoPlaceholder.hidden = false;
            photoRemove.hidden = true;
        });
    }

    // ==========================================
    // 2. FORM SUBMISSIONS WITH VISUAL SAVE STATE
    // ==========================================
    const feedbackForms = document.querySelectorAll('.identity-form, .profile-form');
    
    feedbackForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('.btn-primary');
            
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.classList.add('is-saved');
                submitBtn.textContent = 'Saved!';
                
                setTimeout(() => {
                    submitBtn.classList.remove('is-saved');
                    submitBtn.textContent = originalText;
                }, 2000);
            }
        });
    });

    // ==========================================
    // 3. SKILLS MANAGEMENT (ADD / REMOVE)
    // ==========================================
    const skillBoxes = document.querySelectorAll('.skill-box.offered, .skill-box.wanted');

    skillBoxes.forEach(box => {
        const form = box.querySelector('.add-skill-form');
        const list = box.querySelector('.managed-skills-list');

        if (form && list) {
            // Handle Skill Form Submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = form.querySelector('input[type="text"]');
                const select = form.querySelector('select');
                
                const skillName = input.value.trim();
                const level = select.value;

                if (!skillName) {
                    input.classList.add('input-error');
                    setTimeout(() => input.classList.remove('input-error'), 350);
                    return;
                }

                // Create modern pill matching CSS specifications
                const li = document.createElement('li');
                li.classList.add('is-new');
                
                const pillClass = level.toLowerCase();
                li.innerHTML = `
                    <span>${skillName} — <span class="level-pill ${pillClass}">${level}</span></span>
                    <button type="button" class="remove-skill-btn" aria-label="Remove ${skillName}">&times;</button>
                `;

                list.appendChild(li);
                form.reset();
            });
        }
    });

    // Generic Event Delegation for Skill Deletion
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            const li = e.target.closest('li');
            if (li) {
                li.classList.add('is-removing');
                // Wait for the CSS smooth collapsing transition to complete before removal
                li.addEventListener('transitionend', () => li.remove());
            }
        }
    });

    // ==========================================
    // 4. COMPLEX ENTRIES (EXP, EDU, CERT, ACH)
    // ==========================================
    const entryBoxes = document.querySelectorAll('[data-entry-type]');

    entryBoxes.forEach(box => {
        const form = box.querySelector('.add-entry-form');
        const entryType = box.getAttribute('data-entry-type');
        const list = box.querySelector(`.managed-entries-list[data-list="${entryType}"]`);

        if (!form || !list) return;

        // Initialize empty state indicator if the list is blank on load
        updateEmptyState(list);

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Extract values dynamically based on template fields
            const titleInput = form.querySelector('[data-field="title"]');
            const subtitleInput = form.querySelector('[data-field="subtitle"]');
            const metaInput = form.querySelector('[data-field="meta"]');
            const descInput = form.querySelector('[data-field="description"]');
            const linkInput = form.querySelector('[data-field="link"]');

            const title = titleInput ? titleInput.value.trim() : '';
            const subtitle = subtitleInput ? subtitleInput.value.trim() : '';
            const meta = metaInput ? metaInput.value.trim() : '';
            const description = descInput ? descInput.value.trim() : '';
            const link = linkInput ? linkInput.value.trim() : '';

            // Validation markup handling
            let hasError = false;
            form.querySelectorAll('input[required]').forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('input-error');
                    setTimeout(() => input.classList.remove('input-error'), 350);
                    hasError = true;
                }
            });
            if (hasError) return;

            // Generate semantic item block layout matching specified entry list classes
            const li = document.createElement('li');
            li.classList.add('is-new');

            let bodyHTML = `<div class="entry-body">`;
            if (title) bodyHTML += `<div class="entry-title">${title}</div>`;
            if (subtitle) bodyHTML += `<div class="entry-subtitle">${subtitle}</div>`;
            if (meta) bodyHTML += `<span class="entry-meta">${meta}</span>`;
            if (description) bodyHTML += `<p class="entry-description">${description}</p>`;
            if (link) bodyHTML += `<a href="${link}" target="_blank" rel="noopener noreferrer" class="entry-link">View Credential</a>`;
            bodyHTML += `</div>`;
            bodyHTML += `<button type="button" class="remove-skill-btn" aria-label="Remove entry">&times;</button>`;

            li.innerHTML = bodyHTML;

            // Remove empty state message if item gets added
            const emptyState = list.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            list.appendChild(li);
            form.reset();
        });
    });

    // Observer/Helper function to show empty states beautifully
    function updateEmptyState(list) {
        if (list.children.length === 0) {
            const div = document.createElement('div');
            div.classList.add('empty-state');
            div.textContent = 'No entries added yet. Fill out the form above to update your timeline.';
            list.appendChild(div);
        }
    }

    // Monitor modern item dynamic clearings to revive empty state messaging gracefully
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            const list = e.target.closest('.managed-entries-list');
            if (list) {
                const li = e.target.closest('li');
                if (li) {
                    li.classList.add('is-removing');
                    li.addEventListener('transitionend', () => {
                        li.remove();
                        // Check if list became completely empty after cleanup transition
                        if (list.querySelectorAll('li').length === 0) {
                            updateEmptyState(list);
                        }
                    });
                }
            }
        }
    });
});