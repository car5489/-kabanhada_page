#!/usr/bin/env node
import {
  currentBranch,
  git,
  hasGit,
  isGitRepo,
  parseArgs,
  printStatus,
  remoteUrl,
} from './git-utils.mjs'

const { flags } = parseArgs()
const remote = flags.get('remote') || process.env.GIT_REMOTE_URL || ''
const branch = flags.get('branch') || process.env.GIT_BRANCH || 'main'

if (!hasGit()) {
  console.error('[git:setup] Git is not installed or not available in PATH.')
  process.exit(1)
}

if (!isGitRepo()) {
  console.log('[git:setup] Initializing git repository...')
  git(['init'])
}

const activeBranch = currentBranch()
if (activeBranch !== branch) {
  console.log(`[git:setup] Setting branch to ${branch}...`)
  git(['branch', '-M', branch])
}

if (remote) {
  const currentRemote = remoteUrl('origin')
  if (currentRemote) {
    if (currentRemote !== remote) {
      console.log('[git:setup] Updating origin remote...')
      git(['remote', 'set-url', 'origin', remote])
    } else {
      console.log('[git:setup] Origin remote already configured.')
    }
  } else {
    console.log('[git:setup] Adding origin remote...')
    git(['remote', 'add', 'origin', remote])
  }
} else {
  console.log('[git:setup] No remote provided. Local git repository is ready.')
  console.log('[git:setup] Add one later with: npm run git:setup -- --remote=https://github.com/USER/REPO.git')
}

printStatus()
