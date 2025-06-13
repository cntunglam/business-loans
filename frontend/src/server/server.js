#!/usr/bin/env node

// Load the bundled server
import('./index.js').catch((err) => {
  console.error('Failed to start server:', err);
});
