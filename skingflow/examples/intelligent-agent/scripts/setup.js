/**
 * Setup Script for Intelligent Agent System
 * 
 * @author skingko <venture2157@gmail.com>
 */

import { spawn, exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

class SetupManager {
  constructor() {
    this.steps = [];
    this.results = {
      total: 0,
      completed: 0,
      failed: 0
    };
  }

  addStep(name, stepFn) {
    this.steps.push({ name, stepFn });
  }

  async runStep(step) {
    console.log(chalk.blue(`🔧 ${step.name}...`));
    
    try {
      await step.stepFn();
      console.log(chalk.green(`✅ ${step.name} completed`));
      this.results.completed++;
    } catch (error) {
      console.log(chalk.red(`❌ ${step.name} failed: ${error.message}`));
      this.results.failed++;
      throw error;
    }
  }

  async runAll() {
    console.log(chalk.blue('🚀 Setting up Intelligent Agent System\n'));
    
    this.results.total = this.steps.length;
    
    for (const step of this.steps) {
      await this.runStep(step);
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log(chalk.blue('📊 Setup Summary\n'));
    
    console.log(`Total Steps: ${this.results.total}`);
    console.log(chalk.green(`Completed: ${this.results.completed}`));
    console.log(chalk.red(`Failed: ${this.results.failed}`));
    
    if (this.results.failed === 0) {
      console.log(chalk.green('\n🎉 Setup completed successfully!'));
      console.log(chalk.yellow('\n📋 Next steps:'));
      console.log(chalk.gray('  1. Update .env file with your API keys'));
      console.log(chalk.gray('  2. Run: npm test'));
      console.log(chalk.gray('  3. Run: npm run demo'));
    } else {
      console.log(chalk.red(`\n💥 Setup failed with ${this.results.failed} error(s)`));
    }
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

const setup = new SetupManager();

// Step 1: Check Prerequisites
setup.addStep('Check Prerequisites', async () => {
  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion < 18) {
    throw new Error(`Node.js 18+ required, found ${nodeVersion}`);
  }
  
  console.log(`   Node.js version: ${nodeVersion} ✓`);
  
  // Check PostgreSQL
  try {
    await setup.execCommand('psql --version');
    console.log('   PostgreSQL available ✓');
  } catch (error) {
    throw new Error('PostgreSQL not found. Please install PostgreSQL first.');
  }
});

// Step 2: Install Dependencies
setup.addStep('Install Dependencies', async () => {
  console.log('   Installing npm packages...');
  await setup.execCommand('npm install');
  console.log('   Dependencies installed ✓');
});

// Step 3: Setup Environment File
setup.addStep('Setup Environment File', async () => {
  const envPath = path.join(projectRoot, '.env');
  const envExamplePath = path.join(projectRoot, 'env.example');
  
  if (await setup.fileExists(envPath)) {
    console.log('   .env file already exists ✓');
  } else {
    await fs.copyFile(envExamplePath, envPath);
    console.log('   .env file created from template ✓');
  }
});

// Step 4: Test Database Connection
setup.addStep('Test Database Connection', async () => {
  try {
    // Test if database exists
    await setup.execCommand('psql -U apple -d skingflow_agent -c "SELECT 1;"');
    console.log('   Database connection successful ✓');
  } catch (error) {
    // Try to create database if it doesn't exist
    console.log('   Database not found, creating...');
    await setup.execCommand('psql -U apple postgres -c "CREATE DATABASE skingflow_agent;"');
    console.log('   Database created ✓');
  }
});

// Step 5: Verify Framework Access
setup.addStep('Verify Framework Access', async () => {
  const frameworkPath = path.join(projectRoot, '../skingflow/lib/index.js');
  
  if (await setup.fileExists(frameworkPath)) {
    console.log('   skingflow framework accessible ✓');
  } else {
    throw new Error('skingflow framework not found. Please ensure the framework is built.');
  }
});

// Step 6: Test Tool Loading
setup.addStep('Test Tool Loading', async () => {
  const toolsDir = path.join(projectRoot, 'tools');
  
  try {
    const files = await fs.readdir(toolsDir);
    const toolFiles = files.filter(f => f.endsWith('.xml') || f.endsWith('.yaml') || f.endsWith('.js'));
    
    if (toolFiles.length === 0) {
      throw new Error('No tool files found');
    }
    
    console.log(`   Found ${toolFiles.length} tool files ✓`);
  } catch (error) {
    throw new Error(`Tools directory not accessible: ${error.message}`);
  }
});

// Step 7: Create Required Directories
setup.addStep('Create Required Directories', async () => {
  const dirs = ['logs', 'temp', 'data'];
  
  for (const dir of dirs) {
    const dirPath = path.join(projectRoot, dir);
    try {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`   Created directory: ${dir} ✓`);
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      console.log(`   Directory exists: ${dir} ✓`);
    }
  }
});

// Step 8: Run Basic Tests
setup.addStep('Run Basic Tests', async () => {
  console.log('   Running basic connectivity tests...');
  
  // Test imports
  try {
    const { IntelligentAgent } = await import(path.join(projectRoot, 'src/agent.js'));
    console.log('   Agent import successful ✓');
    
    // Quick initialization test (without full setup)
    const agent = new IntelligentAgent();
    console.log('   Agent instantiation successful ✓');
    
  } catch (error) {
    throw new Error(`Import test failed: ${error.message}`);
  }
});

// Main setup function
async function main() {
  try {
    await setup.runAll();
    
    if (setup.results.failed === 0) {
      console.log(chalk.blue('\n🎯 Ready to run the intelligent agent system!'));
      console.log(chalk.yellow('\nQuick start commands:'));
      console.log(chalk.gray('  npm test          # Run full test suite'));
      console.log(chalk.gray('  npm run demo      # Start interactive demo'));
      console.log(chalk.gray('  npm start         # Start the agent system'));
    }
    
    process.exit(setup.results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error(chalk.red('\n💥 Setup failed:'), error.message);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { SetupManager };
