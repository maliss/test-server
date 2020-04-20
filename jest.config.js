module.exports = {
  roots: ["<rootDir>/src"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov"],
  preset: "ts-jest",
  maxWorkers: 1,
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  verbose: true,
  coveragePathIgnorePatterns: [],
};
