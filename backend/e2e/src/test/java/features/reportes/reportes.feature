@REQ_REPORTES @reportes @agente1
Feature: Report generation

  Background:
    * def config = call read('classpath:karate-config.js')
    * def baseUrl = config.baseUrl
    * def auth = call read('classpath:utils/auth.feature')
    * def gen = call read('classpath:utils/data-generator.js')

  @id:1 @reporteJsonOk
  Scenario: T-API-REP-001 - Generate JSON report for a client
    # Setup: create client, account, and a transaction
    * def setup = call read('classpath:utils/create-client-with-account.feature')
    * def deposit = gen.generateDeposit(setup.numeroCuenta, 500)
    Given url baseUrl + '/api/movimientos'
    And header Authorization = 'Bearer ' + auth.token
    And request deposit
    When method post
    Then status 201

    # Generate report
    Given url baseUrl + '/api/reportes'
    And header Authorization = 'Bearer ' + auth.token
    And param cliente = setup.clienteId
    And param fechaInicio = '2020-01-01'
    And param fechaFin = '2030-12-31'
    When method get
    Then status 200
    And match response == '#array'
    And match response[0].Cliente == '#string'
    And match response[0]['Numero Cuenta'] == '#string'
    * print 'Report entries:', response.length

  @id:2 @sinAutorizacion
  Scenario: T-API-REP-003 - Access without token returns 401
    Given url baseUrl + '/api/reportes'
    And param cliente = 'cli-001'
    And param fechaInicio = '2020-01-01'
    And param fechaFin = '2030-12-31'
    When method get
    Then status 401
    * print 'Unauthorized access blocked'
