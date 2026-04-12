@REQ_CUENTAS @cuentas @agente1
Feature: Account CRUD operations

  Background:
    * def config = call read('classpath:karate-config.js')
    * def baseUrl = config.baseUrl
    * def auth = call read('classpath:utils/auth.feature')
    * def gen = call read('classpath:utils/data-generator.js')

  @id:1 @crearCuentaOk
  Scenario: T-API-CTA-001 - Create an account successfully
    * def created = call read('classpath:utils/create-client.feature')
    * def accountData = gen.generateAccount(created.clienteId)
    Given url baseUrl + '/api/cuentas'
    And header Authorization = 'Bearer ' + auth.token
    And request accountData
    When method post
    Then status 201
    And match response == '#object'
    And match response.numeroCuenta == accountData.numeroCuenta
    And match response.tipoCuenta == '#string'
    And match response.estado == true
    * print 'Created account:', response.numeroCuenta

  @id:2 @crearCuentaValidacion
  Scenario: T-API-CTA-002 - Create account with missing fields returns 400
    Given url baseUrl + '/api/cuentas'
    And header Authorization = 'Bearer ' + auth.token
    And request {}
    When method post
    Then status 400
    * print 'Validation error:', response

  @id:3 @listarCuentas
  Scenario: T-API-CTA-003 - List all accounts
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    Given url baseUrl + '/api/cuentas'
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 200
    And match response.content == '#array'
    * print 'Total accounts:', response.totalElements

  @id:4 @obtenerCuentaPorNumero
  Scenario: T-API-CTA-004 - Get account by number
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    Given url baseUrl + '/api/cuentas/' + setup.numeroCuenta
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 200
    And match response.numeroCuenta == setup.numeroCuenta
    * print 'Found account:', response.numeroCuenta

  @id:5 @obtenerCuentaInexistente
  Scenario: T-API-CTA-005 - Get non-existent account returns 404
    Given url baseUrl + '/api/cuentas/999999'
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 404
    * print 'Not found:', response.message

  @id:6 @actualizarCuentaOk
  Scenario: T-API-CTA-006 - Update account successfully (PUT)
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    * def updateData = gen.generateAccount(setup.clienteId, { numeroCuenta: setup.numeroCuenta, estado: false })
    Given url baseUrl + '/api/cuentas/' + setup.numeroCuenta
    And header Authorization = 'Bearer ' + auth.token
    And request updateData
    When method put
    Then status 200
    And match response.numeroCuenta == setup.numeroCuenta
    * print 'Updated account:', response.numeroCuenta

  @id:7 @eliminarCuentaOk
  Scenario: T-API-CTA-007 - Delete account successfully
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    Given url baseUrl + '/api/cuentas/' + setup.numeroCuenta
    And header Authorization = 'Bearer ' + auth.token
    When method delete
    Then status 204
    * print 'Deleted account:', setup.numeroCuenta

  @id:8 @eliminarCuentaInexistente
  Scenario: T-API-CTA-008 - Delete non-existent account returns 404
    Given url baseUrl + '/api/cuentas/999999'
    And header Authorization = 'Bearer ' + auth.token
    When method delete
    Then status 404
    * print 'Delete not found'

  @id:9 @sinAutorizacion
  Scenario: T-API-CTA-009 - Access without token returns 401
    Given url baseUrl + '/api/cuentas'
    When method get
    Then status 401
    * print 'Unauthorized access blocked'
