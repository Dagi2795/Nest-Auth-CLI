import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';
import { Config } from '../types';
import { promptConfig } from '../utils/prompt';
import { generateFiles } from '../utils/files';
import { displayRoutes } from '../utils/routes';

export default async function generateAction() {
  const srcPath = path.join(process.cwd(), 'src');
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(srcPath)) {
    console.log(boxen(chalk.red('❌ Error: src/ folder not found. Run in a NestJS project.'), {
      padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red'
    }));
    process.exit(1);
  }
  if (!fs.existsSync(packageJsonPath)) {
    console.log(boxen(chalk.red('❌ Error: package.json not found.'), {
      padding: 1, margin: 1, borderStyle: 'double', borderColor: 'red'
    }));
    process.exit(1);
  }
  const config: Config = await promptConfig();
  await generateFiles(config);
  displayRoutes(config);
}