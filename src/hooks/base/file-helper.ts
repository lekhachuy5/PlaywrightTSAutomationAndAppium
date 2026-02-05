import path from 'path';
import fs from 'fs';
import { info } from 'console';
import { ITestCaseHookParameter } from '@cucumber/cucumber';

// Function to rename a file
export async function renameFile(
  oldPath: string,
  newPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.rename(oldPath, newPath, (err: Error | null) => {
      if (err) {
        reject(`Error renaming file: ${err}`);
      } else {
        resolve(newPath); // Resolve with the new file path
      }
    });
  });
}

// Function to rename a file matching a partial name

export async function renamePartialFileName(
  testInfo: ITestCaseHookParameter,
  partialName: string,
  newName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const specDir = path.dirname(testInfo.gherkinDocument.uri);
    const fileName = testInfo.pickle.name.slice(0, testInfo.pickle.name.indexOf('-')).replace(/\s+/g, '_');
    const directory = path.join(specDir, fileName);
    info('directory = ', directory);
    fs.readdir(
      directory,
      (err: NodeJS.ErrnoException | null, files: string[]) => {
        if (err) {
          reject(`Error reading directory: ${err}`);
          return;
        }
        const fileToRename = files.find((file) => file.includes(partialName));
        const fileExtension = fileToRename?.split('.').pop();
        if (fileToRename) {
          const oldPath = path.join(directory, fileToRename); // Full path to the old file
          const newPath = path.join(directory, newName + '.' + fileExtension); // Full path to the new file
          renameFile(oldPath, newPath)
            .then((newFilePath: string | PromiseLike<string>) => {
              info(`File ${oldPath} renamed to ${newFilePath} successfully.`);
              resolve(newFilePath); // Resolve with the new file path
            })
            .catch((error: Error) => {
              reject(`Error renaming file: ${error}`);
            });
        } else {
          reject(`File matching partial name not found.`);
        }
      }
    );
  });
}
