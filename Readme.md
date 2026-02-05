# Automation Instruction

## Pre-require: 
Nodejs v18.16.1 or later

## I. Setup:
1. Install package by command `npm install` then `npx playwright install`
   - **Note:** Set system environment variable `NODE_TLS_REJECT_UNAUTHORIZED=0` if needed.
2. Set up environment to run in `.env` file
3. Run this command: `npm run test:smoke` and the output will be like this after done

## II. Structure:
1. **Feature file**: Place to write `given`, `when`, `then` gherkin and define test case (`src/test/features/yourFeatureName/yourFeatureFile.feature`)
2. **Data-driven**: Create folder in yourFeatureName folder with name must be the same with scenario name in the feature file with snake_format (e.g., Scenario Outline: Create a user -> folder name: `create_a_user`). Create `.xlsx` file and SQL with the same name in here.
3. **Steps definitions**: Will be created in `Steps/yourSteps.step.ts` to call the playwright test from hooks/page
4. **Page**: Will be created in `hooks/pages/yourPages.ts` this is the place we will implement the playwright automation steps function

## III. Context-Syntax:
**SQL File:** 
- `--afterTestSteps` -> this is used to run query after test step complete
- `${__Context(csvDataFile.SqlCondition)}` -> it reads the row with name `SqlCondition` which we declare in `.xlsx` file (e.g., Rowname | abcd -> `${__Context(csvDataFile.Rowname)}` -> this will be replaced to `abcd` before running the query

**XLSX File:** 
- `${__afterSteps.[0].[0].community}` -> `afterSteps` -> get data from `afterTestSteps` query, first `[0]` the table index from query (sometimes we will have more than one table returned, start from 0), second `[0]` the same with first `[0]` but it is the records index in the table.

## Tip
Add this extension on VScode for Cucumber support:
[Cucumber (Gherskin) full support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete)
Then in the setting.json add this 
`"cucumberautocomplete.steps": [
        "src/**/*.step.ts"
    ],`

Command to run for specific scenario:
`npm run test --name "^test case name\-.*$"`
eg: `npm run test "^Retrieve document\-.*$"`

## Conclusion: 
[Visit documents feature for more details](src/tests/features/documents/documents.feature)
[Documents feature steps](src/tests/steps/documents.step.ts)
[Documents feature pages](src/hooks/pages/documents.ts)


This Readme will be updated more in the features.
