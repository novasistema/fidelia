# Fidelia · Club de puntos para comercios

Una sola app para todos los comercios. Cada comercio tiene su espacio, su link y su equipo.

| Dirección | Para quién |
|---|---|
| `/` | Presentación de Fidelia |
| `/c/<comercio>` | Clientes del comercio: se registran, ven puntos, canjean, sorteos y encuestas. `?qr=CODIGO` suma puntos, `?ref=CODIGO` registra un referido |
| `/admin` | Dueños y cajeros del comercio (cada uno con su email) |
| `/creador` | Creador de la plataforma: alta de comercios, suscripciones y suspensiones |

## Cómo funciona la seguridad

- Los navegadores **solo leen** de Firestore. Toda escritura pasa por `api/fidelia.ts` (Vercel), que verifica la sesión y el rol, y hace cada operación de puntos en una transacción.
- Los clientes entran con **Google** o con un **link por email** (sin contraseñas).
- Los QR de puntos son de **un solo uso** y vencen.
- La suspensión de un comercio solo la cambia el creador.
- Reglas en `firestore.rules`. Lógica del servidor en `api/_lib/core.ts`, con pruebas en `scripts/test-core.ts` (`npx tsx scripts/test-core.ts`).

## Puesta en marcha (una sola vez)

### 1. Firebase · Authentication
En la consola de Firebase del proyecto `gen-lang-client-0721502809` → **Authentication → Sign-in method**:
- Activar **Google**.
- Activar **Correo electrónico/contraseña** y dentro, **Vínculo de correo electrónico (acceso sin contraseña)**.

En **Authentication → Settings → Authorized domains** agregar el dominio de Vercel (por ejemplo `fidelia-seven.vercel.app`) y el dominio propio, si hay uno.

### 2. Firebase · Reglas de Firestore
**Firestore Database** → elegir la base `ai-studio-tiendadepuntosfi-…` → **Reglas** → pegar el contenido de `firestore.rules` → **Publicar**.

### 3. Firebase · Credencial del servidor
**Configuración del proyecto (⚙️) → Cuentas de servicio → Generar nueva clave privada**. Se descarga un archivo `.json`.

### 4. Vercel · Variable de entorno
En el proyecto de Vercel → **Settings → Environment Variables**:
- `FIREBASE_SERVICE_ACCOUNT` = el contenido completo del `.json` del paso 3.

Después, **Redeploy**.

### 5. Darte de alta como creador
1. Entrá a `/creador` e iniciá sesión con tu cuenta. Te va a mostrar "Acceso restringido" con tu UID.
2. En Firestore, en la misma base, creá la colección `platformAdmins` con un documento cuyo ID sea ese UID (un campo cualquiera, ej. `email`).
3. Recargá `/creador`.

### 6. Primer comercio
En `/creador` → **Nuevo comercio** → nombre, link y email del dueño. El dueño entra en `/admin` con ese email y configura premios, niveles y su equipo.

## Contacto en la pantalla de suspensión
Completar WhatsApp y email en `src/lib/platform.ts`.
