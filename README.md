# android-tools

Node module for managing and controlling the Android Devices.

## Install

```shell
npm i @wtto00/android-tools
```

## Usage

```js
import Android from "@wtto00/android-tools";

const options = {
  // adb: "platform-tools/adb",
  // avdmanager: "cmdline-tools/bin/avdmanager",
  // sdkmanager: "cmdline-tools/bin/sdkmanager",
  // emulator: "emulator/emulator",
};
const android = new Android(options);
```

Andorid Options
| field | type | required | default | note |
| ----- | ---- | -------- | ------- | ---- |
|adb|string|false|`${process.env.ANDROID_HOME}/platform-tools/adb` or `adb` in `PATH`|The location of the `adb` executable file relative to `ANDROID_HOME`|
|avdmanager|string|false|`${process.env.ANDROID_HOME}/cmdline-tools/bin/avdmanager` or `avdmanager` in `PATH`| The location of the `avdmanager` executable file relative to `ANDROID_HOME`|
|sdkmanager|string|false|`${process.env.ANDROID_HOME}/cmdline-tools/bin/sdkmanager` or `sdkmanager` in `PATH`|The location of the `sdkmanager` executable file relative to `ANDROID_HOME`|
|emulator|string|false|`${process.env.ANDROID_HOME}/emulator/emulator` or `emulator` in `PATH`|The location of the `emulator` executable file relative to `ANDROID_HOME`|

### start

Start the emulator using the AVD supplied through with `avdName`.

```js
android
  .start("android-avd-name")
  .then((res) => {
    console.log(`emulatorId: ${res.id}`);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field   | type   | required | default | note        |
| ------- | ------ | -------- | ------- | ----------- |
| avdName | string | true     | -       | Name of AVD |

### waitForDevice

Waiting for the simulator device to become available.

```js
android
  .waitForDevice("emulator-id")
  .then(() => {
    console.log("available");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                  |
| ---------- | ------ | -------- | ------- | --------------------- |
| emulatorId | string | true     | -       | ID of emulator device |

### ensureReady

Ensure device has been started and ready.

```js
android
  .ensureReady("emulator-id")
  .then(() => {
    console.log("ready");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                  |
| ---------- | ------ | -------- | ------- | --------------------- |
| emulatorId | string | true     | -       | ID of emulator device |

### createAVD

Create a AVD based upon `image`.

```js
android
  .createAVD({
    name: avdName,
    package: "android-image-name",
    force: false,
  })
  .then(() => {
    console.log("has been created");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field   | type    | required | default | note                                                                                                                      |
| ------- | ------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| sdcard  | string  | false    | -       | Path to a shared SD card image, or size of a new sdcard for the new AVD.                                                  |
| tag     | string  | false    | -       | The sys-img tag to use for the AVD. The default is to auto-select if the platform has only one tag for its system images. |
| path    | string  | false    | -       | Directory where the new AVD will be created.                                                                              |
| package | string  | true     | -       | Package path of the system image for this AVD (e.g. 'system-images;android-19;google_apis;x86').                          |
| name    | string  | false    | -       | Name of the new AVD.                                                                                                      |
| skin    | string  | false    | -       | The optional name of a skin to use with this device.                                                                      |
| force   | boolean | false    | -       | Forces creation (overwrites an existing AVD)                                                                              |
| abi     | string  | false    | -       | The ABI to use for the AVD. The default is to auto-select the ABI if the platform has only one ABI for its system images. |
| device  | string  | false    | -       | The optional device definition to use. Can be a device index or id.                                                       |

### hasAVD

Check if a specific AVD has been created on this machine.

```js
android
  .hasAVD("android-avd-name")
  .then((res) => {
    console.log(res ? "has been created" : "not exist");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note        |
| ---------- | ------ | -------- | ------- | ----------- |
| emulatorId | string | true     | -       | Name of AVD |

### stop

Stop a certain emulator.

```js
android
  .stop("emulator-id")
  .then(() => {
    console.log("has sent stop command");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                  |
| ---------- | ------ | -------- | ------- | --------------------- |
| emulatorId | string | true     | -       | ID of emulator device |

### waitForStop

Wait until the device is stopped.

```js
android
  .waitForStop("emulator-id")
  .then(() => {
    console.log("has been stopped");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                  |
| ---------- | ------ | -------- | ------- | --------------------- |
| emulatorId | string | true     | -       | ID of emulator device |

### isInstalled

Check the package specified with `packageName` is installed or not.

```js
android
  .isInstalled("emulator-id", "com.android.webview")
  .then((res) => {
    console.log(res ? "installed" : "not installed");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field       | type   | required | default | note                  |
| ----------- | ------ | -------- | ------- | --------------------- |
| emulatorId  | string | true     | -       | ID of emulator device |
| packageName | string | true     | -       | Package name of App   |

### install

Install an APK located by absolute URI `apkPath` onto device with `emulatorId`.

```js
android
  .isInstalled("emulator-id", "/path/to/apk")
  .then(() => {
    console.log("installed");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                      |
| ---------- | ------ | -------- | ------- | ------------------------- |
| emulatorId | string | true     | -       | ID of emulator device     |
| apkPath    | string | true     | -       | Absolute path of apk file |

### inputKeyEvent

adb shell input keyevent.

```js
android
  .inputKeyEvent("emulator-id", 82)
  .then(() => {
    console.log("has send key");
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                                                                                             |
| ---------- | ------ | -------- | ------- | ------------------------------------------------------------------------------------------------ |
| emulatorId | string | true     | -       | ID of emulator device                                                                            |
| key        | number | true     | -       | key number，see[Android Document](https://developer.android.com/reference/android/view/KeyEvent) |

### devices

List connected devices

```js
android
  .devices()
  .then((res) => {
    res.forEach((item) => {
      console.log(`name: ${item.name}, status: ${item.status}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

### listPackages

List packages installed on the emulator with `emulatorId`.

```js
android
  .listPackages("emulator-id")
  .then((res) => {
    res.forEach((item) => {
      console.log(item);
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

| field      | type   | required | default | note                  |
| ---------- | ------ | -------- | ------- | --------------------- |
| emulatorId | string | true     | -       | ID of emulator device |

### listDevices

List the available device list for creating emulators in the current system.

```js
android
  .listDevices()
  .then((res) => {
    res.forEach((item) => {
      console.log(`id: ${item.id}, Name: ${item.Name}, OEM: ${item.OEM}, Tag: ${item.Tag}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

### listAVDs

List all AVDs created on this machine.

```js
android
  .listAVDs()
  .then((res) => {
    res.forEach((item) => {
      console.log(`Name: ${item.Name}, Path: ${item.Path}, Target: ${item.Target}, Sdcard: ${item.Sdcard}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

### listTargets

List available Android targets.

```js
android
  .listTargets()
  .then((res) => {
    res.forEach((item) => {
      console.log(`id: ${item.id}, Name: ${item.Name}, Type: ${item.Type}, API level: ${item["API level"]}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

### listImages

List available Android images on this machine.

```js
android
  .listImages()
  .then((res) => {
    res.forEach((item) => {
      console.log(
        `name: ${item.name}, type: ${item.type}, sdk: ${item.sdk}, vendor: ${item.vendor}, arch: ${item.arch}`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
```

### adb

Use `adb` to execute commands.

```js
android
  .adb("emulator-id", "shell pm list packages")
  .then((res) => {
    console.log(res.output);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field | type   | required | default | note                        |
| ----- | ------ | -------- | ------- | --------------------------- |
| cmd   | string | true     | -       | The command to be executed. |

### avdmanager

Use `avdmanager` to execute commands.

```js
android
  .avdmanager("list avd")
  .then((res) => {
    console.log(res.output);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field | type   | required | default | note                        |
| ----- | ------ | -------- | ------- | --------------------------- |
| cmd   | string | true     | -       | The command to be executed. |

### sdkmanager

Use `sdkmanager` to execute commands.

```js
android
  .sdkmanager("--list")
  .then((res) => {
    console.log(res.output);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field | type   | required | default | note                        |
| ----- | ------ | -------- | ------- | --------------------------- |
| cmd   | string | true     | -       | The command to be executed. |

### emulator

Use `emulator` to execute commands.

```js
android
  .emulator("--help")
  .then((res) => {
    console.log(res.output);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field | type   | required | default | note                        |
| ----- | ------ | -------- | ------- | --------------------------- |
| cmd   | string | true     | -       | The command to be executed. |
