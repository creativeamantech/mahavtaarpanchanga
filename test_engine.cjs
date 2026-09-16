const { generateComprehensiveVedicAnalysis } = require('./dist/server.cjs').__vedicEngine__ || {};

// If not exported in server, I'll use ts-node or just esbuild to run it.
