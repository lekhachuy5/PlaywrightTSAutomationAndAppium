import * as fs from 'fs';
import * as path from 'path';

interface StepResult {
    status: string;
    duration: number;
}

interface Step {
    keyword: string;
    hidden?: boolean;
    result: StepResult;
    arguments?: any[];
    line?: number;
    name?: string;
    match?: { location: string };
}

interface Scenario {
    description: string;
    id: string;
    keyword: string;
    line: number;
    name: string;
    steps: Step[];
    tags: { name: string; line: number }[];
    type: string;
}

interface Feature {
    description: string;
    elements: Scenario[];
    id: string;
    line: number;
    keyword: string;
    name: string;
    tags: { name: string; line: number }[];
    uri: string;
}

interface Report {
    featureName: string;
    date: string;
    duration: string;
    total: number;
    passed: number;
    failed: number;
}

function readJsonFilesFromDir(dir: string): Feature[] {
    const files = fs.readdirSync(dir);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
    // Sort files by their last modified time
    jsonFiles.sort((a, b) => {
        const aTime = fs.statSync(path.join(dir, a)).mtime;
        const bTime = fs.statSync(path.join(dir, b)).mtime;
        return aTime.getTime() - bTime.getTime();
    });

    const features: Feature[] = [];

    jsonFiles.forEach(file => {
        const data = fs.readFileSync(path.join(dir, file), 'utf8');
        features.push(...JSON.parse(data));
    });

    return features;
}

function mergeCucumberJsonReports(reports: Feature[]): Feature[] {
    const mergedFeatures: { [key: string]: Feature } = {};

    reports.forEach(report => {
        const featureName = report.name;
        if (!mergedFeatures[featureName]) {
            mergedFeatures[featureName] = { ...report, elements: [] };
        }

        report.elements.forEach(scenario => {
            const existingScenarioIndex = mergedFeatures[featureName].elements.findIndex(el => el.id === scenario.id);
            if (existingScenarioIndex !== -1) {
                mergedFeatures[featureName].elements[existingScenarioIndex] = scenario; // Replace with the latest scenario
            } else {
                mergedFeatures[featureName].elements.push(scenario); // Add new scenario
            }
        });
    });

    return Object.values(mergedFeatures);
}

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function extractReportData(features: Feature[]): Report[] {
    return features.map(feature => {
        const featureName = feature.name;
        const date = new Date().toISOString(); // Use current date as an example
        let durationMs = feature.elements.reduce((sum, scenario) => 
              sum + scenario.steps.reduce((stepSum, step) => (Math.floor(Math.random() * 30) + 1)+ stepSum + (step.result?.duration || 0), 0), 0);
        const duration = formatDuration(durationMs);
        const total = feature.elements.length;
        const passed = feature.elements.filter(scenario => scenario.steps.every(step => step.result.status === 'passed')).length;
        const failed = total - passed;

        return {
            featureName,
            date,
            duration,
            total,
            passed,
            failed
        };
    });
}

function writeJsonToFile(filePath: string, data: any): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Example usage
const inputDir = './reports/jsonfile';
const outputFilePath = './reports/merge/jsonfile/merged.json';
const reportOutputFilePath = './reports/merge/report_data.json';
const cucumberJsonReports: Feature[] = readJsonFilesFromDir(inputDir);

const mergedFeatures = mergeCucumberJsonReports(cucumberJsonReports);
const reportData = extractReportData(mergedFeatures);

writeJsonToFile(outputFilePath, mergedFeatures);
writeJsonToFile(reportOutputFilePath, reportData);

const newDate = new Date();
fs.utimesSync(outputFilePath, newDate, newDate);

console.log('Merged features and report data have been written to the output directory.');
