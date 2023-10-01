import path from 'path';
import {
  filterGroupImages,
  getLocalArch,
  isExecExpectedResult,
  params2Cmd,
  processKeyValueGroups,
  retry,
  spawnExec,
  spawnWaitFor
} from './util.js';
import { Arch, EmulatorOptions, SystemImageTarget } from './emulator.js';
import Debug from 'debug';

export * from './util.js';
export * from './emulator.js';

const log = Debug('android-tools');

export interface AndroidOptions {
  /** The location of the `adb` executable file relative to `ANDROID_HOME` */
  adb?: string;
  /** The location of the `avdmanager` executable file relative to `ANDROID_HOME` */
  avdmanager?: string;
  /** The location of the `sdkmanager` executable file relative to `ANDROID_HOME` */
  sdkmanager?: string;
  /** The location of the `emulator` executable file relative to `ANDROID_HOME` */
  emulator?: string;
  /** Print debug output or not */
  debug?: boolean;
}

export type AndroidExecBin = 'adbBin' | 'avdmanagerBin' | 'sdkmanagerBin' | 'emulatorBin';

export interface CreateAVDOptions {
  /** API level of the platform system image */
  apiLevel?: number;
  /** Target of the system image */
  target?: SystemImageTarget;
  /** CPU architecture of the system image */
  arch?: Arch;
  /** Name of AVD */
  name: string;
  /** Forces creation (overwrites an existing AVD) */
  force?: boolean;
  /** Package path of the system image for this AVD (e.g. 'system-images;android-19;google_apis;x86'). */
  package?: string;
}

export interface Device {
  name: string;
  status: string;
}

export interface Avd {
  Name: string;
  Device?: string;
  Path: string;
  Target: string;
  on: string;
  Skin?: string;
  Sdcard: string;
}

export interface AvdTarget {
  id: string;
  Name: string;
  Type: string;
  level: string;
  Revision: string;
}

export interface AvdDevice {
  id: string;
  Name: string;
}

class Android {
  /** The location of the `adb` executable file */
  adbBin: string = process.env.adbBin ?? '';
  /** The location of the `avdmanager` executable file */
  avdmanagerBin: string = process.env.avdmanagerBin ?? '';
  /** The location of the `sdkmanager` executable file */
  sdkmanagerBin: string = process.env.sdkmanagerBin ?? '';
  /** The location of the `emulator` executable file */
  emulatorBin: string = process.env.emulatorBin ?? '';

  constructor(props?: AndroidOptions) {
    if (!props?.debug) Debug.disable();
    this.setAdbBinPath(props?.adb);
    this.setAvdmanagerBinPath(props?.avdmanager);
    this.setSdkmanagerBinPath(props?.sdkmanager);
    this.setEmulatorBinPath(props?.emulator);
  }

  /**
   * Set the location of the `adb` executable file
   * @param execPath The location of the `adb` executable file relative to `ANDROID_HOME`
   */
  setAdbBinPath(execPath?: string) {
    log('setAdbBinPath: %s', JSON.stringify({ execPath }));
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.adbBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.adbBin) {
        this.adbBin = path.resolve(process.env.ANDROID_HOME, './platform-tools/adb');
      }
    }
    const regex = /Android Debug Bridge/;
    if (!this.adbBin || !isExecExpectedResult(this.adbBin, regex)) {
      if (isExecExpectedResult('adb', regex)) {
        this.adbBin = 'adb';
      }
    }
  }

  /**
   * Set the location of the `avdmanager` executable file
   * @param execPath The location of the `avdmanager` executable file relative to `ANDROID_HOME`
   */
  setAvdmanagerBinPath(execPath?: string) {
    log('setAvdmanagerBinPath: %s', JSON.stringify({ execPath }));
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.avdmanagerBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.avdmanagerBin) {
        this.avdmanagerBin = path.resolve(process.env.ANDROID_HOME, './cmdline-tools/latest/bin/avdmanager');
      }
    }

    const regex = /Usage:/;
    if (!this.avdmanagerBin || !isExecExpectedResult(this.avdmanagerBin, regex)) {
      if (isExecExpectedResult('avdmanager', regex)) {
        this.avdmanagerBin = 'avdmanager';
      }
    }
  }

  /**
   * Set the location of the `sdkmanager` executable file
   * @param execPath The location of the `sdkmanager` executable file relative to `ANDROID_HOME`
   */
  setSdkmanagerBinPath(execPath?: string) {
    log('setSdkmanagerBinPath: %s', JSON.stringify({ execPath }));
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.sdkmanagerBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.sdkmanagerBin) {
        this.sdkmanagerBin = path.resolve(process.env.ANDROID_HOME, './cmdline-tools/latest/bin/sdkmanager');
      }
    }
    const regex = /Usage:/;
    if (!this.sdkmanagerBin || !isExecExpectedResult(this.sdkmanagerBin, regex)) {
      if (isExecExpectedResult('sdkmanager', regex)) {
        this.sdkmanagerBin = 'sdkmanager';
      }
    }
  }

  /**
   * Set the location of the `emulator` executable file
   * @param execPath The location of the `emulator` executable file relative to `ANDROID_HOME`
   */
  setEmulatorBinPath(execPath?: string) {
    log('setEmulatorBinPath: %s', JSON.stringify({ execPath }));
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.emulatorBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.emulatorBin) {
        this.emulatorBin = path.resolve(process.env.ANDROID_HOME, './emulator/emulator');
      }
    }
    const regex = /Android Emulator usage:/;
    if (!this.emulatorBin || !isExecExpectedResult(`${this.emulatorBin} --help`, regex)) {
      if (isExecExpectedResult('emulator --help', regex)) {
        this.emulatorBin = 'emulator';
      }
    }
  }

  /**
   * Start the emulator using the AVD supplied through with `avdName`.
   * Returns a promise that is resolved with an object that has the following properties.
   * @param options
   */
  async start(options: Required<Pick<EmulatorOptions, 'avd'>> & Omit<EmulatorOptions, 'avd'>) {
    log('start: %s', JSON.stringify(options));
    options.verbose = true;
    const cmd = params2Cmd(options);
    const res = await spawnWaitFor(
      `${this.emulatorBin} ${cmd}`,
      / control console listening on port (\d+), ADB on port \d+/
    );
    return {
      process: res.process,
      id: 'emulator-' + res.matches[1]
    };
  }

  /**
   * Waiting for the simulator device to become available.
   * @param emulatorId id of emulator
   */
  async waitForDevice(emulatorId: string) {
    log('waitForDevice: %s', JSON.stringify({ emulatorId }));
    await this.adb(emulatorId, 'wait-for-device');
  }

  /**
   * ensure device has been started and ready.
   * @param emulatorId id of emulator
   */
  async ensureReady(emulatorId: string) {
    log('ensureReady: %s', JSON.stringify({ emulatorId }));
    await this.waitForDevice(emulatorId);
    await retry(async () => {
      const proc = await this.adb(emulatorId, 'shell getprop sys.boot_completed');
      return proc.output.trim() === '1';
    }, 1200);
  }

  /**
   * create a AVD based upon `image`
   * @param image android system image
   * @param name name of AVD
   */
  async createAVD(options: CreateAVDOptions) {
    log('createAVD: %s', JSON.stringify(options));
    if (!options.name) return Promise.reject(Error('Missing name parameter.'));
    if (!options.package && !options.apiLevel)
      return Promise.reject(Error('Either the parameter "package" or "apiLevel" must be present.'));
    const systemImage =
      options.package ||
      `system-images;android-${options.apiLevel};${options.target || 'default'};${options.arch || getLocalArch()}`;
    // Downloading the SDK takes a lot of time, so it's best to download it in advance.
    await this.sdkmanager(`--install ${systemImage}`, 600000);
    let cmdParams = `-n ${options.name} -k ${systemImage}`;
    if (options.force) cmdParams += ' -f';
    return await this.avdmanager(`-s create avd ${cmdParams}`);
  }

  /**
   * Check if a specific AVD has been created on this machine.
   * @param avdName Name of AVD.
   */
  async hasAVD(avdName: string) {
    log('hasAVD: %s', JSON.stringify({ avdName }));
    const avds = await this.listAVDs();
    return (
      avds.filter((avd) => {
        return avd.Name.toLowerCase() === avdName.toLowerCase();
      }).length > 0
    );
  }

  /**
   * Stop a certain emulator.
   * @param emulatorId Id of emulator.
   */
  async stop(emulatorId: string) {
    log('stop: %s', JSON.stringify({ emulatorId }));
    return await this.adb(emulatorId, 'emu kill');
  }

  /**
   * Wait until the device is stopped.
   */
  async waitForStop(emulatorId: string) {
    log('waitForStop: %s', JSON.stringify({ emulatorId }));
    await retry(async () => {
      await this.stop(emulatorId);
      const devices = await this.devices();
      return !devices.some((device) => device.name === emulatorId && device.status === 'device');
    }, 1200);
  }

  /**
   * Check the package specified with `packageName` is installed or not.
   * @param emulatorId id of emulator
   * @param packageName name of package
   */
  async isInstalled(emulatorId: string, packageName: string) {
    log('isInstalled: %s, %s', JSON.stringify({ emulatorId, packageName }));
    const packages = await this.listPackages(emulatorId);
    const isInstalled = packages.includes(packageName);
    return isInstalled;
  }

  /**
   * Install an APK located by absolute URI `apkPath` onto device with `emulatorId`.
   * @param emulatorId id of emulator
   * @param apkPath path of apk file
   */
  async install(emulatorId: string, apkPath: string, options?: Record<'l' | 'r' | 't' | 's' | 'd' | 'g', boolean>) {
    log('install: %s, %s', JSON.stringify({ emulatorId, apkPath }));
    const cmdParams = params2Cmd(options);
    const process = await this.adb(emulatorId, `install ${cmdParams} ${apkPath}`);
    if (process.output.match(/Success/)) return;
    throw new Error('Could not parse output of adb command');
  }

  /**
   * adb shell input keyevent
   * @param emulatorId Id of emulator
   * @param key https://developer.android.com/reference/android/view/KeyEvent
   */
  async inputKeyEvent(emulatorId: string, key: number) {
    log('inputKeyEvent: %s, %d', JSON.stringify({ emulatorId, key }));
    return await this.adb(emulatorId, 'shell input keyevent ' + key);
  }

  /**
   * List connected devices
   */
  async devices() {
    log('devices: ');
    const proc = await this.adb('devices');
    const lines = proc.output.split('\n');
    lines.shift();
    return lines
      .map((line) => {
        const matches = line.match(/([^\s]+)\s+([^\s]+)/);
        if (matches === null) return null;
        return {
          name: matches[1],
          status: matches[2]
        };
      })
      .filter((x) => x !== null) as Device[];
  }

  /**
   * List packages installed on the emulator with `emulatorId`.
   * @param emulatorId id of emulator
   */
  async listPackages(emulatorId: string) {
    log('listPackages: %s', JSON.stringify({ emulatorId }));
    const proc = await this.adb(emulatorId, 'shell pm list packages');
    const lines = proc.output.split('\n');
    return lines
      .map((line) => {
        return line.split(':')[1];
      })
      .filter((pkg) => {
        return pkg;
      })
      .map((pkg) => {
        return pkg.trim();
      });
  }

  /**
   * List the available device list for creating emulators in the current system.
   */
  async listDevices() {
    log('listDevices: ');
    const proc = await this.avdmanager('list device');
    return processKeyValueGroups<AvdDevice>(proc.output);
  }

  /**
   * List all AVDs created on this machine.
   */
  async listAVDs() {
    log('listAVDs: ');
    const proc = await this.avdmanager('list avd');
    return processKeyValueGroups<Avd>(proc.output);
  }

  /**
   * List available Android targets.
   */
  async listTargets() {
    log('listTargets: ');
    const proc = await this.avdmanager('list target');
    return processKeyValueGroups<AvdTarget>(proc.output);
  }

  /**
   * List available Android images on this machine.
   */
  async listImages() {
    log('listImages: ');
    const proc = await this.sdkmanager('--list');
    return filterGroupImages(proc.output);
  }

  /**
   * List installed Android images on this machine.
   */
  async listInstalledImages() {
    log('listInstalledImages: ');
    const proc = await this.sdkmanager('--list_installed');
    return filterGroupImages(proc.output);
  }

  /**
   * Use `adb` to execute commands.
   * @param emulatorId id of emulator
   * @param cmd command
   * @param timeout Execution timeout
   */
  async adb(emulatorId: string, cmd?: string, timeout?: number) {
    log('adb: %s', JSON.stringify({ emulatorId, cmd, timeout }));
    if (cmd) return await spawnExec(`${this.adbBin} -s ${emulatorId} ${cmd}`, timeout);
    return await spawnExec(`${this.adbBin} ${emulatorId}`, timeout);
  }

  /**
   * Use `avdmanager` to execute commands.
   * @param cmd command
   * @param timeout Execution timeout
   */
  async avdmanager(cmd: string, timeout?: number) {
    log('avdmanager: %s', JSON.stringify({ cmd, timeout }));
    return await spawnExec(`${this.avdmanagerBin} ${cmd}`, timeout);
  }

  /**
   * Use `sdkmanager` to execute commands.
   * @param cmd command
   * @param timeout Execution timeout
   */
  async sdkmanager(cmd: string, timeout?: number) {
    log('sdkmanager: %s', JSON.stringify({ cmd, timeout }));
    return await spawnExec(`${this.sdkmanagerBin} ${cmd}`, timeout);
  }

  /**
   * Use `emulator` to execute commands.
   * @param cmd command
   * @param timeout Execution timeout
   */
  async emulator(cmd: string, timeout?: number) {
    log('emulator: %s', JSON.stringify({ cmd, timeout }));
    return await spawnExec(`${this.emulatorBin} ${cmd}`, timeout);
  }
}

export default Android;
