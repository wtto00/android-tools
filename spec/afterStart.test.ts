import path from "path";
import Android from "../src/index.js";

const android = new Android();

let emulatorId = "";
beforeAll(async () => {
  const avds = await android.listAVDs();
  let avdName = "";
  if (avds.length === 0) {
    avdName = `TestCreate_${Math.random().toString().substring(2)}`;
    const images = (await android.listImages()).filter((item) => item.vendor === "default" && item.arch === "x86_64");
    if (images.length === 0) return;
    const image = images[images.length - 1].name;
    await android.createAVD({ name: avdName, package: image, force: false });
  } else {
    avdName = avds[0].Name;
  }
  const res = await android.start(avdName);
  emulatorId = res.id;
  if (emulatorId) {
    await android.ensureReady(emulatorId);
  }
}, 1200000);

afterAll(async () => {
  await android.waitForStop(emulatorId);
}, 60000);

describe("after start a emulator", () => {
  test("list packages", async () => {
    console.log("emulatorId", emulatorId);
    if (emulatorId) {
      const list = await android.listPackages(emulatorId);
      expect(list.length).toBeGreaterThan(0);
    }
  });

  test("isInstalled package", async () => {
    if (emulatorId) {
      const res = await android.isInstalled(emulatorId, "com.android.webview");
      expect(res).toBe(true);
    }
  });

  test("install package", async () => {
    if (emulatorId) {
      const apk = path.resolve(__dirname, "pwa2apk.apk");
      const res = await android.install(emulatorId, apk);
      expect(res).toBeUndefined();
      await android.adb(emulatorId, `uninstall com.appmaker.pwa2apk.pwa.androidapp`);
    }
  });

  test("install a none-exist package", async () => {
    if (emulatorId) {
      await expect(async () => {
        await android.install(emulatorId, "123123.apk");
      }).rejects.toThrow();
    }
  });

  test("list devices", async () => {
    const devices = await android.devices();
    expect(devices.findIndex((item) => item.name === emulatorId)).toBeGreaterThan(-1);
  });

  test("adb with no emulatorId", async () => {
    const res = await android.adb("shell pm list packages");
    expect(res.output.length).toBeGreaterThan(0);
  });

  test("input key event", async () => {
    const res = await android.inputKeyEvent(emulatorId, 82);
    expect(res.output.length).toBe(0);
  });
});
