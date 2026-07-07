document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       0. SHARED HELPERS
       ========================================================= */
    const flashSaved = (button, savedText = 'Saved ✓', duration = 1800) => {
        if (!button) return;
        const originalText = button.textContent;
        button.classList.add('is-saved');
        button.textContent = savedText;
        setTimeout(() => {
            button.classList.remove('is-saved');
            button.textContent = originalText;
        }, duration);
    };

    const flagError = (input) => {
        if (!input) return;
        input.classList.remove('input-error');
        void input.offsetWidth; // restart the shake animation if already applied
        input.classList.add('input-error');
        input.focus();
        setTimeout(() => input.classList.remove('input-error'), 400);
    };

    const showEmptyState = (list, message) => {
        const box = list.closest('.skill-box');
        let empty = box.querySelector('.empty-state');
        if (list.children.length === 0) {
            if (!empty) {
                empty = document.createElement('p');
                empty.className = 'empty-state';
                empty.textContent = message;
                list.insertAdjacentElement('afterend', empty);
            }
        } else if (empty) {
            empty.remove();
        }
    };

    const attachRemoveHandler = (li, list, message) => {
        const btn = li.querySelector('.remove-skill-btn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            li.classList.add('is-removing');
            li.addEventListener('transitionend', () => {
                li.remove();
                showEmptyState(list, message);
            }, { once: true });
        });
    };

    /* =========================================================
       1. PHOTO UPLOAD
       ========================================================= */
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const photoPlaceholder = document.getElementById('photo-placeholder');
    const photoRemoveBtn = document.getElementById('photo-remove');
    const fullNameInput = document.getElementById('full-name');

    const initialsFrom = (name) => {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return 'JL';
        return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    };

    if (photoInput) {
        photoInput.addEventListener('change', () => {
            const file = photoInput.files && photoInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.hidden = false;
                photoPlaceholder.hidden = true;
                if (photoRemoveBtn) photoRemoveBtn.hidden = false;
            };
            reader.readAsDataURL(file);
        });
    }

    if (photoRemoveBtn) {
        photoRemoveBtn.addEventListener('click', () => {
            photoPreview.hidden = true;
            photoPreview.removeAttribute('src');
            photoPlaceholder.hidden = false;
            photoRemoveBtn.hidden = true;
            if (photoInput) photoInput.value = '';
        });
    }

    if (fullNameInput && photoPlaceholder) {
        fullNameInput.addEventListener('input', () => {
            if (photoPreview && !photoPreview.hidden) return; // real photo takes priority
            photoPlaceholder.textContent = initialsFrom(fullNameInput.value);
        });
    }

    /* =========================================================
       2. EDIT PROFILE TOGGLE
       (visibility driven with inline styles so nothing in the
       stylesheet can silently override it)
       ========================================================= */
    const editToggleBtn = document.getElementById('edit-profile-btn');
    const identityForm = document.querySelector('.identity-form');
    const identitySaveBtn = document.getElementById('identity-save-btn');
    const photoLabel = document.getElementById('photo-label');
    const identityInputs = identityForm
        ? identityForm.querySelectorAll('input[type="text"]')
        : [];

    let isEditing = false;

    const setEditingUI = (editing) => {
        isEditing = editing;

        identityInputs.forEach((input) => { input.readOnly = !editing; });

        if (photoLabel) photoLabel.style.display = editing ? 'inline-block' : 'none';
        if (identitySaveBtn) identitySaveBtn.style.display = editing ? 'inline-block' : 'none';

        if (editToggleBtn) {
            editToggleBtn.classList.toggle('is-active', editing);
            editToggleBtn.innerHTML = editing
                ? '<span class="edit-icon">✕</span> Cancel'
                : '<span class="edit-icon">✎</span> Edit Profile';
        }
    };

    if (editToggleBtn) {
        setEditingUI(false); // guaranteed starting state, regardless of markup/CSS

        editToggleBtn.addEventListener('click', () => {
            setEditingUI(!isEditing);
            if (isEditing && identityInputs.length) identityInputs[0].focus();
        });
    }

    if (identityForm) {
        identityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            flashSaved(identityForm.querySelector('button[type="submit"]'));
            setEditingUI(false);
        });
    }

    /* =========================================================
       3. BIO: character count + save feedback
       ========================================================= */
    const profileForm = document.querySelector('.profile-form');
    const bio = document.getElementById('bio');

    if (bio) {
        const counter = document.createElement('div');
        counter.className = 'char-count';
        const maxLen = 280;
        const updateCount = () => {
            const remaining = maxLen - bio.value.length;
            counter.textContent = `${bio.value.length} / ${maxLen}`;
            counter.classList.toggle('near-limit', remaining <= 20);
        };
        bio.insertAdjacentElement('afterend', counter);
        bio.setAttribute('maxlength', String(maxLen));
        updateCount();
        bio.addEventListener('input', updateCount);
    }

    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            flashSaved(profileForm.querySelector('button[type="submit"]'));
        });
    }

    /* =========================================================
       4. SKILLS: add / remove (Offered & Wanted)
       ========================================================= */
    const buildSkillItem = (name, level) => {
        const li = document.createElement('li');
        li.classList.add('is-new');
        li.innerHTML = `
            <span>${name} — <span class="level-pill ${level.toLowerCase()}">${level}</span></span>
            <button type="button" class="remove-skill-btn" aria-label="Remove ${name}">&times;</button>
        `;
        return li;
    };

    document.querySelectorAll('.skill-box.offered, .skill-box.wanted').forEach((box) => {
        const list = box.querySelector('.managed-skills-list');
        const form = box.querySelector('.add-skill-form');
        if (!list || !form) return;

        const emptyMessage = 'No skills added yet — add one above.';
        list.querySelectorAll('li').forEach((li) => attachRemoveHandler(li, list, emptyMessage));
        showEmptyState(list, emptyMessage);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input[type="text"]');
            const select = form.querySelector('select');

            if (input.value.trim() === '') {
                flagError(input);
                return;
            }

            const li = buildSkillItem(input.value.trim(), select.value);
            list.appendChild(li);
            attachRemoveHandler(li, list, emptyMessage);
            showEmptyState(list, emptyMessage);

            form.reset();
            input.focus();
        });
    });

    /* =========================================================
       5. ENTRIES: Experience / Education / Certificates / Achievements
       ========================================================= */
    const buildEntryItem = ({ title, subtitle, meta, description, link }) => {
        const li = document.createElement('li');
        li.classList.add('is-new');
        li.innerHTML = `
            <div class="entry-body">
                <div class="entry-title">${title}</div>
                ${subtitle ? `<div class="entry-subtitle">${subtitle}</div>` : ''}
                ${meta ? `<span class="entry-meta">${meta}</span>` : ''}
                ${description ? `<p class="entry-description">${description}</p>` : ''}
                ${link ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="entry-link">View Credential</a>` : ''}
            </div>
            <button type="button" class="remove-skill-btn" aria-label="Remove ${title}">&times;</button>
        `;
        return li;
    };

    document.querySelectorAll('[data-entry-type]').forEach((box) => {
        const entryType = box.getAttribute('data-entry-type');
        const list = box.querySelector(`.managed-entries-list[data-list="${entryType}"]`);
        const form = box.querySelector('.add-entry-form');
        if (!list || !form) return;

        const emptyMessage = 'No entries added yet. Fill out the form above to update your timeline.';
        showEmptyState(list, emptyMessage);

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const getField = (name) => {
                const el = form.querySelector(`[data-field="${name}"]`);
                return el ? el.value.trim() : '';
            };

            const fields = {
                title: getField('title'),
                subtitle: getField('subtitle'),
                meta: getField('meta'),
                description: getField('description'),
                link: getField('link')
            };

            let hasError = false;
            form.querySelectorAll('input[required]').forEach((input) => {
                if (!input.value.trim()) {
                    flagError(input);
                    hasError = true;
                }
            });
            if (hasError) return;

            const li = buildEntryItem(fields);
            list.appendChild(li);
            attachRemoveHandler(li, list, emptyMessage);
            showEmptyState(list, emptyMessage);

            form.reset();
            form.querySelector('[data-field="title"]').focus();
        });
    });
});