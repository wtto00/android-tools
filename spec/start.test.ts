import Android from '../src/index.js';

describe('start', () => {
  const android = new Android();

  test('start a non-existent AVD.', async () => {
    await expect(async () => {
      await android.start(`${Math.random()}`);
    }).rejects.toThrow(/Android emulator version/);
  });
});
