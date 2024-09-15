import { spawn, spawnSync } from 'node:child_process';
import type { ChildProcessByStdio, ChildProcessWithoutNullStreams } from 'node:child_process';
import type internal from 'node:stream';
import { Arch, SystemImageTarget } from './emulator.js';

export function winBatAdapt(cmd: string) {
  if (process.platform === 'win32' && (cmd.endsWith('sdkmanager') || cmd.endsWith('avdmanager'))) {
    return `${cmd}.bat`;
  }
  return cmd;
}

export function transformCommand(command: string) {
  const [cmd, ...args] = command.split(' ');
  const winCmd = winBatAdapt(cmd);
  return { cmd: winCmd, args: args.filter((arg) => arg), options: winCmd.endsWith('.bat') ? { shell: true } : {} };
}

/**
 * Run a shell command.
 */
export function spawnExec(command: string, timeout = 300000) {
  return new Promise<ChildProcessWithoutNullStreams & { output: string }>((resolve, reject) => {
    const { cmd, args, options } = transformCommand(command);
    const proc = spawn(cmd, args, options) as ChildProcessWithoutNullStreams & {
      output: string;
    };
    const clock = setTimeout(() => {
      proc.kill();
      reject(Error('Execution timeout'));
    }, timeout);
    let output = '';
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (data: string) => {
      output += data;
    });
    let error = '';
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (err: string) => {
      error += err;
    });
    proc.on('close', (code) => {
      clearTimeout(clock);
      if (code) {
        reject(Error(error));
      } else {
        proc.output = output;
        resolve(proc);
      }
    });
  });
}

/**
 * Execute a shell command synchronously.
 */
export function spwanSyncExec(command: string, timeout = 300000) {
  const { cmd, args, options } = transformCommand(command);
  const clock = setTimeout(() => {
    throw Error('Execution timeout');
  }, timeout);
  const res = spawnSync(cmd, args, { encoding: 'utf8', ...options });
  clearTimeout(clock);
  return res.output?.find((item) => item) ?? '';
}

/**
 * Execute a shell command until a matching output is found.
 */
export function spawnWaitFor(command: string, regex: RegExp, timeout = 600000) {
  return new Promise<{
    process: ChildProcessByStdio<null, internal.Readable, null>;
    matches: RegExpMatchArray;
    line: string;
  }>((resolve, reject) => {
    const { cmd, args, options } = transformCommand(command);
    const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'ignore'], ...options });
    const clock = setTimeout(() => {
      proc.kill();
      reject(Error('Execution timeout'));
    }, timeout);
    let output = '';
    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (data: string) => {
      output += data;
      const matches = data.match(regex);
      if (matches) {
        clearTimeout(clock);
        resolve({
          process: proc,
          matches: matches,
          line: data
        });
      }
    });
    proc.on('close', () => {
      clearTimeout(clock);
      reject(Error(output));
    });
  });
}

/**
 * Whether to execute the expected matching result.
 * @param cmd command
 * @param regex expected result match
 */
export function isExecExpectedResult(cmd: string, regex: RegExp) {
  try {
    const res = spwanSyncExec(cmd);
    return regex.test(res);
  } catch (_error) {
    return false;
  }
}

/**
 * Retry executing a certain operation until the condition is met.
 * @param execFunc The executed function.
 * @param retries The maximum number of executions, defaulting to 10.
 */
export async function retry(execFunc: () => Promise<boolean> | boolean, retries = 10) {
  const res = await Promise.resolve(execFunc());
  if (res) return;

  if (retries > 1) {
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(undefined);
      }, 1000)
    );
    await retry(execFunc, retries - 1);
  } else {
    throw Error('Already reached maximum retry times.');
  }
}

export function processKeyValueGroups<T extends object = object>(str: string) {
  const lines = str.split('\n');
  let currentKey = {} as T;
  const results = [];

  lines.forEach(function (line) {
    const matches = line.match(/(\w+):\s(.*)/);

    if (matches === null) {
      return;
    }

    const key = matches[1] as keyof T;
    const value = matches[2] as T[keyof T];

    if (typeof currentKey[key] !== 'undefined') {
      results.push(currentKey);
      currentKey = {} as T;
    }

    currentKey[key] = value;
  });

  if (Object.keys(currentKey).length) {
    results.push(currentKey);
  }

  return results;
}

export function filterGroupImages(output: string) {
  const lines = output.split('\n');
  const localArch = getLocalArch();
  return lines
    .map((line) => line.split('|')[0].trim())
    .filter((line) => line.startsWith('system-images;'))
    .map((name) => {
      const [type, sdk, target, arch] = name.split(';');
      return { name, type, sdk, target, arch } as {
        name: string;
        type: string;
        sdk: string;
        target: SystemImageTarget;
        arch: Arch;
      };
    })
    .filter((item) => {
      return item.arch === localArch;
    });
}

export function getLocalArch() {
  if (process.arch === 'arm') return 'armeabi-v7a';
  if (process.arch === 'arm64') return 'arm64-v8a';
  if (process.arch === 'ia32') return 'x86';
  if (process.arch === 'x64') return 'x86_64';
  return '';
}

export function params2Cmd(options: Record<string, string | number | boolean> = {}) {
  const opts = [];
  for (const key in options) {
    const val = options[key];
    const cliKey = '-' + key.replace(/[A-Z]/g, (matched) => `-${matched.toLocaleLowerCase()}`);
    if (val === true) {
      opts.push(cliKey);
    } else if (val) {
      opts.push(cliKey, val);
    }
  }
  return opts.join(' ');
}
