import path from "path";
import {
  filterGroupImages,
  isExecExpectedResult,
  processKeyValueGroups,
  retry,
  spawnExec,
  spawnWaitFor,
} from "./util.js";

export interface AndroidOptions {
  /** The location of the `adb` executable file relative to `ANDROID_HOME` */
  adb?: string;
  /** The location of the `avdmanager` executable file relative to `ANDROID_HOME` */
  avdmanager?: string;
  /** The location of the `sdkmanager` executable file relative to `ANDROID_HOME` */
  sdkmanager?: string;
  /** The location of the `emulator` executable file relative to `ANDROID_HOME` */
  emulator?: string;
}

export type AndroidExecBin = "adbBin" | "avdmanagerBin" | "sdkmanagerBin" | "emulatorBin";

export interface CreateAVDOptions {
  /** Path to a shared SD card image, or size of a new sdcard for the new AVD. */
  sdcard?: string;
  /**
   * The sys-img tag to use for the AVD. The default is to
   * auto-select if the platform has only one tag for its system
   * images.
   */
  tag?: string;
  /** Directory where the new AVD will be created. */
  path?: string;
  /**
   * Package path of the system image for this AVD (e.g.
   * 'system-images;android-19;google_apis;x86').
   */
  package: string;
  /**
   * Name of the new AVD. [required]
   */
  name: string;
  /**
   * The optional name of a skin to use with this device.
   */
  skin?: string;
  /**
   * Forces creation (overwrites an existing AVD)
   */
  force?: boolean;
  /**
   * The ABI to use for the AVD. The default is to auto-select the
   * ABI if the platform has only one ABI for its system images.
   */
  abi?: string;
  /**
   * The optional device definition to use. Can be a device index
   * or id.
   */
  device?: string;
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
  adbBin: string = process.env.adbBin || "";
  /** The location of the `avdmanager` executable file */
  avdmanagerBin: string = process.env.avdmanagerBin || "";
  /** The location of the `sdkmanager` executable file */
  sdkmanagerBin: string = process.env.sdkmanagerBin || "";
  /** The location of the `emulator` executable file */
  emulatorBin: string = process.env.emulatorBin || "";

  constructor(props?: AndroidOptions) {
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
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.adbBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.adbBin) {
        this.adbBin = path.resolve(process.env.ANDROID_HOME, "./platform-tools/adb");
      }
    }
    const regex = /Android Debug Bridge/;
    if (!this.adbBin || !isExecExpectedResult(this.adbBin, regex)) {
      if (isExecExpectedResult("adb", regex)) {
        this.adbBin = "adb";
      }
    }
  }
  /**
   * Set the location of the `avdmanager` executable file
   * @param execPath The location of the `avdmanager` executable file relative to `ANDROID_HOME`
   */
  setAvdmanagerBinPath(execPath?: string) {
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.avdmanagerBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.avdmanagerBin) {
        this.avdmanagerBin = path.resolve(process.env.ANDROID_HOME, "./cmdline-tools/latest/bin/avdmanager");
      }
    }

    const regex = /Usage:/;
    if (!this.avdmanagerBin || !isExecExpectedResult(this.avdmanagerBin, regex)) {
      if (isExecExpectedResult("avdmanager", regex)) {
        this.avdmanagerBin = "avdmanager";
      }
    }
  }
  /**
   * Set the location of the `sdkmanager` executable file
   * @param execPath The location of the `sdkmanager` executable file relative to `ANDROID_HOME`
   */
  setSdkmanagerBinPath(execPath?: string) {
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.sdkmanagerBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.sdkmanagerBin) {
        this.sdkmanagerBin = path.resolve(process.env.ANDROID_HOME, "./cmdline-tools/latest/bin/sdkmanager");
      }
    }
    const regex = /Usage:/;
    if (!this.sdkmanagerBin || !isExecExpectedResult(this.sdkmanagerBin, regex)) {
      if (isExecExpectedResult("sdkmanager", regex)) {
        this.sdkmanagerBin = "sdkmanager";
      }
    }
  }
  /**
   * Set the location of the `emulator` executable file
   * @param execPath The location of the `emulator` executable file relative to `ANDROID_HOME`
   */
  setEmulatorBinPath(execPath?: string) {
    if (process.env.ANDROID_HOME) {
      if (execPath) {
        this.emulatorBin = path.resolve(process.env.ANDROID_HOME, execPath);
      } else if (!this.emulatorBin) {
        this.emulatorBin = path.resolve(process.env.ANDROID_HOME, "./emulator/emulator");
      }
    }
    const regex = /Android Emulator usage:/;
    if (!this.emulatorBin || !isExecExpectedResult(`${this.emulatorBin} --help`, regex)) {
      if (isExecExpectedResult("emulator --help", regex)) {
        this.emulatorBin = "emulator";
      }
    }
  }

  /**
   * Start the emulator using the AVD supplied through with `avdName`.
   * Returns a promise that is resolved with an object that has the following properties.
   * @param {string} avdName
   */
  async start(avdName: string) {
    const res = await spawnWaitFor(
      `${this.emulatorBin} -verbose -avd ${avdName}`,
      / control console listening on port (\d+), ADB on port \d+/
    );
    return {
      process: res.process,
      id: "emulator-" + res.matches[1],
    };
  }

  /**
   * Waiting for the simulator device to become available.
   * @param emulatorId id of emulator
   */
  async waitForDevice(emulatorId: string) {
    await this.adb(emulatorId, "wait-for-device");
  }

  /**
   * ensure device has been started and ready.
   * @param emulatorId id of emulator
   */
  async ensureReady(emulatorId: string) {
    await this.waitForDevice(emulatorId);
    return await retry(async () => {
      const proc = await this.adb(emulatorId, "shell getprop sys.boot_completed");
      return proc.output.trim() === "1";
    }, 100);
  }

  /**
   * create a AVD based upon `image`
   * @param image android system image
   * @param name name of AVD
   */
  async createAVD(options: CreateAVDOptions) {
    if (options.package) {
      await this.sdkmanager(options.package);
    }
    const cmdParams = Object.keys(options).reduce((prev, curr) => {
      const val = options[curr as keyof CreateAVDOptions];
      if (typeof val === "boolean") {
        if (val) return `${prev} --${curr}`;
        else return prev;
      }
      return `${prev} --${curr} ${val}`;
    }, "");
    return await this.avdmanager(`-s create avd ${cmdParams}`);
  }

  /**
   * Check if a specific AVD has been created on this machine.
   * @param avdName Name of AVD.
   */
  async hasAVD(avdName: string) {
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
  stop(emulatorId: string) {
    return this.adb(emulatorId, "emu kill");
  }

  /**
   * Wait until the device is stopped.
   */
  waitForStop(emulatorId: string) {
    return retry(async () => {
      await this.stop(emulatorId);
      const devices = await this.devices();
      return !devices.some((device) => device.name === emulatorId && device.status === "device");
    }, 100);
  }

  /**
   * Check the package specified with `packageName` is installed or not.
   * @param emulatorId id of emulator
   * @param packageName name of package
   */
  async isInstalled(emulatorId: string, packageName: string) {
    const packages = await this.listPackages(emulatorId);
    let isInstalled = packages.indexOf(packageName) > -1;
    return isInstalled;
  }

  /**
   * Install an APK located by absolute URI `apkPath` onto device with `emulatorId`.
   * @param emulatorId id of emulator
   * @param apkPath path of apk file
   */
  async install(emulatorId: string, apkPath: string) {
    const process = await this.adb(emulatorId, `install ${apkPath}`);
    if (process.output.match(/Success/)) return;
    throw new Error("Could not parse output of adb command");
  }

  /**
   * adb shell input keyevent
   * @param emulatorId Id of emulator
   * @param key https://developer.android.com/reference/android/view/KeyEvent
   */
  inputKeyEvent(emulatorId: string, key: number) {
    return this.adb(emulatorId, "shell input keyevent " + key);
  }

  /**
   * List connected devices
   */
  async devices() {
    const proc = await this.adb("devices");
    let lines = proc.output.split("\n");
    lines.shift();
    return lines
      .map((line) => {
        let matches = line.match(/([^\s]+)\s+([^\s]+)/);
        if (matches === null) return null;
        return {
          name: matches[1],
          status: matches[2],
        };
      })
      .filter((x) => x !== null) as Device[];
  }

  /**
   * List packages installed on the emulator with `emulatorId`.
   * @param emulatorId id of emulator
   */
  async listPackages(emulatorId: string) {
    const proc = await this.adb(emulatorId, "shell pm list packages");
    let lines = proc.output.split("\n");
    return lines
      .map((line) => {
        return line.split(":")[1];
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
    const proc = await this.avdmanager("list device");
    return processKeyValueGroups<AvdDevice>(proc.output);
  }

  /**
   * List all AVDs created on this machine.
   */
  async listAVDs() {
    const proc = await this.avdmanager("list avd");
    return processKeyValueGroups<Avd>(proc.output);
  }

  /**
   * List available Android targets.
   */
  async listTargets() {
    const proc = await this.avdmanager("list target");
    return processKeyValueGroups<AvdTarget>(proc.output);
  }

  /**
   * List available Android images on this machine.
   */
  async listImages() {
    const proc = await this.sdkmanager("--list");
    return filterGroupImages(proc.output);
  }

  /**
   * Use `adb` to execute commands.
   * @param emulatorId id of emulator
   * @param cmd command
   */
  adb(emulatorId: string, cmd?: string) {
    if (cmd) return spawnExec(`${this.adbBin} -s ${emulatorId} ${cmd}`);
    return spawnExec(`${this.adbBin} ${emulatorId}`);
  }

  /**
   * Use `avdmanager` to execute commands.
   * @param cmd command
   */
  avdmanager(cmd: string) {
    return spawnExec(`${this.avdmanagerBin} ${cmd}`);
  }

  /**
   * Use `sdkmanager` to execute commands.
   * @param cmd command
   */
  sdkmanager(cmd: string) {
    return spawnExec(`${this.sdkmanagerBin} ${cmd}`);
  }

  /**
   * Use `emulator` to execute commands.
   * @param cmd command
   */
  emulator(cmd: string) {
    return spawnExec(`${this.emulatorBin} ${cmd}`);
  }
}

export default Android;
