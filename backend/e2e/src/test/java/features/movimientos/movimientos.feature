@REQ_MOVIMIENTOS @movimientos @agente1
Feature: Transaction operations (deposits, withdrawals)

  Background:
    * def config = call read('classpath:karate-config.js')
    * def baseUrl = config.baseUrl
    * def auth = call read('classpath:utils/auth.feature')
    * def gen = call read('classpath:utils/data-generator.js')

  @id:1 @depositoOk
  Scenario: T-API-MOV-001 - Register a deposit successfully
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    * def deposit = gen.generateDeposit(setup.numeroCuenta, 500)
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request deposit
    When method post
    Then status 201
    And match response == '#object'
    And match response.numeroCuenta == setup.numeroCuenta
    And match response.valor == 500
    And match response.saldo == '#number'
    * print 'Deposit registered, new balance:', response.saldo

  @id:2 @retiroOk
  Scenario: T-API-MOV-002 - Register a withdrawal successfully
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    # First deposit to ensure sufficient balance
    * def deposit = gen.generateDeposit(setup.numeroCuenta, 1000)
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request deposit
    When method post
    Then status 201

    * def withdrawal = gen.generateWithdrawal(setup.numeroCuenta, 200)
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request withdrawal
    When method post
    Then status 201
    And match response.numeroCuenta == setup.numeroCuenta
    And match response.saldo == '#number'
    * print 'Withdrawal registered, new balance:', response.saldo

  @id:3 @retiroSaldoInsuficiente
  Scenario: T-API-MOV-003 - Withdrawal with insufficient balance returns 400
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    * def withdrawal = gen.generateWithdrawal(setup.numeroCuenta, 999999)
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request withdrawal
    When method post
    Then status 400
    And match response.message == 'Saldo no disponible'
    * print 'Insufficient balance:', response.message

  @id:4 @movimientoValidacion
  Scenario: T-API-MOV-004 - Transaction with missing fields returns 400
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request {}
    When method post
    Then status 400
    * print 'Validation error:', response

  @id:5 @listarMovimientos
  Scenario: T-API-MOV-005 - List all transactions
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 200
    And match response.content == '#array'
    * print 'Total transactions:', response.totalElements

  @id:6 @sinAutorizacion
  Scenario: T-API-MOV-006 - Access without token returns 401
    Given url baseUrl + '/api/movimientos'
    When method get
    Then status 401
    * print 'Unauthorized access blocked'
