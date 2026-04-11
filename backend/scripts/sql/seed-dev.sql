-- =============================================================================
-- seed-dev.sql  —  Dev / Test: WIPE everything + full sample data
-- Variables (set by seed.sh via psql --set):
--   :admin_username  e.g. admin
--   :admin_password  e.g. admin123
-- =============================================================================

\echo '[seed-dev] Enabling pgcrypto...'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Clean slate ─────────────────────────────────────────────────────────────
\echo '[seed-dev] Truncating all tables...'
TRUNCATE TABLE movimiento, cuenta, cliente, persona, auth_user
    RESTART IDENTITY CASCADE;

-- ─── Admin user ──────────────────────────────────────────────────────────────
\echo '[seed-dev] Creating admin user...'
INSERT INTO auth_user (username, password, role, enabled)
VALUES (:'admin_username',
        crypt(:'admin_password', gen_salt('bf', 10)),
        'ADMIN', true);

-- ─── Persons ─────────────────────────────────────────────────────────────────
\echo '[seed-dev] Seeding persons and clients...'
INSERT INTO persona (nombre, genero, edad, identificacion, direccion, telefono)
VALUES ('Jose Lema',          'MASCULINO', 35, '1234567890', 'Otavalo sn y principal',  '098254785'),
       ('Marianela Montalvo', 'FEMENINO',  30, '0987654321', 'Amazonas 456 y Colon',    '097548965');

-- ─── Clients (JOINED table, references persona.id) ───────────────────────────
INSERT INTO cliente (id, contrasena, estado)
SELECT p.id, crypt('1234', gen_salt('bf', 10)), true
FROM persona p WHERE p.identificacion = '1234567890';

INSERT INTO cliente (id, contrasena, estado)
SELECT p.id, crypt('5678', gen_salt('bf', 10)), true
FROM persona p WHERE p.identificacion = '0987654321';

-- ─── Accounts ────────────────────────────────────────────────────────────────
\echo '[seed-dev] Seeding accounts...'
INSERT INTO cuenta (numero_cuenta, tipo_cuenta, saldo_inicial, estado, cliente_id)
SELECT '478758', 'AHORRO',    2000.00, true, c.id
FROM cliente c JOIN persona p ON c.id = p.id WHERE p.identificacion = '1234567890';

INSERT INTO cuenta (numero_cuenta, tipo_cuenta, saldo_inicial, estado, cliente_id)
SELECT '225487', 'CORRIENTE', 100.00,  true, c.id
FROM cliente c JOIN persona p ON c.id = p.id WHERE p.identificacion = '1234567890';

INSERT INTO cuenta (numero_cuenta, tipo_cuenta, saldo_inicial, estado, cliente_id)
SELECT '495878', 'AHORRO',    0.00,    true, c.id
FROM cliente c JOIN persona p ON c.id = p.id WHERE p.identificacion = '0987654321';

INSERT INTO cuenta (numero_cuenta, tipo_cuenta, saldo_inicial, estado, cliente_id)
SELECT '496825', 'AHORRO',    540.00,  true, c.id
FROM cliente c JOIN persona p ON c.id = p.id WHERE p.identificacion = '0987654321';

-- ─── Transactions ─────────────────────────────────────────────────────────────
\echo '[seed-dev] Seeding transactions...'

-- 478758 AHORRO: +2000 deposit
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT NOW() - INTERVAL '10 days', 'CREDITO', 2000.00, 2000.00, id
FROM cuenta WHERE numero_cuenta = '478758';

-- 478758 AHORRO: +500 deposit → 2500
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT NOW() - INTERVAL '5 days', 'CREDITO', 500.00, 2500.00, id
FROM cuenta WHERE numero_cuenta = '478758';

-- 225487 CORRIENTE: +100 initial deposit
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT NOW() - INTERVAL '10 days', 'CREDITO', 100.00, 100.00, id
FROM cuenta WHERE numero_cuenta = '225487';

-- 225487 CORRIENTE: -40 subscription → 60
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT NOW() - INTERVAL '3 days', 'DEBITO', -40.00, 60.00, id
FROM cuenta WHERE numero_cuenta = '225487';

-- 496825 AHORRO: +540 initial deposit
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT NOW() - INTERVAL '7 days', 'CREDITO', 540.00, 540.00, id
FROM cuenta WHERE numero_cuenta = '496825';

\echo '[seed-dev] Done: 1 admin, 2 clients, 4 accounts, 5 transactions.'
