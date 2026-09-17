# 🚀 MaryClean API REST — Documentación de Controladores
### Capa de Controladores API (`app/Controllers/Api/`) — Backend PHP (CodeIgniter 4)

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Formato de Respuesta Unificado](#2-formato-de-respuesta-unificado)
3. [Autenticación JWT](#3-autenticación-jwt)
4. [Filtros de Seguridad API (Throttler y CORS)](#4-filtros-de-seguridad-api)
5. [Mapa de Rutas Completo](#5-mapa-de-rutas-completo)
6. [Referencia de Controladores](#6-referencia-de-controladores)

---

## 1. Visión General

La API REST de MaryClean está diseñada bajo el patrón de **Thin Controllers** (Controladores Delgados).
Toda la lógica de negocio, validaciones complejas y reglas de integridad (como evitar sobrepagos o calcular totales) residen en los Modelos, en Triggers de la Base de Datos, o en Stored Procedures.

Los controladores extienden de `BaseApiController`, heredando un formato estandarizado de respuesta JSON.

---

## 2. Formato de Respuesta Unificado

**BaseApiController** garantiza que todos los endpoints (éxito o error) respondan siempre con la misma estructura JSON:

```json
{
  "success": true,
  "status": 200,
  "message": "Operación exitosa",
  "data": { ... },
  "errors": null
}
```

---

## 3. Autenticación JWT

El sistema está completamente securizado mediante **JSON Web Tokens (JWT)**.
* **Filtro `jwt`**: Se aplica a nivel de rutas para verificar la firma del token.
* **RBAC Integrado**: El filtro `jwt:admin` permite restringir rutas fácilmente. El token almacena el `rol` y el `idSucursal` del empleado, evitando consultas innecesarias a la BD.
* **Inyección de Contexto**: El payload del token se inyecta de forma segura a través de `\App\Libraries\JwtContext::set()`.

---

## 4. Filtros de Seguridad API

1. **CorsFilter (`mcCors`)**: Controla los orígenes permitidos y maneja las peticiones preflight (OPTIONS).
2. **ThrottleFilter (`throttler`)**: Protege contra ataques de fuerza bruta y DDoS limitando las peticiones por IP y endpoint (ej. `throttler:60,60`).
3. **JwtFilter (`jwt`)**: Valida el Bearer token y la jerarquía de roles (admin > cajero > recepcionista).

---

## 5. Mapa de Rutas Completo

*   **Auth:** `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
*   **Clientes:** `GET`, `POST` `/api/v1/clientes` | `GET`, `PUT` `/api/v1/clientes/{id}`
*   **Pedidos:** `GET`, `POST` `/api/v1/pedidos` | `GET` `/api/v1/pedidos/{id}` | `PATCH` `/api/v1/pedidos/{id}/estado`
*   **Pagos:** `POST` `/api/v1/pagos` | `GET` `/api/v1/pagos/pedido/{id}`
*   **Empleados (Admin):** `GET`, `POST` `/api/v1/empleados` | `PATCH` `/api/v1/empleados/{id}/estado` (Baja Lógica) | `DELETE` `/api/v1/empleados/{id}`
*   **Sucursales (Admin):** `GET`, `POST` `/api/v1/sucursales` | `PUT` `/api/v1/sucursales/{id}`
*   **Reportes:** `GET /api/v1/reportes/dashboard`, `diario`, `mensual`, `cierre-caja`, `servicios`

---

## 6. Referencia de Controladores

### 6.1 BaseApiController
Provee utilidades estándar como `respondSuccess()`, `respondError()`, `respondValidationError()`.
Incluye manejo centralizado de excepciones de la BD.

### 6.2 AuthController
Maneja la emisión del token JWT tras validar credenciales con `password_verify()`. Verifica que el usuario tenga `activo = 1`.

### 6.3 ClientesController
CRUD de clientes. Búsqueda optimizada por documento.

### 6.4 PedidosController
Listado dinámico y ligero (paginación y filtrado opcional). Interconecta con el SP `sp_registrar_recepcion`.

### 6.5 PagosController
Gestión de cobros. Soporta validación estricta (restringido a Cajeros/Admin).

### 6.6 ReportesController
Endpoints analíticos que consultan las vistas `v_reporte_diario` y el SP `sp_cierre_caja`.

### 6.7 EmpleadosController
CRUD de empleados (Solo Admin). Incorpora Baja Lógica (`PATCH /estado`) y seguridad contra la eliminación del administrador principal (`idEmpleado = 1`).

### 6.8 SucursalesController
CRUD básico para administración de sucursales.
