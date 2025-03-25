'use strict';

const fs = require('fs');
const path = require('paths');
const paths = require('./paths');
const chalk = require('react-dev-utils/chalk');
const resolve = require('resolve');

// Helper function that returns the error message
const throwBaseUrlError = () => {
  throw new Error(chalk.red.bold(
    "The `baseUrl` can only be set to `src` or `node_modules`. " +
    "Create React App doesn't support other values."
  ));
};

// Function that creates module paths, webpack and jest aliases
function getModules() {
  // Check if config files exist
  const hasTsConfig = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  // Throw an error if both configs exist
  if (hasTsConfig && hasJsConfig) {
    throw new Error(
      'You have both a tsconfig.json and a jsconfig.json. ' +
      'If using TypeScript, remove the jsconfig.json.'
    );
  }

  let config = {};

  // Read TypeScript configuration
  if (hasTsConfig) {
    const ts = require(resolve.sync('typescript', { basedir: paths.appNodeModules }));
    const tsConfig = ts.readConfigFile(paths.appTsConfig, ts.sys.readFile);
    config = tsConfig.config || {};
  } else if (hasJsConfig) {
    config = require(paths.appJsConfig);
  }

  const compilerOptions = config.compilerOptions || {};
  const baseUrl = compilerOptions.baseUrl;

  // Determine module paths
  const getModulePaths = () => {
    if (!baseUrl) return [];
    const resolvedBase = path.resolve(paths.appPath, baseUrl);

    if (path.relative(paths.appNodeModules, resolvedBase) === '') return [];
    if (path.relative(paths.appSrc, resolvedBase) === '') return [paths.appSrc];
    if (path.relative(paths.appPath, resolvedBase) === '') return null;

    throwBaseUrlError();
  };

  // Set Webpack alias
  const getWebpackAlias = () => {
    if (!baseUrl) return {};
    const resolvedBase = path.resolve(paths.appPath, baseUrl);
    return (path.relative(paths.appPath, resolvedBase) === '') ? { src: paths.appSrc } : {};
  };

  // Set gesture alias
  const getJestAlias = () => {
    if (!baseUrl) return {};
    const resolvedBase = path.resolve(paths.appPath, baseUrl);
    return (path.relative(paths.appPath, resolvedBase) === '') ? { '^src/(.*)$': '<rootDir>/src/$1' } : {};
  };

  // Assemble the results
  return {
    additionalModulePaths: getModulePaths(),
    webpackAliases: getWebpackAlias(),
    jestAliases: getJestAlias(),
    hasTsConfig,
  };
}

// Modülexports
module.exports = getModules();
