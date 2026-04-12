@REQ_CLIENTES @clientes @agente1
Feature: Client CRUD operations

  Background:
    * def config = call read('classpath:karate-config.js')
    * def baseUrl = config.baseUrl
    * def auth = call read('classpath:utils/auth.feature')
    * def gen = call read('classpath:utils/data-generator.js')

  @id:1 @crearClienteOk
  Scenario: T-API-CLI-001 - Create a client successfully
    * def clientData = gen.generateClient()
    Given url baseUrl + '/api/clientes'
    And header Authorization = 'Bearer ' + auth.token
    And request clientData
    When method post
    Then status 201
    And match response == '#object'
    And match response.clienteId == '#string'
    And match response.nombre == clientData.nombre
    And match response.identificacion == clientData.identificacion
    And match response.estado == true
    * print 'Created client:', response.clienteId

  @id:2 @crearClienteValidacion
  Scenario: T-API-CLI-002 - Create a client with missing fields returns 400
    Given url baseUrl + '/api/clientes'
    And header Authorization = 'Bearer ' + auth.token
    And request {}
    When method post
    Then status 400
    And match response.validationErrors == '#object'
    * print 'Validation errors:', response.validationErrors

  @id:3 @listarClientes
  Scenario: T-API-CLI-003 - List all clients
    # Ensure at least one client exists
    * def created = call read('classpath:utils/create-client.feature')
    Given url baseUrl + '/api/clientes'
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 200
    And match response.content == '#array'
    And match response.content[0] contains { clienteId: '#string', nombre: '#string' }
    * print 'Total clients:', response.totalElements

  @id:4 @obtenerClientePorId
  Scenario: T-API-CLI-004 - Get client by clienteId
    * def created = call read('classpath:utils/create-client.feature')
    Given url baseUrl + '/api/clientes/' + created.clienteId
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 200
    And match response.clienteId == created.clienteId
    And match response.nombre == created.createdClient.nombre
    * print 'Found client:', response.clienteId

  @id:5 @obtenerClienteInexistente
  Scenario: T-API-CLI-005 - Get non-existent client returns 404
    Given url baseUrl + '/api/clientes/NON_EXISTENT_ID'
    And header Authorization = 'Bearer ' + auth.token
    When method get
    Then status 404
    And match response.message == '#string'
    * print 'Not found:', response.message

  @id:6 @actualizarClienteOk
  Scenario: T-API-CLI-006 - Update a client successfully (PUT)
    * def created = call read('classpath:utils/create-client.feature')
    * def updateData = gen.generateClient({ identificacion: created.createdClient.identificacion })
    Given url baseUrl + '/api/clientes/' + created.clienteId
    And header Authorization = 'Bearer ' + auth.token
    And request updateData
    When method put
    Then status 200
    And match response.clienteId == created.clienteId
    * print 'Updated client:', response.clienteId

  @id:7 @eliminarClienteOk
  Scenario: T-API-CLI-007 - Delete a client successfully
    * def created = call read('classpath:utils/create-client.feature')
    Given url baseUrl + '/api/clientes/' + created.clienteId
    And header Authorization = 'Bearer ' + auth.token
    When method delete
    Then status 204
    * print 'Deleted client:', created.clienteId

  @id:8 @eliminarClienteInexistente
  Scenario: T-API-CLI-008 - Delete non-existent client returns 404
    Given url baseUrl + '/api/clientes/NON_EXISTENT_ID'
    And header Authorization = 'Bearer ' + auth.token
    When method delete
    Then status 404
    * print 'Delete not found'

  @id:9 @sinAutorizacion
  Scenario: T-API-CLI-009 - Access without token returns 401
    Given url baseUrl + '/api/clientes'
    When method get
    Then status 401
    * print 'Unauthorized access blocked'
