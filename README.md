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
- [Manejo de errores](#manejo-de-errores)

## Temática

**ShipNow Perú** conecta tiendas con clientes en cualquier rincón del país: Lima, Arequipa, Cusco, Trujillo, Piura, Chiclayo y más. Cada producto se publica con su precio en soles (S/), su stock y la ciudad desde la que se despacha, para que el pedido llegue rapidito a donde esté el cliente.

La plataforma maneja dos entidades principales en esta entrega:

- **Productos**: catálogo con precio, stock, categoría y ciudad de despacho. El estado del producto (disponible, sin stock, discontinuado) se calcula solo, según las reglas de negocio.
- **Usuarios**: las personas que compran en ShipNow Perú, con un rol asignado (`user` o `admin`) que más adelante va a definir qué puede hacer cada quien.

## Estado del proyecto

| Entrega | Alcance | Estado |
|---|---|---|
| Pre-entrega 1 | Arquitectura por capas (Controller → Service → Repository) para Productos y Usuarios, configuración de entorno validada y constantes de dominio | Completada |

Las siguientes fases (autenticación, roles aplicados con permisos, órdenes de despacho, etc.) se van a ir sumando en las próximas entregas del curso.

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js (>= 18) | Entorno de ejecución |
| Express 4 | Framework del servidor HTTP |
| Módulos ESM | Sistema de módulos (`import` / `export`) |
| dotenv | Carga de variables de entorno |
| MongoDB + Mongoose | Base de datos y ODM |

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
│   │   └── index.js                        # ROLES y PRODUCT_STATUS, objetos congelados
│   ├── models/
│   │   ├── product.model.js                # esquema de Mongoose, sin logica
│   │   └── user.model.js                   # esquema de Mongoose, sin logica
│   ├── repositories/
│   │   ├── product.repository.js           # unico lugar que importa product.model.js
│   │   └── user.repository.js              # unico lugar que importa user.model.js
│   ├── services/
│   │   ├── product.service.js              # reglas de negocio de productos
│   │   └── user.service.js                 # reglas de negocio de usuarios
│   ├── controllers/
│   │   ├── product.controller.js           # solo req/res, delega todo al service
│   │   └── user.controller.js              # solo req/res, delega todo al service
│   ├── routes/
│   │   ├── index.router.js                 # router principal montado en /api
│   │   ├── product.routes.js               # path -> metodo del controller, nada mas
│   │   └── user.routes.js                  # path -> metodo del controller, nada mas
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
  USER: 'user',
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
});
```

Tanto los modelos de Mongoose (para el `enum` del schema) como los services (para calcular o validar un estado) importan estos objetos en vez de escribir `'admin'` o `'available'` a mano.

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
| POST | `/api/users` | Registra un usuario nuevo (siempre con rol `user`) |
| PUT | `/api/users/:id` | Actualiza los datos de un usuario (el `role` no se toca por esta vía) |
| DELETE | `/api/users/:id` | Desactiva un usuario (baja lógica, no borra el documento) |

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
    "role": "user",
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

## Manejo de errores

`error-handler.middleware.js` es el único lugar que arma la respuesta de error de toda la API. El resto del código lanza un `AppError(mensaje, statusCode)` y lo deja pasar con `next(error)`.

| Status | Cuándo |
|---|---|
| `400` | Datos inválidos: falta un campo obligatorio, precio o stock negativo, email con formato incorrecto |
| `404` | El producto o usuario pedido no existe |
| `409` | Conflicto con el estado actual del recurso: nombre o correo duplicado, producto ya discontinuado |
| `500` | Error interno no esperado (el detalle queda en el log del servidor, nunca en la respuesta) |
