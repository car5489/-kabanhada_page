import { spawnSync } from 'node:child_process'

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {
    positional: [],
    flags: new Map(),
  }

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const raw = arg.slice(2)
      const eq = raw.indexOf('=')
      if (eq >= 0) {
        args.flags.set(raw.slice(0, eq), raw.slice(eq + 1))
      } else {
        args.flags.set(raw, true)
      }
    } else {
      args.positional.push(arg)
    }
  }

  return args
}

export function run(command, args = [], options = {}) {
  const label = [command, ...args].join(' ')

  if (options.dryRun) {
    console.log(`[dry-run] ${label}`)
    return { stdout: '', stderr: '', status: 0 }
  }

  const result = spawnSync(command, args, {
    cwd: options.cwd ?? process.cwd(),
    env: process.env,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) {
    throw new Error(`${label}\n${result.error.message}`)
  }

  if (result.status !== 0 && !options.allowFailure) {
    const stderr = result.stderr ? `\n${result.stderr}` : ''
    throw new Error(`${label} failed with status ${result.status}.${stderr}`)
  }

  return {
    stdout: result.stdout?.trim() ?? '',
    stderr: result.stderr?.trim() ?? '',
    status: result.status ?? 0,
  }
}

export function git(args = [], options = {}) {
  return run('git', args, options)
}

export function npm(args = [], options = {}) {
  return run('npm', args, options)
}

export function hasGit() {
  const result = run('git', ['--version'], { capture: true, allowFailure: true })
  return result.status === 0
}

export function isGitRepo() {
  const result = git(['rev-parse', '--is-inside-work-tree'], {
    capture: true,
    allowFailure: true,
  })
  return result.status === 0 && result.stdout === 'true'
}

export function currentBranch() {
  const result = git(['branch', '--show-current'], {
    capture: true,
    allowFailure: true,
  })
  return result.status === 0 ? result.stdout : ''
}

export function remoteUrl(name = 'origin') {
  const result = git(['remote', 'get-url', name], {
    capture: true,
    allowFailure: true,
  })
  return result.status === 0 ? result.stdout : ''
}

export function hasRemoteBranch(remote = 'origin', branch = 'main') {
  const result = git(['ls-remote', '--heads', remote, branch], {
    capture: true,
    allowFailure: true,
  })
  return result.status === 0 && result.stdout.length > 0
}

export function hasStagedChanges() {
  const result = git(['diff', '--cached', '--quiet'], { allowFailure: true })
  return result.status !== 0
}

export function hasWorkingChanges() {
  const result = git(['status', '--porcelain'], {
    capture: true,
    allowFailure: true,
  })
  return result.status === 0 && result.stdout.length > 0
}

export function ensureGitIdentity() {
  const name = git(['config', '--get', 'user.name'], {
    capture: true,
    allowFailure: true,
  }).stdout

  const email = git(['config', '--get', 'user.email'], {
    capture: true,
    allowFailure: true,
  }).stdout

  if (!name) {
    git(['config', 'user.name', 'Kabanhada Catalog Bot'])
    console.log('[git] user.name was missing. Set local fallback: Kabanhada Catalog Bot')
  }

  if (!email) {
    git(['config', 'user.email', 'kabanhada-catalog@example.local'])
    console.log('[git] user.email was missing. Set local fallback: kabanhada-catalog@example.local')
  }
}

export function printStatus() {
  console.log('\n[git] status')
  git(['status', '-sb'], { allowFailure: true })

  const origin = remoteUrl('origin')
  if (origin) {
    console.log(`\n[git] origin: ${origin}`)
  } else {
    console.log('\n[git] origin: not configured')
  }
}
