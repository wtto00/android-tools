import path from 'path';
import Android from '../src/index.js';

describe('constructor', () => {
  test('constructor', () => {
    const androidHome = process.env.ANDROID_HOME ?? '';
    const android = new Android();
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, 'platform-tools/adb'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/avdmanager'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/sdkmanager'),
      path.resolve(androidHome, 'emulator/emulator')
    ]);
  });

  test('constructor with error path', () => {
    const androidHome = process.env.ANDROID_HOME ?? '';
    const android = new Android({
      adb: 'platform-tools/adb111',
      avdmanager: 'cmdline-tools/latest/bin/avdmanager11',
      emulator: 'emulator/emulator111'
    });
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      'adb',
      'avdmanager',
      path.resolve(androidHome, 'cmdline-tools/latest/bin/sdkmanager'),
      process.env.GITHUB_CI ? path.resolve(androidHome, 'emulator/emulator111') : 'emulator'
    ]);
  });

  test('constructor with custom path', () => {
    const androidHome = process.env.ANDROID_HOME ?? '';
    const android = new Android({
      adb: 'platform-tools/adb',
      avdmanager: 'cmdline-tools/latest/bin/avdmanager',
      sdkmanager: 'cmdline-tools/latest/bin/sdkmanager',
      emulator: 'emulator/emulator'
    });
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, 'platform-tools/adb'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/avdmanager'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/sdkmanager'),
      path.resolve(androidHome, 'emulator/emulator')
    ]);
  });

  test('constructor with custom executable file environment variable', () => {
    const androidHome = process.env.ANDROID_HOME ?? '';
    process.env.adbBin = path.resolve(androidHome, 'platform-tools/adb');
    const android = new Android();
    expect([android.adbBin, android.avdmanagerBin, android.sdkmanagerBin, android.emulatorBin]).toEqual([
      path.resolve(androidHome, 'platform-tools/adb'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/avdmanager'),
      path.resolve(androidHome, 'cmdline-tools/latest/bin/sdkmanager'),
      path.resolve(androidHome, 'emulator/emulator')
    ]);
  });
});
