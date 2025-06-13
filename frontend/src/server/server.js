#!/usr/bin/env node

// Simple server bootstrapper to load the built server application
import process from 'process';

import('./index.js').catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
