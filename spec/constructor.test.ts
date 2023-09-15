import path from "path";
import Android from "../src/index.js";

const cmdLinePath = process.env.GITHUB_CI ? "cmdline-tools" : "cmdline-tools/latest";

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
      process.env.GITHUB_CI ? path.resolve(androidHome, "emulator/emulator111") : "emulator",
    ]);
  });

  test("constructor with custom path", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    const android = new Android({
      avdmanager: `${cmdLinePath}/bin/avdmanager`,
      sdkmanager: `${cmdLinePath}/bin/sdkmanager`,
      adb: "platform-tools/adb",
      emulator: "emulator/emulator",
    });
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, "platform-tools/adb"),
      path.resolve(androidHome, `${cmdLinePath}/bin/avdmanager`),
      path.resolve(androidHome, `${cmdLinePath}/bin/sdkmanager`),
      path.resolve(androidHome, "emulator/emulator"),
    ]);
  });

  test("constructor with custom executable file environment variable", () => {
    const androidHome = process.env.ANDROID_HOME || "";
    process.env.avdmanagerBin = path.resolve(androidHome, `${cmdLinePath}/bin/avdmanager`);
    process.env.sdkmanagerBin = path.resolve(androidHome, `${cmdLinePath}/bin/sdkmanager`);
    const android = new Android();
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, "platform-tools/adb"),
      path.resolve(androidHome, `${cmdLinePath}/bin/avdmanager`),
      path.resolve(androidHome, `${cmdLinePath}/bin/sdkmanager`),
      path.resolve(androidHome, "emulator/emulator"),
    ]);
  });
});
