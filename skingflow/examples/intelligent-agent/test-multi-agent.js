#!/usr/bin/env node

/**
 * Multi-Agent Framework Test Launcher
 * 
 * Simple launcher for the comprehensive multi-agent framework test
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { runMultiAgentTests } from './src/multi-agent-test.js';
import chalk from 'chalk';

console.log(chalk.blue('🤖 Multi-Agent Framework Test Launcher'));
console.log(chalk.gray('Testing comprehensive multi-agent system with:'));
console.log(chalk.gray('  • Advanced Memory System (mem0-like)'));
console.log(chalk.gray('  • Planning Agent (deepagents-style)'));
console.log(chalk.gray('  • Specialized Sub-Agents'));
console.log(chalk.gray('  • Virtual File System'));
console.log(chalk.gray('  • Real LLM Integration (Moonshot API)'));
console.log();

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  Test interrupted by user'));
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
runMultiAgentTests().catch(error => {
  console.error(chalk.red('❌ Test execution failed:'), error.message);
  process.exit(1);
});
