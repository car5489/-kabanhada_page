#!/usr/bin/env node
import {
  currentBranch,
  ensureGitIdentity,
  git,
  hasGit,
  hasRemoteBranch,
  hasStagedChanges,
  hasWorkingChanges,
  isGitRepo,
  npm,
  parseArgs,
  printStatus,
  remoteUrl,
} from './git-utils.mjs'

const { flags, positional } = parseArgs()
const dryRun = flags.has('dry-run')
const skipBuild = flags.has('no-build')
const skipPull = flags.has('no-pull')
const allowEmpty = flags.has('allow-empty')
const requestedBranch = flags.get('branch') || process.env.GIT_BRANCH || ''
const positionalMessage = positional.join(' ').trim()
const message = flags.get('message') || positionalMessage || `update: ${new Date().toISOString()}`

if (!hasGit()) {
  console.error('[git:update] Git is not installed or not available in PATH.')
  process.exit(1)
}

if (!isGitRepo()) {
  console.error('[git:update] This folder is not a git repository yet.')
  console.error('[git:update] Run first: npm run git:setup -- --remote=https://github.com/USER/REPO.git')
  process.exit(1)
}

const branch = requestedBranch || currentBranch() || 'main'
const origin = remoteUrl('origin')

if (!skipBuild) {
  console.log('[git:update] Running build before commit...')
  npm(['run', 'build'], { dryRun })
}

if (requestedBranch && currentBranch() !== requestedBranch) {
  console.log(`[git:update] Switching branch to ${requestedBranch}...`)
  git(['checkout', requestedBranch], { dryRun })
}

ensureGitIdentity()

console.log('[git:update] Staging files...')
git(['add', '-A'], { dryRun })

if (!hasStagedChanges() && !allowEmpty) {
  console.log('[git:update] No file changes to commit.')
} else {
  console.log(`[git:update] Creating commit: ${message}`)
  const commitArgs = ['commit', '-m', message]
  if (allowEmpty) commitArgs.splice(1, 0, '--allow-empty')
  git(commitArgs, { dryRun })
}

if (origin) {
  if (!skipPull && hasRemoteBranch('origin', branch)) {
    console.log(`[git:update] Pulling latest origin/${branch} with rebase...`)
    git(['pull', '--rebase', 'origin', branch], { dryRun })
  } else if (!skipPull) {
    console.log(`[git:update] No remote branch origin/${branch} found. First push will create it.`)
  }

  console.log(`[git:update] Pushing to origin/${branch}...`)
  git(['push', '-u', 'origin', branch], { dryRun })
} else {
  console.log('[git:update] No origin remote configured. Commit was kept local.')
  console.log('[git:update] Configure remote with: npm run git:setup -- --remote=https://github.com/USER/REPO.git')
}

if (hasWorkingChanges()) {
  console.log('[git:update] Working tree still has changes after update.')
}

printStatus()
