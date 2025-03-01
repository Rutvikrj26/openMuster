#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const ora = require('ora');
const { GitHubProfileAnalyzer } = require('./github-analyzer');

// Configure CLI options
program
  .name('github-analyzer')
  .description('Analyze and score GitHub profiles based on various metrics')
  .version('1.0.0')
  .argument('<username>', 'GitHub username to analyze')
  .option('-t, --token <token>', 'GitHub personal access token (increases API rate limits)')
  .option('-f, --format <format>', 'Output format (json or text)', 'text')
  .action(async (username, options) => {
    const spinner = ora(`Analyzing GitHub profile for ${username}...`).start();
    
    try {
      const analyzer = new GitHubProfileAnalyzer(username, options.token);
      const report = await analyzer.analyze();
      spinner.succeed(`Analysis complete for ${username}`);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(report, null, 2));
      } else {
        displayTextReport(report);
      }
    } catch (error) {
      spinner.fail(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();

// Function to display formatted text report
function displayTextReport(report) {
  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return chalk.green;
    if (score >= 60) return chalk.blue;
    if (score >= 40) return chalk.yellow;
    return chalk.red;
  };
  
  const scoreColor = getScoreColor(report.overallScore);
  
  console.log('\n' + chalk.bold('🔍 GITHUB PROFILE ANALYSIS') + '\n');
  
  // Account info
  console.log(chalk.bold('📋 ACCOUNT INFORMATION'));
  console.log(`Username: ${chalk.cyan(report.username)}`);
  console.log(`Name: ${report.accountDetails.name}`);
  console.log(`Bio: ${report.accountDetails.bio}`);
  console.log(`Location: ${report.accountDetails.location}`);
  console.log(`Account Age: ${report.accountDetails.accountAge}`);
  console.log(`Profile URL: ${chalk.blue(report.accountDetails.profileUrl)}`);
  console.log('');
  
  // Overall score
  console.log(chalk.bold('🏆 OVERALL SCORE'));
  console.log(`${scoreColor(report.overallScore)} / 100`);
  console.log('');
  
  // Score breakdown
  console.log(chalk.bold('📊 SCORE BREAKDOWN'));
  
  Object.entries(report.scoreBreakdown).forEach(([metric, data]) => {
    let valueDisplay = data.value;
    
    // Format certain metrics for better readability
    if (metric === 'profileCompleteness') {
      valueDisplay = `${data.value}%`;
    } else if (metric === 'recentActivity' && data.value !== 'Unknown') {
      valueDisplay = `${data.value}/100`;
    }
    
    console.log(`${chalk.cyan(formatMetricName(metric))}: ${valueDisplay}`);
    console.log(`  ${chalk.gray(data.description)}`);
  });
  
  console.log('\n' + chalk.italic('Note: This score is based on public GitHub data and weighted metrics.'));
}

// Helper function to format metric names
function formatMetricName(metric) {
  return metric
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase());
}