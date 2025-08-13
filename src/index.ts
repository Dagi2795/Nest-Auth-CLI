#!/usr/bin/env node
import { Command } from 'commander';
import generateAction from './commands/generate';
import gradient from 'gradient-string';
import figlet from 'figlet';

const program = new Command();

program
  .name('tibeb-nest-auth')
  .description('CLI to generate authentication system for NestJS')
  .command('generate')
  .description('Generate authentication system')
  .action(async () => {
    console.log(gradient.rainbow(figlet.textSync('Tibeb Nest Auth', { font: 'Standard' })));
    await generateAction();
  });

program.parse(process.argv);