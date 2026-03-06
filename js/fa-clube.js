const userNameElement = document.getElementById('fanclubUserName');
const userPhotoElement = document.getElementById('fanclubUserPhoto');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const avatarToggle = document.getElementById('avatarToggle');
const fanclubMenu = document.getElementById('fanclubMenu');
const profileMenuLink = document.querySelector('.fanclub-menu-item[href="perfil.html"]');
const logoutButton = document.getElementById('logoutButton');
const defaultUserName = 'fã';
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
const CURRENT_USER_ACCESS_TOKEN_KEY = 'fanClubCurrentUserAccessToken';

function getCurrentUserKey() {
    return localStorage.getItem(CURRENT_USER_KEY_STORAGE) || 'guest';
}

function readScopedValue(baseKey) {
    const currentUserKey = getCurrentUserKey();
    return localStorage.getItem(`${baseKey}:${currentUserKey}`);
}

function renderUserHeader() {
    const savedUserName = readScopedValue('fanClubUserName') || defaultUserName;
    const savedUserPhoto = readScopedValue('fanClubUserPhoto');

    if (userNameElement) {
        userNameElement.textContent = `Olá, ${savedUserName}!`;
    }

    if (userPhotoElement) {
        userPhotoElement.alt = `Foto de ${savedUserName}`;

        if (savedUserPhoto) {
            userPhotoElement.src = savedUserPhoto;
            userPhotoElement.hidden = false;

            if (avatarPlaceholder) {
                avatarPlaceholder.hidden = true;
            }
        } else {
            userPhotoElement.hidden = true;

            if (avatarPlaceholder) {
                avatarPlaceholder.hidden = false;
                avatarPlaceholder.textContent = savedUserName.trim().charAt(0).toUpperCase() || '+';
            }
        }
    }
}

renderUserHeader();

if (profileMenuLink) {
    const currentUserKey = getCurrentUserKey();
    profileMenuLink.href = `perfil.html?user=${encodeURIComponent(currentUserKey)}`;
}

if (avatarToggle && fanclubMenu) {
    avatarToggle.addEventListener('click', () => {
        const isMenuHidden = fanclubMenu.hidden;
        fanclubMenu.hidden = !isMenuHidden;
        avatarToggle.setAttribute('aria-expanded', String(isMenuHidden));
    });
}

document.addEventListener('click', (event) => {
    if (!fanclubMenu || !avatarToggle) {
        return;
    }

    const clickedInsideUser = event.target instanceof Element && event.target.closest('.fanclub-user');

    if (!clickedInsideUser) {
        fanclubMenu.hidden = true;
        avatarToggle.setAttribute('aria-expanded', 'false');
    }
});

if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem(CURRENT_USER_KEY_STORAGE);
        localStorage.removeItem(CURRENT_USER_ACCESS_TOKEN_KEY);
        window.location.href = 'index.html';
    });
}

window.addEventListener('storage', (event) => {
    if (event.key && (event.key === CURRENT_USER_KEY_STORAGE || event.key.startsWith('fanClubUserName:') || event.key.startsWith('fanClubUserPhoto:'))) {
        renderUserHeader();
    }
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        renderUserHeader();
    }
});