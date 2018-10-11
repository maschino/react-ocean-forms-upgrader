#!/usr/bin/env node

import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';

const fieldRegex = /<Field([^>]*)component=\{(.*)\}\s*([^>]*)>/gm;
const replaceRegex = /<Field([^>]*)component=\{(.*)\}\s*([^>]*)>/gm;

let fileCount = 0;
let fieldCount = 0;

const processFile = (filePath: string, dryMode: boolean): void => {
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8'});

  let match = fieldRegex.exec(fileContent);
  if (match !== null) { fileCount++; }

  if (dryMode === true) {
    while (match !== null) {
      console.log(chalk.bold(`Found Field in file ${filePath}`));
      console.log('');
      console.log('Before:');
      console.log(chalk.red(match[0]));
      console.log('');
      console.log('After:');
      console.log(chalk.green(match[0].replace(replaceRegex, '<$2$1$3>')));
      console.log('');

      fieldCount++;
      match = fieldRegex.exec(fileContent);
    }

    return;
  }

  if (!dryMode && match === null) { return; }

  const newContent = fileContent.replace(fieldRegex, '<$2$1$3>');
  fs.writeFileSync(filePath, newContent, { encoding: 'utf8' });
  console.log(`Updated Fields in ${filePath}`);
};

const crawlDirectory = (startPath: string, extensions: string[], dryMode: boolean): void => {
  if (!fs.existsSync(startPath)) {
    console.error(`Directory ${startPath} does not exist.`);
    return;
  }

  const dirStat = fs.lstatSync(startPath);
  if (dirStat.isFile()) {
    processFile(startPath, dryMode);
    return;
  }

  const files = fs.readdirSync(startPath);
  files.forEach(file => {
    const fullName = path.join(startPath, file);
    const stat = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      crawlDirectory(fullName, extensions, dryMode);
      return;
    }

    if (extensions.some(ext => fullName.endsWith(ext))) {
      processFile(fullName, dryMode);
    }
  });
};

const main = (): void => {
  console.log(chalk.green('                         __                                          ____'));
  console.log(chalk.green('   ________  ____ ______/ /_      ____  ________  ____ _____        / __/___  _________ ___  _____'));
  console.log(chalk.green('  / ___/ _ \\/ __ `/ ___/ __/_____/ __ \\/ ___/ _ \\/ __ `/ __ \\______/ /_/ __ \\/ ___/ __ `__ \\/ ___/'));
  console.log(chalk.green(' / /  /  __/ /_/ / /__/ /_/_____/ /_/ / /__/  __/ /_/ / / / /_____/ __/ /_/ / /  / / / / / (__  )'));
  console.log(chalk.green('/_/   \\___/\\__,_/\\___/\\__/      \\____/\\___/\\___/\\__,_/_/ /_/     /_/  \\____/_/  /_/ /_/ /_/____/'));
  console.log('');
  console.log('Your one stop shop for upgrading to react-ocean-forms 2.0!');

  const fileExtensions = ['.tsx', '.jsx', '.js'];

  let startDirectory = process.cwd();
  if (process.argv.length > 2) {
    startDirectory = process.argv[2];
  }

  let dryMode = true;
  if (process.argv.length > 3 && process.argv[3] === '-u') {
    dryMode = false;
  }

  console.log('Searching for', fileExtensions, 'files in ', chalk.underline(startDirectory), '- please stand by.');
  console.log('');

  crawlDirectory(startDirectory, fileExtensions, dryMode);
  console.log('');

  if (dryMode) {
    console.log('Found', chalk.bold(String(fieldCount), 'fields'), 'in', chalk.bold(String(fileCount), 'files.'));
    console.log(chalk.bold(chalk.yellow('To update run react-ocean-forms-upgrader with -u parameter.')));
  } else {
    console.log('Updated', chalk.bold(String(fileCount), 'files.'));
  }
};

main();
