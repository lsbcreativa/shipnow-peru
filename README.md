# ShipNow Perú

API REST para **ShipNow Perú**, una plataforma de venta y despacho de productos a todo el territorio peruano, desarrollada como proyecto de **Backend III (Coderhouse)**.

## Índice

- [Temática](#temática)
- [Estado del proyecto](#estado-del-proyecto)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Cómo ejecutar](#cómo-ejecutar)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Arquitectura en capas](#arquitectura-en-capas)
- [¿Por qué separar Service de Repository?](#por-qué-separar-service-de-repository)
- [Constantes de dominio](#constantes-de-dominio)
- [Rutas disponibles](#rutas-disponibles)
- [Ejemplos de uso](#ejemplos-de-uso)
- [Módulo de mocking](#módulo-de-mocking)
- [Manejo de errores](#manejo-de-errores)

## Temática

**ShipNow Perú** conecta tiendas con clientes en cualquier rincón del país: Lima, Arequipa, Cusco, Trujillo, Piura, Chiclayo y más. Cada producto se publica con su precio en soles (S/), su stock y la ciudad desde la que se despacha, y cada compra se convierte en un pedido que un repartidor lleva hasta la puerta del cliente.

La plataforma maneja estas entidades:

- **Productos**: catálogo con precio, stock, categoría y ciudad de despacho. El estado del producto (disponible, sin stock, discontinuado) se calcula solo, según las reglas de negocio.
- **Usuarios**: las personas registradas en ShipNow Perú, con un rol asignado (`cliente`, `repartidor` o `admin`) que define qué hace cada quien en la plataforma.
- **Pedidos**: la compra que arma un cliente, con sus productos, monto total, ciudad de destino, estado y prioridad de despacho.
- **Entregas**: el seguimiento de un pedido en la calle, asociado siempre a un pedido y, cuando ya fue asignada, a un repartidor.

## Estado del proyecto

| Entrega | Alcance | Estado |
|---|---|---|
| Pre-entrega 1 | Arquitectura por capas (Controller → Service → Repository) para Productos y Usuarios, configuración de entorno validada y constantes de dominio | Completada |
| Pre-entrega 2 | Modelos de Pedidos y Entregas, roles `cliente`/`repartidor`, y un módulo de mocking (`/api/mocks`) para generar y cargar datos de prueba sin tocarlos a mano | Completada |

Las siguientes fases (autenticación, permisos por rol, asignación real de repartidores, etc.) se van a ir sumando en las próximas entregas del curso.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js (>= 18) | Entorno de ejecución |
| Express 4 | Framework del servidor HTTP |
| Módulos ESM | Sistema de módulos (`import` / `export`) |
| dotenv | Carga de variables de entorno |
| MongoDB + Mongoose | Base de datos y ODM |
| @faker-js/faker | Generación de datos simulados para el módulo de mocking |

## Instalación

```bash
git clone https://github.com/lsbcreativa/shipnow-peru.git
cd shipnow-peru
npm install
```

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `PORT` | Puerto donde escucha el servidor | `8080` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://localhost:27017/shipnow_peru` |

`MONGODB_URI` acepta tanto una instancia local como MongoDB Atlas:

```bash
# MongoDB local
MONGODB_URI=mongodb://localhost:27017/shipnow_peru

# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/shipnow_peru
```

El archivo `.env` está excluido del repositorio mediante `.gitignore`; nunca se sube con valores reales.

### Si falta una variable obligatoria

`src/config/env.config.js` valida `PORT`, `MONGODB_URI` y `NODE_ENV` apenas se importa la configuración. Si falta alguna, la aplicación **no arranca** y tira un error descriptivo:

```
Error: Faltan variables de entorno obligatorias: MONGODB_URI. Revisa tu archivo .env (guiate con .env.example) antes de levantar ShipNow Peru.
```

## Cómo ejecutar

```bash
# modo desarrollo (recarga automática con --watch)
npm run dev

# modo producción
npm start
```

El servidor queda disponible en `http://localhost:8080` (o el puerto que definas en `PORT`).

## Estructura de carpetas

```
shipnow-peru/
├── src/
│   ├── app.js                              # arma la app de Express (no levanta el servidor)
│   ├── server.js                           # conecta a MongoDB y levanta el servidor
│   ├── config/
│   │   ├── env.config.js                   # carga dotenv y valida las variables criticas
│   │   ├── index.js                        # punto de entrada unico a la configuracion
│   │   └── db.config.js                    # conexion a MongoDB
│   ├── constants/
│   │   └── index.js                        # ROLES, PRODUCT_STATUS, ORDER_STATUS, ORDER_PRIORITY, DELIVERY_STATUS
│   ├── models/
│   │   ├── product.model.js                # esquema de Mongoose, sin logica
│   │   ├── user.model.js                   # esquema de Mongoose, sin logica
│   │   ├── order.model.js                  # Pedido: cliente, items, monto, ciudad, estado, prioridad
│   │   └── delivery.model.js               # Entrega: pedido, repartidor (opcional), direccion, estado
│   ├── repositories/
│   │   ├── product.repository.js           # unico lugar que importa product.model.js
│   │   ├── user.repository.js              # unico lugar que importa user.model.js
│   │   ├── order.repository.js             # unico lugar que importa order.model.js
│   │   └── delivery.repository.js          # unico lugar que importa delivery.model.js
│   ├── services/
│   │   ├── product.service.js              # reglas de negocio de productos
│   │   ├── user.service.js                 # reglas de negocio de usuarios
│   │   └── mock.service.js                 # genera y siembra datos de prueba (ver Modulo de mocking)
│   ├── controllers/
│   │   ├── product.controller.js           # solo req/res, delega todo al service
│   │   ├── user.controller.js              # solo req/res, delega todo al service
│   │   └── mock.controller.js              # solo req/res, delega todo al mock.service
│   ├── routes/
│   │   ├── index.router.js                 # router principal montado en /api
│   │   ├── product.routes.js               # path -> metodo del controller, nada mas
│   │   ├── user.routes.js                  # path -> metodo del controller, nada mas
│   │   └── mock.routes.js                  # path -> metodo del controller, nada mas
│   ├── middlewares/
│   │   ├── not-found.middleware.js
│   │   └── error-handler.middleware.js     # unico lugar que arma la respuesta de error
│   └── utils/
│       ├── app-error.js                    # error con codigo HTTP asociado
│       └── http-response.js                # formato unico de respuesta exitosa
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Arquitectura en capas

```
router  ->  controller  ->  service  ->  repository  ->  modelo de Mongoose
```

Cada capa conoce solo a la siguiente, y el flujo de dependencias es siempre hacia adentro. El Controller **nunca** importa Mongoose ni conoce el modelo directamente.

| Capa | Responsabilidad | Puede importar | No puede importar |
|---|---|---|---|
| **Router** (`src/routes/`) | Define la URL y el método HTTP, y lo conecta con el método del Controller correspondiente | controllers | services, repositories, models |
| **Controller** (`src/controllers/`) | Lee `req.body` / `req.params` / `req.query`, llama al Service y devuelve la respuesta con el status code correcto | services, utils | repositories, models |
| **Service** (`src/services/`) | Toda la lógica de negocio: validaciones, cálculo del estado del producto, reglas de unicidad, qué campos puede tocar el cliente | repositories, constants, utils | models (nunca Mongoose directo) |
| **Repository** (`src/repositories/`) | Único lugar que conoce Mongoose. Encapsula el acceso a datos: filtros por defecto, proyecciones, ordenamiento | su propio model | otros models |

Recorrido concreto de una consulta de productos:

```
GET /api/products?category=abarrotes
  └─ product.routes.js         define la ruta, delega en el controller
     └─ product.controller.js  lee req.query, llama al service
        └─ product.service.js  arma el filtro y la paginacion
           └─ product.repository.js  aplica el filtro por defecto (oculta discontinuados) y la proyeccion
              └─ product.model.js    esquema de Mongoose sobre la coleccion "products"
```

## ¿Por qué separar Service de Repository?

El Repository es el único lugar del proyecto que sabe que la base de datos es MongoDB con Mongoose. Su trabajo termina en "buscar y guardar datos" con criterios ya definidos: por ejemplo, `product.repository.js` siempre excluye los productos discontinuados del listado salvo que se pida explícitamente ese estado, y siempre aplica la misma proyección. Eso es acceso a datos, no una decisión de negocio.

El Service, en cambio, es el único lugar que decide **qué significa** un dato para ShipNow Perú. Ahí vive, por ejemplo, la regla de que el estado de un producto (`available` u `out_of_stock`) se calcula a partir del stock y nunca lo manda el cliente, o que un producto discontinuado no admite más cambios (409, no 400: es un conflicto con el estado actual del recurso, no un dato mal enviado). Si mañana esa regla cambia, el cambio queda contenido en el Service; el Repository y el Controller ni se enteran.

Separarlos así evita dos problemas típicos: un Repository "pasamanos" que solo hace `return Model.find()` sin agregar valor, y un Service acoplado a los detalles de Mongoose (que se rompería si el día de mañana ShipNow Perú cambia de base de datos).

## Constantes de dominio

`src/constants/index.js` centraliza los valores fijos del dominio en objetos congelados con `Object.freeze`, para no repartir strings sueltos por el código:

```js
export const ROLES = Object.freeze({
  ADMIN: 'admin',
  CLIENTE: 'cliente',
  REPARTIDOR: 'repartidor',
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export const ORDER_PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
});

export const DELIVERY_STATUS = Object.freeze({
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
});
```

Tanto los modelos de Mongoose (para el `enum` del schema) como los services (para calcular, validar o generar un estado) importan estos objetos en vez de escribir `'admin'` o `'available'` a mano. El módulo de mocking hace exactamente lo mismo: nunca escribe un rol, estado o prioridad como string suelto.

## Rutas disponibles

Todas las rutas cuelgan del prefijo `/api`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor esté activo |
| GET | `/api/products` | Lista productos, con filtros por `category`, `city`, `status` y paginación (`page`, `limit`) |
| GET | `/api/products/:id` | Detalle de un producto |
| POST | `/api/products` | Crea un producto nuevo |
| PUT | `/api/products/:id` | Actualiza un producto (el `status` se recalcula solo si se envía `stock`) |
| DELETE | `/api/products/:id` | Discontinúa un producto (nunca borra el documento de la base) |
| GET | `/api/users` | Lista usuarios activos, con filtro por `city` y paginación |
| GET | `/api/users/:id` | Detalle de un usuario |
| POST | `/api/users` | Registra un usuario nuevo (siempre con rol `cliente`) |
| PUT | `/api/users/:id` | Actualiza los datos de un usuario (el `role` no se toca por esta vía) |
| DELETE | `/api/users/:id` | Desactiva un usuario (baja lógica, no borra el documento) |
| GET | `/api/mocks/users?qty=N` | Genera `N` usuarios simulados (`cliente`/`repartidor`), sin guardarlos |
| GET | `/api/mocks/repartidores?qty=N` | Genera `N` usuarios simulados, todos con rol `repartidor`, sin guardarlos |
| GET | `/api/mocks/pedidos?qty=N` | Genera `N` pedidos simulados con su cliente embebido, sin guardarlos |
| GET | `/api/mocks/entregas?qty=N` | Genera `N` entregas simuladas con su pedido y, si corresponde, su repartidor, sin guardarlos |
| POST | `/api/mocks/seed?qty=N&coleccion=X` | Inserta `N` registros de prueba reales en MongoDB (`usuarios`, `repartidores`, `pedidos` o `entregas`) |

## Ejemplos de uso

**Crear un producto** → `201 Created`

```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Chompa de alpaca","description":"Chompa 100% alpaca, talla M","category":"ropa","price":89.90,"stock":15,"city":"Arequipa"}'
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f2a3b9c1d4e5f6a7b8c9d",
    "name": "Chompa de alpaca",
    "description": "Chompa 100% alpaca, talla M",
    "category": "ropa",
    "price": 89.9,
    "stock": 15,
    "city": "Arequipa",
    "status": "available",
    "createdAt": "2026-09-10T14:41:39.427Z",
    "updatedAt": "2026-09-10T14:41:39.427Z"
  }
}
```

**Registrar un usuario** → `201 Created`

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Maria","lastName":"Quispe","email":"maria@mail.com","city":"Cusco"}'
```

```json
{
  "status": "success",
  "payload": {
    "_id": "665f28f19c1d4e5f6a7b8c91",
    "firstName": "Maria",
    "lastName": "Quispe",
    "email": "maria@mail.com",
    "city": "Cusco",
    "role": "cliente",
    "isActive": true,
    "createdAt": "2026-09-10T14:40:10.203Z",
    "updatedAt": "2026-09-10T14:40:10.203Z"
  }
}
```

**Listar productos por categoría, paginado**

```bash
curl "http://localhost:8080/api/products?category=ropa&page=1&limit=5"
```

## Módulo de mocking

ShipNow Perú necesita usuarios, repartidores, pedidos y entregas de prueba para poder probar el resto de la API sin cargar cada dato a mano. Para eso existe `src/services/mock.service.js`, montado bajo el router `src/routes/mock.routes.js` en el prefijo `/api/mocks`.

El módulo respeta la misma arquitectura por capas que el resto del proyecto:

```
router (mock.routes.js)  ->  controller (mock.controller.js)  ->  service (mock.service.js)  ->  repository (user/order/delivery)  ->  modelo de Mongoose
```

`mock.routes.js` solo conecta paths con métodos del controller, igual que `product.routes.js` o `user.routes.js`. Toda la generación de datos falsos, las relaciones entre entidades y la inserción en MongoDB viven en `mock.service.js`, que a su vez usa los mismos repositories que ya existían (`user.repository.js`) más dos nuevos (`order.repository.js`, `delivery.repository.js`) — nunca toca Mongoose directamente.

### Generar datos simulados (no se guardan en la base)

Estos cuatro endpoints arman objetos en memoria con [`@faker-js/faker`](https://fakerjs.dev/) (nombres en español, ciudades peruanas reales) y responden un array directo, sin tocar MongoDB:

```bash
curl "http://localhost:8080/api/mocks/users?qty=2"
```

```json
[
  {
    "firstName": "Jorge Luis",
    "lastName": "Hinojosa Sáenz",
    "email": "jorgeluis_hinojosasaenz@test.com",
    "city": "Huancayo",
    "role": "cliente"
  },
  {
    "firstName": "Ramona",
    "lastName": "Cordero Apodaca",
    "email": "ramona_corderoapodaca@test.com",
    "city": "Ica",
    "role": "repartidor"
  }
]
```

> El campo `qty` acepta hasta 50; si no se manda o llega inválido, genera 5 por defecto. Los campos calcan exactamente los del modelo real (`firstName`, `lastName`, `email`, `city`, `role`), para cumplir con que el mock tenga "estructura similar a los modelos reales".

```bash
curl "http://localhost:8080/api/mocks/repartidores?qty=2"   # todos con role: "repartidor"
curl "http://localhost:8080/api/mocks/pedidos?qty=1"        # pedido con su cliente embebido
curl "http://localhost:8080/api/mocks/entregas?qty=2"       # entrega con su pedido y, a veces, su repartidor
```

Un pedido simulado trae sus `items`, el `totalAmount` ya calculado, `destinationCity`, y un `status`/`priority` sacados de `ORDER_STATUS`/`ORDER_PRIORITY`. Una entrega simulada arma su propio pedido, y solo le asigna `deliveryPerson` cuando el `status` generado no es `pending` (una entrega recién creada todavía no tiene repartidor asignado, igual que en la vida real).

### Cargar datos de prueba en MongoDB

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?qty=10"
```

```json
{ "insertados": 10, "coleccion": "usuarios" }
```

`coleccion` es opcional (por defecto `usuarios`) y acepta `usuarios`, `repartidores`, `pedidos` o `entregas`:

```bash
curl -X POST "http://localhost:8080/api/mocks/seed?qty=5&coleccion=repartidores"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=8&coleccion=pedidos"
curl -X POST "http://localhost:8080/api/mocks/seed?qty=6&coleccion=entregas"
```

La siembra es "controlada" en el sentido que pide la consigna: nunca inserta una relación rota.

- Sembrar **pedidos** primero revisa si ya hay suficientes usuarios con rol `cliente` en la base (`userRepository.sampleByRole`); si faltan, crea los que hagan falta antes de crear los pedidos, y cada pedido queda con un `customer` que es el `_id` real de un cliente que sí existe en MongoDB.
- Sembrar **entregas** hace lo mismo con pedidos existentes (los reutiliza con `$sample` o crea los que falten) y con repartidores, y solo asigna `deliveryPerson` cuando el estado generado no es `pending`.
- Un `coleccion` inválido responde `400` con el listado de valores aceptados, en vez de insertar cualquier cosa.

Podés verificar la carga con `mongosh` o MongoDB Compass:

```bash
mongosh "$MONGODB_URI" --eval "db.orders.findOne()"
mongosh "$MONGODB_URI" --eval "db.deliveries.findOne()"
```

## Manejo de errores

`error-handler.middleware.js` es el único lugar que arma la respuesta de error de toda la API. El resto del código lanza un `AppError(mensaje, statusCode)` y lo deja pasar con `next(error)`.

| Status | Cuándo |
|---|---|
| `400` | Datos inválidos: falta un campo obligatorio, precio o stock negativo, email con formato incorrecto |
| `404` | El producto o usuario pedido no existe |
| `409` | Conflicto con el estado actual del recurso: nombre o correo duplicado, producto ya discontinuado |
| `500` | Error interno no esperado (el detalle queda en el log del servidor, nunca en la respuesta) |
