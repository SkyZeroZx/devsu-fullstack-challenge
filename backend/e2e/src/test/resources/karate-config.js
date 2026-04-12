function fn() {
    var env = karate.env || 'local';

    var config = {
        baseUrl: 'http://localhost:8080',
        authUsername: 'admin',
        authPassword: 'admin123'
    };

    if (env === 'local') {
        config.baseUrl = 'http://localhost:8080';
    }

    if (env === 'dev') {
        config.baseUrl = 'http://localhost:8080';
    }

    if (env === 'staging') {
        config.baseUrl = 'http://localhost:8080';
    }

    karate.configure('connectTimeout', 10000);
    karate.configure('readTimeout', 10000);

    return config;
}
