/**
 * Lógica del Portafolio Multimedia
 * Conexión con Firebase para contenido dinámico.
 */

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    const menuBtn = document.getElementById('menuBtn');
    const nav = document.getElementById('nav');
    const filters = document.getElementById('filters');
    const searchInput = document.getElementById('searchInput');
    const contactForm = document.getElementById('contactForm');
    const projectsGrid = document.getElementById('projectsGrid');
    const heroContainer = document.getElementById('heroVisualContainer');

    // --- Lógica del Modal 3D ---
    const modal3D = document.getElementById('modal3D');
    const modalContainer = document.getElementById('modalViewerContainer');
    const closeModal = document.getElementById('closeModal');
    const screenshotBtn = document.getElementById('screenshotBtn');

    const openViewer = (modelUrl) => {
        modalContainer.innerHTML = `
            <model-viewer src="${modelUrl}"
                ar ar-modes="webxr scene-viewer quick-look"
                camera-controls auto-rotate
                shadow-intensity="1.5"
                shadow-softness="1"
                exposure="1.2"
                environment-image="neutral"
                touch-action="pan-y">
                <button slot="ar-button" class="ar-button">
                    <span>Ver en tu espacio (RA) 📱</span>
                </button>
            </model-viewer>`;
        modal3D.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const takeScreenshot = async () => {
        const viewer = modalContainer.querySelector('model-viewer');
        if (!viewer) return;

        // Captura el frame actual del visualizador
        const blob = await viewer.toBlob({ idealAspect: true });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.src = url;
        await img.decode();

        // Creamos un canvas para fusionar imagen + marca de agua
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Dibujar el render 3D
        ctx.drawImage(img, 0, 0);

        // Dibujar la marca de agua (Logo)
        const logo = new Image();
        logo.src = 'assets/img/preloader.svg';
        await logo.decode();

        const logoW = canvas.width * 0.15; // 15% del ancho de la captura
        const logoH = (logoW * logo.height) / logo.width;
        ctx.globalAlpha = 0.5; // Transparencia para la marca de agua
        ctx.drawImage(logo, canvas.width - logoW - 40, canvas.height - logoH - 40, logoW, logoH);

        // Descargar la imagen resultante
        const link = document.createElement('a');
        link.download = `MauroRios_Render_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    screenshotBtn?.addEventListener('click', takeScreenshot);

    closeModal?.addEventListener('click', () => {
        modal3D.classList.remove('active');
        modalContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    });

    // --- Cargar Imagen de Hero ---
    db.collection('configuracion').doc('hero').get().then((doc) => {
        if (doc.exists && doc.data().url) {
            heroContainer.innerHTML = `<img src="${doc.data().url}" alt="Portafolio web profesional de Mauro Rios con enfoque en 3D y frontend" style="max-width:100%; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.3));">`;
        } else {
            console.log("Aviso: No se encontró el documento 'configuracion/hero' o no tiene URL.");
        }
    });

    // --- Cargar Proyectos desde Firebase ---
    const loadProjects = async () => {
        const snapshot = await db.collection('proyectos').orderBy('fecha', 'desc').get();
        projectsGrid.innerHTML = ''; // Limpiar grid
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const card = document.createElement('article');
            card.className = 'project-card';
            card.dataset.category = data.categoria;
            card.style.cursor = (data.archivoUrl || data.externalLink) ? 'pointer' : 'default';
            card.dataset.search = `${data.titulo} ${data.descripcion} ${(data.tags || []).join(' ')}`.toLowerCase();
            
            card.innerHTML = `
                <div class="thumb" data-kind="${data.categoria}" style="background-image: url('${data.portadaUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center; background-origin: content-box;"></div>
                <div class="project-body">
                    <h3>${data.titulo}</h3>
                    <p>${data.descripcion}</p>
                    <div class="project-footer">
                        ${(data.tags || []).filter(tag => tag.trim() !== "").map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                    </div>
                </div>`;
            projectsGrid.appendChild(card);

            // Si tiene archivo 3D, habilitar visor
            if (data.archivoUrl) {
                card.addEventListener('click', () => openViewer(data.archivoUrl));
            } else if (data.externalLink) {
                card.addEventListener('click', () => window.open(data.externalLink, '_blank'));
            }
        });

        if (snapshot.empty) {
            projectsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5;">No hay proyectos publicados aún.</p>';
        }
    };

    // --- Navegación Móvil ---
    menuBtn?.addEventListener('click', () => {
        nav.classList.toggle('mobile-open');
        menuBtn.textContent = nav.classList.contains('mobile-open') ? '✕' : '☰';
    });

    // Cerrar menú al hacer click fuera
    document.addEventListener('click', (e) => {
        if (window.innerWidth > 860) return;
        if (!nav.contains(e.target)) {
        nav.classList.remove('mobile-open');
        menuBtn.textContent = '☰';
        }
    });

    // --- Filtros y Búsqueda ---
    const updateProjects = () => {
        const activeFilter = document.querySelector('.chip.is-active')?.dataset.filter ?? 'all';
        const query = searchInput.value.trim().toLowerCase();
        const cards = document.querySelectorAll('.project-card');

        cards.forEach((card) => {
        const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
        const matchesSearch = !query || card.dataset.search.toLowerCase().includes(query);
        
        card.style.display = matchesFilter && matchesSearch ? 'flex' : 'none';
        });
    };

    filters?.addEventListener('click', (e) => {
        const btn = e.target.closest('.chip');
        if (!btn) return;

        document.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('is-active'));
        btn.classList.add('is-active');
        updateProjects();
    });

    searchInput?.addEventListener('input', updateProjects);

    // Inicializar carga
    loadProjects();

    // Evitar que el form de búsqueda refresque la página
    document.querySelector('.search')?.addEventListener('submit', (e) => e.preventDefault());

    // --- Formulario de Contacto ---
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // Generamos los caracteres especiales y emojis mediante sus códigos únicos (Unicode/CodePoint)
        // Esto evita que el archivo se rompa si no está guardado en UTF-8.
        const saludo = "\u00A1Hola!"; 
        const emojiMano = String.fromCodePoint(0x1F44B); // 👋
        const text = `${saludo} ${emojiMano} Soy ${name}\n${message}`;
        
        // Codificar el mensaje para la URL
        const encodedText = encodeURIComponent(text);
        
        // Usamos api.whatsapp.com, que tiene una gestión de caracteres más robusta que wa.me
        const whatsappUrl = `https://api.whatsapp.com/send?phone=573168666075&text=${encodedText}`;
        
        // Usamos location.href para una mejor experiencia en dispositivos móviles
        window.location.href = whatsappUrl;
    });

    // --- Manejo del Preloader ---
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('hidden');
            document.body.classList.remove('loading');
        }
    });
});