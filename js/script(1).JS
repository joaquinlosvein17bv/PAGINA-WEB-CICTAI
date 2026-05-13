/* ============================================
   CICTAI 2026 — UNTELS
   JavaScript — Interactividad Premium
   ============================================ */

// ── Simulated Database ──
const registeredUsers = [];

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
            <div class="card-eje" onclick="abrirModalPonencia('${eje.nombre}')" style="cursor: pointer;">
                <span class="eje-number">EJE ${String(index + 1).padStart(2, '0')}</span>
                <div class="eje-icon"><i class="fa-solid ${eje.icono}"></i></div>
                <span class="eje-name">${eje.nombre}</span>
                <div class="eje-hover-text mt-3" style="font-size:0.75rem; color:var(--untels-gold); opacity:0; transition:0.3s; font-weight:700;">
                    <i class="fa-solid fa-upload me-1"></i>Subir Ponencia
                </div>
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

// ── Generate Unique Voucher Code ──
function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CICTAI-2026-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ── Payment Forms Toggling ──
function togglePaymentForm(method) {
    const formPagalo = document.getElementById('formPagalo');
    
    if (method === 'pagalo') {
        formPagalo.style.display = formPagalo.style.display === 'none' ? 'block' : 'none';
    }
}

// ── Payment Processing (Simulated) ──
let paymentCompleted = false;
let currentVoucherCode = '';

function processPayment(method) {
    const tipo = document.getElementById('inputTipo').value;
    const email = document.getElementById('inputEmail').value;
    const nombre = document.getElementById('inputNombre').value;

    if (!email || !nombre) {
        showToast('⚠️ Por favor, completa tu nombre y correo antes de pagar.', 'warning');
        return;
    }

    let activeBtn;
    if (method === 'pagalo') activeBtn = document.getElementById('btnSubmitPagalo');

    if (!activeBtn) return;

    const originalHTML = activeBtn.innerHTML;

    // Disable buttons during processing
    document.getElementById('btnPagalo').disabled = true;
    activeBtn.disabled = true;

    activeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando...';

    // Simulate payment processing
    setTimeout(() => {
        paymentCompleted = true;
        currentVoucherCode = generateVoucherCode();

        // Show confirmation
        document.getElementById('paymentSection').style.display = 'none';
        document.getElementById('paymentConfirmation').style.display = 'block';
        document.getElementById('voucherCodeDisplay').textContent = currentVoucherCode;

        // Simulate sending email
        simulateEmail(email, nombre, currentVoucherCode);

        showToast('✅ ¡Pago exitoso! Se ha enviado un correo con tu voucher de confirmación.', 'success');
    }, 2500);
}

// ── Simulate Email Sending ──
function simulateEmail(email, nombre, code) {
    console.log('=== CORREO ELECTRÓNICO SIMULADO ===');
    console.log(`Para: ${email}`);
    console.log(`Asunto: Confirmación de Inscripción — CICTAI 2026`);
    console.log(`---`);
    console.log(`Estimado/a ${nombre},`);
    console.log(`Su inscripción al CICTAI 2026 ha sido confirmada.`);
    console.log(`Código de Validación: ${code}`);
    console.log(`Use este código para acceder a los recursos del evento.`);
    console.log('===================================');
}

// ── Toggle payment section based on participant type ──
function initPaymentToggle() {
    const tipoSelect = document.getElementById('inputTipo');
    if (!tipoSelect) return;

    tipoSelect.addEventListener('change', function () {
        const paymentSection = document.getElementById('paymentSection');
        if (!paymentSection) return;

        if (this.value === 'ponente') {
            paymentSection.style.display = 'none';
            paymentCompleted = true; // Ponentes don't need to pay
            currentVoucherCode = generateVoucherCode();
        } else {
            paymentSection.style.display = 'block';
            if (!paymentCompleted) {
                document.getElementById('paymentConfirmation').style.display = 'none';
            }
        }
    });
}

// ── Form handling (Sector 1) ──
function initForm() {
    const form = document.getElementById('formCictai');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('inputNombre').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const univ = document.getElementById('inputUniv').value.trim();
        const tipo = document.getElementById('inputTipo').value;
        const password = document.getElementById('inputPassword').value;
        const passwordConfirm = document.getElementById('inputPasswordConfirm').value;

        // Validate passwords match
        if (password !== passwordConfirm) {
            showToast('⚠️ Las contraseñas no coinciden.', 'warning');
            return;
        }

        // Check payment for non-ponentes
        if (tipo !== 'ponente' && !paymentCompleted) {
            showToast('⚠️ Debes completar el pago antes de enviar el registro.', 'warning');
            return;
        }

        // If ponente, generate voucher automatically
        if (tipo === 'ponente' && !currentVoucherCode) {
            currentVoucherCode = generateVoucherCode();
            simulateEmail(email, nombre, currentVoucherCode);
        }

        const btn = document.getElementById('btnSubmit');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Registrando...';
        btn.disabled = true;

        setTimeout(() => {
            // Save to simulated database
            registeredUsers.push({
                nombre, email, univ, tipo, password,
                voucherCode: currentVoucherCode,
                fecha: new Date().toISOString()
            });

            btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>¡Registro Exitoso!';
            btn.style.background = '#28a745';
            btn.style.color = '#fff';
            btn.style.borderRadius = '50px';

            // Show Sector 2 (Validation)
            const validacionSection = document.getElementById('validacion');
            if (validacionSection) {
                validacionSection.style.display = 'block';
                // Re-trigger reveal for newly visible elements
                setTimeout(() => initScrollReveal(), 300);
            }

            showToast(`✅ ¡Registro exitoso! Tu código: ${currentVoucherCode}`, 'success');

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.color = '';
                form.reset();
                // Reset payment state
                paymentCompleted = false;
                currentVoucherCode = '';
                const paymentSection = document.getElementById('paymentSection');
                const paymentConfirmation = document.getElementById('paymentConfirmation');
                if (paymentSection) paymentSection.style.display = 'block';
                if (paymentConfirmation) paymentConfirmation.style.display = 'none';
            }, 4000);
        }, 1500);
    });
}

// ── Validation Form (Sector 2) ──
function initValidation() {
    const form = document.getElementById('formValidacion');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = document.getElementById('valEmail').value.trim();
        const password = document.getElementById('valPassword').value;
        const codigo = document.getElementById('valCodigo').value.trim().toUpperCase();
        const resultDiv = document.getElementById('validacionResult');
        const btn = document.getElementById('btnValidar');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Validando...';
        btn.disabled = true;

        setTimeout(() => {
            // Search in simulated database
            const user = registeredUsers.find(u =>
                u.email.toLowerCase() === email.toLowerCase() &&
                u.password === password &&
                u.voucherCode === codigo
            );

            resultDiv.style.display = 'block';

            if (user) {
                resultDiv.innerHTML = `
                    <div class="alert alert-success" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-check me-2"></i>
                        <strong>¡Bienvenido/a, ${user.nombre}!</strong><br>
                        <span style="font-size:0.85rem;">Tu inscripción como <strong>${user.tipo}</strong> ha sido verificada. Ya puedes acceder a los recursos del evento.</span>
                    </div>`;
                showToast('✅ ¡Validación exitosa! Bienvenido/a al CICTAI 2026.', 'success');
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-xmark me-2"></i>
                        <strong>Validación fallida.</strong><br>
                        <span style="font-size:0.85rem;">El correo, contraseña o código de comprobante no coinciden. Verifica tus datos e intenta nuevamente.</span>
                    </div>`;
                showToast('❌ Datos incorrectos. Verifica e intenta de nuevo.', 'error');
            }

            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 1800);
    });
}

// ── Toast Notification System ──
function showToast(message, type = 'info') {
    // Remove existing toast
    const existing = document.querySelector('.cictai-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `cictai-toast cictai-toast-${type}`;
    toast.innerHTML = message;

    const colors = {
        success: { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32' },
        warning: { bg: '#fff8e1', border: '#ffc107', color: '#e65100' },
        error:   { bg: '#fce4ec', border: '#f44336', color: '#c62828' },
        info:    { bg: '#e3f2fd', border: '#2196f3', color: '#1565c0' }
    };

    const c = colors[type] || colors.info;
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; z-index: 9999;
        background: ${c.bg}; border-left: 5px solid ${c.border}; color: ${c.color};
        padding: 16px 24px; border-radius: 10px; font-weight: 600; font-size: 0.9rem;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15); max-width: 420px;
        animation: fadeInUp 0.4s ease-out; font-family: 'Inter', sans-serif;
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = '0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ── Modal de Ponencias (Ejes Temáticos) ──
function abrirModalPonencia(nombreEje) {
    document.getElementById('ejeSeleccionadoText').innerHTML = `<i class="fa-solid fa-layer-group me-2"></i>Eje Temático: ${nombreEje}`;
    document.getElementById('inputCodigoPonente').value = '';
    
    // Reiniciar pasos del modal
    document.getElementById('stepValidarCodigo').style.display = 'block';
    document.getElementById('stepFormularioPonencia').style.display = 'none';
    document.getElementById('stepExitoPonencia').style.display = 'none';
    
    const form = document.getElementById('formSubirPonencia');
    if (form) form.reset();

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEjePonencia'));
    modal.show();
}

function validarCodigoPonente(btn) {
    const codigo = document.getElementById('inputCodigoPonente').value.trim();
    
    if (codigo.length < 4) {
        showToast('⚠️ Ingresa un código privado válido.', 'warning');
        return;
    }
    
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> Validando...';
    btn.disabled = true;
    
    // Simulación de validación con API/Entidad
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Simulación: cualquier código > 3 letras funciona
        document.getElementById('stepValidarCodigo').style.display = 'none';
        document.getElementById('stepFormularioPonencia').style.display = 'block';
        showToast('✅ Código validado. Acceso concedido.', 'success');
    }, 1200);
}

function initPonenciaForm() {
    const form = document.getElementById('formSubirPonencia');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = document.getElementById('btnSubmitPonencia');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Enviando al comité...';
        btn.disabled = true;
        
        setTimeout(() => {
            document.getElementById('stepFormularioPonencia').style.display = 'none';
            document.getElementById('stepExitoPonencia').style.display = 'block';
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    });
}

// ── Formulario de Matrícula ──
function initMatriculaForm() {
    const form = document.getElementById('formMatricula');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando...';
        btn.disabled = true;
        
        setTimeout(() => {
            showToast('✅ ¡Matrícula confirmada con éxito!', 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
            form.reset();
        }, 1500);
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
    initPaymentToggle();
    initValidation();
    initPonenciaForm();
    initMatriculaForm();
});