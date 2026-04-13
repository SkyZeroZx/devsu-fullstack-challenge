# Desafío Devsu Banking

Aplicación bancaria full-stack con autenticación JWT, API Gateway y un frontend reactivo en Angular. Construida como parte del desafío técnico de Devsu.

## Pruebas con Postman

En la raíz del proyecto encontrarás el archivo `devsu-banking.postman_collection.json`. Este archivo contiene la colección completa de endpoints del API.

1. Importa el archivo `devsu-banking.postman_collection.json` en Postman.
2. Asegúrate de que el backend está corriendo localmente de acuerdo a las guías de arriba (usualmente Docker).
3. Abre la carpeta **Auth** y ejecuta el request **Login** (`POST /auth/login`).
4. **¡Listo!** El script de Login que configuramos automáticamente hará lo siguiente:
   - Extraerá tu Bearer Token y lo guardará en las variables de la colección.
   - Hará consultas al API para encontrar `Clientes` y `Cuentas` existentes.
   - Pre-llenará las variables `clienteId_1`, `clienteId_2`, `cuenta_1_numero`, etc. necesarias para el resto de los endpoints.

De esta forma, puedes probar cualquier endpoint de **Clientes**, **Cuentas**, **Movimientos** o **Reportes** sin tener que copiar y pegar IDs manualmente, sin importar qué datos generó el seed de desarrollo.

## Tecnologías

| Capa          | Tecnología                                 |
| ------------- | ------------------------------------------ |
| Frontend      | Angular 21, Nx, SCSS, PWA (Service Worker) |
| Backend       | Java 21, Spring Boot, Spring Cloud Gateway |
| Base de datos | PostgreSQL 18, Redis 7                     |
| Seguridad     | JWT, BCrypt, cabeceras CSP                 |
| Infra         | Docker, Docker Compose, Nginx              |
| Testing       | JaCoCo, Karate E2E, Jest                   |

## Estructura del proyecto

```
devsu-fullstack-challenge/
├── backend/
│   ├── api-gateway/         Spring Cloud Gateway (filtro JWT + feature flags)
│   ├── auth-service/        Login, registro, validación de tokens
│   ├── banking-service/     Clientes, cuentas, movimientos, reportes
│   └── e2e/                 Tests end-to-end con Karate
└── frontend/
    └── banking-front/       SPA Angular 21 servida por Nginx
```

---

## Requisitos

- Docker y Docker Compose
- Java 21 + Maven 3.8+
- Node 22

---

## Backend

### Variables de entorno

```bash
cd backend
cp .env.example .env
```

Edita `backend/.env` si necesitas cambiar algún valor por defecto:

| Variable            | Valor por defecto              | Descripción                |
| ------------------- | ------------------------------ | -------------------------- |
| `POSTGRES_DB`       | `devsu_banking`                | Nombre de la base de datos |
| `POSTGRES_USER`     | `postgres`                     | Usuario de PostgreSQL      |
| `POSTGRES_PASSWORD` | `postgres`                     | Contraseña de PostgreSQL   |
| `JWT_SECRET`        | `devsu-banking-secret-key-...` | Clave para firmar JWT      |
| `ADMIN_USERNAME`    | `admin`                        | Usuario admin de seed      |
| `ADMIN_PASSWORD`    | `admin123`                     | Contraseña admin de seed   |
| `REDIS_PORT`        | `6379`                         | Puerto de Redis            |

### Desarrollo (con seed de datos)

Al iniciar, se eliminan y recrean todas las tablas en cada arranque. Carga 1 admin, 2 clientes, 4 cuentas y 5 movimientos.

```bash
cd backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Credenciales por defecto tras el seed:

| Usuario | Contraseña |
| ------- | ---------- |
| `admin` | `admin123` |

### Staging

Seed idempotente — crea el admin solo si no existe e inserta ~50 filas por tabla sin borrar datos existentes.

```bash
cd backend
docker compose -f docker-compose.yml -f docker-compose.staging.yml up --build
```

### Producción

Sin seed ni datos de prueba. Solo los servicios.

```bash
cd backend
docker compose up --build
```

### Puertos

| Servicio        | Puerto | Descripción                    |
| --------------- | ------ | ------------------------------ |
| API Gateway     | `8080` | Punto de entrada único         |
| Banking Service | `8090` | Clientes, cuentas, movimientos |
| Auth Service    | `8091` | Autenticación                  |
| PostgreSQL      | `5432` | Base de datos principal        |
| Redis           | `6379` | Cache                          |

---

## Frontend

El frontend es una SPA Angular 21 servida por Nginx dentro de Docker

### Docker

```bash
cd frontend/banking-front
docker compose up --build
```

Abre http://localhost:4200. Por defecto se comunica con el API Gateway en `http://localhost:8080`. Para apuntar a otro backend, define la variable de entorno:

```bash
BACKEND_URL=http://mi-backend:8080 docker compose up --build
```

### Sin Docker

```bash
cd frontend/banking-front
npm install
npm start          # servidor de desarrollo → http://localhost:4200
npm run build      # build de producción → dist/banking-front/browser
```

### Configuración de Nginx y cabeceras de seguridad

La configuración de Nginx incluye las siguientes cabeceras de seguridad por defecto:

| Cabecera                    | Valor                                                     |
| --------------------------- | --------------------------------------------------------- |
| `X-Frame-Options`           | `DENY`                                                    |
| `X-Content-Type-Options`    | `nosniff`                                                 |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                         |
| `Permissions-Policy`        | `geolocation=(), camera=(), microphone=()`                |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`                     |
| `Content-Security-Policy`   | `default-src 'self'; connect-src 'self' <BACKEND_URL>; …` |

La directiva `connect-src` se establece en tiempo de ejecución mediante la variable `BACKEND_URL`, por lo que no es necesario reconstruir la imagen al desplegar en distintos entornos.

---

## Tests unitarios y cobertura (backend)

```bash
# Ejecutar todos los tests
cd backend
mvn clean test

# Ejecutar un único módulo
mvn test -pl auth-service
mvn test -pl api-gateway
mvn test -pl banking-service

# Ejecutar tests y generar reportes HTML de cobertura (fase verify)
mvn clean verify

# Generar reportes HTML sin re-ejecutar los tests
# (requiere jacoco.exec previo generado por mvn test)
mvn verify -DskipTests
```

Los informes de cobertura se generan en:

```
backend/api-gateway/target/site/jacoco/index.html
backend/banking-service/target/site/jacoco/index.html
backend/auth-service/target/site/jacoco/index.html
```

## Tests unitarios (frontend)

```bash
cd frontend/banking-front
npm test
npm run test:coverage
```

## Tests E2E (Karate)

Requiere que los servicios del backend estén en ejecución.

```bash
cd backend/e2e

# Entorno por defecto
mvn test

# Entorno específico
mvn test -Dkarate.env=dev
mvn test -Dkarate.env=staging
```
