-- =============================================================================
-- seed-staging.sql  —  Staging: idempotent 50-record dataset + admin user
-- Variables (set by seed.sh via psql --set):
--   :admin_username  e.g. admin
--   :admin_password  e.g. admin123
--
-- Idempotent: safe to run on every container start.
-- Identificaciones use prefix '50000' to avoid collision with dev seed.
-- Cuentas use prefix 'STG' for the same reason.
-- =============================================================================

\echo '[seed-staging] Enabling pgcrypto...'
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Admin user ──────────────────────────────────────────────────────────────
\echo '[seed-staging] Ensuring admin user...'
INSERT INTO auth_user (username, password, role, enabled)
VALUES (:'admin_username',
        crypt(:'admin_password', gen_salt('bf', 10)),
        'ADMIN', true)
ON CONFLICT (username) DO NOTHING;

-- ─── 50 Personas ─────────────────────────────────────────────────────────────
\echo '[seed-staging] Seeding personas (50)...'
INSERT INTO persona (nombre, genero, edad, identificacion, direccion, telefono)
SELECT
    'Persona ' || LPAD(i::text, 2, '0'),
    CASE WHEN i % 2 = 0 THEN 'MASCULINO' ELSE 'FEMENINO' END,
    20 + (i % 40),
    '50000' || LPAD(i::text, 5, '0'),
    'Calle ' || i || ' y Av. Principal',
    '09' || LPAD((10000000 + i * 7)::text, 8, '0')
FROM generate_series(1, 50) AS t(i)
ON CONFLICT (identificacion) DO NOTHING;

-- ─── 50 Clientes ─────────────────────────────────────────────────────────────
\echo '[seed-staging] Seeding clientes (50)...'
INSERT INTO cliente (id, contrasena, estado)
SELECT
    p.id,
    crypt('pass' || LPAD(i::text, 2, '0'), gen_salt('bf', 10)),
    true
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) AS i
    FROM persona
    WHERE identificacion LIKE '50000%'
    ORDER BY id
) AS p
ON CONFLICT (id) DO NOTHING;

-- ─── 50 Cuentas ──────────────────────────────────────────────────────────────
\echo '[seed-staging] Seeding cuentas (50)...'
INSERT INTO cuenta (numero_cuenta, tipo_cuenta, saldo_inicial, estado, cliente_id)
SELECT
    'STG' || LPAD(ROW_NUMBER() OVER (ORDER BY c.id)::text, 5, '0'),
    CASE WHEN ROW_NUMBER() OVER (ORDER BY c.id) % 2 = 0 THEN 'AHORRO' ELSE 'CORRIENTE' END,
    ROUND((100 + ROW_NUMBER() OVER (ORDER BY c.id) * 137.50)::numeric, 2),
    true,
    c.id
FROM cliente c
JOIN persona p ON c.id = p.id
WHERE p.identificacion LIKE '50000%'
ORDER BY c.id
ON CONFLICT (numero_cuenta) DO NOTHING;

-- ─── 50 Movimientos (1 por cuenta) ───────────────────────────────────────────
\echo '[seed-staging] Seeding movimientos (50)...'
INSERT INTO movimiento (fecha, tipo_movimiento, valor, saldo, cuenta_id)
SELECT
    NOW() - ((rn % 30) || ' days')::interval,
    CASE WHEN rn % 2 = 0 THEN 'CREDITO' ELSE 'DEBITO' END,
    CASE WHEN rn % 2 = 0
         THEN  ROUND((rn * 50.00)::numeric, 2)
         ELSE  ROUND(-(rn * 25.00)::numeric, 2)
    END,
    cu.saldo_inicial,
    cu.id
FROM (
    SELECT
        cu.id,
        cu.saldo_inicial,
        ROW_NUMBER() OVER (ORDER BY cu.id) AS rn
    FROM cuenta cu
    JOIN cliente c  ON cu.cliente_id = c.id
    JOIN persona p  ON c.id = p.id
    WHERE p.identificacion LIKE '50000%'
) AS cu
WHERE NOT EXISTS (
    SELECT 1 FROM movimiento m WHERE m.cuenta_id = cu.id
);

\echo '[seed-staging] Done: 1 admin, 50 personas, 50 clientes, 50 cuentas, 50 movimientos.'
