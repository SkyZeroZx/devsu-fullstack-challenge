 
-- Tabla Persona  
CREATE TABLE IF NOT EXISTS persona (
    id              BIGSERIAL       PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    genero          VARCHAR(20)     NOT NULL,
    edad            INTEGER         NOT NULL CHECK (edad > 0),
    identificacion  VARCHAR(20)     NOT NULL UNIQUE,
    direccion       VARCHAR(200)    NOT NULL,
    telefono        VARCHAR(20)     NOT NULL
);

-- Tabla Cliente
CREATE TABLE IF NOT EXISTS cliente (
    id              BIGINT          PRIMARY KEY REFERENCES persona(id) ON DELETE CASCADE,
    cliente_id      VARCHAR(36)     NOT NULL UNIQUE DEFAULT gen_random_uuid()::varchar,
    contrasena      VARCHAR(255)    NOT NULL,
    estado          BOOLEAN         NOT NULL DEFAULT TRUE
);

-- Tabla Cuenta
CREATE TABLE IF NOT EXISTS cuenta (
    id              BIGSERIAL       PRIMARY KEY,
    numero_cuenta   VARCHAR(255)    NOT NULL UNIQUE,
    tipo_cuenta     VARCHAR(20)     NOT NULL CHECK (tipo_cuenta IN ('AHORRO', 'CORRIENTE')),
    saldo_inicial   NUMERIC(15,2)   NOT NULL DEFAULT 0,
    estado          BOOLEAN         NOT NULL DEFAULT TRUE,
    cliente_id      BIGINT          NOT NULL REFERENCES cliente(id) ON DELETE CASCADE
);

-- Tabla Movimiento
CREATE TABLE IF NOT EXISTS movimiento (
    id                  BIGSERIAL       PRIMARY KEY,
    fecha               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento     VARCHAR(20)     NOT NULL CHECK (tipo_movimiento IN ('CREDITO', 'DEBITO')),
    valor               NUMERIC(15,2)   NOT NULL,
    saldo               NUMERIC(15,2)   NOT NULL,
    cuenta_id           BIGINT          NOT NULL REFERENCES cuenta(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_cliente_cliente_id ON cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cuenta_numero_cuenta ON cuenta(numero_cuenta);
CREATE INDEX IF NOT EXISTS idx_cuenta_cliente_id ON cuenta(cliente_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_cuenta_id ON movimiento(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha ON movimiento(fecha);
CREATE INDEX IF NOT EXISTS idx_movimiento_cuenta_fecha ON movimiento(cuenta_id, fecha);

-- Tabla Auth User 
CREATE TABLE IF NOT EXISTS auth_user (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    enabled         BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_auth_user_username ON auth_user(username);
