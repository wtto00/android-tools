import { spawn, spawnSync } from "node:child_process";
import type { ChildProcessByStdio, ChildProcessWithoutNullStreams } from "node:child_process";
import type internal from "node:stream";

export function winBatAdapt(cmd: string) {
  if (process.platform === "win32" && (cmd.endsWith("sdkmanager") || cmd.endsWith("avdmanager"))) {
    return `${cmd}.bat`;
  }
  return cmd;
}

export function transformCommand(command: string) {
  const [cmd, ...args] = command.split(" ");
  return { cmd: winBatAdapt(cmd), args: args.filter((arg) => arg) };
}

/**
 * Run a shell command.
 */
export function spawnExec(command: string, timeout = 60000) {
  return new Promise<ChildProcessWithoutNullStreams & { output: string }>((resolve, reject) => {
    const { cmd, args } = transformCommand(command);
    const proc = spawn(cmd, args) as ChildProcessWithoutNullStreams & {
      output: string;
    };
    const clock = setTimeout(() => {
      reject(Error("Execution timeout"));
    }, timeout);
    let output = "";
    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", (data) => {
      output += data;
    });
    let error = "";
    proc.stderr.setEncoding("utf8");
    proc.stderr.on("data", (err) => {
      error += err;
    });
    proc.on("close", (code) => {
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
export function spwanSyncExec(command: string, timeout = 6000) {
  const { cmd, args } = transformCommand(command);
  const clock = setTimeout(() => {
    throw Error("Execution timeout");
  }, timeout);
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  clearTimeout(clock);
  return res.output.find((item) => item) || "";
}

/**
 * Execute a shell command until a matching output is found.
 */
export function spawnWaitFor(command: string, regex: RegExp, timeout = 120000) {
  return new Promise<{
    process: ChildProcessByStdio<null, internal.Readable, null>;
    matches: RegExpMatchArray;
    line: string;
  }>((resolve, reject) => {
    console.log("command", command);

    const { cmd, args } = transformCommand(command);
    const proc = spawn(cmd, args, { stdio: ["ignore", "pipe", "ignore"] });
    const clock = setTimeout(() => {
      reject(Error("Execution timeout"));
    }, timeout);
    let output = "";
    proc.stdout.setEncoding("utf8");
    proc.stdout.on("data", (data: string) => {
      console.log("data", command);

      output += data;
      let matches = data.match(regex);
      if (matches) {
        clearTimeout(clock);
        resolve({
          process: proc,
          matches: matches,
          line: data,
        });
      }
    });
    proc.on("close", (code, signal) => {
      console.log("error", proc.stderr);
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
  } catch (error) {
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
    throw Error("Already reached maximum retry times.");
  }
}

export function processKeyValueGroups<T extends object = {}>(str: string) {
  const lines = str.split("\n");
  let currentKey = {} as T;
  const results = [];

  lines.forEach(function (line) {
    const matches = line.match(/([\w\/]+):\s(.*)/);
    let key: keyof T;
    let value: T[keyof T];

    if (matches === null) {
      return;
    }

    key = matches[1] as keyof T;
    value = matches[2] as T[keyof T];

    if (typeof currentKey[key] !== "undefined") {
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
  let lines = output.split("\n");
  return lines
    .map((line) => line.split("|")[0].trim())
    .filter((line) => line.startsWith("system-images;"))
    .map((name) => {
      const [type, sdk, vendor, arch] = name.split(";");
      return { name, type, sdk, vendor, arch };
    })
    .filter((item) => {
      if (process.arch === "arm") return item.arch === "armeabi-v7a";
      if (process.arch === "arm64") return item.arch === "arm64-v8a";
      if (process.arch === "ia32") return item.arch === "x86";
      if (process.arch === "x64") return item.arch === "x86_64";
      return false;
    });
}
