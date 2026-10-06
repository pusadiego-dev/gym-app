# Gym App

**Abrir la app:** https://pusadiego-dev.github.io/gym-app/

Web app (PWA) para entrenar en el gimnasio. Funciona en Chrome o Safari en el iPhone, la tablet o el ordenador, y se puede añadir a la pantalla de inicio como una app. No necesita servidor: son archivos estáticos.

## Qué incluye

- **Perfil por formulario** (nivel, objetivo, cardio, días, tiempo, material, molestias, músculos a priorizar) que genera una rutina semanal.
- **Cardio**: sin cardio, como complemento, como prioridad (con 2 días de fuerza de mantenimiento) o solo cardio. Eliges las actividades (correr, caminar inclinado, bici, elíptica, remo, escaladora, natación, comba) y la rutina reparte sesiones suaves en zona 2 e intervalos (4×4, 10×1) según tu nivel, siguiendo OMS 2020, ACSM 2011 y el modelo polarizado. Se registran minutos, km, RPE y pulso, con temporizador de intervalos.
- **Rutinas predeterminadas** de principiante a atleta: cuerpo completo (2-3 días), torso/pierna (4), híbrida (5) y empuje/tirón/pierna (6). Se pueden editar: series, repeticiones, descansos, variantes y ejercicios.
- **Base científica**: volumen semanal por músculo (Schoenfeld 2017, Pelland 2024), frecuencia 2×/semana (Schoenfeld 2016), rangos de repeticiones (Schoenfeld 2021, ACSM 2009), RIR 0-3 (Refalo 2023) y descansos (Schoenfeld 2016). Las referencias completas están en Perfil.
- **Registro de entreno**: peso y repeticiones por serie, lo que hiciste la última vez y sugerencia de progresión (doble progresión).
- **Temporizadores**: descanso automático al marcar una serie (con sonido y vibración donde se permita), cronómetro de ejercicio y cuenta atrás para ejercicios por tiempo como la plancha.
- **Evolución**: 1RM estimado por ejercicio, series semanales por músculo frente al objetivo, peso corporal, récords e historial.
- **Objetivos y logros**: objetivos con barra de progreso (peso en un ejercicio, nº de entrenos, peso corporal o libre) y logros que añades tú.
- **Biblioteca**: 28 ejercicios y 66 variantes (máquina, peso libre, polea) y 8 actividades de cardio con animación SVG, pasos, errores comunes y consejo.
- **Sincronización con Google Drive** en una carpeta privada de la app (`appDataFolder`): la app no ve tus otros archivos y el archivo no aparece en tu Drive.
- **Personalización**: foto de perfil, 7 temas de color o uno propio (color principal y tono de fondo) y modo claro, oscuro o el del sistema. Se sincroniza con el resto de tus datos.
- **Funciona sin conexión** y guarda los datos en el dispositivo; copia de seguridad con exportar/importar.

## Activar la sincronización con Google (una sola vez, ~5 min)

1. Entra en https://console.cloud.google.com y crea un proyecto (por ejemplo "Gym App").
2. En **APIs y servicios → Biblioteca**, busca **Google Drive API** y pulsa **Habilitar**.
3. En **Google Auth Platform** (pantalla de consentimiento OAuth): tipo **Externo**, nombre "Gym App" y tu correo. En **Audiencia**, añade como **usuario de prueba** tu correo y el de cada persona con la que compartas la app (mientras la app esté en modo de prueba, Google solo deja entrar a esos correos, hasta 100).
4. En **Clientes → Crear cliente**: tipo **Aplicación web**. En **Orígenes de JavaScript autorizados** añade la dirección donde esté publicada la app, por ejemplo `https://TU-USUARIO.github.io`. No hace falta URI de redirección.
5. Copia el **ID de cliente** (termina en `.apps.googleusercontent.com`) y ponlo en `js/config.js` (así vale para todos los que usen la app) o pégalo en **Perfil → Sincronización con Google Drive** de cada dispositivo. Pulsa **Conectar con Google**.

Repite el paso de "Conectar" en cada dispositivo. El acceso de Google dura una hora; después, el indicador de arriba a la derecha pasa a "Sincronizar" y basta con tocarlo.

## Varias personas

Cada persona abre el mismo enlace en su móvil, crea su perfil desde cero y conecta **su propia** cuenta de Google. Los datos de cada uno van a su propio Drive y nadie ve los del otro. Si en un mismo dispositivo quieres cambiar de persona, usa **Perfil → Borrar datos de este dispositivo** antes de conectar otra cuenta.

## Publicarla (GitHub Pages)

Sube el contenido de esta carpeta a un repositorio y activa **Settings → Pages → Deploy from a branch → main / (root)**. La app quedará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`.

## Instalar en el iPhone

Abre la dirección en Safari o Chrome → botón **Compartir** → **Añadir a pantalla de inicio**.

## Probar en local

```
cd gym-app
python3 -m http.server 8000
```

y abre http://localhost:8000 (añade `http://localhost:8000` como origen autorizado si quieres probar Google en local).

## Estructura

- `index.html`, `css/styles.css`: interfaz.
- `js/app.js`: pantallas y eventos.
- `js/program.js`: generador de rutinas, progresión y referencias.
- `js/exercises.js`: biblioteca de ejercicios y poses de las animaciones.
- `js/cardio.js`: actividades de cardio, tipos de sesión e intervalos.
- `js/anim.js`: motor de animación SVG.
- `js/store.js`: datos locales y fusión al sincronizar.
- `js/drive.js`: Google Drive. `js/config.js`: ID de cliente opcional.
- `js/timer.js`: temporizadores. `sw.js`, `manifest.webmanifest`: modo app y sin conexión.

Esta app no sustituye el consejo médico.
