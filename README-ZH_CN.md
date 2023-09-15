# android-tools

使用 Nodejs 控制管理 Andorid 设备。

## 安装

```shell
npm i @wtto00/android-tools
```

## 用法

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
|adb|string|false|`${process.env.ANDROID_HOME}/platform-tools/adb`或者系统环境已配置的`adb`路径|`adb` 可执行文件与 `ANDROID_HOME` 的相对路径|
|avdmanager|string|false|`${process.env.ANDROID_HOME}/cmdline-tools/bin/avdmanager`或者系统环境已配置的`avdmanager`路径|`avdmanager` 可执行文件与 `ANDROID_HOME` 的相对路径|
|sdkmanager|string|false|`${process.env.ANDROID_HOME}/cmdline-tools/bin/sdkmanager`或者系统环境已配置的`sdkmanager`路径|`sdkmanager` 可执行文件与 `ANDROID_HOME` 的相对路径|
|emulator|string|false|`${process.env.ANDROID_HOME}/emulator/emulator`或者系统环境已配置的`emulator`路径|`emulator` 可执行文件与 `ANDROID_HOME` 的相对路径|

### start

打开一个已存在的模拟器设备。

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

| field   | type   | required | default | note       |
| ------- | ------ | -------- | ------- | ---------- |
| avdName | string | true     | -       | 模拟器名称 |

### waitForDevice

等待给定的设备打开，可使用状态。

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

| field      | type   | required | default | note          |
| ---------- | ------ | -------- | ------- | ------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID |

### ensureReady

确保给定的设备已准备就绪。可以 adb 执行一系列命令。

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

| field      | type   | required | default | note          |
| ---------- | ------ | -------- | ------- | ------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID |

### createAVD

创建一个模拟器。

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

| field   | type    | required | default | note                                                                                    |
| ------- | ------- | -------- | ------- | --------------------------------------------------------------------------------------- |
| sdcard  | string  | false    | -       | 共享 SD 卡镜像的路径，或者为新模拟器选择一个新的 SD 卡大小。                            |
| tag     | string  | false    | -       | 用于模拟器的 sys-img 标签。默认情况下，如果平台只有一个标签用于其系统镜像，则自动选择。 |
| path    | string  | false    | -       | 新的模拟器将创建在哪个目录位置。                                                        |
| package | string  | true     | -       | 此模拟器的系统镜像的路径（例如 'system-images;android-19;google_apis;x86'）。           |
| name    | string  | false    | -       | 新模拟器的名称。                                                                        |
| skin    | string  | false    | -       | 此设备可选择使用的皮肤名称。                                                            |
| force   | boolean | false    | -       | 创建虚拟设备（覆盖现有的模拟器）。                                                      |
| abi     | string  | false    | -       | 如果平台的系统镜像只有一个 ABI，则默认为自动选择 ABI 来使用模拟器。                     |
| device  | string  | false    | -       | 可选的要使用的设备定义。可以是设备索引或 id。                                           |

### hasAVD

当前系统是否已存在给定的模拟器。

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

| field      | type   | required | default | note       |
| ---------- | ------ | -------- | ------- | ---------- |
| emulatorId | string | true     | -       | 模拟器名称 |

### stop

停止给定的模拟器。

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

| field      | type   | required | default | note          |
| ---------- | ------ | -------- | ------- | ------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID |

### waitForStop

等待给定的模拟器停止完毕。

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

| field      | type   | required | default | note          |
| ---------- | ------ | -------- | ------- | ------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID |

### isInstalled

在给定的模拟器设备和，是否已安装给定的软件包。

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

| field       | type   | required | default | note          |
| ----------- | ------ | -------- | ------- | ------------- |
| emulatorId  | string | true     | -       | 模拟器设备 ID |
| packageName | string | true     | -       | 软件包 id     |

### install

为给定的模拟器设备安装给定的软件包。

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

| field      | type   | required | default | note                   |
| ---------- | ------ | -------- | ------- | ---------------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID          |
| apkPath    | string | true     | -       | apk 安装包所在路径位置 |

### inputKeyEvent

发送按键指令给给定的模拟器设备。

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

| field      | type   | required | default | note                                                                                               |
| ---------- | ------ | -------- | ------- | -------------------------------------------------------------------------------------------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID                                                                                      |
| key        | number | true     | -       | 所要发送的按键 key 值，见[安卓文档](https://developer.android.com/reference/android/view/KeyEvent) |

### devices

列出当前已连接的设备。相当于`adb devices`。

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

列出给定设备上，已安装的软件包

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

| field      | type   | required | default | note          |
| ---------- | ------ | -------- | ------- | ------------- |
| emulatorId | string | true     | -       | 模拟器设备 ID |

### listDevices

列出当前系统可用的用于创建模拟器的设备列表。

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

详细列出当前已创建的模拟器列表。

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

列出可用的安卓镜像设备。

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

列出所有的安卓镜像。

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

使用`adb`执行自定义命令。

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

| field | type   | required | default | note         |
| ----- | ------ | -------- | ------- | ------------ |
| cmd   | string | true     | -       | 要执行的命令 |

### avdmanager

使用`avdmanager`执行自定义命令。

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

| field | type   | required | default | note         |
| ----- | ------ | -------- | ------- | ------------ |
| cmd   | string | true     | -       | 要执行的命令 |

### sdkmanager

使用`sdkmanager`执行自定义命令。

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

| field | type   | required | default | note         |
| ----- | ------ | -------- | ------- | ------------ |
| cmd   | string | true     | -       | 要执行的命令 |

### emulator

使用`emulator`执行自定义命令。

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

| field | type   | required | default | note         |
| ----- | ------ | -------- | ------- | ------------ |
| cmd   | string | true     | -       | 要执行的命令 |
