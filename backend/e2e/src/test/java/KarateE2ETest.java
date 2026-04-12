import com.intuit.karate.junit5.Karate;

class KarateE2ETest {

    @Karate.Test
    Karate testAll() {
        return Karate.run("classpath:features").relativeTo(getClass());
    }

    @Karate.Test
    Karate testAuth() {
        return Karate.run("classpath:features/auth").relativeTo(getClass());
    }

    @Karate.Test
    Karate testClientes() {
        return Karate.run("classpath:features/clientes").relativeTo(getClass());
    }

    @Karate.Test
    Karate testCuentas() {
        return Karate.run("classpath:features/cuentas").relativeTo(getClass());
    }

    @Karate.Test
    Karate testMovimientos() {
        return Karate.run("classpath:features/movimientos").relativeTo(getClass());
    }

    @Karate.Test
    Karate testReportes() {
        return Karate.run("classpath:features/reportes").relativeTo(getClass());
    }
}
