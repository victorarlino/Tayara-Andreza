// ===== Carrossel Loja =====
document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('storeCarousel');
    const btnLeft = document.getElementById('storeArrowLeft');
    const btnRight = document.getElementById('storeArrowRight');
    let currentIndex = 0;

    function getStepWidth() {
        if (!carousel || !carousel.children.length) {
            return 0;
        }

        const firstItem = carousel.children[0];
        const gap = parseFloat(window.getComputedStyle(carousel).gap || '0');
        return firstItem.getBoundingClientRect().width + gap;
    }

    function getVisibleItems() {
        const stepWidth = getStepWidth();

        if (!carousel || stepWidth <= 0) {
            return 1;
        }

        return Math.max(1, Math.floor((carousel.clientWidth + 1) / stepWidth));
    }

    function getMaxIndex() {
        if (!carousel) {
            return 0;
        }

        return Math.max(0, carousel.children.length - getVisibleItems());
    }

    function goToSlide(index) {
        if (!carousel) {
            return;
        }

        const maxIndex = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        const slideWidth = getStepWidth();

        carousel.scrollTo({
            left: currentIndex * slideWidth,
            behavior: 'smooth'
        });
    }

    if (carousel && btnLeft && btnRight) {
        btnLeft.addEventListener('click', function() {
            goToSlide(currentIndex - 1);
        });

        btnRight.addEventListener('click', function() {
            goToSlide(currentIndex + 1);
        });

        window.addEventListener('resize', function() {
            goToSlide(currentIndex);
        });

        goToSlide(0);
    }
});
// Navegação suave ao clicar nos links
const navLinks = document.querySelectorAll('.nav-link');
const logo = document.querySelector('.logo');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

function closeMobileMenu() {
    if (!menuToggle || !navMenu) {
        return;
    }

    navMenu.classList.remove('is-open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
}

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('is-open');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
}

// ========== LOGIN ==========
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const loginModalClose = document.querySelector('.login-modal-close');
const privateArea = document.getElementById('privateArea');
const logoutBtn = document.getElementById('logoutBtn');

// Senha correta (pode ser alterada)
const correctPassword = 'tayara123';

// Abrir modal de login
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
        passwordInput.focus();
        loginError.style.display = 'none';
    });
}

// Fechar modal de login
if (loginModalClose) {
    loginModalClose.addEventListener('click', () => {
        loginModal.classList.remove('active');
        passwordInput.value = '';
        loginError.style.display = 'none';
    });
}

// Fechar ao clicar fora do modal
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
        passwordInput.value = '';
        loginError.style.display = 'none';
    }
});

// Validar senha
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (passwordInput.value === correctPassword) {
            loginModal.classList.remove('active');
            privateArea.style.display = 'block';
            passwordInput.value = '';
            loginError.style.display = 'none';
            
            // Scroll para a área privada
            setTimeout(() => {
                privateArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        privateArea.style.display = 'none';
        loginModal.classList.remove('active');
        passwordInput.value = '';
        loginError.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');

        if (!targetId || !targetId.startsWith('#')) {
            e.preventDefault();
            closeMobileMenu();
            window.location.href = targetId || 'fans.html';
            return;
        }

        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }

        closeMobileMenu();
    });
    
    // Morcegos ao passar o mouse nos links
    link.addEventListener('mouseenter', () => {
        createNavLinkBat(link);
    });
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeMobileMenu();
    }
});


// Morcegos voando dos links do menu
function createNavLinkBat(element) {
    const linkRect = element.getBoundingClientRect();
    const bat = document.createElement('div');
    bat.className = 'logo-bat';
    bat.innerHTML = '🦇';
    
    // Posição inicial (centro do link)
    const startX = linkRect.left + linkRect.width / 2;
    const startY = linkRect.top + linkRect.height / 2;
    
    // Direção aleatória
    const angle = Math.random() * Math.PI * 2;
    const distance = 150 + Math.random() * 200;
    const endX = startX + Math.cos(angle) * distance;
    const endY = startY + Math.sin(angle) * distance;
    
    bat.style.left = `${startX}px`;
    bat.style.top = `${startY}px`;
    bat.style.setProperty('--end-x', `${endX}px`);
    bat.style.setProperty('--end-y', `${endY}px`);
    
    // Rotação aleatória
    const rotation = Math.random() * 720 - 360;
    bat.style.setProperty('--rotation', `${rotation}deg`);
    
    // Direção horizontal (1 = direita, -1 = esquerda)
    const direction = endX > startX ? 1 : -1;
    bat.style.setProperty('--direction', direction);
    
    document.body.appendChild(bat);
    
    // Remove após animação
    setTimeout(() => bat.remove(), 1500);
}

// Morcegos voando da logo
function createLogoBat() {
    const logoRect = logo.getBoundingClientRect();
    const bat = document.createElement('div');
    bat.className = 'logo-bat';
    bat.innerHTML = '🦇';
    
    // Posição inicial (centro da logo)
    const startX = logoRect.left + logoRect.width / 2;
    const startY = logoRect.top + logoRect.height / 2;
    
    // Direção aleatória
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 300;
    const endX = startX + Math.cos(angle) * distance;
    const endY = startY + Math.sin(angle) * distance;
    
    bat.style.left = `${startX}px`;
    bat.style.top = `${startY}px`;
    bat.style.setProperty('--end-x', `${endX}px`);
    bat.style.setProperty('--end-y', `${endY}px`);
    
    // Rotação aleatória
    const rotation = Math.random() * 720 - 360;
    bat.style.setProperty('--rotation', `${rotation}deg`);
    
    // Direção horizontal (1 = direita, -1 = esquerda)
    const direction = endX > startX ? 1 : -1;
    bat.style.setProperty('--direction', direction);
    
    document.body.appendChild(bat);
    
    // Remove após animação
    setTimeout(() => bat.remove(), 2000);
}

// Event listeners na logo
let hoverTimeout;
logo.addEventListener('mouseenter', () => {
    // Criar morcegos continuamente enquanto hover
    hoverTimeout = setInterval(() => {
        createLogoBat();
    }, 200);
});

logo.addEventListener('mouseleave', () => {
    clearInterval(hoverTimeout);
});

logo.addEventListener('click', (e) => {
    // Criar múltiplos morcegos no click
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createLogoBat(), i * 50);
    }
});

// Header com scroll
let lastScroll = 0;
const header = document.getElementById('header');

// Mostrar fundo do header ao passar o mouse
header.addEventListener('mouseenter', () => {
    if (!header.classList.contains('scrolled')) {
        header.classList.add('hover');
    }
});

header.addEventListener('mouseleave', () => {
    header.classList.remove('hover');
});

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Adiciona classe 'scrolled' quando rolar para baixo
    if (currentScroll > 50) {
        header.classList.add('scrolled');
        header.classList.remove('hover');
    } else {
        header.classList.remove('scrolled');
    }
    
    if (currentScroll <= 0) {
        header.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-up');
        header.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
        header.classList.remove('scroll-down');
        header.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

/* ========== PLAYER DE MÚSICA ANTIGO (DESABILITADO - USANDO SPOTIFY EMBED) ==========
// Player de Música
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentSongEl = document.getElementById('currentSong');
const playlistItems = document.querySelectorAll('.playlist-item');

let currentSongIndex = 0;
let isPlaying = false;

// Carregar música
function loadSong(index) {
    const song = playlistItems[index];
    const songSrc = song.getAttribute('data-src');
    const songName = song.querySelector('h3').textContent;
    
    audioPlayer.src = songSrc;
    currentSongEl.textContent = songName;
    
    // Atualizar playlist visual
    playlistItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
        const icon = item.querySelector('.playlist-icon i');
        icon.className = i === index && isPlaying ? 'fas fa-pause' : 'fas fa-play';
    });
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
}

playBtn.addEventListener('click', togglePlay);

audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    playBtn.querySelector('i').className = 'fas fa-pause';
    playlistItems[currentSongIndex].querySelector('.playlist-icon i').className = 'fas fa-pause';
});

audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    playBtn.querySelector('i').className = 'fas fa-play';
    playlistItems[currentSongIndex].querySelector('.playlist-icon i').className = 'fas fa-play';
});

// Música anterior
prevBtn.addEventListener('click', () => {
    currentSongIndex = currentSongIndex === 0 ? playlistItems.length - 1 : currentSongIndex - 1;
    loadSong(currentSongIndex);
    if (isPlaying) audioPlayer.play();
});

// Próxima música
nextBtn.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % playlistItems.length;
    loadSong(currentSongIndex);
    if (isPlaying) audioPlayer.play();
});

// Clicar em item da playlist
playlistItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        if (currentSongIndex === index && isPlaying) {
            audioPlayer.pause();
        } else {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            audioPlayer.play();
        }
    });
});

// Atualizar barra de progresso
audioPlayer.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    if (duration) {
        durationEl.textContent = formatTime(duration);
    }
});

// Clicar na barra de progresso
progressBar.addEventListener('click', (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
});

// Formatar tempo
function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Música terminou - próxima automática
audioPlayer.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % playlistItems.length;
    loadSong(currentSongIndex);
    audioPlayer.play();
});

// Carregar primeira música
loadSong(0);
========== FIM DO PLAYER ANTIGO ========== */

// Galeria - Lightbox com suporte para imagens e vídeos
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const video = item.querySelector('video');
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        let content = '';
        if (video) {
            // Se for vídeo, pegar a source
            const videoSrc = video.querySelector('source').src;
            content = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <video id="lightboxVideo" controls>
                        <source src="${videoSrc}" type="video/mp4">
                    </video>
                </div>
            `;
        } else if (img) {
            // Se for imagem
            content = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img src="${img.src}" alt="${img.alt}">
                </div>
            `;
        }
        
        lightbox.innerHTML = content;
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Se for vídeo, pausar o vídeo da galeria e tocar o do lightbox
        if (video) {
            const lightboxVideo = lightbox.querySelector('#lightboxVideo');
            video.pause();
            lightboxVideo.play();
            lightboxVideo.muted = false; // Habilitar som
        }
        
        // Fechar lightbox
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const closeLightbox = () => {
            // Se for vídeo, pausar e retomar o da galeria
            if (video) {
                const lightboxVideo = lightbox.querySelector('#lightboxVideo');
                lightboxVideo.pause();
                video.play();
            }
            lightbox.remove();
            document.body.style.overflow = 'auto';
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    });
});

// Lightbox para vídeo da biografia
const aboutVideo = document.querySelector('.about-image video');
if (aboutVideo) {
    aboutVideo.addEventListener('click', () => {
        const videoSrc = aboutVideo.querySelector('source').src;
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <video id="lightboxVideo" controls>
                    <source src="${videoSrc}" type="video/mp4">
                </video>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        const lightboxVideo = lightbox.querySelector('#lightboxVideo');
        aboutVideo.pause();
        lightboxVideo.play();
        lightboxVideo.muted = false;
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const closeLightbox = () => {
            lightboxVideo.pause();
            aboutVideo.play();
            lightbox.remove();
            document.body.style.overflow = 'auto';
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    });
}

// Lightbox para fotos pessoais com event delegation
const photosGrid = document.querySelector('.items-grid.grid-3');
if (photosGrid) {
    photosGrid.addEventListener('click', (e) => {
        const photoContainer = e.target.closest('.item-image');
        if (!photoContainer) return;
        
        const img = photoContainer.querySelector('img');
        if (!img) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${img.src}" alt="${img.alt}">
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const closeLightbox = () => {
            lightbox.remove();
            document.body.style.overflow = 'auto';
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', handleEsc);
            }
        });
    });
}


// Adicionar estilos do lightbox via JavaScript
const lightboxStyles = document.createElement('style');
lightboxStyles.textContent = `
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90vh;
        animation: zoomIn 0.3s ease;
    }
    
    .lightbox-content img,
    .lightbox-content video {
        width: 100%;
        height: auto;
        max-height: 90vh;
        border-radius: 10px;
        object-fit: contain;
    }
    
    .lightbox-content video {
        background: #000;
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        font-size: 40px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10001;
    }
    
    .lightbox-close:hover {
        color: #fff;
        transform: rotate(90deg);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes zoomIn {
        from {
            transform: scale(0.5);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(lightboxStyles);

// Animações ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animação
const animateElements = document.querySelectorAll('.gallery-item, .schedule-item, .playlist-item, .about-content, .highlight-card');
animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Loading inicial
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Morcegos voando - DESABILITADO PARA MELHOR PERFORMANCE
// Os morcegos causavam travamento constante com animações pesadas
// Descomentar abaixo se quiser reativar (não recomendado em mobile)
/*
function createBat() {
    const bat = document.createElement('div');
    bat.className = 'bat';
    bat.innerHTML = '🦇'; // Emoji de morcego
    
    // Posição inicial aleatória
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const endX = Math.random() * 100;
    const endY = Math.random() * 100;
    
    // Duração aleatória entre 15 e 30 segundos
    const duration = 15 + Math.random() * 15;
    
    // Delay aleatório
    const delay = Math.random() * 5;
    
    // Tamanho aleatório (um pouco maiores)
    const size = 1.2 + Math.random() * 0.8;
    
    bat.style.setProperty('--start-x', `${startX}vw`);
    bat.style.setProperty('--start-y', `${startY}vh`);
    bat.style.setProperty('--end-x', `${endX}vw`);
    bat.style.setProperty('--end-y', `${endY}vh`);
    
    // Direção horizontal (1 = direita, -1 = esquerda)
    const direction = endX > startX ? 1 : -1;
    bat.style.setProperty('--bat-direction', direction);
    
    bat.style.animationDuration = `${duration}s`;
    bat.style.animationDelay = `${delay}s`;
    bat.style.transform = `scale(${size})`;
    bat.style.opacity = 0.5 + Math.random() * 0.4;
    
    document.body.appendChild(bat);
    
    // Remove o morcego após a animação e cria um novo
    setTimeout(() => {
        bat.remove();
        createBat();
    }, (duration + delay) * 1000);
}

// Criar múltiplos morcegos
for (let i = 0; i < 4; i++) {
    setTimeout(() => createBat(), i * 1500);
}
*/

// Controle de Volume do Vídeo Hero
const heroVideo = document.getElementById('heroVideo');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');

if (heroVideo && muteBtn && volumeSlider) {
    // Função para atualizar o ícone baseado no volume
    function updateVolumeIcon(volume) {
        const icon = muteBtn.querySelector('i');
        if (volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }
    
    // Controle do slider
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        heroVideo.volume = volume;
        heroVideo.muted = volume === 0;
        updateVolumeIcon(e.target.value);
    });
    
    // Botão de mute/unmute
    muteBtn.addEventListener('click', () => {
        if (heroVideo.muted || heroVideo.volume === 0) {
            heroVideo.muted = false;
            heroVideo.volume = 0.5;
            volumeSlider.value = 50;
            updateVolumeIcon(50);
        } else {
            heroVideo.muted = true;
            volumeSlider.value = 0;
            updateVolumeIcon(0);
        }
    });
}

// Modal de Biografia
const bioModal = document.getElementById('bioModal');
const bioBtn = document.getElementById('bioBtn');
const bioModalClose = document.querySelector('.bio-modal-close');

if (bioBtn && bioModal) {
    // Abrir modal
    bioBtn.addEventListener('click', () => {
        bioModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    // Fechar modal ao clicar no X
    if (bioModalClose) {
        bioModalClose.addEventListener('click', () => {
            bioModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Fechar modal ao clicar fora do conteúdo
    bioModal.addEventListener('click', (e) => {
        if (e.target === bioModal) {
            bioModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Fechar modal com tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && bioModal.style.display === 'flex') {
            bioModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// ========== CARROSSEL DE AGENDA ==========
const scheduleListContainer = document.getElementById('scheduleListContainer');
const scheduleArrowPrev = document.getElementById('scheduleArrowPrev');
const scheduleArrowNext = document.getElementById('scheduleArrowNext');

if (scheduleListContainer && scheduleArrowPrev && scheduleArrowNext) {
    // Clonar todos os items de schedule da estrutura original
    const scheduleItems = `
        <div class="schedule-item animate-slide-left delay-1">
            <div class="schedule-date">
                <span class="date-day">13</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Igarassu</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-2">
            <div class="schedule-date">
                <span class="date-day">14</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Vitória de Santo Antão</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-3">
            <div class="schedule-date">
                <span class="date-day">15</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Jaboatão dos Guararapes</h3>
                <p><i class="fas fa-map-marker-alt"></i> Bloco Fala Mãe Anda Juntos</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-1">
            <div class="schedule-date">
                <span class="date-day">15</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Recife</h3>
                <p><i class="fas fa-map-marker-alt"></i> Pina - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-2">
            <div class="schedule-date">
                <span class="date-day">15</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Escada</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-3">
            <div class="schedule-date">
                <span class="date-day">16</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Camaragibe</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-4">
            <div class="schedule-date">
                <span class="date-day">16</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Buenos Aires</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-5">
            <div class="schedule-date">
                <span class="date-day">17</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Recife</h3>
                <p><i class="fas fa-map-marker-alt"></i> Casa Amarela - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-6">
            <div class="schedule-date">
                <span class="date-day">17</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Jaboatão dos Guararapes</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-1">
            <div class="schedule-date">
                <span class="date-day">17</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Recife</h3>
                <p><i class="fas fa-map-marker-alt"></i> NB Society - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-2">
            <div class="schedule-date">
                <span class="date-day">18</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Paulista</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-3">
            <div class="schedule-date">
                <span class="date-day">21</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Fernando de Noronha</h3>
                <p><i class="fas fa-map-marker-alt"></i> Perdoa Péricles - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-4">
            <div class="schedule-date">
                <span class="date-day">22</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Cavaleiro Fest</h3>
                <p><i class="fas fa-map-marker-alt"></i> Jaboatão dos Guararapes - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-5">
            <div class="schedule-date">
                <span class="date-day">22</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Camaragibe</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-6">
            <div class="schedule-date">
                <span class="date-day">27</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Camaragibe</h3>
                <p><i class="fas fa-map-marker-alt"></i> Praça Pública - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-1">
            <div class="schedule-date">
                <span class="date-day">28</span>
                <span class="date-month">FEV</span>
            </div>
            <div class="schedule-info">
                <h3>Vicência</h3>
                <p><i class="fas fa-map-marker-alt"></i> Povoado Angélicas - PE</p>
            </div>
        </div>
        <div class="schedule-item animate-slide-left delay-2">
            <div class="schedule-date">
                <span class="date-day">01</span>
                <span class="date-month">MAR</span>
            </div>
            <div class="schedule-info">
                <h3>Cohab Fest</h3>
                <p><i class="fas fa-map-marker-alt"></i> Jaboatão dos Guararapes - PE</p>
            </div>
        </div>
    `;

    scheduleListContainer.innerHTML = scheduleItems;

    // Controlar setas de navegação
    function updateArrowState() {
        const scrollLeft = scheduleListContainer.scrollLeft;
        const scrollWidth = scheduleListContainer.scrollWidth;
        const clientWidth = scheduleListContainer.clientWidth;

        scheduleArrowPrev.disabled = scrollLeft === 0;
        scheduleArrowNext.disabled = scrollLeft + clientWidth >= scrollWidth - 1;
    }

    // Scroll com setas
    const scrollAmount = 250;

    scheduleArrowPrev.addEventListener('click', () => {
        scheduleListContainer.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });

    scheduleArrowNext.addEventListener('click', () => {
        scheduleListContainer.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });

    // Atualizar estado das setas ao scroll
    scheduleListContainer.addEventListener('scroll', updateArrowState);
    window.addEventListener('resize', updateArrowState);

    // Inicial
    setTimeout(updateArrowState, 100);
}
