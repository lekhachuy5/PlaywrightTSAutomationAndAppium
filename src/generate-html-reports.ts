const report = require("multiple-cucumber-html-reporter");


const count = { total: 0, passed: 0, failed: 0 };

// Count total, passed, and failed scenarios from JSON
function countScenarios() {
  const fs = require('fs');
  const filePath = "./reports/merge/report_data.json"; // Specify your actual JSON file name
  const jsonData = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(jsonData);

  json.forEach(scenario => {
    count.total += scenario.total || 0;
    count.passed += scenario.passed || 0;
    count.failed += scenario.failed || 0;
  });
};

countScenarios();

report.generate({
  jsonDir: "./reports/merge/jsonfile/",
  reportPath: "./reports/merge",
  saveCollectedJSON: true,
  customData: {
    title: "Run info",
    data: [
      { label: "Project", value: "Test" },
      { label: "Sprint", value: "03" },
      {
        label: "Date run",
        value: new Date().toLocaleDateString('en-AU', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        })
      },
      { label: "Environment", value: "Test" },
      { label: "Total scenarios", value: count.total },
      { label: "Passed", value: count.passed },
      { label: "Failed", value: count.failed },
    ],
  },
  openReportInBrowser: true,
  displayDuration: true,
  durationInMS: false,
  hideMetadata: true,
  staticFilePath: true,
  plainDescription: true,
  displayReportTime: true,
  pageTitle: "Automation Report",
  reportName: "Automation Report",
});
