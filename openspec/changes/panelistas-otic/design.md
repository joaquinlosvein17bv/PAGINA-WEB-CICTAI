# Design: Panelistas + OTIC Email Binding

## Technical Approach

Add `"panelista"` as a third participation role reusing the existing ponente registration flow (OTIC validation → personal info → technical ponencia → POST /auth/register + POST /ponencias). Backend requires two minimal changes: an `email` column on `OticCode` for code-email binding, and passing email through the validation chain. The compendium PDF is restructured client-side using the existing `user.participacion` field already returned by the ponencias endpoint. Spec refs: R1-R7.

## Architecture Decisions

### Decision: New participation role

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add enum validation on `participacion` | More explicit, but existing code accepts any string | **No change** — `participacion` is varchar(20), accept `'panelista'` as-is |
| Create new DB table for panelists | Overkill — same data shape as ponentes | **Reuse ponencia entity** — panelists also submit technical articles |

### Decision: OTIC email binding

| Option | Tradeoff | Decision |
|--------|----------|----------|
| New table `otic_code_emails` | Normalized but adds join | **Add `email` column to OticCode** — nullable, backwards-compatible |
| Validate email in frontend only | Insecure | **Validate server-side** in `OticCodesService.validate()` |

### Decision: Compendium PDF restructure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Backend endpoint returning grouped data | Cleaner but unnecessary — data already includes user | **Client-side grouping** — `p.user.participacion` already loaded by `findAll({ relations: ['user'] })` |
| Separate PDF per section | More files to manage | **Single PDF** with two sections (PONENTES then PANELISTAS) |

### Decision: Virtual modality for ponentes

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Keep modalidad disabled, add backend override | Confusing UX | **Remove disabled** from frontend select, send value from select in `guardarTodo()` |

## Data Flow

```
Browser                          NestJS Backend                PostgreSQL
  │                                  │                            │
  ├─ POST /auth/validate-otic ──────►│                            │
  │  { codigo, email }               ├─ oticCodesService.validate()─►
  │                                  │  checks code EXISTS         │
  │                                  │  checks email MATCHES       │
  │◄── 200 | 400/404/409 ────────────┤                            │
  │                                  │                            │
  ├─ POST /auth/register ───────────►│                            │
  │  { participacion: 'panelista',   ├─ usersService.create() ────►│
  │    modalidad, codigoOtic, ... }  ├─ oticCodesService.markAsUsed()►
  │                                  │                            │
  ├─ POST /ponencias ───────────────►│                            │
  │  { userId, titulo, autores,      ├─ ponenciaRepository.save()─►│
  │    ejeTematicoId, ... }          │                            │
  │◄── 201 ──────────────────────────┤                            │
  │                                  │                            │
  ├─ GET /ponencias ────────────────►│                            │
  │◄── { ponencias[] with user } ────┤  relations: ['user']       │
  │                                  │                            │
  └─ client-side grouping by         │                            │
     p.user.participacion            │                            │
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/otic-codes/entities/otic-code.entity.ts` | Modify | Add `@Column({ nullable: true }) email: string` |
| `src/auth/dto/validate-otic.dto.ts` | Modify | Add `@IsEmail() email: string` |
| `src/otic-codes/otic-codes.service.ts` | Modify | `validate()` accepts `{ codigo, email }`, checks email match |
| `src/auth/auth.service.ts` | Modify | `validateOtic()` passes email to `oticCodesService.validate()` |
| `src/seed.ts` | Modify | Add 12 codes with emails, skip-duplicate logic |
| `public/index.html` | Modify | 3 options in selector, label updates |
| `public/js/script.js` | Modify | `toggleFlujosParticipacion()`, `validarCodigoOTIC()`, `guardarTodo()`, `descargarCompendioGeneral()` |

## Interfaces / Contracts

### Modified: POST /auth/validate-otic

```typescript
// Request
{ "codigo": "3ESSM2026", "email": "sespinozas@unmsm.edu.pe" }
// Response 200: { message, codigo }
// Response 400: { message: "Este código está asignado a otro correo" }
// Response 404: { message: "El código OTIC no existe" }
// Response 409: { message: "El código OTIC ya fue usado" }
```

### Modified: guardarTodo() payload (for panelista)

```typescript
{
  participacion: 'panelista',           // was hardcoded 'ponente'
  modalidad: document.getElementById('inputModalidadPonente').value,  // was hardcoded 'presencial'
  // ... rest unchanged
}
```

### Compendium access (frontend guard)

```typescript
// descargarCompendioGeneral(): remove participacion !== 'ponente' guard
// Allow userData.participacion === 'ponente' || 'panelista'
// Group data: ponencias.filter(p => p.user.participacion === 'ponente') vs 'panelista'
```

## Testing Strategy

No test runner exists in the project. Testing will be manual verification per spec scenarios:

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Integration | Validate-otic with wrong email | curl POST /auth/validate-otic with wrong email → expect 400 |
| Integration | Panelista registration | curl POST /auth/register + /ponencias with `participacion: 'panelista'` → expect 201 |
| E2E | Full UI flow | Manual: select "Soy Panelista" → validate OTIC → personal info → technical → save |
| E2E | Compendium PDF | Manual: login as panelista → Descargar PDF → verify 2-section output |
| E2E | Virtual modality | Manual: select "Soy Ponente Oficial" → verify modalidad select is enabled |

## Migration / Rollout

1. **Schema**: `email` column on `otic_codes` is nullable — existing codes get NULL email and remain valid for any email (backwards-compatible).
2. **Seed**: Use `ON CONFLICT DO NOTHING` pattern (existing skip-duplicate logic) — safe to re-run.
3. **Rollback**: Git revert all files, keep the nullable `email` column (harmless).

## Open Questions

- None — all decisions resolved in spec and proposal.
