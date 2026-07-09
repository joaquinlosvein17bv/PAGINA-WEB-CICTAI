const API_URL = '';
//hola
let codigoValidado = false;
let ejeSeleccionadoActual = '';
let currentVoucherCode = '';
let ejesCictai = [];

// Variables para el flujo de verificación → certificado
let verificacionDni = '';
let verificacionNombre = '';

function toggleFlujosParticipacion() {
    const select = document.getElementById('mainParticipacionSelect');
    const flujosPonencia = document.querySelectorAll('.flujo-ponencia');
    const flujosGeneral = document.querySelectorAll('.flujo-general');
    const formularioTech = document.getElementById('formularioInformacion');
    const inputCodigo = document.getElementById('inputCodigo');
    const modalidadGeneral = document.getElementById('inputModalidad');
    const modalidadPonente = document.getElementById('inputModalidadPonente');

    flujosPonencia.forEach(el => el.classList.add('d-none'));
    flujosGeneral.forEach(el => el.classList.add('d-none'));

    if (formularioTech) formularioTech.classList.add('d-none');
    codigoValidado = false;

    if (select.value === 'ponente' || select.value === 'panelista') {
        flujosPonencia.forEach(el => el.classList.remove('d-none'));

        if (inputCodigo) {
            inputCodigo.value = '';
            inputCodigo.disabled = false;
        }

        if (modalidadPonente) {
            modalidadPonente.disabled = false;
            modalidadPonente.value = select.value === 'ponente' ? 'presencial' : 'virtual';
        }

        if (modalidadGeneral) {
            modalidadGeneral.value = '';
            modalidadGeneral.disabled = false;
        }
    } else if (select.value === 'general') {
        flujosGeneral.forEach(el => el.classList.remove('d-none'));

        if (inputCodigo) {
            inputCodigo.value = '';
            inputCodigo.disabled = false;
        }
        const errorMsg = document.getElementById('errorValidacion');
        if (errorMsg) errorMsg.classList.add('d-none');

        if (modalidadGeneral) {
            modalidadGeneral.value = '';
            modalidadGeneral.disabled = false;
        }

        currentVoucherCode = '';
    }
}

async function validarCodigoOTIC() {
    const codigo = document.getElementById('inputCodigo').value.trim();
    const mensajeError = document.getElementById('errorValidacion');
    const seccionPonente = document.getElementById('formularioInformacion');

    if (!codigo) {
        showToast('⚠️ Ingresa un código OTIC', 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/validate-otic`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Código inválido');
        }

        codigoValidado = true;
        mensajeError.classList.add('d-none');
        seccionPonente.classList.remove('d-none');
        document.getElementById('inputCodigo').disabled = true;
        showToast('✅ Código de OTIC validado con éxito.', 'success');
    } catch (e) {
        codigoValidado = false;
        mensajeError.classList.remove('d-none');
        mensajeError.querySelector('span').textContent = e.message || 'El código ingresado no es válido.';
        showToast('❌ ' + (e.message || 'Código no válido'), 'error');
    }
}

async function renderEjes() {
    const contenedor = document.getElementById('grid-ejes');
    if (!contenedor) return;

    try {
        const res = await fetch(`${API_URL}/ejes-tematicos`);
        const data = await res.json();
        ejesCictai = data.ejes;
    } catch {
        ejesCictai = [
            { id: '', nombre: 'Ciencias Físicas y Tecnologías Nucleares Aplicadas', icono: 'fa-atom' },
            { id: '', nombre: 'Ciencias de los Materiales y Nanotecnología', icono: 'fa-cubes' },
            { id: '', nombre: 'Ingeniería Biomédica, Ciencias de la Salud y Tecnologías Médicas', icono: 'fa-heartbeat' },
            { id: '', nombre: 'Ingeniería, Energía y Tecnologías para la Sostenibilidad', icono: 'fa-solar-panel' },
            { id: '', nombre: 'Instrumentación Científica, Sensores y Metrología', icono: 'fa-microchip' },
            { id: '', nombre: 'Ciencia de Datos, Modelado y Simulación en Ingeniería', icono: 'fa-chart-line' },
            { id: '', nombre: 'Ingeniería Ambiental, Gestión de Riesgos y Seguridad Tecnológica', icono: 'fa-leaf' },
            { id: '', nombre: 'Educación Científica, Formación en Ingeniería y Divulgación', icono: 'fa-graduation-cap' },
        ];
    }

    ejesCictai.forEach((eje, index) => {
        const col = document.createElement('div');
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12 reveal';
        col.innerHTML = `
            <div class="card-eje" onclick="abrirModalPonencia('${eje.nombre}')" style="cursor: pointer;">
                <span class="eje-number">EJE ${String(index + 1).padStart(2, '0')}</span>
                <div class="eje-icon"><i class="fa-solid ${eje.icono}"></i></div>
                <span class="eje-name">${eje.nombre}</span>
                <div class="eje-hover-text mt-3" style="font-size:0.75rem; color:var(--untels-gold); opacity:0; transition:0.3s; font-weight:700;">
                    <i class="fa-solid fa-download me-1"></i>Ver Artículos
                </div>
            </div>
        `;
        contenedor.appendChild(col);
    });
}

async function poblarSelectEjes() {
    const select = document.getElementById('selectEje');
    if (!select) return;

    try {
        const res = await fetch(`${API_URL}/ejes-tematicos`);
        const data = await res.json();
        (data.ejes || []).forEach(eje => {
            const opcion = document.createElement('option');
            opcion.value = eje.id;
            opcion.innerText = eje.nombre;
            select.appendChild(opcion);
        });
    } catch {
        showToast('⚠️ No se pudieron cargar los ejes temáticos', 'warning');
    }
}

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

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });

                const navCollapse = document.getElementById('navbarNav');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });
}

function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CICTAI-2026-';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function initForm() {
    const form = document.getElementById('formCictai');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre = document.getElementById('inputNombre').value.trim();
        const email = document.getElementById('inputEmail').value.trim();
        const dni = document.getElementById('inputDni')?.value.trim() || undefined;
        const univ = document.getElementById('inputUniv').value.trim();
        const participacion = document.getElementById('mainParticipacionSelect').value;
        const modalidad = document.getElementById('inputModalidad').value;
        const codigoOtic = document.getElementById('inputCodigo')?.value.trim() || undefined;

        if (participacion === 'ponente' && !codigoValidado) {
            showToast('⚠️ Primero debes validar tu código OTIC.', 'warning');
            return;
        }

        if (!currentVoucherCode) {
            currentVoucherCode = generateVoucherCode();
        }

        const btn = document.getElementById('btnSubmit');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Registrando...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    email,
                    dni,
                    universidad: univ || undefined,
                    participacion,
                    modalidad,
                    voucherCode: currentVoucherCode,
                    codigoOtic: codigoOtic || undefined,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al registrar');
            }

            const data = await res.json();

            localStorage.setItem('cictai_user', JSON.stringify(data.user));
            actualizarNavbarUser();

            document.getElementById('sectionRegistroBody').classList.add('d-none');
            document.getElementById('checkRegistro').classList.remove('d-none');

            const validacionSection = document.getElementById('validacion');
            if (validacionSection) {
                validacionSection.style.display = 'block';
                setTimeout(() => initScrollReveal(), 300);
            }

            showToast(`✅ ¡Registro exitoso! Tu código: ${currentVoucherCode}`, 'success');

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.color = '';
                currentVoucherCode = '';
            }, 4000);
        } catch (e) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            showToast('❌ ' + (e.message || 'Error de conexión con el servidor'), 'error');
        }
    });
}

async function initValidation() {
    const form = document.getElementById('formValidacion');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('valEmail').value.trim();
        const codigo = document.getElementById('valCodigo').value.trim().toUpperCase();
        const resultDiv = document.getElementById('validacionResult');
        const btn = document.getElementById('btnValidar');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Validando...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            resultDiv.style.display = 'block';

            if (res.ok) {
                // Guardar en localStorage para persistencia
                localStorage.setItem('cictai_user', JSON.stringify(data.user));
                actualizarNavbarUser();

                resultDiv.innerHTML = `
                    <div class="alert alert-success" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-check me-2"></i>
                        <strong>¡Bienvenido/a, ${data.user.nombre}!</strong><br>
                        <span style="font-size:0.85rem;">Tu inscripción como <strong>${data.user.participacion}</strong> ha sido verificada. Ya puedes acceder a los recursos del evento.</span>
                    </div>`;
                showToast('✅ ¡Validación exitosa! Bienvenido/a al CICTAI 2026.', 'success');
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-xmark me-2"></i>
                        <strong>${data.message || 'Validación fallida.'}</strong><br>
                        <span style="font-size:0.85rem;">El correo, contraseña o código de comprobante no coinciden.</span>
                    </div>`;
                showToast('❌ ' + (data.message || 'Datos incorrectos'), 'error');
            }
        } catch (e) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="alert alert-danger" style="border-radius: var(--radius-sm);">
                    <i class="fa-solid fa-circle-xmark me-2"></i>
                    <strong>Error de conexión.</strong><br>
                    <span style="font-size:0.85rem;">No se pudo conectar con el servidor.</span>
                </div>`;
            showToast('❌ Error de conexión con el servidor.', 'error');
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

function mostrarCertificado() {
    // Ir directamente al flujo de certificado sin verificación de asistencia
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCertificadoPago'));
    modal.show();
}

function proseguirACertificado() {
    // Cerrar modal de verificación
    const modalVerif = bootstrap.Modal.getInstance(document.getElementById('modalVerificacionAsistencia'));
    if (modalVerif) modalVerif.hide();

    // Abrir modal de pasos de certificado
    const modalPago = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCertificadoPago'));
    modalPago.show();
}

function abrirModalRegistrarBoucher() {
    // Cerrar modal de pasos de certificado
    const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalCertificadoPago'));
    if (modalPago) modalPago.hide();

    // Resetear el formulario
    const form = document.getElementById('formRegistrarBoucher');
    if (form) form.reset();

    // Ocultar resultado previo
    const resultado = document.getElementById('boucherResultado');
    if (resultado) {
        resultado.classList.add('d-none');
        resultado.innerHTML = '';
        resultado.className = 'd-none mb-3';
    }

    // Restaurar botón
    const btn = document.getElementById('btnGuardarBoucher');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-save me-2"></i>GUARDAR';
    }

    // Abrir modal de registro de boucher
    const modalBoucher = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRegistrarBoucher'));
    modalBoucher.show();
}

async function guardarBoucher(e) {
    e.preventDefault();

    const nombre = document.getElementById('boucherNombre').value.trim();
    const dni = document.getElementById('boucherDni').value.trim();
    const codigo = document.getElementById('boucherCodigo').value.trim();
    const fileInput = document.getElementById('boucherFile');
    const file = fileInput?.files?.[0];
    const resultado = document.getElementById('boucherResultado');
    const btn = document.getElementById('btnGuardarBoucher');

    if (!nombre || !dni || !codigo) {
        showToast('⚠️ Completá todos los campos obligatorios.', 'warning');
        return;
    }

    if (!/^\d{8}$/.test(dni)) {
        showToast('⚠️ El DNI debe tener exactamente 8 dígitos.', 'warning');
        return;
    }

    if (!file) {
        showToast('⚠️ Seleccioná el archivo PDF del boucher.', 'warning');
        return;
    }

    if (file.type !== 'application/pdf') {
        showToast('⚠️ El archivo debe ser un PDF.', 'warning');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        showToast('⚠️ El archivo no puede superar los 5 MB.', 'warning');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Guardando...';

    try {
        const formData = new FormData();
        formData.append('dni', dni);
        formData.append('nombre', nombre);
        formData.append('codigoBoucher', codigo);
        formData.append('file', file);

        const res = await fetch(`${API_URL}/auth/registrar-boucher`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Error al guardar el boucher');
        }

        resultado.classList.remove('d-none');
        resultado.className = 'mb-3 alert alert-success text-center';
        resultado.style.borderRadius = 'var(--radius-sm)';
        resultado.style.padding = '12px 16px';
        resultado.innerHTML = `
            <i class="fa-solid fa-circle-check me-2"></i>
            <strong>¡Boucher registrado correctamente!</strong><br>
            <span style="font-size:0.85rem;">${data.message || 'Ya podés obtener tu certificado.'}</span>
        `;

        showToast('✅ Boucher registrado con éxito.', 'success');
        btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>¡REGISTRADO!';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';

        // Limpiar el file input
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalRegistrarBoucher'));
            if (modal) modal.hide();
            btn.innerHTML = '<i class="fa-solid fa-save me-2"></i>GUARDAR';
            btn.style.background = '';
            btn.style.color = '';
            btn.disabled = false;
        }, 3000);
    } catch (e) {
        resultado.classList.remove('d-none');
        resultado.className = 'mb-3 alert alert-danger text-center';
        resultado.style.borderRadius = 'var(--radius-sm)';
        resultado.style.padding = '12px 16px';
        resultado.innerHTML = `
            <i class="fa-solid fa-circle-xmark me-2"></i>
            <strong>Error</strong><br>
            <span style="font-size:0.85rem;">${e.message || 'No se pudo guardar el boucher.'}</span>
        `;
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-save me-2"></i>GUARDAR';
        showToast('❌ ' + (e.message || 'Error al guardar el boucher'), 'error');
    }
}

function showToast(message, type = 'info') {
    const existing = document.querySelector('.cictai-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `cictai-toast cictai-toast-${type}`;
    toast.innerHTML = message;

    const colors = {
        success: { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32' },
        warning: { bg: '#fff8e1', border: '#ffc107', color: '#e65100' },
        error: { bg: '#fce4ec', border: '#f44336', color: '#c62828' },
        info: { bg: '#e3f2fd', border: '#2196f3', color: '#1565c0' }
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

// ============ LOGIN MODAL (Navbar) ============
function abrirModalLogin() {
    const resultDiv = document.getElementById('loginModalResult');
    if (resultDiv) {
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalLogin'));
    modal.show();
}

function initLoginModal() {
    const form = document.getElementById('formLoginModal');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const resultDiv = document.getElementById('loginModalResult');
        const btn = document.getElementById('btnLoginModal');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Ingresando...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('cictai_user', JSON.stringify(data.user));

                resultDiv.innerHTML = `
                    <div class="alert alert-success" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-check me-2"></i>
                        <strong>¡Bienvenido/a, ${data.user.nombre}!</strong>
                    </div>`;
                resultDiv.style.display = 'block';

                showToast(`✅ ¡Bienvenido/a, ${data.user.nombre}!`, 'success');
                actualizarNavbarUser();

                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
                    if (modal) modal.hide();
                }, 1500);
            } else {
                resultDiv.innerHTML = `
                    <div class="alert alert-danger" style="border-radius: var(--radius-sm);">
                        <i class="fa-solid fa-circle-xmark me-2"></i>
                        <strong>${data.message || 'Credenciales inválidas.'}</strong><br>
                        <span style="font-size:0.85rem;">Verifica tus datos e intenta de nuevo.</span>
                    </div>`;
                resultDiv.style.display = 'block';
                showToast('❌ ' + (data.message || 'Credenciales inválidas'), 'error');
            }
        } catch (e) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div class="alert alert-danger" style="border-radius: var(--radius-sm);">
                    <i class="fa-solid fa-circle-xmark me-2"></i>
                    <strong>Error de conexión.</strong><br>
                    <span style="font-size:0.85rem;">No se pudo conectar con el servidor.</span>
                </div>`;
            showToast('❌ Error de conexión con el servidor.', 'error');
        }

        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

function actualizarNavbarUser() {
    const userData = JSON.parse(localStorage.getItem('cictai_user'));
    const btnIngresar = document.getElementById('btnIngresar');
    const btnRegistrarse = document.getElementById('btnRegistrarse');
    const dropdownUsuario = document.getElementById('dropdownUsuario');
    const navbarUserName = document.getElementById('navbarUserName');

    if (!btnIngresar || !btnRegistrarse || !dropdownUsuario || !navbarUserName) return;

    if (userData && userData.nombre) {
        btnRegistrarse.classList.add('d-none');
        btnIngresar.classList.add('d-none');
        dropdownUsuario.classList.remove('d-none');
        navbarUserName.textContent = userData.nombre;
    } else {
        btnRegistrarse.classList.remove('d-none');
        btnIngresar.classList.remove('d-none');
        dropdownUsuario.classList.add('d-none');
    }
}

function logout() {
    localStorage.removeItem('cictai_user');
    actualizarNavbarUser();
    showToast('👋 Sesión cerrada.', 'info');
}

function abrirModalPonencia(nombreEje) {
    ejeSeleccionadoActual = nombreEje;
    document.getElementById('ejeSeleccionadoText').innerHTML = `<i class="fa-solid fa-layer-group me-2"></i>Eje Temático: ${nombreEje}`;

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEjePonencia'));
    modal.show();
}

async function descargarCompendioEje() {
    if (!ejeSeleccionadoActual) return;

    showToast('⏳ Cargando datos del servidor...', 'info');

    try {
        const res = await fetch(`${API_URL}/ponencias`);
        const data = await res.json();
        const todas = data.ponencias || [];
        const ponenciasDelEje = todas.filter(p => p.ejeTematico?.nombre === ejeSeleccionadoActual);

        generarPDFCompendio(ejeSeleccionadoActual, ponenciasDelEje);
    } catch {
        showToast('❌ Error al cargar datos del servidor', 'error');
    }
}

async function descargarCompendioGeneral() {
    const userData = JSON.parse(localStorage.getItem('cictai_user'));
    if (!userData || (userData.participacion !== 'ponente' && userData.participacion !== 'panelista')) {
        showToast('🔒 Solo ponentes y panelistas pueden descargar el Compendio General.', 'warning');
        return;
    }

    showToast('⏳ Cargando datos del servidor...', 'info');

    try {
        const res = await fetch(`${API_URL}/ponencias`);
        const data = await res.json();
        const ponencias = data.ponencias || [];

        setTimeout(() => {
            if (!window.jspdf) {
                showToast('❌ Error: No se pudo cargar la librería PDF.', 'error');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const margin = 20;
            let cursorY = 50;

            // --- HEADER ---
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(0, 43, 91);
            doc.text("I CONGRESO INTERNACIONAL", pageWidth / 2, cursorY, { align: "center" });
            cursorY += 12;
            doc.text("CICTAI 2026", pageWidth / 2, cursorY, { align: "center" });
            cursorY += 25;

            doc.setFontSize(16);
            doc.setTextColor(80, 80, 80);
            doc.text("COMPENDIO OFICIAL DE ARTÍCULOS", pageWidth / 2, cursorY, { align: "center" });
            cursorY += 35;

            // --- SPLIT BY ROLE ---
            const ponentes = ponencias.filter(p => p.user?.participacion === 'ponente');
            const panelistas = ponencias.filter(p => p.user?.participacion === 'panelista');

            if (ponentes.length === 0 && panelistas.length === 0) {
                doc.setFont("helvetica", "italic");
                doc.setFontSize(12);
                doc.setTextColor(100, 100, 100);
                doc.text("Aún no hay artículos registrados en el sistema.", pageWidth / 2, cursorY, { align: "center" });
                doc.save("Compendio_Oficial_CICTAI2026.pdf");
                showToast('✅ Compendio generado (Vacío).', 'success');
                return;
            }

            // --- HELPER: group ponencias by eje ---
            function groupByAxis(arr) {
                const grupos = {};
                arr.forEach(p => {
                    const eje = p.ejeTematico?.nombre || 'Sin eje';
                    if (!grupos[eje]) grupos[eje] = [];
                    grupos[eje].push(p);
                });
                return grupos;
            }

            // --- HELPER: render a full ponencia card ---
            function renderPonenciaCard(p) {
                doc.addPage();
                cursorY = 20;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(13);
                doc.setTextColor(0, 0, 0);
                const ejeHeader = doc.splitTextToSize(`Eje Temático: ${(p.ejeTematico?.nombre || 'Sin eje').toUpperCase()}`, pageWidth - margin * 2);
                doc.text(ejeHeader, margin, cursorY);
                cursorY += (ejeHeader.length * 5);

                doc.setLineWidth(0.5);
                doc.setDrawColor(0, 0, 0);
                doc.line(margin, cursorY, pageWidth - margin, cursorY);
                cursorY += 10;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                const titleLines = doc.splitTextToSize(p.titulo, pageWidth - margin * 2);
                doc.text(titleLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (titleLines.length * 6) + 4;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                const autorLines = doc.splitTextToSize(p.autores, pageWidth - margin * 2);
                doc.text(autorLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (autorLines.length * 5) + 2;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                const afilLines = doc.splitTextToSize(p.afiliacion || '', pageWidth - margin * 2);
                doc.text(afilLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (afilLines.length * 4) + 10;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const abstractLines = doc.splitTextToSize(p.resumen || '', pageWidth - margin * 2);
                doc.text(abstractLines, margin, cursorY, { align: "justify", maxWidth: pageWidth - margin * 2 });
                cursorY += (abstractLines.length * 4) + 8;

                doc.setFont("helvetica", "bold");
                doc.text("Palabras Claves : ", margin, cursorY);
                doc.setFont("helvetica", "normal");
                const kwText = p.palabrasClave || '';
                const kwX = margin + doc.getTextWidth("Palabras Claves : ");
                const kwMaxWidth = pageWidth - kwX - margin;
                const kwLines = doc.splitTextToSize(kwText, kwMaxWidth);
                kwLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.text(line, kwX, cursorY);
                    } else {
                        cursorY += 5;
                        if (cursorY > 280) { doc.addPage(); cursorY = 20; }
                        doc.text(line, margin, cursorY);
                    }
                });
                cursorY += 8;

                doc.setFont("helvetica", "bold");
                doc.text("*Correspondiente autor : ", margin, cursorY);
                doc.setFont("helvetica", "normal");
                const caText = p.correo || '';
                const caX = margin + doc.getTextWidth("*Correspondiente autor : ");
                const caMaxWidth = pageWidth - caX - margin;
                const caLines = doc.splitTextToSize(caText, caMaxWidth);
                caLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.text(line, caX, cursorY);
                    } else {
                        cursorY += 5;
                        if (cursorY > 280) { doc.addPage(); cursorY = 20; }
                        doc.text(line, margin, cursorY);
                    }
                });
                cursorY += 10;

                doc.setFont("helvetica", "bold");
                doc.text("Referencias :", margin, cursorY);
                cursorY += 6;

                doc.setFont("helvetica", "normal");
                const refsArray = (p.referencias || '').split('\n').filter(r => r.trim() !== '');
                refsArray.forEach(ref => {
                    const refLines = doc.splitTextToSize(ref.trim(), pageWidth - margin * 2);
                    if (cursorY + (refLines.length * 4) > 280) {
                        doc.addPage();
                        cursorY = 20;
                    }
                    doc.text(refLines, margin, cursorY);
                    cursorY += (refLines.length * 4) + 2;
                });
            }

            // --- HELPER: render a role section (Lista de... + ponencias directo) ---
            function renderRoleSection(roleTitle, roleLabel, items) {
                if (items.length === 0) return;

                const grupos = groupByAxis(items);

                // --- Section header page ---
                doc.addPage();
                cursorY = 30;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(22);
                doc.setTextColor(0, 43, 91);
                const spacedTitle = roleTitle.split('').join(' ');
                doc.text(spacedTitle, pageWidth / 2, cursorY, { align: "center" });
                cursorY += 22;

                doc.setFontSize(14);
                doc.setTextColor(80, 80, 80);
                doc.text(`Lista de ${roleLabel}`, pageWidth / 2, cursorY, { align: "center" });
                cursorY += 14;

                // Horizontal line divider
                doc.setLineWidth(0.8);
                doc.setDrawColor(0, 43, 91);
                doc.line(margin, cursorY, pageWidth - margin, cursorY);
                cursorY += 16;

                // --- Full ponencia cards directly ---
                Object.keys(grupos).forEach(eje => {
                    grupos[eje].forEach(p => {
                        renderPonenciaCard(p);
                    });
                });
            }

            // --- PONENTES SECTION ---
            renderRoleSection("PONENTES", "Ponentes", ponentes);

            // --- PANELISTAS SECTION ---
            renderRoleSection("PANELISTAS", "Panelistas", panelistas);

            doc.save("Compendio_Oficial_CICTAI2026.pdf");
            showToast('✅ Compendio Oficial generado con éxito.', 'success');
        }, 500);
    } catch {
        showToast('❌ Error al cargar datos del servidor', 'error');
    }
}

function generarPDFCompendio(nombreEje, ponencias) {
    setTimeout(() => {
        if (!window.jspdf) {
            showToast('❌ Error: No se pudo cargar la librería PDF.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 43, 91);
        doc.text("I CONGRESO INTERNACIONAL CICTAI 2026", pageWidth / 2, cursorY, { align: "center" });
        cursorY += 8;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("COMPENDIO OFICIAL DE ARTÍCULOS", pageWidth / 2, cursorY, { align: "center" });
        cursorY += 15;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        const ejeLines = doc.splitTextToSize(`EJE TEMÁTICO: ${nombreEje.toUpperCase()}`, pageWidth - margin * 2);
        doc.text(ejeLines, margin, cursorY);
        cursorY += (ejeLines.length * 7) + 5;

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;

        if (ponencias.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Total de artículos aprobados en este eje: ${ponencias.length}`, margin, cursorY);
            cursorY += 15;

            ponencias.forEach((p, i) => {
                if (i > 0) {
                    doc.addPage();
                    cursorY = 20;
                }

                doc.setLineWidth(0.5);
                doc.setDrawColor(0, 0, 0);
                doc.line(margin, cursorY, pageWidth - margin, cursorY);
                cursorY += 10;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                const titleLines = doc.splitTextToSize(p.titulo, pageWidth - margin * 2);
                doc.text(titleLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (titleLines.length * 6) + 4;

                doc.setFont("helvetica", "bold");
                doc.setFontSize(11);
                const autorLines = doc.splitTextToSize(p.autores, pageWidth - margin * 2);
                doc.text(autorLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (autorLines.length * 5) + 2;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                const afilLines = doc.splitTextToSize(p.afiliacion || '', pageWidth - margin * 2);
                doc.text(afilLines, pageWidth / 2, cursorY, { align: "center" });
                cursorY += (afilLines.length * 4) + 10;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                const abstractLines = doc.splitTextToSize(p.resumen || '', pageWidth - margin * 2);
                doc.text(abstractLines, margin, cursorY, { align: "justify", maxWidth: pageWidth - margin * 2 });
                cursorY += (abstractLines.length * 4) + 8;

                doc.setFont("helvetica", "bold");
                doc.text("Palabras Claves : ", margin, cursorY);
                doc.setFont("helvetica", "normal");
                const kwText = p.palabrasClave || '';
                const kwX = margin + doc.getTextWidth("Palabras Claves : ");
                const kwMaxWidth = pageWidth - kwX - margin;
                const kwLines = doc.splitTextToSize(kwText, kwMaxWidth);
                kwLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.text(line, kwX, cursorY);
                    } else {
                        cursorY += 5;
                        if (cursorY > 280) { doc.addPage(); cursorY = 20; }
                        doc.text(line, margin, cursorY);
                    }
                });
                cursorY += 8;

                doc.setFont("helvetica", "bold");
                doc.text("*Correspondiente autor : ", margin, cursorY);
                doc.setFont("helvetica", "normal");
                const caText = p.correo || '';
                const caX = margin + doc.getTextWidth("*Correspondiente autor : ");
                const caMaxWidth = pageWidth - caX - margin;
                const caLines = doc.splitTextToSize(caText, caMaxWidth);
                caLines.forEach((line, idx) => {
                    if (idx === 0) {
                        doc.text(line, caX, cursorY);
                    } else {
                        cursorY += 5;
                        if (cursorY > 280) { doc.addPage(); cursorY = 20; }
                        doc.text(line, margin, cursorY);
                    }
                });
                cursorY += 10;

                doc.setFont("helvetica", "bold");
                doc.text("Referencias :", margin, cursorY);
                cursorY += 6;

                doc.setFont("helvetica", "normal");
                const refsArray = (p.referencias || '').split('\n').filter(r => r.trim() !== '');
                refsArray.forEach(ref => {
                    const refLines = doc.splitTextToSize(ref.trim(), pageWidth - margin * 2);
                    if (cursorY + (refLines.length * 4) > 280) {
                        doc.addPage();
                        cursorY = 20;
                    }
                    doc.text(refLines, margin, cursorY);
                    cursorY += (refLines.length * 4) + 2;
                });
            });

            if (cursorY > 270) {
                doc.addPage();
                cursorY = 20;
            }
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("* Nota: Estos artículos están en proceso de revisión por el comité científico.", margin, cursorY);
        } else {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            const msg = "Actualmente no hay artículos registrados en este eje.\n\nEl compendio oficial con los artículos aprobados por el comité científico estará disponible a partir del 20 de junio de 2026.";
            const msgLines = doc.splitTextToSize(msg, pageWidth - margin * 2);
            doc.text(msgLines, margin, cursorY);
        }

        const nombreArchivo = nombreEje.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        doc.save(`compendio_${nombreArchivo}_CICTAI2026.pdf`);

        showToast('✅ PDF estructurado generado con éxito.', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('modalEjePonencia'));
        if (modal) modal.hide();
    }, 500);
}

function mostrarSeccionTecnica() {
    const nombre = document.getElementById('inputNombrePonente').value.trim();
    const email = document.getElementById('inputEmailPonente').value.trim();
    const univ = document.getElementById('inputUnivPonente').value.trim();

    if (!nombre || !email || !univ) {
        showToast('⚠️ Completa todos los campos obligatorios del Registro Personal.', 'warning');
        return;
    }

    document.getElementById('btnContinuar').classList.add('d-none');
    document.getElementById('seccionTecnica').classList.remove('d-none');
    document.getElementById('seccionTecnica').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function guardarTodo() {
    const nombre = document.getElementById('inputNombrePonente').value.trim();
    const email = document.getElementById('inputEmailPonente').value.trim();
    const univ = document.getElementById('inputUnivPonente').value.trim();
    const hojaVida = document.getElementById('inputHojaVida').value.trim();
    const codigoOtic = document.getElementById('inputCodigo').value.trim();

    const titulo = document.getElementById('tituloPonencia').value.trim();
    const autores = document.getElementById('autoresPonencia').value.trim();
    const afiliacion = document.getElementById('afiliacionPonencia').value.trim();
    const correo = document.getElementById('correoPonencia').value.trim();
    const ejeId = document.getElementById('selectEje').value;
    const palabrasClave = document.getElementById('palabrasClavePonencia').value.trim();
    const resumen = document.getElementById('resumenPonencia').value.trim();
    const referencias = document.getElementById('referenciasPonencia').value.trim();

    if (!nombre || !email || !univ) {
        showToast('⚠️ Completa todos los campos del Registro Personal.', 'warning');
        return;
    }

    if (!titulo || !autores || !correo || !ejeId || !palabrasClave || !resumen) {
        showToast('⚠️ Completa todos los campos obligatorios de la Información Técnica.', 'warning');
        return;
    }

    const wordsCount = resumen.split(/\s+/).filter(Boolean).length;
    if (wordsCount > 300) {
        showToast('⚠️ El resumen no puede superar las 300 palabras.', 'warning');
        return;
    }

    const btn = document.querySelector('#seccionTecnica .btn-gold');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Guardando...';
    btn.disabled = true;

    try {
        const registerRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre,
                email,
                dni: document.getElementById('inputDniPonente')?.value.trim() || undefined,
                universidad: univ || undefined,
                participacion: document.getElementById('mainParticipacionSelect').value,
                modalidad: document.getElementById('inputModalidadPonente').value,
                codigoOtic: codigoOtic || undefined,
                hojaDeVida: hojaVida || undefined,
            }),
        });

        if (!registerRes.ok) {
            const err = await registerRes.json();
            throw new Error(err.message || 'Error al registrar usuario');
        }

        const registerData = await registerRes.json();

        localStorage.setItem('cictai_user', JSON.stringify(registerData.user));
        actualizarNavbarUser();

        const userId = registerData.user.id;

        const ponenciaRes = await fetch(`${API_URL}/ponencias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                titulo,
                autores,
                afiliacion: afiliacion || undefined,
                ejeTematicoId: ejeId,
                correo,
                palabrasClave,
                resumen,
                referencias: referencias || undefined,
            }),
        });

        if (!ponenciaRes.ok) {
            const err = await ponenciaRes.json();
            throw new Error(err.message || 'Error al guardar ponencia');
        }

        generarPDFPonencia(titulo, autores, afiliacion, correo, palabrasClave, resumen, referencias);

        // Descargar plantilla PPT según el rol
        const rol = document.getElementById('mainParticipacionSelect').value;
        descargarPlantilla(rol);

        // Auto-generar certificado para ponente
        try {
            await fetch(`${API_URL}/certificados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: registerData.user.id,
                    codigoPago: currentVoucherCode || generateVoucherCode(),
                    metodoPago: 'exonerado',
                }),
            });
        } catch (_e) {
            // No bloquear si falla la generación automática
        }

        document.getElementById('seccionPersonal').classList.add('d-none');
        document.getElementById('seccionTecnica').classList.add('d-none');
        const btnContinuar = document.getElementById('btnContinuar');
        if (btnContinuar) btnContinuar.classList.add('d-none');

        btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>¡Registro Completo!';
        btn.style.background = '#28a745';
        btn.style.color = '#fff';
        btn.style.borderRadius = '50px';

        showToast('✅ ¡Registro exitoso! Usuario, ponencia y certificado generados.', 'success');

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
            btn.style.background = '';
            btn.style.color = '';
            document.getElementById('inputNombrePonente').value = '';
            document.getElementById('inputEmailPonente').value = '';
            document.getElementById('inputUnivPonente').value = '';
            document.getElementById('inputHojaVida').value = '';
            document.getElementById('tituloPonencia').value = '';
            document.getElementById('autoresPonencia').value = '';
            document.getElementById('afiliacionPonencia').value = '';
            document.getElementById('correoPonencia').value = '';
            document.getElementById('selectEje').value = '';
            document.getElementById('palabrasClavePonencia').value = '';
            document.getElementById('resumenPonencia').value = '';
            document.getElementById('referenciasPonencia').value = '';
            document.getElementById('seccionTecnica').classList.add('d-none');
            document.getElementById('btnContinuar').classList.remove('d-none');
            document.getElementById('inputCodigo').disabled = false;
            document.getElementById('inputCodigo').value = '';
            codigoValidado = false;
            document.getElementById('seccionPersonal').classList.remove('d-none');
        }, 5000);
    } catch (e) {
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast('❌ ' + (e.message || 'Error al guardar todo'), 'error');
    }
}

function generarPDFPonencia(titulo, autores, afiliacion, correo, palabrasClave, resumen, referencias) {
    setTimeout(() => {
        if (!window.jspdf) {
            showToast('❌ Error: No se pudo cargar la librería PDF.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let cursorY = 20;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 43, 91);
        doc.text("I CONGRESO INTERNACIONAL CICTAI 2026", pageWidth / 2, cursorY, { align: "center" });
        cursorY += 8;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("PONENCIA REGISTRADA", pageWidth / 2, cursorY, { align: "center" });
        cursorY += 15;

        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 12;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        const titleLines = doc.splitTextToSize(titulo, pageWidth - margin * 2);
        doc.text(titleLines, pageWidth / 2, cursorY, { align: "center" });
        cursorY += (titleLines.length * 6) + 6;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const autorLines = doc.splitTextToSize(autores, pageWidth - margin * 2);
        doc.text(autorLines, pageWidth / 2, cursorY, { align: "center" });
        cursorY += (autorLines.length * 5) + 3;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const afilLines = doc.splitTextToSize(afiliacion || '', pageWidth - margin * 2);
        doc.text(afilLines, pageWidth / 2, cursorY, { align: "center" });
        cursorY += (afilLines.length * 4) + 12;

        doc.setLineWidth(0.3);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 43, 91);
        doc.text("RESUMEN", margin, cursorY);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const abstractLines = doc.splitTextToSize(resumen, pageWidth - margin * 2);
        doc.text(abstractLines, margin, cursorY, { align: "justify", maxWidth: pageWidth - margin * 2 });
        cursorY += (abstractLines.length * 4) + 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 43, 91);
        doc.text("PALABRAS CLAVES", margin, cursorY);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(palabrasClave, margin, cursorY);
        cursorY += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 43, 91);
        doc.text("CORRESPONDIENTE", margin, cursorY);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(correo, margin, cursorY);
        cursorY += 10;

        doc.setLineWidth(0.3);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 8;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 43, 91);
        doc.text("REFERENCIAS", margin, cursorY);
        cursorY += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const refsArray = (referencias || '').split('\n').filter(r => r.trim() !== '');
        refsArray.forEach(ref => {
            const refLines = doc.splitTextToSize(ref.trim(), pageWidth - margin * 2);
            if (cursorY + (refLines.length * 4) > 280) {
                doc.addPage();
                cursorY = 20;
            }
            doc.text(refLines, margin, cursorY);
            cursorY += (refLines.length * 4) + 2;
        });

        const nombreArchivo = titulo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().substring(0, 50);
        doc.save(`ponencia_${nombreArchivo}_CICTAI2026.pdf`);

        showToast('✅ PDF de la ponencia descargado con éxito.', 'success');
    }, 500);
}

function descargarPlantilla(rol) {
    const archivos = {
        ponente: 'plantillas/ponente.pptx',
        panelista: 'plantillas/panelista.pptx',
    };

    const ruta = archivos[rol];
    if (!ruta) return;

    const link = document.createElement('a');
    link.href = ruta;
    link.download = rol === 'ponente' ? 'Plantilla_Ponente_CICTAI2026.pptx' : 'Plantilla_Panelista_CICTAI2026.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`📥 Plantilla para ${rol} descargada.`, 'success');
}

async function initCertificadoForm() {
    const form = document.getElementById('formCertificado');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Procesando...';
        btn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/certificados`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: '00000000-0000-0000-0000-000000000000',
                    codigoPago: document.getElementById('certCodigo').value,
                    metodoPago: 'pagalo',
                }),
            });

            if (!res.ok) throw new Error('Error al confirmar certificado');

            document.getElementById('sectionCertificadoBody').classList.add('d-none');
            document.getElementById('checkCertificado').classList.remove('d-none');

            showToast('✅ ¡Certificado confirmado con éxito!', 'success');
            btn.innerHTML = originalText;
            btn.disabled = false;
        } catch {
            showToast('❌ Error al confirmar certificado', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function initBoucherForm() {
    const form = document.getElementById('formRegistrarBoucher');
    if (!form) return;
    form.addEventListener('submit', guardarBoucher);
}

function initResumenLimit() {
    const textarea = document.getElementById('resumenPonencia');
    const label = document.getElementById('wordCountLabel');
    if (!textarea || !label) return;

    let warningShown = false;

    function checkLimit() {
        const text = textarea.value;
        const words = text.trim().split(/\s+/).filter(Boolean);
        const count = words.length;

        if (count > 300) {
            textarea.value = words.slice(0, 300).join(' ');
            label.textContent = '300 / 300 palabras';
            label.classList.remove('text-muted');
            label.classList.add('text-danger', 'fw-bold');
            if (!warningShown) {
                showToast('⚠️ El resumen no puede superar las 300 palabras.', 'warning');
                warningShown = true;
                setTimeout(() => { warningShown = false; }, 3000);
            }
        } else {
            label.textContent = `${count} / 300 palabras`;
            label.classList.remove('text-danger', 'fw-bold');
            label.classList.add('text-muted');
        }
    }

    textarea.addEventListener('input', checkLimit);
}

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        renderEjes(),
        poblarSelectEjes(),
    ]);
    initCountdown();
    initScrollReveal();
    initNavbarScroll();
    initActiveNav();
    initSmoothScroll();
    initForm();
    initValidation();
    initCertificadoForm();
    initBoucherForm();
    initLoginModal();
    initResumenLimit();
    actualizarNavbarUser();

    // Auto-scroll a la sección de registro al cargar la página
    setTimeout(() => {
        const registroSection = document.getElementById('registro');
        if (registroSection) {
            registroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 800);
});
