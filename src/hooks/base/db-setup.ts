import { Pool } from 'pg';
import fs from 'fs';
import 'dotenv/config';

export const pool = new Pool(
  {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
    ssl: {
      rejectUnauthorized: false,
    },
  });

export const writeToFile = (file: string, data: unknown) => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(file, JSON.stringify(data), (err: unknown) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const loadSqlStatement = (sqlString: string) => {
  const currSqlArr = sqlString.split('--');
  const sqlStatements = new Map();

  for (let i = 0; i < currSqlArr.length; i++) {
    const statement = currSqlArr[i].trim();
    if (statement !== '') {
      const key = statement.substring(0, statement.indexOf('\n')).trim();
      const value = statement.substring(statement.indexOf('\n') + 1);
      sqlStatements.set(key, value);
    }
  }
  return sqlStatements;
};
