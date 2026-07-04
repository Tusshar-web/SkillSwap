document.addEventListener('DOMContentLoaded', () => {
    // 1. SELECT FORMS AND LISTS
    const skillForms = document.querySelectorAll('.add-skill-form');
    const profileForm = document.querySelector('.profile-form');

    // 2. HANDLE BIO SUBMISSION
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Bio saved successfully!');
        });
    }

    // 3. DYNAMICALLY ADD SKILLS TO LISTS
    skillForms.forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Find specific inputs for this form block
            const textInput = form.querySelector('input[type="text"]');
            const levelSelect = form.querySelector('select');
            const destinationList = form.parentElement.querySelector('.managed-skills-list');

            if (!textInput || !levelSelect || !destinationList) return;

            const skillName = textInput.value.trim();
            const skillLevel = levelSelect.value;

            if (skillName === '') return;

            // Build structural list elements layout
            const newLi = document.createElement('li');
            newLi.innerHTML = `
                <span>${skillName} — <strong>${skillLevel}</strong></span>
                <button class="remove-skill-btn">&times;</button>
            `;

            // Append item to DOM list structure
            destinationList.appendChild(newLi);

            // Reset specific text box value fields
            textInput.value = '';
            levelSelect.selectedIndex = 0;
        });
    });

    // 4. DELEGATE DELETE EVENT ACTIONS
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-skill-btn')) {
            const listItem = e.target.closest('li');
            if (listItem) {
                listItem.remove();
            }
        }
    });
});