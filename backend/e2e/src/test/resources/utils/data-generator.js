function fn() {
    var utils = {
        randomString: function(length, prefix) {
            var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var result = prefix || '';
            for (var i = 0; i < (length || 8); i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        },
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        randomElement: function(array) {
            return array[Math.floor(Math.random() * array.length)];
        },
        uniqueId: function() {
            return Date.now() + '-' + Math.floor(Math.random() * 10000);
        }
    };

    var names = ['Jose Lema', 'Marianela Montalvo', 'Juan Osorio', 'Carlos Lopez', 'Ana Torres', 'Luis Garcia', 'Maria Perez'];
    var genders = ['Masculino', 'Femenino'];
    var streets = ['Otavalo sn y principal', 'Amazonas y NNUU', '13 junio y Equinoccial', 'Av. 10 de Agosto', 'Calle Cuenca 123'];
    var accountTypes = ['Ahorro', 'Corriente'];

    return {
        generateClient: function(overrides) {
            overrides = overrides || {};
            var id = utils.uniqueId();
            return {
                nombre: overrides.nombre || utils.randomElement(names) + ' ' + id.substring(id.length - 4),
                genero: overrides.genero || utils.randomElement(genders),
                edad: overrides.edad || utils.randomInt(18, 65),
                identificacion: overrides.identificacion || utils.uniqueId(),
                direccion: overrides.direccion || utils.randomElement(streets),
                telefono: overrides.telefono || '09' + utils.randomInt(10000000, 99999999),
                contrasena: overrides.contrasena || '1234',
                estado: overrides.estado !== undefined ? overrides.estado : true
            };
        },

        generateAccount: function(clienteId, overrides) {
            overrides = overrides || {};
            return {
                numeroCuenta: overrides.numeroCuenta || String(utils.randomInt(100000, 999999)),
                tipoCuenta: overrides.tipoCuenta || utils.randomElement(accountTypes),
                saldoInicial: overrides.saldoInicial !== undefined ? overrides.saldoInicial : utils.randomInt(500, 5000),
                estado: overrides.estado !== undefined ? overrides.estado : true,
                clienteId: clienteId
            };
        },

        generateDeposit: function(numeroCuenta, amount) {
            return {
                numeroCuenta: numeroCuenta,
                tipoMovimiento: 'Deposito',
                valor: amount || utils.randomInt(100, 1000)
            };
        },

        generateWithdrawal: function(numeroCuenta, amount) {
            return {
                numeroCuenta: numeroCuenta,
                tipoMovimiento: 'Retiro',
                valor: amount || utils.randomInt(50, 200)
            };
        },

        utils: utils
    };
}
