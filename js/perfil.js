const profileName = document.getElementById('profileName');
const profilePhoto = document.getElementById('profilePhoto');
const profileActions = document.getElementById('profileActions');
const toggleEditBtn = document.getElementById('toggleEditBtn');
const editPhotoBtn = document.getElementById('editPhotoBtn');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const profileForm = document.getElementById('profileForm');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const profileMessage = document.getElementById('profileMessage');
const cityInput = document.getElementById('city');
const stateInput = document.getElementById('state');
const birthDateInput = document.getElementById('birthDate');
const socialInput = document.getElementById('social');
const fanclubUrlInput = document.getElementById('fanclubUrl');
const bioInput = document.getElementById('bio');

const defaultUserName = 'fã';
const defaultUserPhoto = 'images/fotos/tayara_fans.jpg';
const CURRENT_USER_KEY_STORAGE = 'fanClubCurrentUserKey';
let isEditing = false;

function getCurrentUserKey() {
	return String(localStorage.getItem(CURRENT_USER_KEY_STORAGE) || 'guest').trim().toLowerCase();
}

const params = new URLSearchParams(window.location.search);
const requestedUserKey = (params.get('user') || '').trim().toLowerCase();
const currentUserKey = getCurrentUserKey();
const viewedUserKey = requestedUserKey || currentUserKey;
const isProfileOwner = viewedUserKey === currentUserKey;

function readScopedValue(baseKey, userKey = viewedUserKey) {
	return localStorage.getItem(`${baseKey}:${userKey}`);
}

function writeScopedValue(baseKey, value, userKey = viewedUserKey) {
	localStorage.setItem(`${baseKey}:${userKey}`, value);
}

function optimizeImageForStorage(file) {
	return new Promise((resolve, reject) => {
		if (!file.type.startsWith('image/')) {
			reject(new Error('Arquivo inválido.'));
			return;
		}

		const reader = new FileReader();

		reader.onload = () => {
			const image = new Image();

			image.onload = () => {
				const maxSize = 600;
				let width = image.width;
				let height = image.height;

				if (width > maxSize || height > maxSize) {
					if (width > height) {
						height = Math.round((height * maxSize) / width);
						width = maxSize;
					} else {
						width = Math.round((width * maxSize) / height);
						height = maxSize;
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					reject(new Error('Não foi possível processar a imagem.'));
					return;
				}

				ctx.drawImage(image, 0, 0, width, height);
				resolve(canvas.toDataURL('image/jpeg', 0.82));
			};

			image.onerror = () => reject(new Error('Erro ao carregar imagem.'));
			image.src = String(reader.result);
		};

		reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
		reader.readAsDataURL(file);
	});
}

function readProfileData() {
	const rawProfile = readScopedValue('fanClubProfile');

	if (!rawProfile) {
		return {
			city: '',
			state: '',
			birthDate: '',
			social: '',
			fanclubUrl: '',
			bio: ''
		};
	}

	try {
		return JSON.parse(rawProfile);
	} catch (error) {
		return {
			city: '',
			state: '',
			birthDate: '',
			social: '',
			fanclubUrl: '',
			bio: ''
		};
	}
}

function fillProfileFields() {
	const profileData = readProfileData();

	cityInput.value = profileData.city || '';
	stateInput.value = profileData.state || '';
	birthDateInput.value = profileData.birthDate || '';
	socialInput.value = profileData.social || '';
	fanclubUrlInput.value = profileData.fanclubUrl || '';
	bioInput.value = profileData.bio || '';
}

function setEditMode(enabled) {
	isEditing = enabled;

	[cityInput, stateInput, birthDateInput, socialInput, fanclubUrlInput, bioInput].forEach((field) => {
		field.disabled = !enabled;
	});

	if (saveProfileBtn) {
		saveProfileBtn.hidden = !enabled;
	}

	if (editPhotoBtn) {
		editPhotoBtn.hidden = !enabled;
	}

	if (toggleEditBtn) {
		toggleEditBtn.textContent = enabled ? 'Cancelar edição' : 'Editar perfil';
	}
}

const savedUserName = readScopedValue('fanClubUserName') || defaultUserName;
const savedUserPhoto = readScopedValue('fanClubUserPhoto') || defaultUserPhoto;

profileName.textContent = savedUserName;
profilePhoto.src = savedUserPhoto;
profilePhoto.alt = `Foto de ${savedUserName}`;
fillProfileFields();

if (isProfileOwner) {
	if (profileActions) {
		profileActions.hidden = false;
	}

	setEditMode(false);

	toggleEditBtn?.addEventListener('click', () => {
		if (isEditing) {
			fillProfileFields();
			if (profileMessage) {
				profileMessage.textContent = '';
			}
			setEditMode(false);
			return;
		}

		setEditMode(true);
	});

	profileForm?.addEventListener('submit', (event) => {
		event.preventDefault();

		const profileData = {
			city: cityInput.value.trim(),
			state: stateInput.value.trim(),
			birthDate: birthDateInput.value.trim(),
			social: socialInput.value.trim(),
			fanclubUrl: fanclubUrlInput.value.trim(),
			bio: bioInput.value.trim()
		};

		writeScopedValue('fanClubProfile', JSON.stringify(profileData));
		if (profileMessage) {
			profileMessage.textContent = 'Perfil atualizado com sucesso!';
		}
		setEditMode(false);
	});

	profilePhotoInput?.addEventListener('change', (event) => {
		const selectedFile = event.target.files?.[0];

		if (!selectedFile) {
			return;
		}

		optimizeImageForStorage(selectedFile)
			.then((optimizedPhoto) => {
				profilePhoto.src = optimizedPhoto;
				try {
					writeScopedValue('fanClubUserPhoto', optimizedPhoto);
				} catch (error) {
					throw new Error('storage-failed');
				}
				if (profileMessage) {
					profileMessage.textContent = 'Foto atualizada com sucesso!';
				}
			})
			.catch(() => {
				if (profileMessage) {
					profileMessage.textContent = 'Não foi possível salvar a foto. Tente outra imagem.';
				}
			});
	});
} else {
	setEditMode(false);

	if (profileActions) {
		profileActions.hidden = true;
	}

	if (toggleEditBtn) {
		toggleEditBtn.disabled = true;
	}

	if (editPhotoBtn) {
		editPhotoBtn.hidden = true;
	}

	if (profilePhotoInput) {
		profilePhotoInput.value = '';
		profilePhotoInput.disabled = true;
	}

	if (saveProfileBtn) {
		saveProfileBtn.hidden = true;
		saveProfileBtn.disabled = true;
	}

	[cityInput, stateInput, birthDateInput, socialInput, fanclubUrlInput, bioInput].forEach((field) => {
		field.disabled = true;
	});

	if (profileMessage) {
		profileMessage.textContent = 'Apenas o dono deste perfil pode editar as informações.';
	}
}