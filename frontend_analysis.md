# Análisis Frontend - Proyecto MaryClean

Este documento detalla la estructura, herramientas y diseño implementado exclusivamente en el **Frontend** del sistema MaryClean, omitiendo cualquier aspecto relacionado con el módulo de inventario.

## 1. Arquitectura y Control de Rutas (Vistas)

El proyecto utiliza **EJS (Embedded JavaScript)** como motor de plantillas, renderizado desde el servidor mediante Express. Las rutas están organizadas de forma modular en la carpeta `src/routes/` y las vistas en `src/views/`.

**Vistas principales contempladas:**
*   **Dashboard (`/`):** Vista principal (`dashboard.ejs`) que muestra los KPIs del día y resúmenes de clientes/servicios frecuentes.
*   **Dashboard Analítico (`/dashboard-analitico`):** Vista enfocada en gráficos y análisis de datos (`dashboard-analitico.ejs`). Trabaja en conjunto con Reportes.
*   **Registrar Pedido (`/registrar-pedido`):** Interfaz para la creación de nuevos pedidos (`registrar_pedido.ejs`), seleccionando clientes y servicios.
*   **Pedidos (`/pedidos`):** Listado general de pedidos (`pedidos.ejs`) con capacidad de ver detalles mediante modales y cambiar estados.
*   **Clientes (`/clientes`):** Gestión del directorio de clientes (`clientes.ejs`), manejado a través de su propia ruta modular `clientes.routes.js`.
*   **Reportes (`/reportes`):** Visualización de métricas históricas y tablas analíticas (`reportes.ejs`).
*   **Configuración (`/configuracion`):** Interfaz exclusiva para el dueño (`configuracion.ejs`) para gestionar datos del negocio y catálogo de servicios.
*   **Usuarios y Roles (`/accesos`):** Gestión de usuarios del sistema y sus niveles de acceso (`accesos.ejs`), controlado por `accesos.routes.js`.

> **Nota:** La estructura de EJS utiliza `partials` (como `head.ejs`, `footer.ejs`, `sidebar.ejs`) para mantener un código limpio y reutilizable en todas las pantallas.

## 2. Tour Interactivo y Manual de Uso

Se ha implementado un sistema robusto para guiar al usuario:
*   **Tour Interactivo:** Utiliza la librería **Driver.js** (`driver.js.iife.js` y `driver.css`). La lógica de inicialización y los pasos del tour están modularizados en el archivo `src/public/js/tour.js`.
*   **Manual de Usuario (`/manual`):** Existe una vista dedicada (`manual.ejs`) donde el usuario puede consultar instrucciones detalladas de uso en cualquier momento.
*   **Textos Dinámicos del Tour:** Los textos del tour (botones "Siguiente", "Anterior", títulos de pasos) están internacionalizados. En `footer.ejs`, se crea un objeto global `window.tourTextos` que inyecta las traducciones desde el backend al script del frontend.

## 3. Internacionalización (i18n)

El sistema soporta múltiples idiomas (Español e Inglés):
*   **Librería:** Se utiliza el paquete de npm `i18n`.
*   **Diccionarios:** Los archivos de traducción se encuentran en la carpeta `src/locales/` (`es.json` y `en.json`).
*   **Uso en Frontend:** En las vistas EJS se utiliza la sintaxis `<%= __("clave.del.texto") %>` para imprimir textos dinámicos según el idioma configurado por el usuario.

## 4. Scripts y Librerías Externas

Para mejorar la experiencia de usuario (UX) y la interfaz (UI), se integraron los siguientes scripts (visibles en `head.ejs` y `footer.ejs`):

*   **FontAwesome (Iconos):** Integrado vía Kit (`https://kit.fontawesome.com/...`). Proporciona toda la iconografía del sistema (sidebar, botones, tarjetas).
*   **SweetAlert2 (Alertas y Modales):** Integrado vía CDN (`sweetalert2@11`). Se utiliza para reemplazar los `alert()` y `confirm()` nativos del navegador. En `footer.ejs`, existe un script global que captura variables flash (`success_msg` y `error_msg`) y las muestra automáticamente como notificaciones tipo "Toast" en la esquina inferior derecha.
*   **Driver.js:** Mencionada anteriormente, es la librería encargada del onboarding paso a paso.

## 5. Sistema de Diseño (UI/UX)

El diseño está concebido bajo el concepto **"Moderno SaaS, Premium y Limpio"**. Toda la lógica visual está centralizada en archivos modulares de CSS dentro de `src/public/css/` (`main.css`, `sidebar.css`, `tables.css`, `modals.css`).

### Paleta de Colores
*   **Fondo Base (`--bg-body`):** `#F4F7FE` (Gris-azulado muy claro y fresco).
*   **Fondo Tarjetas (`--card-bg`):** `#FFFFFF` (Blanco puro para contrastar).
*   **Texto Principal (`--text-main`):** `#1E293B` (Azul medianoche profundo para máxima legibilidad).
*   **Texto Secundario (`--text-muted`):** `#64748B` (Gris azulado).
*   **Colores de Marca (Acentos):**
    *   Primario: `#4AA3FF` (Azul claro/vibrante).
    *   Cyan: `#5CE1E6`.
    *   Púrpura: `#5500FF`.

### Aspectos Visuales Destacados
*   **Sombras (Depth):** Se utilizan sombras suaves 3D (`rgba(15, 23, 42, 0.04)`) para dar profundidad a las tarjetas, y sombras azules dinámicas al hacer `hover` para generar interactividad.
*   **Bordes y Formas:** Diseños muy redondeados y modernos (`--radius-lg: 20px`).
*   **Líneas de Acento:** Uso de gradientes (de primario a púrpura) en los separadores de títulos para un toque "Premium".
*   **Responsividad:** (Implícita en el CSS y layouts grid/flexbox) La estructura utiliza `display: grid` y `flexbox` con `minmax()` para asegurar que las tarjetas (stats) y tablas se adapten a diferentes tamaños de pantalla.

---

## 💡 Prompt de Recomendación para Continuar el Desarrollo

Si deseas utilizar este contexto para guiar a la IA en futuras modificaciones o creación de nuevas vistas, puedes usar el siguiente Prompt:

> **"Actúa como un desarrollador Frontend experto. Estamos trabajando en el proyecto MaryClean bajo una arquitectura EJS + Node.js. El diseño debe mantener un estilo 'Moderno SaaS'.**
> 
> **Reglas de UI a respetar:**
> 1. Usa la paleta del `main.css`: Fondo `#F4F7FE`, Tarjetas `#FFFFFF`, Texto `#1E293B`. Acentos en gradiente `#4AA3FF` a `#5500FF`.
> 2. Las tarjetas deben usar bordes redondeados de 20px y la sombra suave estándar del proyecto.
> 3. Utiliza FontAwesome para toda la iconografía y SweetAlert2 para cualquier alerta, confirmación o mensaje de éxito/error.
> 4. Toda la interfaz debe ser Responsive, utilizando Flexbox o Grid.
> 5. Todo el texto de la interfaz debe ser llamado mediante la función de i18n (`<%= __("clave") %>`) para soportar Inglés y Español. No uses texto quemado (hardcoded).
> 
> **Tarea:** Necesito crear la vista de [NOMBRE DE LA VISTA]..."
