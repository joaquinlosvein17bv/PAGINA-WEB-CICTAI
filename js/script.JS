const ejesCictai = [
    "Ciencias Físicas y Tecnologías Nucleares Aplicadas",
    "Ciencias de los Materiales y Nanotecnología",
    "Ingeniería Biomédica y Ciencias de la Salud",
    "Ingeniería, Energía y Tecnologías para la Sostenibilidad",
    "Instrumentación Científica, Sensores y Metrología",
    "Ciencia de Datos, Modelado y Simulación",
    "Ingeniería Ambiental y Gestión de Riesgos",
    "Educación Científica y Formación en Ingeniería"
];

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('grid-ejes');
    
    ejesCictai.forEach(eje => {
        const col = document.createElement('div');
        // Configuración para 4 columnas en PC (col-xl-3)
        col.className = 'col-xl-3 col-lg-4 col-md-6 col-12';
        col.innerHTML = `
            <div class="card-eje shadow-sm">
                <span class="small fw-bold">${eje.toUpperCase()}</span>
            </div>
        `;
        contenedor.appendChild(col);
    });
});

document.getElementById('formCictai').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'ENVIANDO...';

    try {
        const res = await fetch('http://localhost:3000/auth/register', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message?.[0] || data.message || 'Error al registrar');
        }

        alert(`¡Registro exitoso, ${data.user.nombre}! El comité CICTAI revisará tu solicitud.`);
        this.reset();
    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
});