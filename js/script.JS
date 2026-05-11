/* ============================================
   CICTAI 2026 — UNTELS
   JavaScript — Interactividad Premium
   ============================================ */

// ── Ejes Temáticos (datos con iconos) ──
const ejesCictai = [
    { nombre: "Ciencias Físicas y Tecnologías Nucleares Aplicadas", icono: "fa-atom" },
    { nombre: "Ciencias de los Materiales y Nanotecnología", icono: "fa-cubes" },
    { nombre: "Ingeniería Biomédica y Ciencias de la Salud", icono: "fa-heartbeat" },
    { nombre: "Ingeniería, Energía y Tecnologías para la Sostenibilidad", icono: "fa-solar-panel" },
    { nombre: "Instrumentación Científica, Sensores y Metrología", icono: "fa-microchip" },
    { nombre: "Ciencia de Datos, Modelado y Simulación", icono: "fa-chart-line" },
    { nombre: "Ingeniería Ambiental y Gestión de Riesgos", icono: "fa-leaf" },
    { nombre: "Educación Científica y Formación en Ingeniería", icono: "fa-graduation-cap" }
];

// ── Render Ejes ──
function renderEjes() {
    const contenedor = document.getElementById('grid-ejes');
    if (!contenedor) return;

    ejesCictai.forEach((eje, index) => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12 reveal';
        col.innerHTML = `
            <div class="card-eje">
                <span class="eje-number">EJE ${String(index + 1).padStart(2, '0')}</span>
                <div class="eje-icon"><i class="fa-solid ${eje.icono}"></i></div>
                <span class="eje-name">${eje.nombre}</span>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

// ── Countdown Timer ──
function initCountdown() {
    const targetDate = new Date('2026-06-25T08:00:00-05:00').getTime();

    function update() {
        const now = Date.now();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('cd-days').textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-minutes').textContent = '00';
            document.getElementById('cd-seconds').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// ── Scroll Reveal (IntersectionObserver) ──
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('active');
                }, i * 100);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
}

// ── Navbar scroll effect ──
function initNavbarScroll() {
    const navbar = document.getElementById('mainNav');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ── Active nav link on scroll ──
function initActiveNav() {
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ── Smooth Scroll ──
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                // Close mobile menu
                const navCollapse = document.getElementById('navbarNav');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });
}

// ── Form handling ──
function initForm() {
    const form = document.getElementById('formCictai');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = document.getElementById('btnSubmit');
        const originalText = btn.innerHTML;

        const nombre = document.getElementById('inputNombre').value;
        const email = document.getElementById('inputEmail').value;
        const password = document.getElementById('inputPassword').value;
        const participacion = document.getElementById('inputTipo').value;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Enviando...';
        btn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password, participacion })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al registrar');
            }

            const data = await response.json();
            console.log('Registro exitoso:', data);

            btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>¡Registro Exitoso!';
            btn.classList.remove('btn-gold');
            btn.style.background = '#28a745';
            btn.style.color = '#fff';
            form.reset();
        } catch (error) {
            console.error('Error:', error);
            btn.innerHTML = '<i class="fa-solid fa-times me-2"></i>Error: ' + error.message;
            btn.classList.remove('btn-gold');
            btn.style.background = '#dc3545';
            btn.style.color = '#fff';
        } finally {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.classList.add('btn-gold');
                btn.style.background = '';
                btn.style.color = '';
            }, 3000);
        }
    });
}

// ── Init all ──
document.addEventListener('DOMContentLoaded', () => {
    renderEjes();
    initCountdown();
    initScrollReveal();
    initNavbarScroll();
    initActiveNav();
    initSmoothScroll();
    initForm();
});
