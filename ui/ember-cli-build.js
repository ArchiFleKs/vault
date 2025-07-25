/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: BUSL-1.1
 */

/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const config = require('./config/environment')();

const environment = EmberApp.env();
const isProd = environment === 'production';
const isTest = environment === 'test';
// const isCI = !!process.env.CI;

const appConfig = {
  'ember-service-worker': {
    serviceWorkerScope: config.serviceWorkerScope,
    skipWaitingOnMessage: true,
  },
  babel: {
    plugins: [require.resolve('ember-concurrency/async-arrow-task-transform')],
  },
  fingerprint: {
    exclude: ['images/'],
  },
  assetLoader: {
    generateURI: function (filePath) {
      return `${config.rootURL.replace(/\/$/, '')}${filePath}`;
    },
  },
  'ember-cli-babel': {
    enableTypeScriptTransform: true,
    throwUnlessParallelizable: true,
  },
  hinting: isTest,
  tests: isTest,
  sourcemaps: {
    enabled: !isProd,
  },
  sassOptions: {
    sourceMap: false,
    onlyIncluded: true,
    quietDeps: true, // silences deprecation warnings from dependencies
    precision: 4,
    includePaths: [
      './node_modules/@hashicorp/design-system-components/dist/styles',
      './node_modules/@hashicorp/design-system-tokens/dist/products/css',
      './node_modules/ember-basic-dropdown/',
      './node_modules/ember-power-select/',
      './node_modules/@hashicorp/vault-reporting/dist/styles',
    ],
  },
  minifyCSS: {
    options: {
      advanced: false,
    },
  },
  autoprefixer: {
    enabled: isTest || isProd,
    grid: true,
    browsers: ['defaults'],
  },
  autoImport: {
    forbidEval: true,
  },
  'ember-test-selectors': {
    strip: isProd,
  },
  'ember-composable-helpers': {
    except: ['array'],
  },
  'ember-cli-deprecation-workflow': {
    enabled: true,
  },
};

module.exports = function (defaults) {
  const app = new EmberApp(defaults, appConfig);

  app.import('node_modules/jsonlint/lib/jsonlint.js');
  app.import('node_modules/text-encoder-lite/text-encoder-lite.js');
  app.import('node_modules/jsondiffpatch/dist/jsondiffpatch.umd.js');
  app.import('node_modules/jsondiffpatch/dist/formatters-styles/html.css');

  app.import('app/styles/bulma/bulma-radio-checkbox.css');
  app.import(
    'node_modules/@hashicorp/design-system-components/dist/styles/@hashicorp/design-system-components.css'
  );

  return app.toTree();
};
