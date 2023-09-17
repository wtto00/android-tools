import Android from '../src/index.js';

describe('emulator AVD', () => {
  const android = new Android();

  test('create AVD', async () => {
    const avdName = `TestCreate_${Math.random()}`;
    const images = (await android.listInstalledImages()).filter((item) => item.vendor === 'default');
    if (images.length === 0) return;
    await android.createAVD({ name: avdName, package: images[images.length - 1].name, force: false });
    const res = await android.hasAVD(avdName);
    expect(res).toBe(true);
    await android.avdmanager(`delete avd --name ${avdName}`);
  }, 10000);

  test('create an existing AVD', async () => {
    const avds = await android.listAVDs();
    if (avds.length === 0) return;
    const images = (await android.listInstalledImages()).filter((item) => item.vendor === 'default');
    if (images.length === 0) return;
    await expect(async () => {
      await android.createAVD({ name: avds[0].Name, package: images[images.length - 1].name });
    }).rejects.toThrow(/already exists/);
  }, 10000);

  test('force create an existing AVD', async () => {
    const avds = await android.listAVDs();
    if (avds.length === 0) return;
    const images = (await android.listInstalledImages()).filter((item) => item.vendor === 'default');
    if (images.length === 0) return;
    await android.createAVD({ name: avds[0].Name, package: images[images.length - 1].name, force: true });
    const res = await android.hasAVD(avds[0].Name);
    expect(res).toBe(true);
  }, 10000);

  test('list targets', async () => {
    const targets = await android.listTargets();
    expect(Array.isArray(targets)).toBe(true);
  });

  test('list devices', async () => {
    const devices = await android.listDevices();
    expect(devices.length).toBeGreaterThan(0);
  });

  test('emulator command', async () => {
    const res = await android.emulator('-list-avds');
    expect(res.output.length).toBeGreaterThan(0);
  });
});
