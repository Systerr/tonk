import {Command} from 'commander';
import chalk from 'chalk';
import fetch from 'node-fetch';
import {trackCommand, trackCommandError, trackCommandSuccess} from '../utils/analytics.js';

interface ServerInfo {
  id: string;
  bundleName: string;
  port: number;
  status: string;
  startedAt?: string;
}

export const psCommand = new Command('ps')
  .description('List running bundle servers')
  .option('-u, --url <url>', 'URL of the Tonk server', 'http://localhost:7777')
  .action(async options => {
    const startTime = Date.now();
    const serverUrl = options.url;

    try {
      trackCommand('ps', {serverUrl});

      console.log(chalk.blue(`Fetching running servers from ${serverUrl}...`));

      const response = await fetch(`${serverUrl}/ps`);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Server error: ${error}`);
      }

      const servers = (await response.json()) as ServerInfo[];

      if (servers.length === 0) {
        console.log(chalk.yellow('No servers currently running.'));
        
        const duration = Date.now() - startTime;
        trackCommandSuccess('ps', duration, {
          serverUrl,
          serverCount: 0,
        });
        return;
      }

      console.log(chalk.green(`Running servers (${servers.length}):`));

      // Format the output as a table
      console.log(
        `${chalk.bold('ID'.padEnd(36))} | ${chalk.bold(
          'Bundle'.padEnd(20),
        )} | ${chalk.bold('Port'.padEnd(6))} | ${chalk.bold('Status')}`,
      );
      console.log('-'.repeat(80));

      servers.forEach((server: ServerInfo) => {
        console.log(
          `${server.id.padEnd(36)} | ${server.bundleName.padEnd(20)} | ${String(
            server.port,
          ).padEnd(6)} | ${server.status}`,
        );
      });

      const duration = Date.now() - startTime;
      trackCommandSuccess('ps', duration, {
        serverUrl,
        serverCount: servers.length,
        bundleNames: servers.map(s => s.bundleName),
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      trackCommandError('ps', error as Error, duration, {
        serverUrl,
      });

      console.error(
        chalk.red(
          `Error: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      process.exit(1);
    }
  });
