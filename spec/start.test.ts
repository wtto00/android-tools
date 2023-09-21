import Android from '../src/index.js';

describe('start', () => {
  const android = new Android();

  test('start a non-existent AVD.', async () => {
    await expect(async () => {
      await android.start({
        verbose: true,
        avd: `${Math.random()}`,
        noaudio: true,
        noBootAnim: true,
        noSnapshot: true,
        noWindow: true
      });
    }).rejects.toThrow(/Android emulator version/);
  });
});
