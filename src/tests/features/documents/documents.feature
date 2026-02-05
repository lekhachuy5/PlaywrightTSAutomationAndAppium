
Feature: Documents

    Scenario Outline: Retrieve document list-<Description>
        Given Scenario executes <TC> to verify for journey
        When User logins into the app
        And User opens documents page
        Then User verifies document list
        Examples:
            | TC | Description          |
            | 01 | Retrieve document list |

    Scenario Outline: Create new document-<Description>
        Given Scenario executes <TC> to verify for journey
        When User logins into the app
        And User opens documents page
        Then User creates new document
        Examples:
            | TC | Description          |
            | 02 | Create new document |

    Scenario Outline: Edit document-<Description>
        Given Scenario executes <TC> to verify for journey
        When User logins into the app
        And User opens documents page
        Then User edits document
        Examples:
            | TC | Description          |
            | 03 | Edit document |

    Scenario Outline: Delete document-<Description>
        Given Scenario executes <TC> to verify for journey
        When User logins into the app
        And User opens documents page
        Then User deletes document
        Examples:
            | TC | Description          |
            | 04 | Delete document |
