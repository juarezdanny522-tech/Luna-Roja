# 🌙 Luna Roja · Economía Estudiantil

App web (PWA) para llevar el control de tu economía semanal como estudiante. Diseño oscuro con luna roja y siluetas negras, totalmente personalizable.

![Version](https://img.shields.io/badge/version-2.0.0-dc2626?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-dc2626?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-ready-dc2626?style=for-the-badge)

## ✨ Características

- 💰 **Registro diario** de gastos con categorías personalizables
- 📊 **Resumen semanal** automático (con tips y análisis)
- 🌙 **Diseño dark** profesional con luna roja y siluetas
- 🎨 **Totalmente personalizable**:
  - Tamaño de letra
  - Densidad/tamaño de la app
  - Color de acento (4 paletas)
  - Animaciones ON/OFF
  - Categorías personalizadas (agregar/editar/eliminar/ordenar)
- 💾 **Base de datos local** con `localStorage` (todo queda en tu dispositivo)
- 📥 **Exportar/Importar** datos en formato JSON
- 🏠 **Instalable como PWA** en Android e iOS
- 🌐 **Funciona offline** después de la primera carga
- 🇪🇸 **100% en español**

## 🚀 Cómo instalar

### 📱 En tu celular (recomendado)

#### Opción 1: GitHub Pages (gratis)
1. Haz un fork de este repositorio
2. Activa GitHub Pages en `Settings > Pages > Source: main branch`
3. Abre la URL que GitHub te da (algo como `https://tu-usuario.github.io/luna-roja/`)
4. Toca el menú del navegador → **"Añadir a pantalla de inicio"** o **"Instalar app"**

#### Opción 2: Localmente
```bash
# Con Python 3
python3 -m http.server 8000

# O con Node.js
npx serve
```

Luego abre `http://localhost:8000` en tu celular (que esté en la misma WiFi).

### 💻 En tu computadora
Solo abre `index.html` en cualquier navegador moderno (Chrome, Firefox, Safari, Edge).

## 📂 Estructura del proyecto

```
├── index.html          # Estructura HTML
├── styles.css          # Estilos con tema oscuro y luna roja
├── app.js              # Lógica completa de la aplicación
├── manifest.json       # Manifiesto PWA
├── sw.js               # Service Worker (modo offline)
├── icon-192.png        # Ícono 192x192
├── icon-512.png        # Ícono 512x512
├── README.md           # Este archivo
├── LICENSE             # Licencia MIT
└── .gitignore          # Archivos ignorados por Git
```

## 🛠️ Tecnologías

- **HTML5** semántico
- **CSS3** con variables personalizadas, glass-morphism, animaciones
- **JavaScript** vanilla (sin frameworks, sin dependencias)
- **PWA** (Progressive Web App) con Service Worker
- **LocalStorage** como base de datos local
- **SVG** para la luna y siluetas

## 🎨 Personalización

Desde el ícono ⚙️ en la esquina superior derecha puedes:

- Cambiar tu nombre
- Ajustar el presupuesto semanal
- Cambiar la moneda
- Modificar el **tamaño de letra** (Pequeño/Normal/Grande)
- Modificar la **densidad de la app** (Compacta/Normal/Cómoda)
- Elegir el **color de acento** (Rojo, Carmesí, Borgoña, Naranja)
- Activar/Desactivar animaciones
- **Agregar categorías personalizadas** con tu emoji y nombre
- **Editar/Eliminar/Reordenar** categorías personalizadas
- Exportar/Importar tus datos
- Ver la sección "Acerca de"

## 🔒 Privacidad

- ✅ Todos los datos se guardan **solo en tu dispositivo** (localStorage)
- ✅ Nada se envía a ningún servidor
- ✅ Funciona 100% offline después de instalar
- ✅ Puedes exportar/importar tus datos cuando quieras
- ✅ Puedes borrar todo cuando quieras

## 👨‍💻 Autor

**Danny Juarez** — Estudiante de primer año en Desarrollo de Software.

*"Esta aplicación nació de la necesidad de ayudar a estudiantes como yo a tomar el control de su economía semanal."*

## 📄 Licencia

MIT — Puedes usar, modificar y compartir libremente. Solo mantén el crédito al autor original.

## 🙏 Contribuir

¿Encontraste un bug? ¿Tienes una idea? ¡Abre un issue o haz un pull request!
Escribeme a mi Whatsapp para cualquier duda o sugerencia, estare encantado de conocer tus ambiciones
📷 Whatsapp: +503 7480-7084

---

Hecho con 🌙 y ❤️ para la comunidad estudiantil.
