# 📱 MaryClean App - Guía de Desarrollo Móvil (Expo)

Este documento es nuestra hoja de ruta para construir la aplicación móvil de MaryClean. Utilizaremos el mismo backend (CodeIgniter 4) y la misma base de datos, consumiendo la API REST mediante JWT.

## 🛠️ Stack Tecnológico
- **Framework:** React Native con **Expo Go** (facilita pruebas en dispositivos físicos).
- **Lenguaje:** TypeScript.
- **Navegación:** React Navigation (Stack & Bottom Tabs).
- **Gestor de Estado:** Zustand (igual que en la web).
- **Peticiones HTTP:** Axios.
- **Estilos:** NativeWind (Tailwind CSS para React Native) o StyleSheet nativo.
- **Almacenamiento Seguro:** `expo-secure-store` (para guardar el token JWT en el celular).

---

## 📂 Arquitectura de Carpetas (Recomendada)
Mantendremos una estructura basada en "Features" (características), similar a la web para mantener consistencia:

```text
maryclean-mobile/
├── src/
│   ├── core/
│   │   ├── api/           # Configuración de Axios (Interceptor para Token)
│   │   ├── store/         # Zustand Stores (authStore, etc.)
│   │   ├── navigation/    # AppNavigator, TabNavigator
│   │   └── theme/         # Colores globales y tipografía
│   ├── features/
│   │   ├── auth/          # Pantallas de Login
│   │   ├── dashboard/     # Resumen y estadísticas rápidas
│   │   ├── pedidos/       # Lista de pedidos, registro y cobro
│   │   └── clientes/      # Buscador de clientes
│   └── shared/
│       └── components/    # Botones, Inputs, Modales reutilizables
├── App.tsx                # Punto de entrada de la aplicación
└── app.json               # Configuración de Expo
```

---

## 🚀 Fases de Desarrollo

### Fase 1: Inicialización y Configuración Base
1. Crear el proyecto con Expo y TypeScript.
2. Instalar dependencias clave (Zustand, Axios, React Navigation).
3. Configurar Axios para apuntar a la IP local de la computadora (ej. `http://192.168.1.XX:8080/api/v1`). **Importante:** Un celular no reconoce `localhost`, debe apuntar a la IP de XAMPP en la red WiFi.

### Fase 2: Autenticación y Seguridad
1. Crear pantalla de `Login`.
2. Consumir `/api/v1/auth/login`.
3. Guardar el Token JWT en `expo-secure-store`.
4. Configurar el interceptor de Axios para inyectar el token en cada petición.
5. Proteger las rutas (si no hay token, ir a Login; si hay, ir al Dashboard).

### Fase 3: Navegación Principal (Bottom Tabs)
1. Implementar un menú inferior (Bottom Tab Navigation).
2. Pestañas sugeridas: **Inicio (Dashboard)**, **Pedidos**, **Nuevo (Registrar)**, **Perfil**.

### Fase 4: Integración de Features Core (Módulos)
1. **Dashboard:** Consumir `/api/v1/reportes/dashboard` y mostrar tarjetas estadísticas.
2. **Pedidos:** Lista de pedidos con scroll infinito o paginación, filtros básicos. Modal inferior (BottomSheet) para ver el detalle y cobrar.
3. **Registrar Pedido:** Flujo por pasos adaptado a pantallas pequeñas (Buscar DNI -> Seleccionar Prendas -> Confirmar).

### Fase 5: Ajustes Nativos
1. Manejo del teclado (KeyboardAvoidingView) para que los inputs no se oculten.
2. Pantallas de carga (Splash Screen) personalizadas con el logo de MaryClean.
3. Alertas y Toasts nativos.

---

## ⚠️ Consideraciones Especiales para Móviles
- **Red WiFi:** Para que la app en Expo Go se conecte al backend local, tanto la PC como el celular deben estar conectados a la misma red WiFi.
- **CORS:** El backend ya está configurado para aceptar peticiones, pero en móviles las peticiones a IPs locales a veces requieren configuraciones extra de seguridad (HTTP en texto plano vs HTTPS).
- **Rendimiento:** Evitar renderizados innecesarios, usar `FlatList` para listas largas (como los pedidos) en lugar de mapear arreglos directamente.

## 🎯 Siguiente Paso
Cuando estés listo, abre una terminal en tu computadora (fuera de la carpeta `frontend`) y ejecuta el comando para crear el proyecto de Expo. ¡Avísame para darte el comando exacto y empezar a escribir el código!
