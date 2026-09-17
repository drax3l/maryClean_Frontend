# 🧺 MaryClean — Sistema de Gestión de Lavandería
### Documentación Técnica — Backend PHP (CodeIgniter 4) + MySQL

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Mapa de Arquitectura MVC](#3-mapa-de-arquitectura-mvc)
4. [Estructura de Directorios](#4-estructura-de-directorios)
5. [Diccionario y Esquema de Datos](#5-diccionario-y-esquema-de-datos)
6. [Catálogo de Lógica Encapsulada en DB](#6-catálogo-de-lógica-encapsulada-en-db)
7. [Capa de Modelos CI4](#7-capa-de-modelos-ci4)
8. [Arquitectura de Seguridad (RBAC)](#8-arquitectura-de-seguridad-rbac)
9. [Manejo de Excepciones de Base de Datos](#9-manejo-de-excepciones-de-base-de-datos)
10. [Suite de Pruebas (Testing)](#10-suite-de-pruebas-testing)
11. [Migraciones y Seeders](#11-migraciones-y-seeders)
12. [Guía de Extensión y Mantenimiento](#12-guía-de-extensión-y-mantenimiento)
13. [Comandos de Referencia Rápida](#13-comandos-de-referencia-rápida)

---

## 1. Resumen del Proyecto

**MaryClean** es un sistema de gestión integral para lavanderías presenciales. Centraliza la operación del negocio en un único backend PHP/CI4 con lógica de negocio crítica embebida directamente en el motor de base de datos MySQL.

### Principios de Diseño

| Principio | Implementación |
|---|---|
| **Lógica de negocio en la BD** | Triggers, Stored Procedures y Views encapsulan reglas críticas a nivel motor |
| **Cobro 100% presencial** | No hay pasarelas de pago externas. Métodos: Efectivo, POS (Tarjeta), Yape/Plin manual |
| **Auditoría inmutable** | `AuditoriaEstado` solo es escrita por triggers; PHP solo tiene permisos de lectura |
| **Integridad garantizada** | CHECK CONSTRAINTS, FK con CASCADE y validación en doble capa (PHP + MySQL) |
| **RBAC integrado** | Filtros CI4 (`AuthFilter`, `RolFilter`) con jerarquía: admin > cajero > recepcionista |

### Flujo de Operación Principal

```
Recepción del pedido
        ↓
Registro del cliente → Creación del ticket (sp_registrar_recepcion)
        ↓
Adición de prendas → Triggers recalculan total automáticamente
        ↓
Cambios de estado → Triggers registran auditoría
        ↓
Cobro en mostrador → Trigger valida saldo → Trigger marca 'Pagado'
        ↓
Cierre de caja → sp_cierre_caja con ROLLUP
```

---

## 2. Stack Tecnológico

| Componente | Versión | Descripción |
|---|---|---|
| **PHP** | 8.1+ | Backend con `declare(strict_types=1)` obligatorio |
| **CodeIgniter 4** | 4.x | Framework MVC. Namespace `App\` |
| **MySQL** | 8.0+ | BD `lavanderia`. Motor InnoDB. Charset UTF8MB4 |
| **PHPUnit** | 10+ | Suite de pruebas. BD separada: `lavanderia_test` |

---

## 3. Mapa de Arquitectura MVC

```
+-------------------------------------------------------------------+
|  CAPA DE PRESENTACIÓN                                             |
|  Navegador / Terminal del Recepcionista / Impresora de Tickets    |
+------------------------------+------------------------------------+
                               | HTTP Request
+------------------------------v------------------------------------+
|  CAPA DE ENRUTAMIENTO — app/Config/Routes.php                     |
|  Define URI → Controlador::método                                 |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE FILTROS — app/Filters/                                   |
|  +------------------+   +-------------------------------------+   |
|  |  AuthFilter      |   |  RolFilter                          |   |
|  |  Verifica sesión | → |  Valida rol RBAC (jerarquía)        |   |
|  |  Redirige /login |   |  Devuelve 403 si insuficiente       |   |
|  +------------------+   +-------------------------------------+   |
|  + CSRF global (Config\Filters.php)                               |
+------------------------------+------------------------------------+
                               | Request autenticado y autorizado
+------------------------------v------------------------------------+
|  CAPA DE CONTROLADORES — app/Controllers/                         |
|  Recibe Request → Llama al Modelo → Pasa datos a la Vista        |
|  Captura excepciones de modelo y devuelve JSON/flashdata          |
+------------------------------+------------------------------------+
                               |
+------------------------------v------------------------------------+
|  CAPA DE MODELOS — app/Models/                                    |
|                                                                   |
|  SucursalModel   EmpleadoModel   ClienteModel                     |
|  ServicioModel   ServicioPrendaModel                              |
|  PedidoModel ---------> sp_registrar_recepcion (START TRANSACTION)|
|               +--------> v_pedidos_activos (VIEW)                 |
|  DetallePedidoModel ---> importe calculado PHP antes de INSERT    |
|  PagoModel -----------> registrarPago() captura SQLSTATE 45000    |
|  AuditoriaEstadoModel -> SOLO LECTURA (insert/update/delete       |
|                          bloqueados en PHP)                       |
|  ReporteModel ---------> v_reporte_diario + sp_cierre_caja        |
|                                                                   |
|  TRAIT: DbExceptionHandler (reutilizable en todos los modelos)    |
+------------------------------+------------------------------------+
                               | SQL Queries
+------------------------------v------------------------------------+
|  MOTOR DE BASE DE DATOS — MySQL 8.0 (InnoDB)                      |
|                                                                   |
|  TABLAS: 9 tablas con FK, INDEX y CHECK CONSTRAINTS               |
|                                                                   |
|  VISTAS:                                                          |
|    v_pedidos_activos   → Pedidos activos con JOINs                |
|    v_reporte_diario    → Ingresos por fecha y método              |
|                                                                   |
|  STORED PROCEDURES:                                               |
|    sp_registrar_recepcion → INSERT transaccional + OUT param      |
|    sp_cierre_caja         → GROUP BY WITH ROLLUP                  |
|                                                                   |
|  TRIGGERS (automáticos, transparentes para PHP):                  |
|  +-- DetallePedido ---> [INSERT/UPDATE/DELETE] recalcula total    |
|  +-- Pedido UPDATE  ---> [BEFORE] Asigna fechaEntrega             |
|  +-- Pedido UPDATE  ---> [AFTER] Registra AuditoriaEstado         |
|  +-- Pago INSERT    ---> [BEFORE] Valida saldo (SQLSTATE 45000)   |
|  +-- Pago INSERT    ---> [AFTER] Cambia estado a 'Pagado'         |
+-------------------------------------------------------------------+
```

---

## 4. Estructura de Directorios

```
proyecto_prueba/
├── app/
│   ├── Config/
│   │   └── Filters.php          ← Registra 'auth' y 'rol' + CSRF global
│   ├── Database/
│   │   ├── Migrations/
│   │   │   ├── 2026-09-01-000001_CreateLavanderiaSchema.php     ← 9 tablas
│   │   │   ├── 2026-09-01-000002_CreateLavanderiaViews.php      ← 2 vistas
│   │   │   ├── 2026-09-01-000003_CreateLavanderiaTriggers.php   ← 7 triggers
│   │   │   └── 2026-09-01-000004_CreateLavanderiaProcedures.php ← 2 SPs
│   │   └── Seeds/
│   │       ├── LavanderiaSeeder.php   ← Orquestador maestro
│   │       ├── SucursalSeeder.php     ← Sucursales + Empleados
│   │       ├── ClienteSeeder.php      ← 5 clientes de prueba
│   │       ├── ServicioSeeder.php     ← 4 servicios + 16 prendas
│   │       └── PedidoSeeder.php       ← 3 pedidos + detalles + pago parcial
│   ├── Filters/
│   │   ├── AuthFilter.php       ← Verifica sesión activa
│   │   └── RolFilter.php        ← RBAC con jerarquía de roles
│   ├── Libraries/
│   │   └── DbExceptionHandler.php ← Trait para clasificar DatabaseExceptions
│   └── Models/
│       ├── SucursalModel.php
│       ├── EmpleadoModel.php
│       ├── ClienteModel.php
│       ├── ServicioModel.php
│       ├── ServicioPrendaModel.php
│       ├── PedidoModel.php        ← SP + Vista + Ticket + Saldo
│       ├── DetallePedidoModel.php ← Cálculo de importe + triggers
│       ├── PagoModel.php          ← Captura SQLSTATE 45000 + Recibo
│       ├── AuditoriaEstadoModel.php ← INMUTABLE (insert/update/delete bloqueados)
│       └── ReporteModel.php       ← Vistas + SP cierre de caja + Dashboard
├── tests/
│   └── app/
│       └── Models/
│           ├── PedidoModelTest.php       ← 12 tests
│           ├── PagoModelTest.php         ← 11 tests
│           └── DetallePedidoModelTest.php ← 12 tests
├── phpunit.xml                  ← Apunta a lavanderia_test
└── .env                         ← Credenciales de lavanderia (desarrollo)
```

---

## 5. Diccionario y Esquema de Datos

### Modelo Entidad-Relación (Simplificado)

```
Sucursal (1) ----< Empleado (N)
                       |
                       | (idEmpleado FK)
                       v
Cliente (1) ----< Pedido (N) >---- Empleado
                       |
                       | (idPedido FK)
                 +-----+------+
                 v            v
           DetallePedido    Pago
                 |
                 | (idPrenda FK)
                 v
           ServicioPrenda >---- Servicio

Pedido (1) ----< AuditoriaEstado (N)
```

### Detalle de Tablas

| Tabla | PK | Campos Clave | Constraints |
|---|---|---|---|
| **Sucursal** | `idSucursal` | nombre, direccion, telefono | — |
| **Empleado** | `idEmpleado` | nombres, rol ENUM | FK→Sucursal |
| **Cliente** | `idCliente` | `documento` UNIQUE, nombres, telefono | INDEX(telefono) |
| **Servicio** | `idServicio` | nombre, `tiempoEstimado` | CHECK(tiempoEstimado>0) |
| **ServicioPrenda** | `idPrenda` | nombrePrenda, `precio` | FK→Servicio, CHECK(precio>0) |
| **Pedido** | `idPedido` | `codigoTicket` UNIQUE, estado ENUM, `total` | FK→Cliente,Empleado; INDEX(fechaRecepcion, estado) |
| **DetallePedido** | `idDetalle` | cantidad, importe, idPedido, idPrenda | FK→Pedido(CASCADE), CHECK(cantidad>0, importe>0) |
| **Pago** | `idPago` | monto, metodo ENUM, fechaPago | FK→Pedido; CHECK(monto>0); INDEX(fechaPago) |
| **AuditoriaEstado** | `idAuditoria` | estadoAnterior, estadoNuevo, fechaCambio | FK→Pedido(CASCADE) |

### Estados del Ciclo de Vida de un Pedido

```
Recibido --> En Proceso --> Listo --> Entregado
                                         |
                             +-----------+
                             |
                       [Pago registrado]
                             |
                          Pagado <-- (automático por trigger)

En cualquier estado: --> Cancelado
```

---

## 6. Catálogo de Lógica Encapsulada en DB

### 6.1 Vistas (VIEWS)

#### `v_pedidos_activos`
- **Propósito**: Consulta desnormalizada para el panel de operaciones diarias.
- **Excluye**: estados `'Entregado'` y `'Cancelado'`.
- **Incluye**: datos de cliente, empleado y sucursal via `INNER JOIN`.
- **Usada en**: `PedidoModel::getPedidosActivos()`, `ReporteModel::getPedidosActivos()`.
- **Índice aprovechado**: `idx_pedido_estado` en `Pedido.estado`.

#### `v_reporte_diario`
- **Propósito**: Agrupación de ingresos para reportes de caja.
- **Agrupa por**: `DATE(fechaPago)` y `metodo` de pago.
- **Columnas calculadas**: `SUM(monto)`, `COUNT(idPago)`, MIN, MAX, AVG.
- **Usada en**: `ReporteModel::getReporteDiarioHoy()`, `getReportePorRango()`.
- **Índice aprovechado**: `idx_pago_fecha` en `Pago.fechaPago`.

---

### 6.2 Stored Procedures

#### `sp_registrar_recepcion`

```
Parámetros IN:  codigoTicket VARCHAR(20)
                fechaRecepcion DATETIME
                idCliente INT UNSIGNED
                idEmpleado INT UNSIGNED
Parámetro OUT:  p_idPedidoGenerado INT UNSIGNED
```

- **Inicia** `START TRANSACTION` nativo de MySQL.
- **Inserta** la cabecera del pedido con estado `'Recibido'` y `total=0`.
- **Devuelve** el ID generado via `LAST_INSERT_ID()` en el parámetro `OUT`.
- **Maneja** errores con `DECLARE EXIT HANDLER FOR SQLEXCEPTION → ROLLBACK`.
- **Invocado en**: `PedidoModel::registrarRecepcion()`.

> **Nota CI4**: Se usa `CALL sp_registrar_recepcion(?, ?, ?, ?, @out)` seguido de `SELECT @out AS idPedido` en dos queries separadas.

#### `sp_cierre_caja`

```
Parámetro IN: p_fecha DATE
Resultado:    Rows con metodo, cantidadTransacciones, total_ingresos
              Fila final con metodo=NULL = TOTAL GENERAL (ROLLUP)
```

- **Calcula** el desglose de ingresos del día por método de pago.
- **Usa** `GROUP BY metodo WITH ROLLUP` para incluir el total acumulado.
- **Invocado en**: `ReporteModel::ejecutarCierreCaja()`.

> **Nota de parsing**: La fila con `metodo IS NULL` es el total general. El modelo la separa automáticamente del array de filas de detalle.

---

### 6.3 Triggers (7 en total)

#### Grupo 1: Recálculo de Total del Pedido

| Trigger | Evento | Tabla | Efecto |
|---|---|---|---|
| `trg_detalle_insertar_total` | `AFTER INSERT` | `DetallePedido` | `UPDATE Pedido SET total = SUM(importe) WHERE idPedido = NEW.idPedido` |
| `trg_detalle_actualizar_total` | `AFTER UPDATE` | `DetallePedido` | Mismo recálculo con `NEW.idPedido` |
| `trg_detalle_eliminar_total` | `AFTER DELETE` | `DetallePedido` | Mismo recálculo con `OLD.idPedido` |

> **Implicación para PHP**: `DetallePedidoModel` calcula el importe en PHP (cantidad × precio) antes de insertar. Los triggers sincronizan `Pedido.total`. **Nunca actualizar `Pedido.total` directamente desde PHP.**

#### Grupo 2: Automatización de Pedido

| Trigger | Evento | Tabla | Efecto |
|---|---|---|---|
| `trg_pedido_antes_actualizar` | `BEFORE UPDATE` | `Pedido` | Si `NEW.estado = 'Entregado'` → `SET NEW.fechaEntrega = NOW()` |
| `trg_pedido_despues_actualizar_auditoria` | `AFTER UPDATE` | `Pedido` | Si `NEW.estado != OLD.estado` → `INSERT INTO AuditoriaEstado` |

> **Implicación para PHP**: `PedidoModel::cambiarEstado()` solo actualiza el campo `estado`. La `fechaEntrega` y el registro de auditoría son exclusivos de los triggers.

#### Grupo 3: Control de Pagos

| Trigger | Evento | Tabla | Efecto |
|---|---|---|---|
| `trg_pago_antes_insertar_validar` | `BEFORE INSERT` | `Pago` | Valida `NEW.monto <= (total - SUM(pagos))`. Si excede → `SIGNAL SQLSTATE '45000'` |
| `trg_pago_despues_insertar_estado` | `AFTER INSERT` | `Pago` | Si `SUM(pagos) >= total` → `UPDATE Pedido SET estado = 'Pagado'` |

> **Implicación para PHP**: `PagoModel::registrarPago()` envuelve el INSERT en `try/catch DatabaseException`. El mensaje del `SIGNAL` es analizado para clasificarlo como `SOBREPAGO_TRIGGER_45000`.

---

## 7. Capa de Modelos CI4

### Resumen de Modelos

| Modelo | Tabla | Métodos Destacados | Interacción DB Especial |
|---|---|---|---|
| `SucursalModel` | `Sucursal` | `getSucursalConEmpleados()`, `listarConEmpleados()` | JOIN con Empleado |
| `EmpleadoModel` | `Empleado` | `getEmpleadosPorRol()`, `listarTodosConSucursal()` | JOIN con Sucursal |
| `ClienteModel` | `Cliente` | `buscarCliente()`, `getDatosTicket()` | Búsqueda multi-campo |
| `ServicioModel` | `Servicio` | `getCatalogoCompleto()`, `getListaDropdown()` | Nested → ServicioPrenda |
| `ServicioPrendaModel` | `ServicioPrenda` | `getCatalogoParaPedido()`, `getPrecio()` | JOIN con Servicio |
| `PedidoModel` | `Pedido` | `registrarRecepcion()`, `getPedidosActivos()`, `getDatosTicket()` | SP + Vista |
| `DetallePedidoModel` | `DetallePedido` | `insertarDetalle()`, `getDetallesParaTicket()` | Triggers automáticos |
| `PagoModel` | `Pago` | `registrarPago()` → captura 45000, `getDatosRecibo()` | Trigger validación |
| `AuditoriaEstadoModel` | `AuditoriaEstado` | `getHistorialPorPedido()`, `getAuditoriaPorRango()` | **SOLO LECTURA** |
| `ReporteModel` | *(vistas/SPs)* | `ejecutarCierreCaja()`, `getResumenDashboard()` | Vista + SP ROLLUP |

### Convenciones de Modelos

```php
// Todos los modelos siguen esta convención:
declare(strict_types=1);
namespace App\Models;

class XxxModel extends Model {
    protected $returnType       = 'array';  // Siempre array, nunca object
    protected $useAutoIncrement = true;
    protected $useTimestamps    = false;    // Timestamps manejados manualmente
    protected $skipValidation   = false;    // Validación activa por defecto
}
```

---

## 8. Arquitectura de Seguridad (RBAC)

### Roles y Permisos

| Rol | Pedidos | Clientes | Cobros | Reportes | Admin |
|---|---|---|---|---|---|
| `admin` | CRUD | CRUD | ✅ | ✅ | ✅ |
| `cajero` | Lectura | Lectura | ✅ | ✅ | ❌ |
| `recepcionista` | CRUD | CRUD | ❌ | ❌ | ❌ |

### Jerarquía de Roles (RolFilter)

```
admin         → puede acceder a rutas de: [admin, cajero, recepcionista]
cajero        → puede acceder a rutas de: [cajero, recepcionista]
recepcionista → solo rutas de: [recepcionista]
```

### Uso en Rutas (Routes.php)

```php
// Solo admin
$routes->group('admin', ['filter' => 'rol:admin'], function($routes) {
    $routes->get('empleados', 'EmpleadoController::index');
    $routes->get('sucursales', 'SucursalController::index');
});

// Admin + Cajero
$routes->group('caja', ['filter' => 'rol:admin,cajero'], function($routes) {
    $routes->get('cierre', 'CajaController::cierre');
    $routes->post('pago', 'PagoController::registrar');
});

// Todos los roles autenticados
$routes->group('pedidos', ['filter' => 'auth'], function($routes) {
    $routes->get('/', 'PedidoController::index');
});
```

### Datos de Sesión Requeridos

```php
// Al hacer login, el controlador debe establecer:
session()->set([
    'empleado_id'     => $empleado['idEmpleado'],
    'empleado_rol'    => $empleado['rol'],        // 'admin'|'cajero'|'recepcionista'
    'empleado_nombre' => $empleado['nombres'],
    'sucursal_id'     => $empleado['idSucursal'],
]);
```

### Seguridad CSRF

- CSRF activado **globalmente** en `Config/Filters.php` para todas las rutas POST.
- Los formularios deben incluir `<?= csrf_field() ?>`.
- Las peticiones AJAX deben enviar el header `X-CSRF-TOKEN`.

### Principio de Mínimo Privilegio en MySQL

```sql
-- Usuario de aplicación (NUNCA usar root en producción)
CREATE USER 'maryclean_app'@'localhost' IDENTIFIED BY 'password_seguro';

-- Permisos mínimos necesarios
GRANT SELECT, INSERT, UPDATE, DELETE ON lavanderia.* TO 'maryclean_app'@'localhost';
GRANT EXECUTE ON lavanderia.* TO 'maryclean_app'@'localhost';

-- AuditoriaEstado: SOLO lectura para la aplicación
REVOKE INSERT, UPDATE, DELETE ON lavanderia.AuditoriaEstado FROM 'maryclean_app'@'localhost';
```

---

## 9. Manejo de Excepciones de Base de Datos

### Trait `DbExceptionHandler` (`app/Libraries/DbExceptionHandler.php`)

Se aplica con `use DbExceptionHandler` en cualquier modelo.

### Tipos de Excepción Clasificados

| Código | Causa | Mensaje para el Usuario |
|---|---|---|
| `SOBREPAGO_TRIGGER_45000` | Trigger `trg_pago_antes_insertar_validar` | "El monto supera el saldo pendiente (S/ X.XX)." |
| `CHECK_CONSTRAINT_VIOLATION` | Precio/monto/cantidad ≤ 0 | "El valor viola una restricción de integridad." |
| `FOREIGN_KEY_VIOLATION` | FK inexistente | "El registro referenciado no existe." |
| `DUPLICATE_ENTRY` | `codigoTicket` o `documento` duplicado | "Ya existe un registro con ese valor único." |
| `DATABASE_ERROR` | Error genérico | "Error interno. Contacte al administrador." |
| `VALIDATION_ERROR` | Validación CI4 antes de llegar a BD | Lista de errores de validación |

### Patrón de Uso en Controladores

```php
class PagoController extends BaseController {
    public function registrar(): ResponseInterface {
        $pagoModel = new PagoModel();
        $resultado = $pagoModel->registrarPago(
            (int) $this->request->getPost('idPedido'),
            (float) $this->request->getPost('monto'),
            $this->request->getPost('metodo')
        );

        if ($resultado['success']) {
            return $this->response->setJSON($resultado)->setStatusCode(201);
        }

        // Código HTTP según tipo de error
        $statusCode = $resultado['codigo_error'] === 'SOBREPAGO_TRIGGER_45000' ? 422 : 400;
        return $this->response->setJSON($resultado)->setStatusCode($statusCode);
    }
}
```

---

## 10. Suite de Pruebas (Testing)

### Configuración del Entorno de Pruebas

La BD `lavanderia_test` es **completamente independiente** de `lavanderia`.

```bash
# 1. Crear la BD de testing
mysql -u root -e "CREATE DATABASE lavanderia_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Ejecutar migraciones en entorno de testing
php spark migrate --env testing

# 3. Poblar con datos limpios
php spark db:seed LavanderiaSeeder --env testing
```

### Ejecutar Tests

```bash
# Suite completa
vendor\bin\phpunit

# Solo modelos MaryClean
vendor\bin\phpunit --testsuite "MaryClean Models"

# Test específico
vendor\bin\phpunit --filter testSobrepagoBloqueadoPorTrigger

# Con cobertura de código
vendor\bin\phpunit --coverage-html build/logs/html
```

### Resumen de Tests por Suite (35 tests totales)

#### `PedidoModelTest` — 12 tests

| Test | Verifica |
|---|---|
| `testCambiarEstadoExitoso` | Transición de estado |
| `testCambiarEstadoInvalidoLanzaExcepcion` | Validación de estado |
| `testCambiarAEntregadoAsignaFechaEntrega` | Trigger `trg_pedido_antes_actualizar` |
| `testCambioEstadoRegistraAuditoria` | Trigger `trg_pedido_despues_actualizar_auditoria` |
| `testCancelarPedido` | Estado 'Cancelado' |
| `testGetPedidosActivosExcluyeFinalizados` | Vista `v_pedidos_activos` |
| `testGetPedidosActivosTieneJoins` | Estructura de la vista |
| `testGetSaldoPendiente` | Cálculo de saldo |
| `testSaldoPendientePedidoSinTotal` | Saldo en pedido vacío |
| `testGetDatosTicketEstructura` | Formato del ticket imprimible |
| `testGenerarCodigoTicketFormato` | Regex del código de ticket |
| `testRegistrarRecepcionDevuelveIdValido` | SP con parámetro OUT |

#### `PagoModelTest` — 11 tests

| Test | Verifica |
|---|---|
| `testRegistrarPagoValido` | Pago exitoso |
| `testRegistrarPagoConDiferentesMetodos` | Los 3 métodos presenciales |
| `testSobrepagoBloqueadoPorTrigger` | **SQLSTATE 45000** |
| `testSobrepagoBloqueadoCerca` | Límite exacto del trigger |
| `testPagoExactoDelSaldoEsAceptado` | Pago limítrofe válido |
| `testPagoCompletoActualizaEstadoAPagado` | Trigger post-pago |
| `testPagoParcialNoActualizaEstadoAPagado` | Pago parcial |
| `testMontoNegativoOCeroFallaValidacion` | CHECK CONSTRAINT monto |
| `testMetodoPagoInvalidoFallaValidacion` | Validación de método |
| `testGetDatosReciboEstructura` | Formato del recibo de caja |
| `testGetTotalPagado` | Suma acumulada de pagos |

#### `DetallePedidoModelTest` — 12 tests

| Test | Verifica |
|---|---|
| `testTriggerInsertarActualizaTotalPedido` | Trigger `trg_detalle_insertar_total` |
| `testInsertarMultiplesDetallesAcumulaTotal` | Acumulación de totales |
| `testTriggerEliminarDetalleActualizaTotalPedido` | Trigger `trg_detalle_eliminar_total` |
| `testEliminarTodosLosDetallesDejaTotal0` | Total a 0 sin detalles |
| `testTriggerActualizarDetalleRecalculaTotal` | Trigger `trg_detalle_actualizar_total` |
| `testInsertarDetalleCantidadCeroFalla` | CHECK cantidad > 0 |
| `testInsertarDetallePrendaInexistenteFalla` | FK de prenda |
| `testGetDetallesPorPedidoConteo` | Conteo correcto |
| `testGetDetallesPorPedidoTieneJoins` | Estructura JOIN |
| `testCalcularSubtotalCoincideConTotalPedido` | Consistencia PHP vs BD |
| `testGetDetallesParaTicketFormato` | Formato para impresión |

---

## 11. Migraciones y Seeders

### Orden de Ejecución de Migraciones

```
000001 → Esquema (9 tablas + FK + índices + CHECK CONSTRAINTS)
000002 → Vistas (v_pedidos_activos, v_reporte_diario)
000003 → Triggers (7 triggers en DetallePedido, Pedido y Pago)
000004 → Stored Procedures (sp_registrar_recepcion, sp_cierre_caja)
```

> **IMPORTANTE**: Las migraciones 2, 3 y 4 dependen de la migración 1. No ejecutar fuera de orden.

### Comandos de Migración

```bash
# Aplicar todas las migraciones
php spark migrate

# Revertir la última migración
php spark migrate:rollback

# Revertir hasta un batch específico
php spark migrate:rollback --batch 3

# Verificar estado de migraciones
php spark migrate:status
```

### Seeders — Orden de Dependencia

```
LavanderiaSeeder (orquestador maestro)
    +-- SucursalSeeder    (Sucursal + Empleado)
    +-- ClienteSeeder     (5 Clientes)
    +-- ServicioSeeder    (4 Servicios + 16 Prendas)
    +-- PedidoSeeder      (3 Pedidos + Detalles + Pago parcial de prueba)
```

---

## 12. Guía de Extensión y Mantenimiento

### Agregar una Nueva Prenda a un Servicio Existente

No requiere migración nueva. Solo insertar en la BD:
```sql
INSERT INTO ServicioPrenda (nombrePrenda, precio, idServicio)
VALUES ('Chaleco formal', 12.00, 2);
```
El CHECK CONSTRAINT `precio > 0` lo valida automáticamente.

### Agregar un Nuevo Método de Pago

1. **Modificar el ENUM en BD** (nueva migración):
   ```sql
   ALTER TABLE Pago MODIFY COLUMN metodo ENUM('Efectivo','Tarjeta','Yape/Plin','Nuevo') NOT NULL;
   ```
2. **Actualizar** `PagoModel::METODOS_PAGO`.
3. **Actualizar** `$validationRules['metodo']` en `PagoModel`.
4. **Revisar** `v_reporte_diario` si el nuevo método requiere agrupación diferente.

### Agregar un Nuevo Estado de Pedido

1. Modificar el ENUM en `Pedido.estado` (nueva migración).
2. Actualizar `PedidoModel::ESTADOS`.
3. Revisar los triggers `trg_pago_despues_insertar_estado` y `trg_pedido_antes_actualizar`.
4. Agregar un test en `PedidoModelTest`.

### Agregar un Nuevo Rol de Empleado

1. Modificar el ENUM en `Empleado.rol` (nueva migración).
2. Actualizar `EmpleadoModel::ROLES_VALIDOS`.
3. Actualizar `JERARQUIA` en `RolFilter`.
4. Actualizar la validación `in_list[...]` en `EmpleadoModel::$validationRules`.

### Modificar un Trigger Existente

1. Crear una **nueva migración** (no modificar las existentes).
2. La nueva migración ejecuta `DROP TRIGGER IF EXISTS` + `CREATE TRIGGER`.
3. Ejecutar la suite de tests para verificar el comportamiento.
4. Actualizar este `README.md`.

### Modificar `sp_registrar_recepcion`

Si cambias los parámetros del SP, actualizar simultáneamente:
- La migración (nuevo `DROP PROCEDURE` + `CREATE PROCEDURE`).
- `PedidoModel::registrarRecepcion()` (argumentos del `CALL`).
- `PedidoModelTest::testRegistrarRecepcionDevuelveIdValido()`.

### Lo que NUNCA se debe hacer

```php
// NUNCA actualizar Pedido.total desde PHP
$this->db->table('Pedido')->update(['total' => 100], ['idPedido' => 1]);

// NUNCA insertar directamente en AuditoriaEstado
$auditoriaModel->insert([...]); // Lanza RuntimeException intencionalmente

// NUNCA deshabilitar FOREIGN_KEY_CHECKS fuera de Seeders de testing
$this->db->query('SET FOREIGN_KEY_CHECKS = 0'); // SOLO en LavanderiaSeeder

// NUNCA conectar la app con el usuario root de MySQL en producción
// Usar 'maryclean_app' con permisos mínimos
```

---

## 13. Comandos de Referencia Rápida

```bash
# Servidor de desarrollo
php spark serve

# Migraciones
php spark migrate                    # Aplicar todas
php spark migrate:rollback           # Revertir última
php spark migrate:status             # Ver estado

# Seeders
php spark db:seed LavanderiaSeeder                    # Desarrollo
php spark db:seed LavanderiaSeeder --env testing      # Testing

# Testing
vendor\bin\phpunit                                    # Suite completa
vendor\bin\phpunit --testsuite "MaryClean Models"    # Solo modelos
vendor\bin\phpunit --filter testSobrepago            # Test por nombre
vendor\bin\phpunit --coverage-text                   # Cobertura en terminal

# Utilidades CI4
php spark list          # Ver todos los comandos disponibles
php spark cache:clear   # Limpiar caché
php spark routes        # Ver todas las rutas registradas
```

---

*MaryClean v1.0 — Arquitectura CI4 MVC + MySQL InnoDB*
*Documentación técnica generada: 2026-09-01*
