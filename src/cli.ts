import * as yargs from 'yargs';
import { updateSecrets } from './update-secrets';

async function main() {
  const argv = yargs
    .usage('$0 -s SECRET [OPTIONS]')
    .usage('$0 -C secrets.json')
    .option('secret', { alias: 's', describe: 'Secrets Manager secret ID or ARN', type: 'string', required: true })
    .option('repo', { alias: 'r', describe: 'GitHub repository owner/name (default is derived from current git repository)', type: 'string' })
    .option('region', { alias: 'R', describe: 'AWS region (if --secret is an ARN, region is not required)', type: 'string' })
    .option('keys', { alias: 'k', describe: 'Which keys to update (by default, updates all keys)', type: 'array' })
    .option('config', { alias: 'C', describe: 'Reads options from a configuration file' })
    .option('debug', { type: 'boolean', describe: 'Show debugging information', default: false })
    .example('$0 -s my-secrets', 'Updates all secrets from AWS Secrets Manager to the current github repository (region can be omitted by specifying an ARN)')
    .example('$0 -s my-secrets -k TWINE_USERNAME -k TWINE_PASSWORD', 'Only updates two secrets')
    .example('$0 -C secrets.json', 'Read settings from secrets.json')
    .boolean('confirm')
    .array('keys')
    .string('keys')
    .config('config') // allow reading from a config file
    .argv;

  if (argv.debug) {
    console.error({ argv });
  }

  await updateSecrets({
    secret: argv.secret,
    region: argv.region,
    repository: argv.repo,
    keys: argv.keys,
  });
}

main().catch((e: Error) => {
  console.error(e.stack);
  process.exit(1);
});