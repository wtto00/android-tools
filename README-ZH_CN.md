# android-tools

[![Test](https://github.com/wtto00/android-tools/actions/workflows/test.yml/badge.svg)](https://github.com/wtto00/android-tools/actions/workflows/test.yml)

使用 Nodejs 控制管理 Andorid 设备。

[English](./README.md) | 简体中文

## 安装

```shell
npm i @wtto00/android-tools
```

## 用法

```js
import Android from '@wtto00/android-tools';

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
  .start(
    avd: 'android-avd-name',
    verbose: true
    // ...
  )
  .then((res) => {
    console.log(`emulatorId: ${res.id}`);
  })
  .catch((err) => {
    console.log(err);
  });
```

| field                | type                                                                                          | required | default | note                                                               |
| -------------------- | --------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------------------ |
| avd                  | string                                                                                        | true     | -       | 使用特定的android虚拟设备                                          |
| verbose              | boolean                                                                                       | true     | -       | 启用特定的调试消息                                                 |
| noWindow             | boolean                                                                                       | false    | -       | 禁用图形窗口显示                                                   |
| noSnapshot           | boolean                                                                                       | false    | -       | 执行完全引导，不自动保存，但qemu vmload和vmsave在snapstorage上操作 |
| noSnapstorage        | boolean                                                                                       | false    | -       | 不要装载快照存储文件（这将禁用所有快照功能）                       |
| noSnapshotUpdateTime | boolean                                                                                       | false    | -       | 在还原时不要尝试更正快照时间                                       |
| noSnapshotSave       | boolean                                                                                       | false    | -       | 退出时不自动保存到快照：放弃已更改的状态                           |
| noSnapshotLoad       | boolean                                                                                       | false    | -       | 不要从快照自动启动：执行完全启动                                   |
| cameraBack           | "emulated"<br>"virtualscene"<br>"videoplayback"<br>"none"<br>"webcam<N>"                      | false    | -       | 为背面的相机设置模拟模式                                           |
| cameraFront          | 'emulated'<br>'webcam<N>'<br>'none'                                                           | false    | -       | 为前置摄像头设置模拟模式                                           |
| gpu                  | 'auto'<br>'auto-no-window'<br>'host'<br>'swiftshader_indirect'<br>'angle_indirect'<br>'guest' | false    | 'auto'  | 设置硬件OpenGLES仿真模式                                           |
| nocache              | boolean                                                                                       | false    | -       | 禁用缓存分区                                                       |
| noaudio              | boolean                                                                                       | false    | -       | 禁用音频支持                                                       |
| noBootAnim           | boolean                                                                                       | false    | -       | 禁用动画以加快启动速度                                             |
| lowram               | boolean                                                                                       | false    | -       | 该设备是一种低ram设备                                              |
| restartWhenStalled   | boolean                                                                                       | false    | -       | 允许在来宾停止时重新启动。                                         |
| waitForDebugger      | boolean                                                                                       | false    | -       | 启动时暂停，等待调试器进程附加后再继续                             |
| httpProxy            | string                                                                                        | false    | -       | 通过HTTP/HTTPS代理进行TCP连接                                      |
| cores                | number                                                                                        | false    | -       | 将CPU核心数设置为模拟器                                            |
| wipeData             | boolean                                                                                       | false    | -       | 重置用户数据映像（从initdata复制）                                 |
| noPassiveGps         | boolean                                                                                       | false    | -       | 禁用被动gps更新                                                    |

### waitForDevice

等待给定的设备打开，可使用状态。

```js
android
  .waitForDevice('emulator-id')
  .then(() => {
    console.log('available');
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
  .ensureReady('emulator-id')
  .then(() => {
    console.log('ready');
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
    package: 'android-image-name',
    force: false
  })
  .then(() => {
    console.log('has been created');
  })
  .catch((err) => {
    console.log(err);
  });
```

| field    | type                                                                                                                                           | required | default   | note                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------- | ----------------------------------------------------------------------------------- |
| apiLevel | number                                                                                                                                         | false    | -         | 平台系统镜像的API级别 - 例如，Android Marshmallow的级别为23，Android 10的级别为29。 |
| target   | 'default'<br>'google_apis'<br>'playstore'<br>'android-wear'<br>'android-wear-cn'<br>'android-tv'<br>'google-tv'<br>'aosp_atd '<br>'google_atd' | false    | 'default' | 系统镜像的目标。                                                                    |
| arch     | 'x86_64'<br>'x86'<br>'arm64-v8a'<br>'armeabi-v7a'                                                                                              | false    | 'x86_64'  | 系统镜像的CPU架构                                                                   |
| package  | string                                                                                                                                         | true     | -         | 此模拟器的系统镜像的路径（例如 'system-images;android-19;google_apis;x86'）。       |
| name     | string                                                                                                                                         | false    | -         | 新模拟器的名称。                                                                    |
| force    | boolean                                                                                                                                        | false    | -         | 创建虚拟设备（覆盖现有的模拟器）。                                                  |

- 如果你传了`package`，则参数`apiLevel`，`target`，`arch`将被会略。如果你没有传参`package`，则`apiLevel`参数是必须的。

### hasAVD

当前系统是否已存在给定的模拟器。

```js
android
  .hasAVD('android-avd-name')
  .then((res) => {
    console.log(res ? 'has been created' : 'not exist');
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
  .stop('emulator-id')
  .then(() => {
    console.log('has sent stop command');
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
  .waitForStop('emulator-id')
  .then(() => {
    console.log('has been stopped');
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
  .isInstalled('emulator-id', 'com.android.webview')
  .then((res) => {
    console.log(res ? 'installed' : 'not installed');
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
  .isInstalled('emulator-id', '/path/to/apk')
  .then(() => {
    console.log('installed');
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
  .inputKeyEvent('emulator-id', 82)
  .then(() => {
    console.log('has send key');
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
  .listPackages('emulator-id')
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
      console.log(`id: ${item.id}, Name: ${item.Name}, Type: ${item.Type}, API level: ${item['API level']}`);
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

### listInstalledImages

列出已安装的所有安卓镜像。

```js
android
  .listInstalledImages()
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
  .adb('emulator-id', 'shell pm list packages')
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
  .avdmanager('list avd')
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
  .sdkmanager('--list')
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
  .emulator('--help')
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
