const { TypeScriptProject, JsonFile } = require('projen');

const PROJEN_UPGRADE_SECRET = 'PROJEN_GITHUB_TOKEN';

const project = new TypeScriptProject({
  defaultReleaseBranch: 'main',
  name: '@cdklabs/sm2gh-secrets',
  description: 'Update GitHub repository secrets from an AWS SecretsManager secret',
  deps: ['aws-sdk', 'yargs@17.1.1'],
  minNodeVersion: '14.17.0',
  projenUpgradeSecret: PROJEN_UPGRADE_SECRET,
  releaseToNpm: true,
  npmRegistryUrl: 'https://npm.pkg.github.com',
  workflowBootstrapSteps: [
    {
      name: 'Install Semgrep',
      run: 'python3 -m pip install semgrep',
    },
  ],
});

//----------------------------------------------------
// very meta (should be part of projen)

const secretsConfig = 'sm2gh.json';
new JsonFile(project, secretsConfig, {
  obj: {
    secret: 'publishing-secrets',
    region: 'us-east-1',
    prune: true,
    keys: ['NPM_TOKEN', PROJEN_UPGRADE_SECRET],
  },
});

project.addTask('secrets:update', {
  description: 'Update this GitHub repository\'s secrets from AWS SecretsManager',
  exec: `bin/sm2gh-secrets --config ${secretsConfig}`,
});

//----------------------------------------------------

const semgrep = project.addTask('semgrep', {
  description: 'Static analysis',
  exec: 'semgrep --config p/typescript',
  condition: 'which semgrep', // only run if semgrep is installed
});

project.postCompileTask.spawn(semgrep);

project.synth();
