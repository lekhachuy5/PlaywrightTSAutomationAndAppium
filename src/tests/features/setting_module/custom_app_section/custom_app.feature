
Feature: Custom app section
    
    Scenario Outline: Retrieve sub sections list-<Description>
        Given Scenario executes <TC> to verify for journey
        When User logins into the app
        And User opens setting pages
        And User opens custom app section
        And User opens sub section
        Then User verifies sub section list
        Examples:
            | TC | Description               |
            | 01 | Retrieve sub section list |
