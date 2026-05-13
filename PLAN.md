# PLAN DE IMPLEMENTACIÓN — CICTAI 2026

## Fase 0: Corregir entidades existentes

**0.1** Agregar campo `universidad` a `User` entity y `RegisterDto`
**0.2** Agregar campo `voucherCode` a `User` entity (string, unique, nullable)
**0.3** Permitir `"ponente"` como valor en `participacion`
**0.4** Agregar campo `codigoOtic` (string, nullable) a `User` para registrar con qué código OTIC se validó el ponente

---

## Fase 1: Nuevas entidades / tablas

**1.1** `OticCode`
- id (uuid), codigo (string, unique), usado (boolean), createdAt

**1.2** `EjeTematico`
- id (uuid), nombre (string), icono (string)

**1.3** `Ponencia`
- id (uuid), userId (relación con User), titulo, autores, afiliacion, ejeTematicoId (FK), correo, palabrasClave, resumen, referencias, createdAt

**1.4** `Matricula`
- id (uuid), userId (FK), codigoPago, metodoPago, createdAt

---

## Fase 2: Nuevos endpoints en el backend

**2.1** `POST /auth/validate-otic`
- Recibe: `{ codigo: string }`
- Busca en tabla `otic_codes`, si existe y no está usado → lo marca como usado y retorna éxito
- Si no existe o ya está usado → error 400

**2.2** `POST /auth/login`
- Recibe: `{ email, password, voucherCode }`
- Busca user por email, verifica password con bcrypt, verifica voucherCode
- Retorna datos del usuario si todo coincide

**2.3** `POST /ponencias`
- Recibe: datos de la ponencia (titulo, autores, afiliacion, ejeTematicoId, correo, palabrasClave, resumen, referencias)
- Asocia al userId (recibido en el body)
- Guarda en DB

**2.4** `GET /ponencias`
- Retorna todas las ponencias con su eje temático y datos del autor
- El frontend usa esto para generar el compendio general ordenado por eje

**2.5** `GET /ponencias?ejeId=...`
- Filtra por eje temático específico

**2.6** `GET /ejes-tematicos`
- Retorna la lista de ejes temáticos desde la DB

**2.7** `POST /matricula`
- Recibe: userId, codigoPago, metodoPago
- Crea registro de matrícula

---

## Fase 3: Refactorizar `script.js` — conectar con API real

**3.1** Reemplazar `registeredUsers[]` local por `fetch()` a `POST /auth/register`
- Enviar: nombre, email, universidad, participacion, password, codigoOtic, voucherCode
- Si el flujo es "ponente" → `participacion: "ponente"` + `codigoOtic`

**3.2** Reemplazar `validarCodigoOTIC()` local por `fetch()` a `POST /auth/validate-otic`

**3.3** Reemplazar `initValidation()` local por `fetch()` a `POST /auth/login`

**3.4** Reemplazar `baseDeDatosPonencias[]` local + `generarArchivoLaTeX()` por `fetch()` a `POST /ponencias`

**3.5** Reemplazar `descargarCompendioGeneral()` y `descargarCompendioEje()` para que primero hagan `fetch()` a `GET /ponencias` con datos reales, y luego generen el PDF con jsPDF

**3.6** Reemplazar `initMatriculaForm()` local por `fetch()` a `POST /matricula`

**3.7** Agregar `fetch()` a `GET /ejes-tematicos` en `poblarSelectEjes()` y `renderEjes()` para que los ejes vengan de la DB

---

## Fase 4: Agregar envío de email real

**4.1** Instalar `nodemailer` y `@nestjs-modules/mailer`
**4.2** Crear `MailService` con método `sendVoucherEmail(email, nombre, voucherCode)`
**4.3** Llamar al `MailService` desde `AuthService.register()` después de crear el usuario
**4.4** En `.env` agregar configuración SMTP

---

## Fase 5: Ajustes en `script.js` para el flujo de ponente

**5.1** Cuando se selecciona "Soy Ponente Oficial" en `mainParticipacionSelect`:
- Auto-asignar `inputTipo` a `"ponente"` y bloquearlo (hoy tiene un bug: `initPaymentToggle()` busca `this.value === 'ponente'` pero ese select no contiene esa opción)

**5.2** Al registrarse como ponente:
- 1° Validar código OTIC contra el backend
- 2° Llenar formulario técnico
- 3° `generarArchivoLaTeX()` envía los datos via `POST /ponencias` Y abre Overleaf
- 4° Enviar el registro via `POST /auth/register`

---

## Fase 6: Seed de datos iniciales

**6.1** Crear script de seed que inserte:
- Códigos OTIC válidos: `["UNTELS2026", "OTIC-CICTAI", "PONENTE2026"]`
- Ejes temáticos: los 8 del array `ejesCictai`

---

## Fase 7: Probar el flujo completo

**7.1** Iniciar backend con `npm run start:dev`
**7.2** Abrir `index.html` en el navegador
**7.3** Probar registro como ponente (OTIC → formulario técnico → registro)
**7.4** Probar registro como asistente/panelista (pago → registro)
**7.5** Probar validación de acceso con credenciales + voucher
**7.6** Probar descarga de compendios (general y por eje)
**7.7** Verificar que los datos persisten en PostgreSQL
