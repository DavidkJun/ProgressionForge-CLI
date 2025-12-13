/** @type {import('ts-jest').JestConfigWithTsJest} */
const isUnit = process.env.IS_UNIT === 'true';

export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  verbose: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        isolatedModules: isUnit,
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
};
