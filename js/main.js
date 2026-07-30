/**
 * PORTAFOLIO 2026 - Mauro Rios
 * Bowlby One + Outfit | #2DCDFF, #171717, #FFFFFF
 * About Slider, Carrusel Infinito, Firebase, GLB Viewer, Snap Nav
 */

const firebaseConfig = {
    apiKey: "AIzaSyDXxGKVMkytpiyclCvuZv0I3BWigPS4haY",
    authDomain: "proyectos-fb5f4.firebaseapp.com",
    projectId: "proyectos-fb5f4",
    storageBucket: "proyectos-fb5f4.appspot.com",
    messagingSenderId: "767346559996",
    appId: "1:767346559996:web:97341f80b654f1e015c079",
    measurementId: "G-P4VHTGWBRY"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const analytics = firebase.analytics ? firebase.analytics() : null;

document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENTS ===
    const preloader = document.getElementById('preloader');
    const hamburger = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    const navbarLinks = document.querySelectorAll('.nav-link');
    const aboutSlider = document.getElementById('aboutSlider');
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const certGrid = document.getElementById('certGrid');
    const certCount = document.getElementById('certCount');
    const modalPDF = document.getElementById('modalPDF');
    const pdfContainer = document.getElementById('pdfViewerContainer');
    const closePDF = document.getElementById('closePDF');
    const modal3D = document.getElementById('modal3D');
    const modalViewerContainer = document.getElementById('modalViewerContainer');
    const closeModal3D = document.getElementById('closeModal3D');
    const floatingBtns = document.querySelectorAll('.nav-floating-btn');

    // =============================================
    // PRELOADER
    // =============================================
    window.addEventListener('load', () => {
        setTimeout(() => preloader?.classList.add('hidden'), 500);
    });
    if (document.readyState === 'complete') preloader?.classList.add('hidden');

    // =============================================
    // MOBILE MENU
    // =============================================
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks?.classList.toggle('open');
    });
    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 860) return;
        const nav = document.getElementById('navbar');
        if (nav && !nav.contains(e.target)) {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('open');
        }
    });

    // =============================================
    // FLOATING NAV & ACTIVE SECTION DETECTION
    // =============================================
    const sections = ['hero', 'acerca', 'proyectos', 'contacto'];
    let currentSection = 'hero';
    let isSnapping = false;

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            isSnapping = true;
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { isSnapping = false; }, 800);
        }
    };

    floatingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            scrollToSection(btn.dataset.target);
        });
    });

    const updateActiveStates = () => {
        if (isSnapping) return;
        let current = 'hero';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 100) current = id;
            }
        });
        if (current !== currentSection) {
            currentSection = current;
            navbarLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
            floatingBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.target === current);
            });
        }
    };

    window.addEventListener('scroll', updateActiveStates);
    updateActiveStates();

    // =============================================
    // ABOUT SLIDER
    // =============================================
    let currentSlide = 0;
    const totalSlides = document.querySelectorAll('.about-slide').length;

    const goToSlide = (index) => {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        document.querySelectorAll('.about-slide').forEach((slide, i) => {
            slide.classList.toggle('active', i === currentSlide);
        });
        const counter = document.querySelector('.about-slide.active .about-counter');
        if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    };

    aboutSlider?.addEventListener('click', (e) => {
        const prev = e.target.closest('.about-prev');
        const next = e.target.closest('.about-next');
        if (prev) {
            const slide = prev.closest('.about-slide');
            if (slide) goToSlide(parseInt(slide.dataset.index) - 1);
        }
        if (next) {
            const slide = next.closest('.about-slide');
            if (slide) goToSlide(parseInt(slide.dataset.index) + 1);
        }
    });

    // =============================================
    // GLB VIEWER MODAL
    // =============================================
    const openGLBViewer = (modelUrl) => {
        if (!modalViewerContainer || !modal3D) return;
        modalViewerContainer.innerHTML = `
            <model-viewer src="${modelUrl}"
                ar ar-modes="webxr scene-viewer quick-look"
                camera-controls auto-rotate
                shadow-intensity="1.5" shadow-softness="1"
                exposure="1.2" environment-image="neutral"
                touch-action="pan-y">
                <button slot="ar-button" class="ar-button" style="background:var(--cyan);border-radius:14px;border:none;position:absolute;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;font-weight:700;color:var(--dark);box-shadow:0 8px 25px rgba(45,205,255,0.4);display:flex;align-items:center;gap:10px;cursor:pointer;z-index:20;font-family:Outfit,sans-serif;">
                    <span>Ver en RA 📱</span>
                </button>
            </model-viewer>`;
        modal3D.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    closeModal3D?.addEventListener('click', () => {
        modal3D?.classList.remove('active');
        if (modalViewerContainer) modalViewerContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    });
    modal3D?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) closeModal3D?.click();
    });

    // =============================================
    // PROJECTS CAROUSEL (Infinite)
    // =============================================
    let projects = [];
    let currentProjectIdx = 0;
    let isTransitioning = false;

    const truncateText = (text, maxLen = 120) => {
        if (!text || text.length <= maxLen) return { short: text, full: text, needsTrunc: false };
        return { short: text.substring(0, maxLen) + '...', full: text, needsTrunc: true };
    };

    const createProjectCard = (data, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        const subtitle = data.entidad || data.categoria || '';
        const tags = (data.tags || []).filter(t => t.trim() !== '');
        const tagsHTML = tags.map(t => `<span>${t}</span>`).join('');
        const hasGLB = !!data.archivoUrl;
        const desc = data.descripcion || '';
        const { short, full, needsTrunc } = truncateText(desc);
        
        let descHTML = '';
        if (needsTrunc) {
            descHTML = `
                <div class="project-desc-wrap">
                    <p class="project-desc">${short}</p>
                    <p class="project-desc-full">${full}</p>
                    <button class="read-more-btn" data-expanded="false">...leer más</button>
                </div>`;
        } else {
            descHTML = `<p class="project-desc">${desc}</p>`;
        }
        
        slide.innerHTML = `
            <div class="project-card" data-index="${index}">
                <div class="project-card-thumb">
                    ${data.portadaUrl 
                        ? `<img src="${data.portadaUrl}" alt="${data.titulo}" loading="lazy" />`
                        : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#222);display:flex;align-items:center;justify-content:center;color:rgba(45,205,255,0.15);font-size:2rem;">◆</div>`
                    }
                </div>
                <div class="project-card-body">
                    <h3>${data.titulo}</h3>
                    ${subtitle ? `<p class="project-subtitle">${subtitle}</p>` : ''}
                    ${descHTML}
                    ${tagsHTML ? `<div class="project-card-tags">${tagsHTML}</div>` : ''}
                    ${hasGLB ? `<div class="project-card-tags" style="margin-top:8px;"><span style="background:rgba(45,205,255,0.15);">🔮 Ver modelo 3D</span></div>` : ''}
                </div>
            </div>
        `;

        // "leer más" toggle
        const readMoreBtn = slide.querySelector('.read-more-btn');
        const descWrap = slide.querySelector('.project-desc-wrap');
        if (readMoreBtn && descWrap) {
            readMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const expanded = readMoreBtn.dataset.expanded === 'true';
                readMoreBtn.dataset.expanded = expanded ? 'false' : 'true';
                descWrap.classList.toggle('project-desc-expanded', !expanded);
                readMoreBtn.textContent = expanded ? '...leer más' : '...ver menos';
            });
        }

        // Click handler for GLB viewer or link
        const card = slide.querySelector('.project-card');
        card?.addEventListener('click', (e) => {
            // Don't trigger if clicking on read-more button
            if (e.target.closest('.read-more-btn')) return;
            if (data.archivoUrl) {
                openGLBViewer(data.archivoUrl);
            } else if (data.externalLink) {
                window.open(data.externalLink, '_blank', 'noopener,noreferrer');
            }
        });

        return slide;
    };

    const renderCarousel = () => {
        if (!carouselTrack) return;
        carouselTrack.innerHTML = '';
        if (projects.length === 0) {
            carouselTrack.innerHTML = `
                <div class="carousel-slide">
                    <div class="project-card" style="text-align:center;padding:60px 40px;min-height:200px;display:flex;align-items:center;justify-content:center;">
                        <p style="color:rgba(255,255,255,0.3);font-size:1.1rem;">No hay proyectos publicados aún.</p>
                    </div>
                </div>`;
            return;
        }
        projects.forEach((project, i) => carouselTrack.appendChild(createProjectCard(project, i)));
        carouselDots.innerHTML = '';
        projects.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = `carousel-dot ${i === currentProjectIdx ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
            dot.addEventListener('click', () => goToProject(i));
            carouselDots.appendChild(dot);
        });
        updateCarouselPosition();
    };

    const updateCarouselPosition = () => {
        if (!carouselTrack || projects.length === 0) return;
        carouselTrack.style.transform = `translateX(${-currentProjectIdx * 100}%)`;
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentProjectIdx);
        });
    };

    const goToProject = (index) => {
        if (isTransitioning || projects.length === 0) return;
        isTransitioning = true;
        if (index < 0) index = projects.length - 1;
        if (index >= projects.length) index = 0;
        currentProjectIdx = index;
        updateCarouselPosition();
        setTimeout(() => { isTransitioning = false; }, 500);
    };

    prevBtn?.addEventListener('click', () => goToProject(currentProjectIdx - 1));
    nextBtn?.addEventListener('click', () => goToProject(currentProjectIdx + 1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToProject(currentProjectIdx - 1);
        if (e.key === 'ArrowRight') goToProject(currentProjectIdx + 1);
    });

    let touchStartX = 0, touchEndX = 0;
    carouselTrack?.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carouselTrack?.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) goToProject(currentProjectIdx + 1);
            else goToProject(currentProjectIdx - 1);
        }
    }, { passive: true });

    // =============================================
    // LOAD PROJECTS FROM FIREBASE
    // =============================================
    const loadProjects = async () => {
        try {
            const snapshot = await db.collection('proyectos').orderBy('fecha', 'desc').get();
            projects = [];
            snapshot.forEach(doc => projects.push(doc.data()));
            renderCarousel();
        } catch (err) {
            console.error('Error loading projects:', err);
            if (carouselTrack) {
                carouselTrack.innerHTML = `
                    <div class="carousel-slide">
                        <div class="project-card" style="text-align:center;padding:60px 40px;min-height:200px;display:flex;align-items:center;justify-content:center;">
                            <p style="color:rgba(255,255,255,0.3);">Error al cargar proyectos.</p>
                        </div>
                    </div>`;
            }
        }
    };

    // =============================================
    // LOAD CERTIFICATES FROM FIREBASE (con contador)
    // =============================================
    const loadCertificates = async () => {
        if (!certGrid) return;
        try {
            const snapshot = await db.collection('certificados').orderBy('fechaExpedicion', 'desc').get();
            certGrid.innerHTML = '';
            
            // Actualizar contador dinámico
            const total = snapshot.size;
            if (certCount) certCount.textContent = total;
            
            snapshot.forEach(doc => {
                const data = doc.data();
                let displayDate = data.fechaExpedicion;
                if (data.fechaExpedicion && typeof data.fechaExpedicion.toDate === 'function') {
                    const d = data.fechaExpedicion.toDate();
                    const meses = ["ENERO","FEBRERO","MARZO","ABRIL","MAYO","JUNIO","JULIO","AGOSTO","SEPTIEMBRE","OCTUBRE","NOVIEMBRE","DICIEMBRE"];
                    displayDate = `${d.getDate()}/${meses[d.getMonth()]}/${d.getFullYear()}`;
                }
                const item = document.createElement('div');
                item.className = 'cert-item';
                item.innerHTML = `<h4>${data.nombre}</h4><span>${displayDate}</span><span class="cert-view">Ver certificado ↗</span>`;
                item.addEventListener('click', () => openPDF(data.pdfUrl));
                certGrid.appendChild(item);
            });
            if (snapshot.empty) {
                certGrid.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;grid-column:1/-1;">No hay certificados disponibles.</p>';
            }
        } catch (err) {
            console.error('Error loading certificates:', err);
        }
    };

    // =============================================
    // PDF MODAL
    // =============================================
    const openPDF = (pdfUrl) => {
        if (!pdfContainer || !modalPDF) return;
        pdfContainer.innerHTML = `<iframe src="${pdfUrl}" width="100%" height="100%" style="border:none;" title="Visor PDF"></iframe>`;
        modalPDF.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    closePDF?.addEventListener('click', () => {
        modalPDF?.classList.remove('active');
        if (pdfContainer) pdfContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    });
    modalPDF?.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            modalPDF.classList.remove('active');
            if (pdfContainer) pdfContainer.innerHTML = '';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modalPDF?.classList.contains('active')) closePDF?.click();
            if (modal3D?.classList.contains('active')) closeModal3D?.click();
        }
    });

    // =============================================
    // INIT
    // =============================================
    loadProjects();
    loadCertificates();
});