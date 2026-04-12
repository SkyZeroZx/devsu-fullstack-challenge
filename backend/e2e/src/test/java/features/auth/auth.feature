@REQ_AUTH @auth @agente1
Feature: Authentication - Register, Login and Token Validation

  Background:
    * def config = call read('classpath:karate-config.js')
    * def baseUrl = config.baseUrl

  @id:1 @registerOk
  Scenario: T-API-AUTH-001 - Register a new user successfully
    * def uniqueUser = 'user_' + java.lang.System.currentTimeMillis()
    Given url baseUrl + '/auth/register'
    And request { username: '#(uniqueUser)', password: '1234' }
    When method post
    Then status 201
    And match response == '#object'
    And match response.token == '#string'
    And match response.username == uniqueUser
    And match response.role == '#string'
    * print 'Registered user:', response.username

  @id:2 @registerDuplicate
  Scenario: T-API-AUTH-002 - Register with existing username returns 400
    * def auth = call read('classpath:utils/auth.feature')
    Given url baseUrl + '/auth/register'
    And request { username: '#(config.authUsername)', password: '1234' }
    When method post
    Then status 400
    And match response.message contains 'already exists'
    * print 'Duplicate register error:', response.message

  @id:3 @registerValidation
  Scenario: T-API-AUTH-003 - Register with invalid data returns 400
    Given url baseUrl + '/auth/register'
    And request { username: '', password: '' }
    When method post
    Then status 400
    * print 'Validation error:', response

  @id:4 @loginOk
  Scenario: T-API-AUTH-004 - Login with valid credentials returns token
    * def auth = call read('classpath:utils/auth.feature')
    Given url baseUrl + '/auth/login'
    And request { username: '#(config.authUsername)', password: '#(config.authPassword)' }
    When method post
    Then status 200
    And match response.token == '#string'
    And match response.username == config.authUsername
    And match response.role == '#string'
    * print 'Login token received'

  @id:5 @loginBadCredentials
  Scenario: T-API-AUTH-005 - Login with wrong password returns 401
    Given url baseUrl + '/auth/login'
    And request { username: 'admin', password: 'wrongpassword' }
    When method post
    Then status 401
    And match response.message == 'Invalid username or password'
    * print 'Bad credentials error:', response.message

  @id:6 @validateTokenOk
  Scenario: T-API-AUTH-006 - Validate a valid token
    * def auth = call read('classpath:utils/auth.feature')
    Given url baseUrl + '/auth/validate'
    And param token = auth.token
    When method get
    Then status 200
    And match response.valid == true
    And match response.username == '#string'
    And match response.role == '#string'
    * print 'Token validation:', response

  @id:7 @validateTokenInvalid
  Scenario: T-API-AUTH-007 - Validate an invalid token
    Given url baseUrl + '/auth/validate'
    And param token = 'invalid.jwt.token'
    When method get
    Then status 200
    And match response.valid == false
    * print 'Invalid token validation:', response
