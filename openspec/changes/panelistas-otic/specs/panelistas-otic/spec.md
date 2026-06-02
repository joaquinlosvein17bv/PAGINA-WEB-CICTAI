# Delta: Panelistas + OTIC Email Binding

## ADDED Requirements

### Requirement: Panelista role in registration selector

The main participation selector MUST offer 3 options: `"Soy Ponente Oficial"`, `"Soy Panelista"`, `"Soy Asistente"`.

| # | Option value | Label |
|---|-------------|-------|
| 1 | `ponente` | Soy Ponente Oficial |
| 2 | `panelista` | Soy Panelista |
| 3 | `general` | Soy Asistente |

#### Scenario: Selector shows three roles on page load

- GIVEN a user opens the registration section
- WHEN the main participation selector renders
- THEN it MUST contain options `ponente`, `panelista`, and `general`
- AND `panelista` MUST be labeled "Soy Panelista"

#### Scenario: Existing general users unchanged

- GIVEN a previously registered user with `participacion = 'general'`
- WHEN the user logs in
- THEN their role MUST display as "Asistente"
- AND their existing data MUST NOT be modified

### Requirement: Panelista multi-step registration flow

Panelists MUST follow the same multi-step flow as ponentes: OTIC validation → personal info → technical ponencia info.

#### Scenario: Panelista validates OTIC code

- GIVEN a user selects "Soy Panelista"
- WHEN they enter a valid OTIC code with matching email
- THEN step 1 (OTIC validation) succeeds
- AND step 2 (personal info form) appears

#### Scenario: Panelista completes registration

- GIVEN a panelista has validated an OTIC code
- WHEN they submit personal info + technical ponencia info
- THEN `POST /auth/register` MUST receive `participacion: 'panelista'`
- AND `POST /ponencias` MUST create an associated ponencia
- AND the OTIC code MUST be marked as used

#### Scenario: Panelista technical form validation

- GIVEN a panelista is on the technical info step
- WHEN they submit with missing required fields (title, authors, eje, keywords, abstract)
- THEN the system MUST reject the submission
- AND display validation errors

### Requirement: Compendium PDF with panelistas section

The compendium PDF MUST restructure content into two sections: PONENTES first, then PANELISTAS, each grouped by eje temático.

```
CICTAI 2026 header
├── PONENTES section
│   ├── Eje 1 → ponencias
│   ├── Eje 2 → ponencias
│   └── ...
├── PANELISTAS section
│   ├── Eje 1 → ponencias
│   ├── Eje 2 → ponencias
│   └── ...
```

#### Scenario: Compendium includes both groups

- GIVEN ponencias exist for both ponentes and panelistas
- WHEN `descargarCompendioGeneral()` executes
- THEN the PDF MUST contain a "PONENTES" heading followed by grouped axes
- AND a "PANELISTAS" heading followed by grouped axes

#### Scenario: Compendium access for panelistas

- GIVEN a logged-in panelista user
- WHEN they click "Descargar PDF" in Recursos
- THEN they MUST be able to download the compendium
- (Previously: only ponentes could access)

#### Scenario: Empty section handling

- GIVEN no ponencias exist for panelistas
- WHEN the compendium generates
- THEN the PANELISTAS section MUST show "No hay artículos de panelistas registrados"
- AND the PONENTES section MUST render normally

### Requirement: OTIC code-email binding

The `OticCode` entity MUST include an `email` column. `POST /auth/validate-otic` MUST accept `{ codigo, email }` and validate both.

#### Scenario: Code exists with matching email

- GIVEN an OTIC code `3ESSM2026` assigned to `sespinozas@unmsm.edu.pe`
- WHEN a POST request sends `{ codigo: "3ESSM2026", email: "sespinozas@unmsm.edu.pe" }`
- THEN the API MUST return `200` with success message
- AND the code MUST NOT be marked as used yet

#### Scenario: Code exists with wrong email

- GIVEN an OTIC code `3ESSM2026` assigned to `sespinozas@unmsm.edu.pe`
- WHEN a POST request sends `{ codigo: "3ESSM2026", email: "wrong@email.com" }`
- THEN the API MUST return `400` error
- AND the error message MUST state "Este código está asignado a otro correo"

#### Scenario: Code does not exist

- GIVEN a non-existent code `FAKE123`
- WHEN a POST request sends `{ codigo: "FAKE123", email: "test@test.com" }`
- THEN the API MUST return `404` error

#### Scenario: Code already used

- GIVEN an OTIC code already marked as `usado = true`
- WHEN a POST request sends a valid code + its matching email
- THEN the API MUST return `409` (Conflict) error

### Requirement: Preloaded OTIC codes with emails

The seed MUST insert 12 OTIC codes with their assigned emails into the database.

| Code | Email |
|------|-------|
| 3ESSM2026 | sespinozas@unmsm.edu.pe |
| 4SE2026 | enrique.solano@kipu-quantum.com |
| 5THW2026 | wth@waremlab.com |
| 6PJR2026 | ropaja@hotmail.com |
| 7PBAM2026 | apoma@ippt.pan.pl |
| 8CCD2026 | david.correa@gmail.com |
| 9CCD2026 | carlos.prado@autonoma.pe |
| 10PQR2026 | rpillaca@techeraperu.com |
| 11RPN2026 | nramos@testcontrol.com.pe |
| 12MNJO2026 | oremazz@gmail.com |
| 13PSDG2026 | dpachecos@unsa.edu.pe |
| 19VGA2026 | araceli.venegas-gomez@qureca.com |

#### Scenario: Seed inserts all codes with emails

- GIVEN a fresh database
- WHEN the seed script runs
- THEN the `otic_codes` table MUST contain all 12 codes above
- AND each code MUST have its `email` column populated
- AND each code MUST have `usado = false`

#### Scenario: Existing codes not duplicated

- GIVEN a database that already has some OTIC codes
- WHEN the seed script runs
- THEN existing codes MUST NOT be duplicated
- AND new codes MUST be inserted if missing

## MODIFIED Requirements

### Requirement: Ponente can select virtual modality

(Previously: ponente modalidad select was disabled and forced to `presencial`)

The modalidad select for ponentes MUST NOT be disabled. Ponentes MUST be able to choose between `"presencial"` and `"virtual"`.

#### Scenario: Ponente selects virtual modality

- GIVEN a user selects "Soy Ponente Oficial"
- WHEN the registration form renders
- THEN the modalidad select MUST be enabled
- AND MUST offer options "Presencial" and "Virtual"
- AND `presencial` MUST be the default

#### Scenario: Panelista defaults to virtual

- GIVEN a user selects "Soy Panelista"
- WHEN the registration form renders
- THEN `modalidad` MUST be sent as `'virtual'` in the registration payload

## REMOVED Requirements

### Requirement: Buggy flujo-general toggle on OTIC validation

(Reason: The `validarCodigoOTIC()` function incorrectly reveals the general registration form after OTIC validation, which is only relevant for ponente/panelista flows.)

The line `document.querySelectorAll('.flujo-general').forEach(el => el.classList.remove('d-none'));` in `validarCodigoOTIC()` MUST be removed.

#### Scenario: Only speaker form appears after validation

- GIVEN a user has entered a valid OTIC code
- WHEN `validarCodigoOTIC()` executes
- THEN only the `#formularioInformacion` section MUST become visible
- AND elements with class `.flujo-general` MUST remain hidden
