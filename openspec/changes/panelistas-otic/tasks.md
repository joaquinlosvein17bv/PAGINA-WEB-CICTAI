# Tasks: Panelistas + OTIC Email Binding

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400-550 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: Backend → PR 2: Frontend |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: entity, DTO, validation, auth, seed | PR 1 | Base to main; ~100-140 lines |
| 2 | Frontend: HTML selector, JS flow, PDF, bugfix, modalidad | PR 2 | Base to main; ~250-350 lines |

## Phase 1: Foundation (Backend)

- [x] 1.1 `src/otic-codes/entities/otic-code.entity.ts` — add `@Column({ nullable: true, type: 'varchar' }) email: string`
- [x] 1.2 `src/auth/dto/validate-otic.dto.ts` — add `@IsOptional() @IsEmail() email?: string`
- [x] 1.3 `src/seed.ts` — insert 12 OTIC codes with assigned emails, skip-duplicate logic, reference OticCode entity

## Phase 2: Core Backend Logic

- [x] 2.1 `src/otic-codes/otic-codes.service.ts` — modify `validate()` to accept `{ codigo, email }`, throw 400/404/409 on mismatch
- [x] 2.2 `src/auth/auth.service.ts` — pass email to `OticCodesService.validate()`, check email in `register()`

## Phase 3: Frontend

- [x] 3.1 `public/index.html` — 3 options in selector (`ponente`, `panelista`, `general`), label updates
- [x] 3.2 `public/js/script.js` — `toggleFlujosParticipacion()`: add panelista flow, remove disabled on modalidad select for ponentes
- [x] 3.3 `public/js/script.js` — `validarCodigoOTIC()`: pass email param, remove `.flujo-general` reveal (bugfix)
- [x] 3.4 `public/js/script.js` — `guardarTodo()`: send `participacion` & `modalidad` from select values (not hardcoded)
- [x] 3.5 `public/js/script.js` — `descargarCompendioGeneral()`: restructure PDF into PONENTES + PANELISTAS sections, remove participacion guard, add empty-section handling

## Phase 4: Manual Verification

- [ ] 4.1 Verify OTIC wrong email → 400 "Este código está asignado a otro correo"
- [ ] 4.2 Verify panelista full flow (OTIC → personal → ponencia → 201)
- [ ] 4.3 Verify compendium PDF includes PONENTES + PANELISTAS sections
- [ ] 4.4 Verify ponente can select virtual modality
- [ ] 4.5 Verify existing general users unchanged
