import path from 'path';
import Android from '../src/index.js';

const android = new Android({ debug: true });

let emulatorId = '';
beforeAll(async () => {
  console.log('start', new Date().toUTCString());
  const avds = await android.listAVDs();
  let avdName = '';
  if (avds.length === 0) {
    avdName = `TestCreate_${Math.random().toString().substring(2)}`;
    await android.createAVD({ name: avdName, apiLevel: 31, force: false });
  } else {
    avdName = avds[0].Name;
  }
  const res = await android.start({
    avd: avdName,
    noaudio: true,
    noBootAnim: true,
    noSnapshot: true,
    noSnapshotSave: true,
    noWindow: true,
    gpu: 'swiftshader_indirect'
  });
  emulatorId = res.id;
  if (emulatorId) {
    await android.ensureReady(emulatorId);
  } else {
    throw Error('no emulator');
  }
  console.log('start-end', new Date().toUTCString());
}, 1200000);

afterAll(async () => {
  console.log('waitForStop', new Date().toUTCString());
  await android.waitForStop(emulatorId);
}, 60000);

describe('after start a emulator', () => {
  test('list packages', async () => {
    console.log('list packages', new Date().toUTCString());
    if (emulatorId) {
      const list = await android.listPackages(emulatorId);
      expect(list.length).toBeGreaterThan(0);
    } else {
      expect(1).toBe(0);
    }
  });

  test('isInstalled package', async () => {
    console.log('isInstalled packages', new Date().toUTCString());
    if (emulatorId) {
      const res = await android.isInstalled(emulatorId, 'com.android.webview');
      expect(res).toBe(true);
    } else {
      expect(1).toBe(0);
    }
  });

  test('install package', async () => {
    console.log('install packages', new Date().toUTCString());
    if (emulatorId) {
      const apk = path.resolve(__dirname, 'pwa2apk.apk');
      const res = await android.install(emulatorId, apk);
      expect(res).toBeUndefined();
      await android.adb(emulatorId, 'uninstall com.appmaker.pwa2apk.pwa.androidapp');
    } else {
      expect(1).toBe(0);
    }
  }, 60000);

  test('install a none-exist package', async () => {
    console.log('install a none-exist packages', new Date().toUTCString());
    if (emulatorId) {
      await expect(async () => {
        await android.install(emulatorId, '123123.apk');
      }).rejects.toThrow();
    } else {
      expect(1).toBe(0);
    }
  }, 30000);

  test('list devices', async () => {
    console.log('list devices', new Date().toUTCString());
    const devices = await android.devices();
    expect(devices.findIndex((item) => item.name === emulatorId)).toBeGreaterThan(-1);
  });

  test('adb with no emulatorId', async () => {
    console.log('adb with no emulatorId', new Date().toUTCString());
    const res = await android.adb('shell pm list packages');
    expect(res.output.length).toBeGreaterThan(0);
  });

  test('input key event', async () => {
    console.log('input key event', new Date().toUTCString());
    const res = await android.inputKeyEvent(emulatorId, 82);
    expect(res.output.length).toBe(0);
  });
});
