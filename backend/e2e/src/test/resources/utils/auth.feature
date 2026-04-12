@ignore
Feature: Helper to register and login, returning a valid JWT token

  Scenario: Get auth token
    * def config = call read('classpath:karate-config.js')
    Given url config.baseUrl + '/auth/register'
    And request { username: '#(config.authUsername)', password: '#(config.authPassword)' }
    When method post
    # Ignore register failure (user may already exist)
    * def registerStatus = responseStatus

    Given url config.baseUrl + '/auth/login'
    And request { username: '#(config.authUsername)', password: '#(config.authPassword)' }
    When method post
    Then status 200
    * def token = response.token
