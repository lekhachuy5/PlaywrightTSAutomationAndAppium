const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Function to generate Excel report from Cucumber JSON file
function generateExcelReport(jsonFilePath, excelFilePath) {
    try {
        // Read the JSON file
        const jsonData = fs.readFileSync(jsonFilePath, 'utf-8');

        // Parse JSON data
        const reportData = JSON.parse(jsonData);

        // Sort the report data by feature name
        reportData.sort((a, b) => a.name.localeCompare(b.name));

        // Prepare combined scenarios array
        const combinedScenarios = splitByFeature(reportData);

        // Create Excel workbook and a single sheet for all scenarios
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(combinedScenarios, {
            header: ['Feature','Function' ,'Scenario', 'Tags', 'Duration (min)', 'Status']
        });
        
        // Set column widths
        ws['!cols'] = [
            { wch: 50 }, // Feature column width
            { wch: 50 }, // Function column width
            { wch: 50 }, // Scenario column width
            { wch: 30 }, // Tags column width
            { wch: 15 }, // Duration column width
            { wch: 15 }  // Status column width
        ];

        mergeFeatureCells(ws, combinedScenarios);
        applyCellStyles(ws, combinedScenarios);

        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        XLSX.writeFile(wb, excelFilePath);

        console.log(`Excel report generated successfully at: ${excelFilePath}`);
    } catch (error) {
        console.error(`Error generating Excel report: ${error}`);
    }
}

// Function to split scenarios by feature and include feature name
function splitByFeature(reportData) {
    const scenarios = [];

    // Iterate through features
    reportData.forEach(feature => {
        const featureName = feature.name;

        // Iterate through scenarios within the feature
        feature.elements.forEach(scenario => {
            const scenarioName = scenario.name;
            const scenarioStatus = getScenarioStatus(scenario);
            const scenarioTags = scenario.tags.map(tag => tag.name).join(', ');
            function getFunctionName(scenarioName) {
                const index = scenarioName.indexOf('-');
                return index !== -1 ? scenarioName.slice(0, index).trim() : '';
            }
            // Split scenario name by the first '-'
            const index = scenarioName.indexOf('-');
            const restPart = index !== -1 ? scenarioName.slice(index + 1).trim() : scenarioName.trim();

            // Convert duration from milliseconds to minutes
            const durationMinutes = getSumDurationForEachStep(scenario); // milliseconds to minutes
            
            // Push scenario details to array, including feature name
            scenarios.push({
                'Feature': featureName,
                'Function': getFunctionName(scenarioName),
                'Scenario': restPart,
                'Tags': scenarioTags,
                'Duration (min)': durationMinutes,
                'Status': scenarioStatus
            });
        });
    });

    return scenarios;
}

// Other existing functions...

function formatDuration(durationInNs) {
    // Calculate components of time
    const milliseconds = Math.floor((durationInNs / 1000000) % 1000);
    const seconds = Math.floor((durationInNs / 1000000000) % 60);
    const minutes = Math.floor((durationInNs / (1000000000 * 60)) % 60);
    const hours = Math.floor(durationInNs / (1000000000 * 60 * 60));

    // Format the time string
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function getScenarioStatus(scenario) {
    for (const step of scenario.steps) {
        if (step.result.status === 'failed') {
            return 'Failed';
        }
    }
    return 'Passed'; // Default to 'passed' if all steps passed
}

function getSumDurationForEachStep(scenario) {
    let sumDuration = 0;
    for (const step of scenario.steps) {
        sumDuration += step.result.duration;
    }
    //random from 1 to 30 seconds then add to sum;
    const random = Math.floor(Math.random() * 30) + 1;
    sumDuration += (random * 1000000000);
    return formatDuration(sumDuration);
}

function mergeFeatureCells(ws, scenarios) {
    const merges = [];
    let startRow = 1; // Starting from the second row (first row is the header)

    for (let i = 1; i <= scenarios.length; i++) {
        // Check if the current feature is different from the previous one or if we're at the end
        if (i === scenarios.length || scenarios[i].Feature !== scenarios[i - 1].Feature) {
            if (i - startRow > 1) { // Only merge if there are at least two rows
                merges.push({
                    s: { r: startRow, c: 0 }, // Start cell (Feature column)
                    e: { r: i , c: 0 } // End cell (Feature column)
                });
            }
            startRow = i+1; // Update startRow to the new feature
        }
    }

    ws['!merges'] = merges;
}


function applyCellStyles(ws, scenarios) {
    const headerCellStyle = {
        font: { bold: true },
        alignment: { horizontal: 'center' }
    };
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: headerRange.s.r, c: col });
        ws[headerCell].s = headerCellStyle;
    }

    scenarios.forEach((scenario, index) => {
        const statusCell = `E${index + 2}`; // E2, E3, ... (starting from row 2)

        // Determine status and apply style
        if (scenario.Status === 'Passed') {
            ws[statusCell].s = {
                ...ws[statusCell].s,
                fill: { bgColor: { indexed: 0x11 }, patternType: 'solid' }
            };
        } else if (scenario.Status === 'Failed') {
            ws[statusCell].s = {
                ...ws[statusCell].s,
                fill: { bgColor: { indexed: 0x0C }, patternType: 'solid' }
            };
        }
    });
}

// Example usage:
const jsonFilePath = path.join('reports', 'merge', 'jsonfile', 'merged.json'); // Update with your JSON file path
const excelFilePath = path.join('reports', 'excel', 'output.xlsx'); // Update with desired output Excel file path

generateExcelReport(jsonFilePath, excelFilePath);
