#!/usr/bin/env node
import { hasGit, isGitRepo, printStatus } from './git-utils.mjs'

if (!hasGit()) {
  console.error('[git:status] Git is not installed or not available in PATH.')
  process.exit(1)
}

if (!isGitRepo()) {
  console.log('[git:status] This folder is not a git repository yet.')
  console.log('[git:status] Run: npm run git:setup -- --remote=https://github.com/USER/REPO.git')
  process.exit(0)
}

printStatus()
