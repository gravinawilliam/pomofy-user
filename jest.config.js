const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('get-tsconfig').getTsconfig('./tsconfig.json')['config'];

module.exports = {
  verbose: true,
  rootDir: './',
  roots: ['<rootDir>'],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  testMatch: ['<rootDir>/src/**/?(*.)+(unit|int|e2e|spec|test).(ts|js)'],
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: false,
            decorators: true
          },
          target: 'es2021',
          keepClassNames: true,
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true
          }
        },
        module: {
          type: 'es6',
          noInterop: false
        }
      }
    ]
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>' }),
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  clearMocks: true,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/src/types',
    '<rootDir>/src/infrastructure',
    '<rootDir>/src/index.ts',
    '<rootDir>/src/healthcheck.ts',
    '<rootDir>/src/main'
  ],
  reporters: ['default'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
