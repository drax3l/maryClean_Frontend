# DOCUMENTO TECNICO — BACKEND MARYCLEAN

## Guia 3 — Programa ADSI II

**Proyecto:** Sistema de Gestion de Lavanderia MaryClean
**Modulo:** Backend PHP + MySQL
**Framework:** CodeIgniter 4.7 / PHP 8.2 / MySQL 8.0+
**Fecha:** 02 de septiembre de 2026

---

## Indice de Criterios de Evaluacion

| # | Criterio | Puntaje | Seccion |
|---|---|---|---|
| 1 | Proyecto correctamente configurado y ejecutable | 2 pts | [Seccion 1](#1-proyecto-correctamente-configurado-y-ejecutable) |
| 2 | Comprension y aplicacion de MVC | 2 pts | [Seccion 2](#2-comprension-y-aplicacion-de-mvc) |
| 3 | Organizacion modular y arquitectura | 2 pts | [Seccion 3](#3-organizacion-modular-y-arquitectura) |
| 4 | Correspondencia entre requisitos y modelo de datos | 2 pts | [Seccion 4](#4-correspondencia-entre-requisitos-y-modelo-de-datos) |
| 5 | Diseno de entidades, claves y relaciones | 3 pts | [Seccion 5](#5-diseno-de-entidades-claves-y-relaciones) |
| 6 | Configuracion de la conexion | 2 pts | [Seccion 6](#6-configuracion-de-la-conexion) |
| 7 | Modelo de acceso a datos correctamente implementado | 2 pts | [Seccion 7](#7-modelo-de-acceso-a-datos-correctamente-implementado) |
| 8 | Operacion de registro | 2 pts | [Seccion 8](#8-operacion-de-registro) |
| 9 | Operacion de consulta y comprobacion de persistencia | 2 pts | [Seccion 9](#9-operacion-de-consulta-y-comprobacion-de-persistencia) |
| 10 | Repositorio y explicacion tecnica del equipo | 1 pt | [Seccion 10](#10-repositorio-y-explicacion-tecnica-del-equipo) |
| | **TOTAL** | **20 pts** | |

---

## 1. Proyecto correctamente configurado y ejecutable (2 puntos)

### 1.1 Stack Tecnologico

| Componente | Version | Funcion |
|---|---|---|
| **PHP** | 8.2+ | Lenguaje backend con `declare(strict_types=1)` |
| **CodeIgniter 4** | 4.7+ | Framework MVC, namespace `App\` |
| **MySQL** | 8.0+ | Motor de base de datos InnoDB, charset UTF8MB4 |
| **Firebase JWT** | 7.1+ | Generacion y validacion de tokens JWT |
| **PHPUnit** | 10.5+ | Suite de pruebas unitarias |

### 1.2 Archivo de Configuracion del Proyecto (composer.json)

```json
{
    "name": "codeigniter4/appstarter",
    "require": {
        "php": "^8.2",
        "codeigniter4/framework": "^4.7",
        "firebase/php-jwt": "^7.1"
    },
    "require-dev": {
        "phpunit/phpunit": "^10.5.16"
    },
    "autoload": {
        "psr-4": {
            "App\\": "app/",
            "Config\\": "app/Config/"
        }
    }
}
```

### 1.3 Comandos de Ejecucion

```bash
# Instalacion de dependencias
composer install

# Servidor de desarrollo
php spark serve

# Aplicar migraciones (crea esquema + vistas + triggers + SPs)
php spark migrate

# Poblar datos de prueba
php spark db:seed LavanderiaSeeder

# Ejecutar pruebas
vendor\bin\phpunit

# Verificar rutas registradas
php spark routes
```

### 1.4 Estructura de Directorios

```
Maryclean_backend/
├── app/
│   ├── Config/          ← Configuracion (Routes, Database, Filters)
│   ├── Controllers/Api/ ← 6 controladores REST
│   ├── Filters/         ← 5 filtros de seguridad
│   ├── Libraries/       ← JwtHelper, DbExceptionHandler
│   ├── Models/          ← 10 modelos CI4
│   ├── Database/
│   │   ├── Migrations/  ← 5 migraciones (esquema, vistas, triggers, SPs, auth)
│   │   └── Seeds/       ← 5 seeders de datos de prueba
│   └── Views/           ← Swagger UI
├── public/
│   └── docs/swagger.yaml
├── tests/               ← Suite PHPUnit
├── composer.json
├── phpunit.xml
└── .env                 ← Variables de entorno (DB, JWT, CORS)
```

### 1.5 Migraciones Versionadas (5 en total)

| # | Archivo | Contenido |
|---|---|---|
| 1 | `000001_CreateLavanderiaSchema.php` | 9 tablas + 8 FK + 6 CHECK + 5 indices |
| 2 | `000002_CreateLavanderiaViews.php` | 2 vistas SQL |
| 3 | `000003_CreateLavanderiaTriggers.php` | 7 triggers automatizados |
| 4 | `000004_CreateLavanderiaProcedures.php` | 2 stored procedures |
| 5 | `000005_AddAuthToEmpleado.php` | Campos username, password, activo |

---

## 2. Comprension y aplicacion de MVC (2 puntos)

### 2.1 Diagrama de Arquitectura MVC

```
+-------------------------------------------------------------------+
|  CAPA DE PRESENTACION (Clientes)                                   |
|  Frontend Web (Node.js) | App Movil (Expo Go)                     |
+------------------------------+------------------------------------+
                               | HTTP Request JSON
                               v
+------------------------------+------------------------------------+
|  CAPA DE ENRUTAMIENTO — app/Config/Routes.php                     |
|  Mapea URI → Controlador::metodo                                  |
|  Asigna filtros de seguridad por grupo de rutas                   |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE FILTROS — app/Filters/                                   |
|  CorsFilter → JwtFilter → ThrottleFilter → RolFilter              |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE CONTROLADORES — app/Controllers/Api/                     |
|  Reciben HTTP Request → Llaman al Modelo → Devuelven JSON         |
|  NO contienen SQL ni logica de negocio                            |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE MODELOS — app/Models/                                    |
|  Contienen toda la logica de acceso a datos y validacion          |
|  Negocian con MySQL via Query Builder y SQL nativo                |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE DATOS — MySQL 8.0 (InnoDB)                               |
|  9 tablas, 2 vistas, 7 triggers, 2 stored procedures              |
+-------------------------------------------------------------------+
```

### 2.2 Modelo (M) — 10 Modelos CI4

Cada modelo representa una entidad de negocio y encapsula toda la logica de acceso a datos:

| Modelo | Tabla BD | Responsabilidad |
|---|---|---|
| `SucursalModel` | Sucursal | Puntos fisicos de operacion |
| `EmpleadoModel` | Empleado | Personal + autenticacion bcrypt |
| `ClienteModel` | Cliente | Clientes + busqueda + historial |
| `ServicioModel` | Servicio | Tipos de servicio ofrecidos |
| `ServicioPrendaModel` | ServicioPrenda | Prendas con precio unitario |
| `PedidoModel` | Pedido | Ciclo de vida del pedido + SP + vistas |
| `DetallePedidoModel` | DetallePedido | Lineas de detalle + calculo de importe |
| `PagoModel` | Pago | Cobros presenciales + validacion trigger |
| `AuditoriaEstadoModel` | AuditoriaEstado | SOLO LECTURA (inmutable) |
| `ReporteModel` | *(vistas/SPs)* | Reportes + cierre de caja |

**Ejemplo — Modelo de Cliente (`ClienteModel.php`):**

```php
class ClienteModel extends Model
{
    protected $table            = 'Cliente';
    protected $primaryKey       = 'idCliente';
    protected $returnType       = 'array';
    protected $protectFields    = true;

    protected $allowedFields = ['documento', 'nombres', 'telefono', 'direccion'];

    protected $validationRules = [
        'documento' => 'required|min_length[8]|max_length[15]|alpha_numeric|is_unique[Cliente.documento,idCliente,{idCliente}]',
        'nombres'   => 'required|min_length[3]|max_length[200]',
        'telefono'  => 'permit_empty|min_length[7]|max_length[15]',
        'direccion' => 'permit_empty|max_length[255]',
    ];

    public function getClientePorDocumento(string $documento): ?array { ... }
    public function buscarCliente(string $termino): array { ... }
    public function getHistorialPedidos(int $idCliente): array { ... }
}
```

### 2.3 Vista (V) — Respuestas JSON Estructuradas

Los controladores devuelven JSON con formato unificado definido en `BaseApiController`:

```php
// Formato de respuesta exitosa:
{
    "success": true,
    "status": 200,
    "message": "Operacion exitosa.",
    "data": { ... },
    "errors": null
}

// Formato de respuesta de error:
{
    "success": false,
    "status": 422,
    "message": "Los datos enviados no son validos.",
    "data": null,
    "errors": { "campo": ["Mensaje de error"] }
}
```

### 2.4 Controlador (C) — 6 Controladores REST

**Principio Thin Controller:** Los controladores NO contienen SQL ni logica de negocio. Solo coordinan: Request HTTP → Modelo → Response JSON.

| Controlador | Rutas | Funcion |
|---|---|---|
| `AuthController` | `auth/login`, `auth/me` | Autenticacion JWT |
| `ClientesController` | `clientes/*` | CRUD de clientes |
| `PedidosController` | `pedidos/*` | Recepcion + ticket + estados |
| `PagosController` | `pagos/*` | Cobro presencial + recibos |
| `ReportesController` | `reportes/*` | Dashboard + cierre de caja |
| `BaseApiController` | *(abstracto)* | Helpers de respuesta + manejo de excepciones |

**Ejemplo — Flujo en un Controlador:**

```php
// ClientesController::create() — Recibe HTTP, delega al Modelo, devuelve JSON
public function create(): ResponseInterface
{
    $body = $this->getJsonBody();              // 1. Recibe request

    if (!$this->clienteModel->validate($body)) { // 2. Valida via Modelo
        return $this->respondValidationError($this->clienteModel->errors());
    }

    $idCliente = $this->clienteModel->insert($body, true); // 3. Inserta via Modelo

    $cliente = $this->clienteModel->find((int) $idCliente); // 4. Consulta via Modelo

    return $this->respondCreated($cliente, 'Cliente registrado.'); // 5. Devuelve JSON
}
```

---

## 3. Organizacion modular y arquitectura (2 puntos)

### 3.1 Mapa de Modulos del Sistema

```
Maryclean Backend
├── MODULO 1: Autenticacion y Accesos
│   ├── AuthController.php          ← Login JWT
│   ├── EmpleadoModel.php           ← Autenticacion bcrypt
│   ├── JwtHelper.php               ← Generacion/validacion JWT
│   ├── JwtFilter.php               ← Validacion Bearer token
│   ├── ThrottleFilter.php          ← Rate limiting
│   ├── AuthFilter.php              ← Sesion web
│   └── RolFilter.php               ← RBAC jerarquico
│
├── MODULO 2: Gestion de Clientes
│   ├── ClientesController.php      ← CRUD + busqueda
│   └── ClienteModel.php            ← Validacion DNI/RUC + historial
│
├── MODULO 3: Recepcion y Registro de Pedidos
│   ├── PedidosController.php       ← Recepcion + ticket + estados
│   ├── PedidoModel.php             ← SP sp_registrar_recepcion + vistas
│   ├── DetallePedidoModel.php      ← Calculo de importes + triggers
│   └── ServicioPrendaModel.php     ← Catalogo de prendas
│
├── MODULO 4: Seguimiento Operativo
│   ├── PedidosController.php       ← Cambio de estado + ticket
│   ├── PedidoModel.php             ← Vista v_pedidos_activos
│   └── AuditoriaEstadoModel.php    ← Auditoria inmutable
│
├── MODULO 5: Control de Caja y Pagos
│   ├── PagosController.php         ← Cobro + recibo
│   ├── PagoModel.php               ← Captura SQLSTATE 45000
│   ├── ReportesController.php      ← Dashboard + cierre
│   └── ReporteModel.php            ← SP sp_cierre_caja + vistas
│
├── MODULO 6: Servicios y Tarifas
│   ├── ServicioModel.php           ← Catalogo jerarquico
│   └── ServicioPrendaModel.php     ← Prendas + precios
│
└── CAPA TRANSVERSAL
    ├── BaseApiController.php        ← Formato JSON unificado
    ├── DbExceptionHandler.php       ← Clasificador de excepciones
    ├── CorsFilter.php               ← Headers CORS
    └── Config/Routes.php            ← Enrutamiento REST
```

### 3.2 Separacion de Responsabilidades

| Capa | Ubicacion | Responsabilidad | Contiene SQL? |
|---|---|---|---|
| **Configuracion** | `app/Config/` | Rutas, filtros, conexion, CORS | No |
| **Filtros** | `app/Filters/` | Seguridad: JWT, CORS, RBAC, Throttle | No |
| **Controladores** | `app/Controllers/Api/` | Coordinan HTTP → Modelo → JSON | No |
| **Modelos** | `app/Models/` | Acceso a datos + validacion | Si |
| **Libraries** | `app/Libraries/` | Utilidades reutilizables (JWT, Excepciones) | No |
| **Migraciones** | `app/Database/Migrations/` | Esquema de BD versionado | Si (DDL) |
| **Seeders** | `app/Database/Seeds/` | Datos de prueba | Si (DML) |

### 3.3 Patrones de Diseno Aplicados

| Patron | Ubicacion | Descripcion |
|---|---|---|
| **Thin Controller** | Todos los controladores | Controladores sin logica de negocio, solo coordinacion |
| **Fat Model** | Todos los modelos | Toda la logica de BD y validacion en modelos |
| **Trait** | `DbExceptionHandler.php` | Logica compartida de clasificacion de excepciones |
| **Template Method** | `BaseApiController.php` | Metodos base de respuesta JSON heredados por todos |
| **Repository Pattern** | Cada Modelo | Cada modelo encapsula el acceso a una tabla |
| **Facade** | `JwtHelper.php` | Interfaz simple para operaciones JWT complejas |

### 3.4 Filtros de Seguridad (Encadenados)

```
Peticion HTTP entrante
        │
        v
   CorsFilter         → Headers CORS + Preflight OPTIONS (HTTP 204)
        │
        v
   ThrottleFilter     → Rate limiting: 4 intentos/min por IP
        │
        v
   JwtFilter          → Valida Bearer token + inyecta payload
        │
        v
   RolFilter          → Valida jerarquia: admin > cajero > recepcionista
        │
        v
   Controlador        → Recibe request autenticada y autorizada
```

---

## 4. Correspondencia entre requisitos y modelo de datos (2 puntos)

### 4.1 Requisitos de Negocio vs Implementacion

| Requisito del Negocio | Modulo BD | Tabla(s) Involucrada(s) | Mecanismo |
|---|---|---|---|
| Identificar al personal y restringir accesos | Autenticacion | `Empleado` | JWT + RBAC + bcrypt |
| Asociar empleado a sucursal | Autenticacion | `Empleado` → FK `Sucursal` | Foreign Key |
| Centralizar datos de contacto del cliente | Clientes | `Cliente` | CRUD + UNIQUE en documento |
| Evitar duplicados de DNI/RUC | Clientes | `Cliente` | UNIQUE constraint + validacion PHP |
| Registrar ingreso de prendas | Recepcion | `Pedido` + `DetallePedido` | SP transaccional |
| Calcular importe automatico | Recepcion | `DetallePedido` | Trigger recalcula total |
| Emitir ticket de atencion | Recepcion | `Pedido` + `DetallePedido` + `Cliente` | Vista + SP |
| Controlar flujo de estados | Seguimiento | `Pedido` + `AuditoriaEstado` | Triggers de auditoria |
| Asignar fecha de entrega automatica | Seguimiento | `Pedido.fechaEntrega` | Trigger BEFORE UPDATE |
| Registrar cobros parciales | Pagos | `Pago` | Multi-pago por pedido |
| Validar saldo antes de cobrar | Pagos | `Pago` + `Pedido` | Trigger SQLSTATE 45000 |
| Cambiar estado a Pagado automaticamente | Pagos | `Pedido.estado` | Trigger AFTER INSERT |
| Reportes de ingresos diarios | Reportes | `Pago` | Vista `v_reporte_diario` |
| Cierre de caja por metodo de pago | Reportes | `Pago` | SP `sp_cierre_caja` con ROLLUP |
| Catalogo de servicios y precios | Servicios | `Servicio` + `ServicioPrenda` | FK jerarquica |
| Tiempo estimado de procesamiento | Servicios | `Servicio.tiempoEstimado` | CHECK > 0 |

### 4.2 Diagrama Entidad-Relacion

```
Sucursal (1) ─────────< Empleado (N)
                           │
                           │ FK idSucursal
                           v
Cliente (1) ─────────< Pedido (N) >──────── Empleado
                           │
                           │ FK idCliente + FK idEmpleado
                     ┌─────┴─────┐
                     v           v
              DetallePedido    Pago
                     │
                     │ FK idPrenda
                     v
              ServicioPrenda >──────── Servicio

Pedido (1) ─────────< AuditoriaEstado (N)
                           │
                           │ FK idPedido (CASCADE)
                           v
                    [Solo escritura por trigger]
```

### 4.3 Matriz de Requisitos Functionales

| ID | Requisito | Endpoint(s) | Modelo(s) | BD |
|---|---|---|---|---|
| RF-01 | Login de empleado | `POST /auth/login` | EmpleadoModel | Tabla Empleado |
| RF-02 | Verificar perfil activo | `GET /auth/me` | EmpleadoModel | JOIN Sucursal |
| RF-03 | Registrar cliente nuevo | `POST /clientes` | ClienteModel | Tabla Cliente |
| RF-04 | Evitar duplicados DNI | `GET /clientes/documento/{doc}` | ClienteModel | UNIQUE index |
| RF-05 | Buscar clientes | `GET /clientes?q=` | ClienteModel | LIKE multi-campo |
| RF-06 | Registrar recepcion | `POST /pedidos` | PedidoModel | SP sp_registrar_recepcion |
| RF-07 | Agregar prendas al pedido | `POST /pedidos` | DetallePedidoModel | Trigger recalcula total |
| RF-08 | Generar ticket | `GET /pedidos/{id}/ticket` | PedidoModel | Vista + JOINs |
| RF-09 | Cambiar estado | `PATCH /pedidos/{id}/estado` | PedidoModel | Trigger auditoria |
| RF-10 | Registrar pago | `POST /pagos` | PagoModel | Trigger validacion saldo |
| RF-11 | Ver historial de pagos | `GET /pagos/pedido/{id}` | PagoModel | Tabla Pago |
| RF-12 | Cierre de caja | `GET /reportes/cierre-caja` | ReporteModel | SP sp_cierre_caja |
| RF-13 | Dashboard del dia | `GET /reportes/dashboard` | ReporteModel | Consultas agregadas |
| RF-14 | Catalogo de servicios | *(consultas)* | ServicioModel | FK Servicio→Prenda |
| RF-15 | Precios por servicio | *(consultas)* | ServicioPrendaModel | CHECK precio>0 |

---

## 5. Diseno de entidades, claves y relaciones (3 puntos)

### 5.1 Diccionario de Datos Completo

#### Tabla: Sucursal

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idSucursal` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | — | — | — | NOT NULL |
| `direccion` | VARCHAR(255) | — | — | — | NOT NULL |
| `telefono` | VARCHAR(15) | — | — | — | NOT NULL |

#### Tabla: Empleado

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idEmpleado` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `nombres` | VARCHAR(150) | — | — | — | NOT NULL |
| `username` | VARCHAR(50) | — | — | UNIQUE | UNIQUE |
| `password` | VARCHAR(255) | — | — | — | Hash bcrypt |
| `activo` | TINYINT(1) | — | — | — | DEFAULT 1 |
| `rol` | ENUM('admin','cajero','recepcionista') | — | — | — | NOT NULL |
| `idSucursal` | INT UNSIGNED | — | FK → Sucursal | — | RESTRICT ON DELETE |

#### Tabla: Cliente

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idCliente` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `documento` | VARCHAR(15) | — | — | UNIQUE | UNIQUE, alfanumerico |
| `nombres` | VARCHAR(200) | — | — | — | NOT NULL |
| `telefono` | VARCHAR(15) | — | — | INDEX | Optimiza busquedas |
| `direccion` | VARCHAR(255) | — | — | — | NULL permitido |

#### Tabla: Servicio

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idServicio` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | — | — | — | NOT NULL |
| `tiempoEstimado` | INT UNSIGNED | — | — | — | CHECK: > 0 (horas) |

#### Tabla: ServicioPrenda

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idPrenda` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `nombrePrenda` | VARCHAR(100) | — | — | — | NOT NULL |
| `precio` | DECIMAL(10,2) | — | — | — | CHECK: > 0 |
| `idServicio` | INT UNSIGNED | — | FK → Servicio | — | RESTRICT ON DELETE |

#### Tabla: Pedido

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idPedido` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `codigoTicket` | VARCHAR(20) | — | — | UNIQUE | MC-YYYYMMDD-XXXXX |
| `fechaRecepcion` | DATETIME | — | — | INDEX | NOT NULL |
| `fechaEntrega` | DATETIME | — | — | — | NULL (trigger la asigna) |
| `estado` | ENUM('Recibido','En Proceso','Listo','Entregado','Pagado','Cancelado') | — | — | INDEX | DEFAULT 'Recibido' |
| `total` | DECIMAL(10,2) | — | — | — | DEFAULT 0.00 (trigger calcula) |
| `idCliente` | INT UNSIGNED | — | FK → Cliente | — | RESTRICT ON DELETE |
| `idEmpleado` | INT UNSIGNED | — | FK → Empleado | — | RESTRICT ON DELETE |

#### Tabla: DetallePedido

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idDetalle` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `cantidad` | INT UNSIGNED | — | — | — | CHECK: > 0 |
| `descripcion` | VARCHAR(255) | — | — | — | NULL permitido |
| `importe` | DECIMAL(10,2) | — | — | — | CHECK: > 0 |
| `idPedido` | INT UNSIGNED | — | FK → Pedido | — | CASCADE ON DELETE |
| `idPrenda` | INT UNSIGNED | — | FK → ServicioPrenda | — | RESTRICT ON DELETE |

#### Tabla: Pago

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idPago` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `monto` | DECIMAL(10,2) | — | — | — | CHECK: > 0 |
| `metodo` | ENUM('Efectivo','Tarjeta','Yape/Plin') | — | — | — | NOT NULL |
| `fechaPago` | DATETIME | — | — | INDEX | NOT NULL |
| `idPedido` | INT UNSIGNED | — | FK → Pedido | — | RESTRICT ON DELETE |

#### Tabla: AuditoriaEstado

| Campo | Tipo | PK | FK | Index | Restriccion |
|---|---|---|---|---|---|
| `idAuditoria` | INT UNSIGNED | SI | — | PK | AUTO_INCREMENT |
| `idPedido` | INT UNSIGNED | — | FK → Pedido | — | CASCADE ON DELETE |
| `estadoAnterior` | ENUM(6 valores) | — | — | — | NOT NULL |
| `estadoNuevo` | ENUM(6 valores) | — | — | — | NOT NULL |
| `fechaCambio` | DATETIME | — | — | — | DEFAULT CURRENT_TIMESTAMP |

### 5.2 Claves Primarias (9 PK)

Todas las tablas usan `INT UNSIGNED AUTO_INCREMENT` como clave primaria:

| Tabla | PK | Tipo |
|---|---|---|
| Sucursal | `idSucursal` | INT UNSIGNED AI |
| Empleado | `idEmpleado` | INT UNSIGNED AI |
| Cliente | `idCliente` | INT UNSIGNED AI |
| Servicio | `idServicio` | INT UNSIGNED AI |
| ServicioPrenda | `idPrenda` | INT UNSIGNED AI |
| Pedido | `idPedido` | INT UNSIGNED AI |
| DetallePedido | `idDetalle` | INT UNSIGNED AI |
| Pago | `idPago` | INT UNSIGNED AI |
| AuditoriaEstado | `idAuditoria` | INT UNSIGNED AI |

### 5.3 Claves Foraneas (8 FK)

| FK | Tabla Origen | Tabla Destino | ON DELETE | ON UPDATE |
|---|---|---|---|---|
| `fk_empleado_sucursal` | Empleado.idSucursal | Sucursal.idSucursal | RESTRICT | CASCADE |
| `fk_pedido_cliente` | Pedido.idCliente | Cliente.idCliente | RESTRICT | CASCADE |
| `fk_pedido_empleado` | Pedido.idEmpleado | Empleado.idEmpleado | RESTRICT | CASCADE |
| `fk_detalle_pedido` | DetallePedido.idPedido | Pedido.idPedido | CASCADE | CASCADE |
| `fk_detalle_prenda` | DetallePedido.idPrenda | ServicioPrenda.idPrenda | RESTRICT | CASCADE |
| `fk_pago_pedido` | Pago.idPedido | Pedido.idPedido | RESTRICT | CASCADE |
| `fk_prenda_servicio` | ServicioPrenda.idServicio | Servicio.idServicio | RESTRICT | CASCADE |
| `fk_auditoria_pedido` | AuditoriaEstado.idPedido | Pedido.idPedido | CASCADE | CASCADE |

**Decisiones de diseno FK:**
- `CASCADE ON DELETE` en DetallePedido y AuditoriaEstado: si se elimina un pedido, se eliminan sus detalles y auditorias
- `RESTRICT ON DELETE` en Empleado, Pago: no se puede eliminar una sucursal/pedido que tenga registros dependientes

### 5.4 Uniques e Indices (5 objetos)

| Tipo | Tabla | Campo | Proposito |
|---|---|---|---|
| UNIQUE | Cliente | `documento` | Evita duplicados de DNI/RUC |
| UNIQUE | Pedido | `codigoTicket` | Ticket unico por pedido |
| UNIQUE | Empleado | `username` | Usuario unico de login |
| INDEX | Cliente | `telefono` | Optimiza busquedas por telefono |
| INDEX | Pedido | `fechaRecepcion` | Optimiza ordenamiento por fecha |
| INDEX | Pedido | `estado` | Optimiza filtros por estado |
| INDEX | Pago | `fechaPago` | Optimiza reportes por rango de fechas |
| INDEX | Empleado | `username` | Optimiza busqueda en login |

### 5.5 CHECK Constraints (6 en total)

| Tabla | Constraint | Expresion | Protege contra |
|---|---|---|---|
| Servicio | `chk_servicio_tiempo` | `tiempoEstimado > 0` | Tiempo en cero o negativo |
| ServicioPrenda | `chk_prenda_precio` | `precio > 0` | Precios invalidos |
| DetallePedido | `chk_detalle_cantidad` | `cantidad > 0` | Cantidad en cero |
| DetallePedido | `chk_detalle_importe` | `importe > 0` | Importe en cero o negativo |
| Pago | `chk_pago_monto` | `monto > 0` | Pago en cero o negativo |

### 5.6 Tabla de Auditoria — Diseno Inmutable

La tabla `AuditoriaEstado` es **SOLO LECTURA** desde PHP. Los registros son escritos EXCLUSIVAMENTE por el trigger `trg_pedido_despues_actualizar_auditoria`. Esto garantiza:

- Integridad del historial de cambios
- Imposibilidad de alterar registros desde la aplicacion
- Trazabilidad completa del ciclo de vida de cada pedido

```php
// AuditoriaEstadoModel — Bloqueo total de escritura
class AuditoriaEstadoModel extends Model
{
    protected $allowedFields = []; // Sin campos editables

    public function insert(...)  { throw new \RuntimeException('PROHIBIDO'); }
    public function update(...)  { throw new \RuntimeException('PROHIBIDO'); }
    public function delete(...)  { throw new \RuntimeException('PROHIBIDO'); }
    public function save(...)    { throw new \RuntimeException('PROHIBIDO'); }
}
```

---

## 6. Configuracion de la conexion (2 puntos)

### 6.1 Archivo de Configuracion

**Archivo:** `app/Config/Database.php`

```php
class Database extends Config
{
    public string $defaultGroup = 'default';

    public array $default = [
        'DSN'          => '',
        'hostname'     => 'localhost',
        'username'     => '',        // Se carga desde .env
        'password'     => '',        // Se carga desde .env
        'database'     => '',        // Se carga desde .env (lavanderia)
        'DBDriver'     => 'MySQLi',
        'DBPrefix'     => '',
        'pConnect'     => false,
        'DBDebug'      => true,
        'charset'      => 'utf8mb4',
        'DBCollat'     => 'utf8mb4_general_ci',
        'port'         => 3306,
        'strictOn'     => false,
    ];

    // Configuracion de testing (SQLite in-memory)
    public array $tests = [
        'hostname'   => '127.0.0.1',
        'database'   => ':memory:',
        'DBDriver'   => 'SQLite3',
        'DBPrefix'   => 'db_',
        'foreignKeys'=> true,
    ];

    public function __construct()
    {
        parent::__construct();
        if (ENVIRONMENT === 'testing') {
            $this->defaultGroup = 'tests'; // BD separada para pruebas
        }
    }
}
```

### 6.2 Variables de Entorno (.env)

```env
# Base de datos
database.default.hostname = localhost
database.default.database = lavanderia
database.default.username = root
database.default.password = 

# JWT
jwt.secret = tu_clave_secreta_de_minimo_32_caracteres
jwt.ttl = 28800
jwt.issuer = maryclean-api

# CORS
cors.allowedOrigins = http://localhost:3000,http://localhost:8081
cors.allowedMethods = GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### 6.3 Motor de Base de Datos

| Caracteristica | Valor |
|---|---|
| Motor | InnoDB (transacciones, FK, triggers) |
| Charset | UTF8MB4 (soporte completo Unicode) |
| Collation | utf8mb4_unicode_ci |
| Puerto | 3306 (default MySQL) |
| Version minima | MySQL 8.0 (requerido para WITH ROLLUP en SPs) |

### 6.4 Configuracion de Testing

- **BD de desarrollo:** `lavanderia` (MySQL real)
- **BD de testing:** SQLite in-memory o `lavanderia_test` (MySQL)
- Se activa automaticamente via `ENVIRONMENT === 'testing'` en `Database.php`
- PHPUnit apunta a `lavanderia_test` via `phpunit.xml`

---

## 7. Modelo de acceso a datos correctamente implementado (2 puntos)

### 7.1 Herencia de CodeIgniter Model

Todos los modelos extienden `CodeIgniter\Model` y usan sus funcionalidades:

```php
class ClienteModel extends Model
{
    protected $table            = 'Cliente';
    protected $primaryKey       = 'idCliente';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';      // Siempre array, nunca object
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;          // Solo allowedFields se pueden modificar
    protected $useTimestamps    = false;         // Timestamps manejados manualmente
    protected $skipValidation   = false;         // Validacion activa por defecto

    protected $allowedFields = ['documento', 'nombres', 'telefono', 'direccion'];
}
```

### 7.2 Operaciones CRUD Heredadas de CI4 Model

| Operacion | Metodo CI4 | Ejemplo en el Proyecto |
|---|---|---|
| **Crear** | `$this->insert($data, true)` | `ClienteModel::insert()` en `ClientesController::create()` |
| **Leer uno** | `$this->find($id)` | `ClienteModel::find($id)` en `ClientesController::show()` |
| **Leer todos** | `$this->findAll($limit, $offset)` | `ClienteModel::findAll()` en `ClientesController::index()` |
| **Actualizar** | `$this->update($id, $data)` | `ClienteModel::update($id, $body)` en `ClientesController::update()` |
| **Eliminar** | `$this->delete($id)` | No usado (sin soft deletes) |
| **Contar** | `$this->countAllResults()` | `ClienteModel::countAllResults()` en paginacion |
| **Buscar** | `$this->like('campo', $termino)` | `ClienteModel::buscarCliente()` |

### 7.3 Query Builder y SQL Nativo

**Query Builder (consultas simples):**

```php
// Busqueda parcial por nombre, documento o telefono
public function buscarCliente(string $termino): array
{
    return $this->groupStart()
        ->like('nombres', $termino, 'both')
        ->orLike('documento', $termino, 'both')
        ->orLike('telefono', $termino, 'both')
        ->groupEnd()
        ->orderBy('nombres', 'ASC')
        ->findAll();
}
```

**SQL Nativo (consultas complejas con JOINs):**

```php
// EmpleadoModel::autenticar() — JOIN con Sucursal
$empleado = $this->db->table('Empleado e')
    ->select('e.idEmpleado, e.nombres, e.username, e.password, e.rol, e.idSucursal, s.nombre AS sucursal')
    ->join('Sucursal s', 's.idSucursal = e.idSucursal', 'inner')
    ->where('e.username', $username)
    ->get()->getRowArray();
```

### 7.4 Stored Procedures y Triggers

**Stored Procedure — sp_registrar_recepcion:**

```php
// PedidoModel::registrarRecepcion() — Ejecuta SP con transaccion nativa
public function registrarRecepcion(string $codigoTicket, string $fechaRecepcion, int $idCliente, int $idEmpleado): int
{
    $this->db->query(
        'CALL sp_registrar_recepcion(?, ?, ?, ?, @p_idPedidoGenerado)',
        [$codigoTicket, $fechaRecepcion, $idCliente, $idEmpleado]
    );

    $resultado = $this->db->query('SELECT @p_idPedidoGenerado AS idPedido')->getRowArray();
    return (int) $resultado['idPedido'];
}
```

**Triggers (7 en total, transparentes para PHP):**

| Trigger | Evento | Efecto |
|---|---|---|
| `trg_detalle_insertar_total` | AFTER INSERT DetallePedido | Recalcula `Pedido.total` |
| `trg_detalle_actualizar_total` | AFTER UPDATE DetallePedido | Recalcula `Pedido.total` |
| `trg_detalle_eliminar_total` | AFTER DELETE DetallePedido | Recalcula `Pedido.total` |
| `trg_pedido_antes_actualizar` | BEFORE UPDATE Pedido | Asigna `fechaEntrega` al pasar a Entregado |
| `trg_pedido_despues_actualizar_auditoria` | AFTER UPDATE Pedido | Registra cambio en `AuditoriaEstado` |
| `trg_pago_antes_insertar_validar` | BEFORE INSERT Pago | Valida saldo (SQLSTATE 45000) |
| `trg_pago_despues_insertar_estado` | AFTER INSERT Pago | Cambia a Pagado si suma >= total |

### 7.5 Manejo de Excepciones de BD

**Trait `DbExceptionHandler`** — Clasifica errores de MySQL en categorias legibles:

```php
trait DbExceptionHandler
{
    protected function excepcionAArray(DatabaseException $e, int $idPedido = 0): array
    {
        if ($this->esSobrepagoTrigger($e)) {
            return ['codigo_error' => 'SOBREPAGO_TRIGGER_45000', ...];
        }
        if ($this->esViolacionCheck($e)) {
            return ['codigo_error' => 'CHECK_CONSTRAINT_VIOLATION', ...];
        }
        if ($this->esViolacionFK($e)) {
            return ['codigo_error' => 'FOREIGN_KEY_VIOLATION', ...];
        }
        if ($this->esDuplicado($e)) {
            return ['codigo_error' => 'DUPLICATE_ENTRY', ...];
        }
        return ['codigo_error' => 'DATABASE_ERROR', ...];
    }
}
```

---

## 8. Operacion de registro (2 puntos)

### 8.1 Registro de Clientes

**Endpoint:** `POST /api/v1/clientes`

**Request:**
```json
{
    "documento": "12345678",
    "nombres": "Juan Pablo Mendoza Garcia",
    "telefono": "987654321",
    "direccion": "Jr. Los Pinos 234, Miraflores"
}
```

**Flujo completo:**

```
1. ClientesController::create() recibe el JSON
2. $this->clienteModel->validate($body) → Valida reglas CI4:
   - documento: required, min_length[8], max_length[15], alpha_numeric
   - documento: is_unique[Cliente.documento] → Evita duplicados
   - nombres: required, min_length[3], max_length[200]
   - telefono: regex_match[/^\+?[0-9\s\-]+$/]
3. Si validacion falla → HTTP 422 con errores de campo
4. $this->clienteModel->insert($body, true) → INSERT en tabla Cliente
5. MySQL valida UNIQUE constraint en documento
6. $this->clienteModel->find($idCliente) → Recupera el registro
7. HTTP 201 con datos del cliente creado
```

**Codigo del controlador:**

```php
public function create(): ResponseInterface
{
    $body = $this->getJsonBody();

    if (!$this->clienteModel->validate($body)) {
        return $this->respondValidationError($this->clienteModel->errors());
    }

    $idCliente = $this->clienteModel->insert($body, true);

    if ($idCliente === false) {
        return $this->respondError('Error al registrar el cliente.');
    }

    $cliente = $this->clienteModel->find((int) $idCliente);
    return $this->respondCreated($cliente, 'Cliente registrado exitosamente.');
}
```

### 8.2 Registro de Recepcion de Pedido

**Endpoint:** `POST /api/v1/pedidos`

**Request:**
```json
{
    "idCliente": 1,
    "detalles": [
        { "idPrenda": 1, "cantidad": 3, "descripcion": "Camisas blancas" },
        { "idPrenda": 2, "cantidad": 2, "descripcion": "Pantalon oscuro" }
    ]
}
```

**Flujo completo:**

```
1. PedidosController::crearRecepcion() recibe el JSON
2. Valida: idCliente existe (is_not_unique), detalles no vacio
3. Valida cada detalle: idPrenda > 0, cantidad > 0
4. Obtiene idEmpleado del JWT autenticado
5. PedidoModel::generarCodigoTicket() → "MC-20260901-A3F7B"
6. PedidoModel::registrarRecepcion() → CALL sp_registrar_recepcion
   └── MySQL: START TRANSACTION → INSERT → LAST_INSERT_ID → COMMIT
7. Para cada prenda: DetallePedidoModel::insertarDetalle()
   └── Calcula importe = cantidad × precio_prenda
   └── INSERT en DetallePedido
   └── trigger trg_detalle_insertar_total → UPDATE Pedido.total
8. PedidoModel::getDatosTicket() → Arma estructura del ticket
9. HTTP 201 con ticket completo
```

### 8.3 Registro de Pagos

**Endpoint:** `POST /api/v1/pagos`

**Request:**
```json
{
    "idPedido": 2,
    "monto": 33.00,
    "metodo": "Efectivo"
}
```

**Flujo completo:**

```
1. PagosController::registrarPago() verifica rol (cajero o admin)
2. Valida: idPedido existe, monto > 0, metodo in [Efectivo, Tarjeta, Yape/Plin]
3. Verifica que pedido NO este en estado Pagado o Cancelado
4. PagoModel::registrarPago() → $this->insert($data, true)
5. MySQL ejecuta trigger trg_pago_antes_insertar_validar:
   └── Calcula saldo = total - SUM(pagos_existentes)
   └── Si monto > saldo → SIGNAL SQLSTATE '45000' → rollback
6. Si INSERT exitoso → trigger trg_pago_despues_insertar_estado:
   └── Si SUM(pagos) >= total → UPDATE Pedido SET estado = 'Pagado'
7. PagoModel::getDatosRecibo() → Arma recibo para impresion
8. HTTP 201 con recibo y nuevo estado del pedido
```

### 8.4 Registro de Empleados (via Seeder)

**Archivo:** `app/Database/Seeds/SucursalSeeder.php`

Los empleados se registran con password hasheado:

```php
$password = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
$this->db->table('Empleado')->insert([
    'nombres'   => 'Maria Torres',
    'username'  => 'emp0001',
    'password'  => $password,
    'activo'    => 1,
    'rol'       => 'admin',
    'idSucursal'=> 1,
]);
```

---

## 9. Operacion de consulta y comprobacion de persistencia (2 puntos)

### 9.1 Consulta de Clientes con Paginacion

**Endpoint:** `GET /api/v1/clientes?q=juan&page=1&per_page=15`

**Codigo:**

```php
public function index(): ResponseInterface
{
    $q       = $this->request->getGet('q') ?? '';
    $page    = max(1, (int) ($this->request->getGet('page') ?? 1));
    $perPage = min(50, max(1, (int) ($this->request->getGet('per_page') ?? 15)));
    $offset  = ($page - 1) * $perPage;

    if (!empty($q)) {
        $clientes = $this->clienteModel->buscarCliente($q);
        $total    = count($clientes);
        $clientes = array_slice($clientes, $offset, $perPage);
    } else {
        $total    = $this->clienteModel->countAllResults(false);
        $clientes = $this->clienteModel->orderBy('nombres', 'ASC')->findAll($perPage, $offset);
    }

    return $this->respondSuccess([
        'clientes'   => $clientes,
        'paginacion' => [
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => (int) ceil($total / $perPage),
        ],
    ]);
}
```

**Respuesta (persistencia verificada):**

```json
{
    "success": true,
    "data": {
        "clientes": [
            {
                "idCliente": 1,
                "documento": "12345678",
                "nombres": "JUAN PABLO MENDOZA GARCIA",
                "telefono": "987654321",
                "direccion": "Jr. Los Pinos 234"
            }
        ],
        "paginacion": {
            "total": 1,
            "page": 1,
            "per_page": 15,
            "total_pages": 1
        }
    }
}
```

### 9.2 Busqueda por Documento (DNI/RUC)

**Endpoint:** `GET /api/v1/clientes/documento/12345678`

**Codigo:**

```php
public function buscarPorDocumento(?string $doc = null): ResponseInterface
{
    if (empty($doc)) {
        return $this->respondError('El numero de documento es requerido.', 400);
    }

    $cliente = $this->clienteModel->getClientePorDocumento($doc);

    if ($cliente === null) {
        return $this->respondNotFound("No se encontro ningun cliente con el documento '{$doc}'.");
    }

    return $this->respondSuccess($cliente, 'Cliente encontrado.');
}
```

**Metodo del modelo:**

```php
public function getClientePorDocumento(string $documento): ?array
{
    return $this->where('documento', $documento)->first();
}
```

### 9.3 Consulta de Pedido Completo (con detalles y pagos)

**Endpoint:** `GET /api/v1/pedidos/1`

**Codigo:**

```php
public function show($id = null): ResponseInterface
{
    $pedido = $this->pedidoModel->getPedidoCompleto((int) $id);

    if ($pedido === null) {
        return $this->respondNotFound("Pedido #{$id} no encontrado.");
    }

    return $this->respondSuccess($pedido);
}
```

**Metodo del modelo (3 JOINs + detalles + pagos):**

```php
public function getPedidoCompleto(int $idPedido): ?array
{
    $pedido = $this->db->table('Pedido p')
        ->select('p.*, c.documento, c.nombres AS cliente, e.nombres AS empleado, e.rol AS rolEmpleado')
        ->join('Cliente c', 'c.idCliente = p.idCliente', 'inner')
        ->join('Empleado e', 'e.idEmpleado = p.idEmpleado', 'inner')
        ->where('p.idPedido', $idPedido)
        ->get()->getRowArray();

    if (!$pedido) return null;

    $pedido['detalles'] = (new DetallePedidoModel())->getDetallesPorPedido($idPedido);
    $pedido['pagos']    = (new PagoModel())->getPagosPorPedido($idPedido);

    return $pedido;
}
```

**Respuesta (persistencia verificada):**

```json
{
    "success": true,
    "data": {
        "idPedido": 1,
        "codigoTicket": "MC-20260901-A3F7B",
        "fechaRecepcion": "2026-09-01 14:30:00",
        "estado": "En Proceso",
        "total": 27.00,
        "cliente": "JUAN PABLO MENDOZA GARCIA",
        "documento": "12345678",
        "empleado": "Maria Torres",
        "detalles": [
            {
                "servicio": "Lavado Simple",
                "nombrePrenda": "Camisa",
                "cantidad": 3,
                "precioUnitario": 5.00,
                "importe": 15.00
            }
        ],
        "pagos": [
            { "idPago": 1, "monto": 10.00, "metodo": "Efectivo", "fechaPago": "2026-09-01 15:00:00" }
        ]
    }
}
```

### 9.4 Vista de Pedidos Activos (Persistencia con Vista SQL)

**Vista `v_pedidos_activos`:**

```sql
CREATE VIEW v_pedidos_activos AS
SELECT
    p.idPedido, p.codigoTicket, p.fechaRecepcion, p.fechaEntrega,
    p.estado, p.total,
    c.documento AS documentoCliente, c.nombres AS cliente,
    e.nombres AS empleado, s.nombre AS sucursal
FROM Pedido p
INNER JOIN Cliente  c ON c.idCliente  = p.idCliente
INNER JOIN Empleado e ON e.idEmpleado = p.idEmpleado
INNER JOIN Sucursal s ON s.idSucursal = e.idSucursal
WHERE p.estado NOT IN ('Entregado', 'Cancelado')
```

**Consulta desde el modelo:**

```php
public function getPedidosActivos(): array
{
    return $this->db->table('v_pedidos_activos')
        ->orderBy('fechaRecepcion', 'DESC')
        ->get()->getResultArray();
}
```

### 9.5 Historial de Pagos y Saldo Pendiente

**Endpoint:** `GET /api/v1/pagos/pedido/1`

**Respuesta (persistencia verificada):**

```json
{
    "success": true,
    "data": {
        "idPedido": 1,
        "total": 27.00,
        "total_pagado": 10.00,
        "saldo_pendiente": 17.00,
        "estado": "En Proceso",
        "pagos": [
            { "idPago": 1, "monto": 10.00, "metodo": "Efectivo", "fechaPago": "2026-09-01 15:00:00" }
        ]
    }
}
```

### 9.6 Cierre de Caja (Persistencia con SP + ROLLUP)

**Endpoint:** `GET /api/v1/reportes/cierre-caja?fecha=2026-09-01`

**SP ejecutado:**

```sql
CALL sp_cierre_caja('2026-09-01');
-- GROUP BY metodo WITH ROLLUP genera fila de total general (metodo=NULL)
```

**Respuesta (persistencia verificada):**

```json
{
    "success": true,
    "data": {
        "fecha": "2026-09-01",
        "desglose": [
            { "metodo": "Efectivo",  "cantidadTransacciones": 5,  "total_ingresos": 150.00 },
            { "metodo": "Tarjeta",   "cantidadTransacciones": 2,  "total_ingresos": 80.00 },
            { "metodo": "Yape/Plin", "cantidadTransacciones": 3,  "total_ingresos": 45.00 }
        ],
        "total_general": 275.00,
        "total_operaciones": 10
    }
}
```

### 9.7 Dashboard del Dia (Consultas Agregadas)

**Endpoint:** `GET /api/v1/reportes/dashboard`

**Codigo (ReporteModel):**

```php
public function getResumenDashboard(): array
{
    $hoy = date('Y-m-d');

    $pedidosHoy = $this->db->table('Pedido')
        ->where('DATE(fechaRecepcion)', $hoy)->countAllResults();

    $ingresosHoy = (float) ($this->db->table('Pago')
        ->selectSum('monto')->where('DATE(fechaPago)', $hoy)
        ->get()->getRowArray()['monto'] ?? 0);

    $pedidosActivos = $this->db->table('v_pedidos_activos')->countAllResults();

    $pendientesCobro = $this->db->table('Pedido')
        ->whereIn('estado', ['Listo', 'Entregado'])->countAllResults();

    return [
        'pedidos_hoy'      => $pedidosHoy,
        'ingresos_hoy'     => number_format($ingresosHoy, 2),
        'pedidos_activos'  => $pedidosActivos,
        'pendientes_cobro' => $pendientesCobro,
        'fecha'            => date('d/m/Y'),
    ];
}
```

**Respuesta:**

```json
{
    "success": true,
    "data": {
        "pedidos_hoy": 8,
        "ingresos_hoy": "275.00",
        "pedidos_activos": 5,
        "pendientes_cobro": 2,
        "fecha": "01/09/2026"
    }
}
```

---

## 10. Repositorio y explicacion tecnica del equipo (1 punto)

### 10.1 Mapa Completo de Endpoints API

| # | Metodo | Ruta | Controlador | Filtro | Modulo |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/v1/auth/login` | `AuthController::login` | `throttler` | 1-Autenticacion |
| 2 | `GET` | `/api/v1/auth/me` | `AuthController::me` | `jwt` | 1-Autenticacion |
| 3 | `GET` | `/api/v1/clientes` | `ClientesController::index` | `jwt` | 2-Clientes |
| 4 | `GET` | `/api/v1/clientes/documento/{doc}` | `ClientesController::buscarPorDocumento` | `jwt` | 2-Clientes |
| 5 | `GET` | `/api/v1/clientes/{id}` | `ClientesController::show` | `jwt` | 2-Clientes |
| 6 | `POST` | `/api/v1/clientes` | `ClientesController::create` | `jwt` | 2-Clientes |
| 7 | `PUT` | `/api/v1/clientes/{id}` | `ClientesController::update` | `jwt` | 2-Clientes |
| 8 | `GET` | `/api/v1/pedidos` | `PedidosController::index` | `jwt` | 3-Recepcion |
| 9 | `GET` | `/api/v1/pedidos/{id}` | `PedidosController::show` | `jwt` | 3-Recepcion |
| 10 | `POST` | `/api/v1/pedidos` | `PedidosController::crearRecepcion` | `jwt` | 3-Recepcion |
| 11 | `GET` | `/api/v1/pedidos/{id}/ticket` | `PedidosController::obtenerTicket` | `jwt` | 3-Recepcion |
| 12 | `PATCH` | `/api/v1/pedidos/{id}/estado` | `PedidosController::cambiarEstado` | `jwt` | 4-Seguimiento |
| 13 | `POST` | `/api/v1/pagos` | `PagosController::registrarPago` | `jwt` | 5-Pagos |
| 14 | `GET` | `/api/v1/pagos/pedido/{id}` | `PagosController::obtenerHistorial` | `jwt` | 5-Pagos |
| 15 | `GET` | `/api/v1/pagos/{id}/recibo` | `PagosController::obtenerRecibo` | `jwt` | 5-Pagos |
| 16 | `GET` | `/api/v1/reportes/dashboard` | `ReportesController::dashboard` | `jwt` | 5-Pagos |
| 17 | `GET` | `/api/v1/reportes/diario` | `ReportesController::reporteDiario` | `jwt` | 5-Pagos |
| 18 | `GET` | `/api/v1/reportes/mensual` | `ReportesController::reporteMensual` | `jwt` | 5-Pagos |
| 19 | `GET` | `/api/v1/reportes/cierre-caja` | `ReportesController::cierreCaja` | `jwt` | 5-Pagos |
| 20 | `GET` | `/api/v1/reportes/servicios` | `ReportesController::serviciosMasSolicitados` | `jwt` | 6-Servicios |

### 10.2 Repositorio de Codigo — Archivos Principales

| Archivo | Lineas | Funcion |
|---|---|---|
| `app/Config/Routes.php` | 127 | Define los 20 endpoints REST |
| `app/Config/Database.php` | 204 | Configuracion MySQL + testing |
| `app/Config/Filters.php` | 153 | Registro de filtros de seguridad |
| `app/Controllers/Api/BaseApiController.php` | 233 | Controlador base con helpers JSON |
| `app/Controllers/Api/AuthController.php` | 165 | Login JWT + perfil |
| `app/Controllers/Api/ClientesController.php` | 228 | CRUD clientes |
| `app/Controllers/Api/PedidosController.php` | 354 | Recepcion + ticket + estados |
| `app/Controllers/Api/PagosController.php` | 259 | Cobro + recibos |
| `app/Controllers/Api/ReportesController.php` | 256 | Reportes + cierre de caja |
| `app/Models/EmpleadoModel.php` | 231 | Empleados + autenticacion |
| `app/Models/ClienteModel.php` | 136 | Clientes + busqueda |
| `app/Models/PedidoModel.php` | 378 | Pedidos + SP + vistas + ticket |
| `app/Models/DetallePedidoModel.php` | 194 | Detalle de prendas |
| `app/Models/PagoModel.php` | 290 | Pagos + SQLSTATE 45000 |
| `app/Models/ServicioModel.php` | 129 | Catalogo de servicios |
| `app/Models/ServicioPrendaModel.php` | 136 | Prendas con precio |
| `app/Models/ReporteModel.php` | 266 | Vistas + SP reportes |
| `app/Models/AuditoriaEstadoModel.php` | 162 | Auditoria inmutable |
| `app/Models/SucursalModel.php` | 114 | Sucursales |
| `app/Filters/JwtFilter.php` | 137 | Validacion JWT |
| `app/Filters/CorsFilter.php` | 154 | Headers CORS |
| `app/Filters/RolFilter.php` | 128 | RBAC jerarquico |
| `app/Filters/ThrottleFilter.php` | 61 | Rate limiting |
| `app/Filters/AuthFilter.php` | 91 | Sesion web |
| `app/Libraries/JwtHelper.php` | 155 | Generacion/validacion JWT |
| `app/Libraries/DbExceptionHandler.php` | 188 | Clasificador de excepciones |
| `app/Database/Migrations/000001_CreateLavanderiaSchema.php` | 240 | 9 tablas |
| `app/Database/Migrations/000002_CreateLavanderiaViews.php` | 86 | 2 vistas |
| `app/Database/Migrations/000003_CreateLavanderiaTriggers.php` | 223 | 7 triggers |
| `app/Database/Migrations/000004_CreateLavanderiaProcedures.php` | 95 | 2 SPs |
| `app/Database/Migrations/000005_AddAuthToEmpleado.php` | 54 | Auth en Empleado |

### 10.3 Resumen de Tecnologias y Herramientas

| Capa | Tecnologia | Version |
|---|---|---|
| Lenguaje | PHP | 8.2+ (strict_types) |
| Framework | CodeIgniter | 4.7+ |
| BD | MySQL | 8.0+ (InnoDB) |
| Autenticacion | Firebase JWT | 7.1+ |
| Testing | PHPUnit | 10.5+ |
| API Docs | Swagger/OpenAPI | — |
| CORS | Filtro personalizado | configurable via .env |

### 10.4 Criterios de Diseno Aplicados

| Criterio | Implementacion |
|---|---|
| **Thin Controller** | Controladores sin SQL, solo coordinacion HTTP → Modelo → JSON |
| **Fat Model** | Toda la logica de BD en modelos |
| **Doble validacion** | PHP (CI4 Validation) + MySQL (CHECK, UNIQUE, FK) |
| **Logica en BD** | 7 triggers + 2 SPs encapsulan reglas criticas |
| **Auditoria inmutable** | AuditoriaEstado escrito solo por triggers |
| **API versionada** | Todos los endpoints bajo `/api/v1/` |
| **Formato unificado** | BaseApiController define respuesta JSON estandar |
| **RBAC jerarquico** | admin > cajero > recepcionista con herencia de permisos |
| **Excepciones clasificadas** | DbExceptionHandler traduce errores MySQL a legibles |

### 10.5 Comandos de Referencia Rapida

```bash
# Ejecutar el proyecto
php spark serve

# Migraciones
php spark migrate                  # Aplicar todas
php spark migrate:rollback         # Revertir ultima
php spark migrate:status           # Ver estado

# Seeders
php spark db:seed LavanderiaSeeder                  # Desarrollo
php spark db:seed LavanderiaSeeder --env testing    # Testing

# Pruebas
vendor\bin\phpunit                                  # Suite completa
vendor\bin\phpunit --testsuite "MaryClean Models"  # Solo modelos
vendor\bin\phpunit --filter testSobrepago           # Test especifico

# Utilidades
php spark routes       # Ver todas las rutas
php spark cache:clear  # Limpiar cache
```

---

*Documento Tecnico — Backend MaryClean v1.0*
*Programa ADSI II — Guia 3*
*Elaborado: 02 de septiembre de 2026*
