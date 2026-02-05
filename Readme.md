# Playwright TypeScript Automation and Appium

A comprehensive test automation framework combining Playwright for web testing and Appium for mobile testing, built with TypeScript and Cucumber BDD.

## 🚀 Features

- **BDD with Cucumber**: Write tests in Gherkin syntax for better readability and collaboration
- **Playwright Integration**: Modern web automation with Playwright
- **Appium Support**: Mobile application testing capabilities
- **TypeScript**: Strong typing and better IDE support
- **Data-Driven Testing**: Excel-based test data management
- **Database Integration**: PostgreSQL query support for test data setup and validation
- **HTML Reports**: Automatically generated test execution reports
- **Email Content Validation**: Built-in email testing capabilities

## 📋 Prerequisites

- Node.js v18.16.1 or later
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/lekhachuy5/PlaywrightTSAutomationAndAppium.git
   cd PlaywrightTSAutomationAndAppium
   ```

2. **Install dependencies**
   ```bash
   npm install
   npx playwright install
   ```
   
   > **Note:** Set system environment variable `NODE_TLS_REJECT_UNAUTHORIZED=0` if needed for SSL certificate handling.

3. **Configure environment**
   - Create a `.env` file in the project root
   - Add your environment-specific configurations

4. **Run smoke tests**
   ```bash
   npm run test:smoke
   ```

## 📁 Project Structure

```
├── src/
│   ├── tests/
│   │   ├── features/         # Cucumber feature files (.feature)
│   │   └── steps/            # Step definitions (.step.ts)
│   ├── hooks/
│   │   └── pages/            # Page Object Model implementations
│   ├── email-content-templates/
│   ├── generate-excel-reports.ts
│   ├── generate-html-reports.ts
│   └── merge-json-reports.ts
├── playwright.config.ts      # Playwright configuration
├── package.json
└── tsconfig.json
```

### Key Components

1. **Feature Files** (`src/tests/features/yourFeatureName/yourFeatureFile.feature`)
   - Write test scenarios using Gherkin syntax (`Given`, `When`, `Then`)
   - Define test cases in a readable, business-friendly format

2. **Data-Driven Testing**
   - Create a folder with the same name as your scenario (in snake_case format)
   - Example: `Scenario Outline: Create a user` → folder name: `create_a_user`
   - Place `.xlsx` files and SQL scripts in this folder

3. **Step Definitions** (`src/tests/steps/yourSteps.step.ts`)
   - Implement the Gherkin steps
   - Call page objects and hooks

4. **Page Objects** (`src/hooks/pages/yourPages.ts`)
   - Implement Playwright automation functions
   - Follow Page Object Model pattern

## 🔤 Context Syntax

### SQL Files
- `--afterTestSteps`: Execute queries after test step completion
- `${__Context(csvDataFile.SqlCondition)}`: Read values from Excel file
  - Example: `${__Context(csvDataFile.Rowname)}` reads the `Rowname` column value

### XLSX Files
- `${__afterSteps.[0].[0].community}`: Access query results
  - `afterSteps`: Data from `afterTestSteps` query
  - First `[0]`: Table index (when multiple tables returned)
  - Second `[0]`: Record index within the table
  - `.community`: Column name

## 🧪 Running Tests

```bash
# Run all tests
npm run test

# Run smoke tests
npm run test:smoke

# Run acceptance tests
npm run test:acceptance

# Run specific scenario
npm run test --name "^test case name\-.*$"
# Example: npm run test "^Retrieve document\-.*$"

# Run with specific profile
npm run test:profile <profile-name>
```

## 📊 Reports

The framework automatically generates:
- **HTML Reports**: After each test run
- **Excel Reports**: Test results summary
- **Screenshots**: Captured for failed tests

Reports are generated automatically after test execution.

## 💡 Development Tips

### VSCode Extensions
Install the Cucumber extension for better development experience:
- [Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete)

Add to your VSCode `settings.json`:
```json
{
  "cucumberautocomplete.steps": [
    "src/**/*.step.ts"
  ]
}
```

## 📖 Examples

For detailed examples, refer to:
- [Documents Feature](src/tests/features/documents/documents.feature)
- [Documents Steps](src/tests/steps/documents.step.ts)
- [Documents Page Object](src/hooks/pages/documents.ts)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**lekhachuy5**

## 🔗 Links

- Repository: [https://github.com/lekhachuy5/PlaywrightTSAutomationAndAppium](https://github.com/lekhachuy5/PlaywrightTSAutomationAndAppium)

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

**Note:** This README is continuously updated with new features and improvements.
