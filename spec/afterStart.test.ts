import path from 'path';
import Android from '../src/index.js';

const android = new Android({ debug: true });

let emulatorId = '';
beforeAll(async () => {
  const avds = await android.listAVDs();
  console.log('avds', avds);
  let avdName = '';
  if (avds.length === 0) {
    avdName = `TestCreate_${Math.random().toString().substring(2)}`;
    const images = (await android.listImages()).filter((item) => item.target === 'default' && item.arch === 'x86_64');
    console.log('images', images);
    if (images.length === 0) return;
    await android.createAVD({ name: avdName, apiLevel: 31, force: false });
    console.log('avds', avds);
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
  }
}, 1200000);

afterAll(async () => {
  await android.waitForStop(emulatorId);
}, 60000);

describe('after start a emulator', () => {
  test('list packages', async () => {
    if (emulatorId) {
      const list = await android.listPackages(emulatorId);
      expect(list.length).toBeGreaterThan(0);
    } else {
      expect(1).toBe(0);
    }
  });

  test('isInstalled package', async () => {
    if (emulatorId) {
      const res = await android.isInstalled(emulatorId, 'com.android.webview');
      expect(res).toBe(true);
    } else {
      expect(1).toBe(0);
    }
  });

  test('install package', async () => {
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
    if (emulatorId) {
      await expect(async () => {
        await android.install(emulatorId, '123123.apk');
      }).rejects.toThrow();
    } else {
      expect(1).toBe(0);
    }
  }, 30000);

  test('list devices', async () => {
    const devices = await android.devices();
    expect(devices.findIndex((item) => item.name === emulatorId)).toBeGreaterThan(-1);
  });

  test('adb with no emulatorId', async () => {
    const res = await android.adb('shell pm list packages');
    expect(res.output.length).toBeGreaterThan(0);
  });

  test('input key event', async () => {
    const res = await android.inputKeyEvent(emulatorId, 82);
    expect(res.output.length).toBe(0);
  });
});
