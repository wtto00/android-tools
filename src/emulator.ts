export interface EmulatorOptions {
  /** use a specific android virtual device */
  avd?: string;
  /** enable specific debug messages */
  verbose?: boolean;
  /** disable graphical window display */
  noWindow?: boolean;
  /** perform a full boot and do not auto-save, but qemu vmload and vmsave operate on snapstorage */
  noSnapshot?: boolean;
  /** do not mount a snapshot storage file (this disables all snapshot functionality) */
  noSnapstorage?: boolean;
  /** do not try to correct snapshot time on restore */
  noSnapshotUpdateTime?: boolean;
  /** do not auto-save to snapshot on exit: abandon changed state */
  noSnapshotSave?: boolean;
  /** do not auto-start from snapshot: perform a full boot */
  noSnapshotLoad?: boolean;
  /** set emulation mode for a camera facing back */
  cameraBack?: CameraBack;
  /** set emulation mode for a camera facing front */
  cameraFront?: CameraFront;
  /** set hardware OpenGLES emulation mode */
  gpu?: EmulatorGpu;
  /** disable the cache partition */
  nocache?: boolean;
  /** disable audio support */
  noaudio?: boolean;
  /** disable animation for faster boot */
  noBootAnim?: boolean;
  /** device is a low ram device */
  lowram?: boolean;
  /** Allows restarting guest when it is stalled. */
  restartWhenStalled?: boolean;
  /** Pause on launch and wait for a debugger process to attach before resuming */
  waitForDebugger?: boolean;
  /** make TCP connections through a HTTP/HTTPS proxy */
  httpProxy?: string;
  /** Set number of CPU cores to emulator */
  cores?: number;
  /** reset the user data image (copy it from initdata) */
  wipeData?: boolean;
  /** disable passive gps updates */
  noPassiveGps?: boolean;
  /** Disables acceleration entirely. Mostly useful for debugging. */
  noAccel?: boolean;
}

export type SystemImageTarget =
  | 'default'
  | 'google_apis'
  | 'playstore'
  | 'android-wear'
  | 'android-wear-cn'
  | 'android-tv'
  | 'google-tv'
  | 'aosp_atd'
  | 'google_atd';

export type Arch = 'x86' | 'x86_64' | 'arm64-v8a' | 'armeabi-v7a';

/**
 * Use -camera-back <mode> to control emulation of a camera facing back.
 * @value __emulated__ camera will be emulated using software ('fake') camera emulation
 * @value __virtualscene__ If the feature is enabled, camera will render a virtual scene
 * @value __videoplayback__ If the feature is enabled, camera will support playing back a video
 * @value __none__ camera emulation will be disabled
 * @value __webcam\<N>__ camera will be emulated using a webcamera connected to the host
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type CameraBack = 'emulated' | 'virtualscene' | 'videoplayback' | 'none' | (string & object);

/**
 * Use -camera-front <mode> to control emulation of a camera facing front.
 * @value __emulated__ camera will be emulated using software ('fake') camera emulation
 * @value __webcam\<N>__ camera will be emulated using a webcamera connected to the host
 * @value __none__ camera emulation will be disabled
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type CameraFront = 'emulated' | 'none' | (string & object);

/**
 * Use -gpu <mode> to override the mode of hardware OpenGL ES emulation
 * indicated by the AVD.
 *
 * Note that enabling GPU emulation if the system image does not support it
 * will prevent the proper display of the emulated framebuffer.
 *
 * The 'auto' mode is the default. In this mode, the hw.gpu.enabled setting
 * in the AVD's hardware-qemu.ini file will determine whether GPU emulation
 * is enabled.
 * @value **auto** Auto-select the renderer.
 * @value **auto-no-window** Auto-select the renderer when running headless. This will use the same gpu selection mechanism as running without the "-no-window" flag and the "-gpu auto" option. See auto for details on the behavior.
 * @value **host** Use the host system's OpenGL driver.
 * @value **swiftshader_indirect** Use SwiftShader software renderer on the host, which can be beneficial if you are experiencing issues with your GPU drivers or need to run on systems without GPUs.
 * @value **angle_indirect** Use ANGLE, an OpenGL ES to D3D11 renderer (Windows 7 SP1 + Platform update, Windows 8.1+, or Windows 10 only).
 * @value **guest** Use guest-side software rendering. For advanced users only. Warning: slow! In API 28 and later, guest rendering is not supported, and will fall back automatically to swiftshader_indirect.
 */
export type EmulatorGpu = 'auto' | 'auto-no-window' | 'host' | 'swiftshader_indirect' | 'angle_indirect' | 'guest';

/**
 * Android Emulator usage: emulator [options] [-qemu args]
  options:
    -list-avds                                                          list available AVDs
    -sysdir <dir>                                                       search for system disk images in <dir>
    -system <file>                                                      read initial system image from <file>
    -vendor <file>                                                      read initial vendor image from <file>
    -writable-system                                                    make system & vendor image writable after 'adb remount'
    -delay-adb                                                          delay adb communication till boot completes
    -datadir <dir>                                                      write user data into <dir>
    -kernel <file>                                                      use specific emulated kernel
    -ramdisk <file>                                                     ramdisk image (default <system>/ramdisk.img
    -image <file>                                                       obsolete, use -system <file> instead
    -initdata <file>                                                    same as '-init-data <file>'
    -data <file>                                                        data image (default <datadir>/userdata-qemu.img
    -encryption-key <file>                                              read initial encryption key image from <file>
    -logcat-output <file>                                               output file of logcat(default none)
    -partition-size <size>                                              system/data partition size in MBs
    -cache <file>                                                       cache partition image (default is temporary file)
    -cache-size <size>                                                  cache partition size in MBs
    -no-cache                                                           disable the cache partition
    -nocache                                                            same as -no-cache
    -sdcard <file>                                                      SD card image (default <datadir>/sdcard.img
    -quit-after-boot <timeout>                                          qeuit emulator after guest boots completely, or after timeout in seconds
    -qemu-top-dir <dir>                                                 Use the emulator in the specified dir (relative or absolute path)
    -monitor-adb <verbose_level>                                        monitor the adb messages between guest and host, default not
    -snapstorage <file>                                                 file that contains all state snapshots (default <datadir>/snapshots.img)
    -no-snapstorage                                                     do not mount a snapshot storage file (this disables all snapshot functionality)
    -snapshot <name>                                                    name of snapshot within storage file for auto-start and auto-save (default 'default-boot')
    -no-snapshot                                                        perform a full boot and do not auto-save, but qemu vmload and vmsave operate on snapstorage
    -no-snapshot-save                                                   do not auto-save to snapshot on exit: abandon changed state
    -no-snapshot-load                                                   do not auto-start from snapshot: perform a full boot
    -snapshot-list                                                      show a list of available snapshots
    -no-snapshot-update-time                                            do not try to correct snapshot time on restore
    -wipe-data                                                          reset the user data image (copy it from initdata)
    -avd <name>                                                         use a specific android virtual device
    -avd-arch <target>                                                  use a specific target architecture
    -skindir <dir>                                                      search skins in <dir> (default <system>/skins)
    -skin <name>                                                        select a given skin
    -no-skin                                                            deprecated: create an AVD with no skin instead
    -noskin                                                             same as -no-skin
    -memory <size>                                                      physical RAM size in MBs
    -ui-only <UI feature>                                               run only the UI feature requested
    -id <name>                                                          assign an id to this virtual device (separate from the avd name)
    -cores <number>                                                     Set number of CPU cores to emulator
    -accel <mode>                                                       Configure emulation acceleration
    -no-accel                                                           Same as '-accel off'
    -ranchu                                                             Use new emulator backend instead of the classic one
    -engine <engine>                                                    Select engine. auto|classic|qemu2
    -netspeed <speed>                                                   maximum network download/upload speeds
    -netdelay <delay>                                                   network latency emulation
    -netfast                                                            disable network shaping
    -code-profile <name>                                                enable code profiling
    -show-kernel                                                        display kernel messages
    -shell                                                              enable root shell on current terminal
    -no-jni                                                             deprecated, see dalvik_vm_checkjni
    -nojni                                                              deprecated, see dalvik_vm_checkjni
    -dalvik-vm-checkjni                                                 Enable dalvik.vm.checkjni
    -logcat <tags>                                                      enable logcat output with given tags
    -log-nofilter                                                       Disable the duplicate log filter
    -no-audio                                                           disable audio support
    -noaudio                                                            same as -no-audio
    -audio <backend>                                                    use specific audio backend
    -radio <device>                                                     redirect radio modem interface to character device
    -port <port>                                                        TCP port that will be used for the console
    -ports <consoleport>,<adbport>                                      TCP ports used for the console and adb bridge
    -modem-simulator-port <port>                                        TCP port that will be used for android modem simulator
    -onion <image>                                                      use overlay PNG image over screen
    -onion-alpha <%age>                                                 specify onion-skin translucency
    -onion-rotation 0|1|2|3                                             specify onion-skin rotation
    -dpi-device <dpi>                                                   specify device's resolution in dpi (default DEFAULT_DEVICE_DPI)
    -scale <scale>                                                      scale emulator window (deprecated)
    -wifi-client-port <port>                                            connect to other emulator for WiFi forwarding
    -wifi-server-port <port>                                            listen to other emulator for WiFi forwarding
    -http-proxy <proxy>                                                 make TCP connections through a HTTP/HTTPS proxy
    -timezone <timezone>                                                use this timezone instead of the host's default
    -change-language <language>                                         use this language instead of the current one. Restarts the framework.
    -change-country <country>                                           use this country instead of the current one. Restarts the framework.
    -change-locale <locale>                                             use this locale instead of the current one. Restarts the framework.
    -dns-server <servers>                                               use this DNS server(s) in the emulated system
    -net-tap <interface>                                                use this TAP interface for networking
    -net-tap-script-up <script>                                         script to run when the TAP interface goes up
    -net-tap-script-down <script>                                       script to run when the TAP interface goes down
    -cpu-delay <cpudelay>                                               throttle CPU emulation
    -no-boot-anim                                                       disable animation for faster boot
    -no-window                                                          disable graphical window display
    -qt-hide-window                                                     Start QT window but hide window display
    -no-sim                                                             device has no SIM card
    -lowram                                                             device is a low ram device
    -version                                                            display emulator version number
    -no-passive-gps                                                     disable passive gps updates
    -gnss-file-path <path>                                              Use the specified filepath to read gnss data
    -gnss-grpc-port <port number>                                       Use the specified port number to start grpc service to receive gnss data
    -virtio-console                                                     using virtio console as console
    -read-only                                                          allow running multiple instances of emulators on the same AVD, but cannot save snapshot.
    -is-restart <restart-pid>                                           specifies that this emulator was a restart, and to wait out <restart-pid> before proceeding
    -report-console <socket>                                            report console port to remote socket
    -gps <device>                                                       redirect NMEA GPS to character device
    -shell-serial <device>                                              specific character device for root shell
    -tcpdump <file>                                                     capture network packets to file
    -bootchart <timeout>                                                enable bootcharting
    -charmap <file>                                                     use specific key character map
    -studio-params <file>                                               used by Android Studio to provide parameters
    -prop <name>=<value>                                                set system property on boot
    -shared-net-id <number>                                             join the shared network, using IP address 10.1.2.<number>
    -gpu <mode>                                                         set hardware OpenGLES emulation mode
    -use-host-vulkan                                                    use host for vulkan emulation regardless of 'gpu' mode
    -camera-back <mode>                                                 set emulation mode for a camera facing back
    -camera-front <mode>                                                set emulation mode for a camera facing front
    -webcam-list                                                        lists web cameras available for emulation
    -virtualscene-poster <name>=<filename>                              Load a png or jpeg image as a poster in the virtual scene
    -screen <mode>                                                      set emulated screen mode
    -selinux <disabled|permissive>                                      Set SELinux to either disabled or permissive mode
    -unix-pipe <path>                                                   Add <path> to the list of allowed Unix pipes
    -fixed-scale                                                        Use fixed 1:1 scale for the initial emulator window.
    -wait-for-debugger                                                  Pause on launch and wait for a debugger process to attach before resuming
    -skip-adb-auth                                                      Skip adb authentication dialogue
    -metrics-to-console                                                 Enable usage metrics and print the messages to stdout
    -metrics-collection                                                 Enable usage metrics and send them to google play
    -metrics-to-file <file>                                             Enable usage metrics and write the messages into specified file
    -detect-image-hang                                                  Enable the detection of system image hangs.
    -feature <name|-name>                                               Force-enable or disable (-name) the features
    -icc-profile <file>                                                 Use icc profile from specified file
    -sim-access-rules-file <file>                                       Use SIM access rules from specified file
    -phone-number <phone_number>                                        Sets the phone number of the emulated device
    -acpi-config <file>                                                 specify acpi device proprerties (hierarchical key=value pair)
    -fuchsia                                                            Run Fuchsia image. Bypasses android-specific setup; args after are treated as standard QEMU args
    -window-size <size>                                                 Set window size for when bypassing android-specific setup.
    -allow-host-audio                                                   Allows sending of audio from audio input devices. Otherwise, zeroes out audio.
    -restart-when-stalled                                               Allows restarting guest when it is stalled.
    -perf-stat <file>                                                   Run periodic perf stat reporter in the background and write output to specified file.
    -share-vid                                                          Share current video state in shared memory region.
    -grpc <port>                                                        TCP ports used for the gRPC bridge.
    -grpc-tls-key <pem>                                                 File with the private key used to enable gRPC TLS.
    -grpc-tls-cer <pem>                                                 File with the public X509 certificate used to enable gRPC TLS.
    -grpc-tls-ca <pem>                                                  File with the Certificate Authorities used to validate client certificates.
    -grpc-use-token                                                     Use the emulator console token for gRPC authentication.
    -grpc-use-jwt                                                       Use a signed JWT token for gRPC authentication.
    -idle-grpc-timeout <timeout>                                        Terminate the emulator if there is no gRPC activity within <timeout> seconds.
    -waterfall <mode>                                                   Mode in which to run waterfall.
    -rootcanal-controller-properties <file>                        Rootcanal controller_properties.json file.
    -rootcanal-default-commands-file <file>                             Rootcanal commands file to run on launch.
    -rootcanal-no-mesh                                                  Disable auto discovery and connection bluetooth enabled emulators
    -forward-vhci                                                       Enable the VHCI grpc forwarding service.
    -multidisplay index width height dpi flag                           config multiple displays.
    -google-maps-key <API key>                                          API key to use with the Google Maps GUI.
    -no-location-ui                                                     Disable the location UI in the extended window.
    -use-keycode-forwarding                                             Use keycode forwarding instead of host charmap translation.
    -record-session <file>,<delay>[,<duration>]                         Screen record the emulator session.
    -legacy-fake-camera                                                 Use legacy camera HAL for the emulated fake camera.
    -camera-hq-edge                                                     Enable high qualify edge processing for emulated camera.
    -no-direct-adb                                                      Use external adb executable for internal communication.
    -check-snapshot-loadable <snapshot name|exported snapshot tar file> Check if a snasphot is loadable.
    -no-hidpi-scaling                                                   Disable HiDPI scaling of guest display on macOS devices.
    -no-mouse-reposition                                                Do not reposition the mouse to emulator window center if mouse pointer gets out of the window.
    -guest-angle                                                        Enable guest ANGLE as system driver.
    -usb-passthrough VID PID BUS PORTS                                  Host USB device Passthrough
    -append-userspace-opt key=value                                     Appends a property which is passed to the userspace.
    -save-path <file path>                                              Override save path for screenshot and bug report. The value will not be persisted on host OS.
    -no-nested-warnings                                                 Disable the warning dialog when emulator is running in nested virtualization.
    -wifi-tap <interface>                                               use this TAP interface for Virtio Wi-Fi
    -wifi-tap-script-up <script>                                        script to run when the TAP interface goes up
    -wifi-tap-script-down <script>                                      script to run when the TAP interface goes down
    -wifi-vmnet <interface>                                              This option is alias to vmnet, it is used for backward compatibility.
    -vmnet <interface>                                                   Use this network <interface> and enable vmnet framework as the backend of tap netdev on MacOS.
    -wifi-user-mode-options <option list>                               Override default user mode networking option for wifi network in Android Emulator for API 31 and above.
    -network-user-mode-options <option list>                            Override default user mode networking option for both radio and wifi network in Android Emulator for API 30 and below. Override default user mode networking optionfor radio network for API 31 and above.
    -adb-path <path>                                                    use adb binary from <path>

     -qemu args...                                                      pass arguments to qemu
     -qemu -h                                                           display qemu help

     -verbose                                                           same as '-debug-init'
     -debug <tags>                                                      enable/disable debug messages
     -debug-<tag>                                                       enable specific debug messages
     -debug-no-<tag>                                                    disable specific debug messages

     -help                                                              print this help
     -help-<option>                                                     print option-specific help

     -help-disk-images                                                  about disk images
     -help-debug-tags                                                   debug tags for -debug <tags>
     -help-char-devices                                                 character <device> specification
     -help-environment                                                  environment variables
     -help-virtual-device                                               virtual device management
     -help-sdk-images                                                   about disk images when using the SDK
     -help-build-images                                                 about disk images when building Android
     -help-all                                                          prints all help content
 */
