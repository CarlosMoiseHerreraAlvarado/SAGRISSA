# 🚀 SAGRISA PWA - Guía de Pruebas Locales

¡Hola! Sigue esta guía paso a paso para probar en tu computadora todo lo que hemos construido (Vistas móviles responsivas, Estados Offline, Login con Roles, y Skeleton Loaders).

## 1. ¿Cómo encender la aplicación localmente?

Si el entorno falla o está apagado, abre tu terminal (línea de comandos) en la carpeta `D:\SAGRISSA\SAGRISSA\frontend` y ejecuta:

```bash
npm run dev
```

El sistema te responderá con algo parecido a:
`➜  Local:   http://localhost:5173/`

## 2. Probar en "Modo Dispositivo Móvil" (Crucial para PWA)

Nuestra aplicación es "Mobile-First", pero se adapta a PC. Para probar ambos "modos" haz lo siguiente:

1. Ingresa a `http://localhost:5173/` desde **Google Chrome** o **Microsoft Edge**.
2. Presiona la tecla **F12** en tu teclado (esto abrirá las Herramientas de Desarrollador).
3. Busca el ícono que parece un teléfono junto a una tablet 📱💻 (o presiona `Ctrl + Shift + M`).
4. En la parte de arriba (donde dice 'Dimensiones'), elige un teléfono como **iPhone 12 Pro** o **Samsung Galaxy S20**.
5. ¡Listo! Recarga la página (`F5`) y verás la aplicación interactiva comportándose exactamente como si estuvieras en el celular (la barra de navegación bajará al fondo de la pantalla).
6. Si desactivas el ícono 📱💻 (o haces la pantalla grande), verás cómo el diseño muta al exquisito Modo Escritorio de forma nativa.

## 3. ¿Cómo probar los "distintos perfiles" (RBAC)?

Hemos diseñado la pantalla de Inicio de Sesión (`/login`) para facilitar tu control de calidad:
- **Pestañas:** En la cabecera del login, cambia el botón entre "Vendedor" y "Cliente".
- Ve a los inputs de texto y escríbeles cualquier cosa.
- Da clic en los botones grandes para simular los llamados.
- **Auto-inyección:** La plataforma te inyectará automáticamente un perfil gerencial simulado para que no tengas que conectarlo a la base de datos momentáneamente. Al entrar a `/app/home`, explora el menú para verificar cómo el sistema "sabe" qué mostrarte dependiendo de la pestaña de prueba que elegiste.

## 4. ¿Cómo probar el aviso de "Caída de Internet"?

Nuestra aplicación tiene un Banner Offline avanzado para proteger al usuario. Para forzar su aparición simulando una pérdida de red en tu computadora:
1. Con F12 abierto, busca la pestaña llamada **Red (Network)** en la ventana de código de la derecha.
2. Verás un selector que probablemente diga "Sin Limitaciones (No throttling)".
3. Haz clic allí y selecciona **Sin conexión (Offline)**.
4. Voltea a ver la aplicación de inmediato y el cintillo de PWA emergerá sin necesidad de recargar la ventana. (¡No olvides volver a seleccionarlo en "No throttling" para que sigan cargando los falsos llamados!)
