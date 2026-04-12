@ignore
Feature: Helper to create a client with an account

  Scenario: Create client and account
    * def config = call read('classpath:karate-config.js')
    * def auth = call read('classpath:utils/auth.feature')
    * def gen = call read('classpath:utils/data-generator.js')
    * def clientData = gen.generateClient()

    Given url config.baseUrl + '/api/clientes'
    And header Authorization = 'Bearer ' + auth.token
    And request clientData
    When method post
    Then status 201
    * def clienteId = response.clienteId

    * def accountData = gen.generateAccount(clienteId)
    Given url config.baseUrl + '/api/cuentas'
    And header Authorization = 'Bearer ' + auth.token
    And request accountData
    When method post
    Then status 201
    * def numeroCuenta = response.numeroCuenta
    * def createdAccount = response
