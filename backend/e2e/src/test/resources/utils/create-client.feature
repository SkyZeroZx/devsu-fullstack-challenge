@ignore
Feature: Helper to create a client, returning clienteId

  Scenario: Create a client
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
    * def createdClient = response
