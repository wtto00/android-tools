import path from "path";
import Android from "../src/index.js";

describe("constructor", () => {
  test("constructor", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    const android = new Android();
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, "platform-tools/adb"),
      "avdmanager",
      "sdkmanager",
      path.resolve(androidHome, "emulator/emulator"),
    ]);
  });

  test("constructor with adb error path", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    const android = new Android({ adb: "platform-tools/adb111", emulator: "emulator/emulator111" });
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      "adb",
      "avdmanager",
      "sdkmanager",
      "emulator",
    ]);
  });

  test("constructor with custom path", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    const android = new Android({
      avdmanager: "cmdline-tools/latest/bin/avdmanager",
      sdkmanager: "cmdline-tools/latest/bin/sdkmanager",
      adb: "platform-tools/adb",
      emulator: "emulator/emulator",
    });
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, "platform-tools/adb"),
      path.resolve(androidHome, "cmdline-tools/latest/bin/avdmanager"),
      path.resolve(androidHome, "cmdline-tools/latest/bin/sdkmanager"),
      path.resolve(androidHome, "emulator/emulator"),
    ]);
  });

  test("constructor with custom executable file environment variable", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    process.env.avdmanagerBin = path.resolve(androidHome, "cmdline-tools/latest/bin/avdmanager");
    process.env.sdkmanagerBin = path.resolve(androidHome, "cmdline-tools/latest/bin/sdkmanager");
    const android = new Android();
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, "platform-tools/adb"),
      path.resolve(androidHome, "cmdline-tools/latest/bin/avdmanager"),
      path.resolve(androidHome, "cmdline-tools/latest/bin/sdkmanager"),
      path.resolve(androidHome, "emulator/emulator"),
    ]);
  });
});
