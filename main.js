const { app, BrowserWindow, dialog, Menu, ipcMain, globalShortcut } = require('electron/main');
const path = require('node:path');
const Tail = require("tail").Tail;
const Buttplug = require('buttplug');
const WebSocket = require('ws');
Object.assign(global, { WebSocket: require('ws') });

function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true
        }
    })

    win.loadFile('index.html')
}

let connector
let client
let devices
let currVibes = 0;
let active = false;
let vibeFactor = 1;

setInterval(async () => {
    if (active)
        vibe();
    else
        stopVibing();
}, 10);

app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Alt+B', async () => {
        active = !active;
        if (active)
            vibe();
        else
            stopVibing();
    });

    ipcMain.handle('connect', async (event, address) => {
        try {
            return await setupBP(address);
        } catch (error) {
            console.log(error)
            return -1;
        }
    });

    ipcMain.handle('select-directory', async (event) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });
        if(!canceled) {
            try {
                tail = new Tail(filePaths[0]+'/Hearts of Iron IV/logs/game.log', { fsWatchOptions: { interval: 100 }, useWatchFile: true, flushAtEOF: true});
                tail.on("line", (data) => {
                    try {
                        if(data.includes("HapticTension: ")) {
                            currVibes = parseFloat(data.split(" ").at(-1))
                            if(active) {
                                vibe();
                            }
                        }
                    } catch (error) {
                        console.log(error)
                    }
                })
                tail.on("error", (error) => {
                    console.log(error);
                })
            } catch (error) {
                console.log(error);
            }
            return filePaths[0]
        }
    });

    ipcMain.handle('update-factor', async (event, factor) => {
        vibeFactor = factor;
    });

    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

async function setupBP(address = "ws://127.0.0.1:12345") {
    if(client && client.connected) {
        try {
            await client.disconnect();
            client = undefined
        } catch (error) { console.log(error); return -1; }
    }
    if(connector && connector.connected) {
        try {
            await connector.disconnect();
            connector = undefined
        } catch (error) { console.log(error); return -1; }
    }
    try {
        address = address.trim();
        connector = new Buttplug.ButtplugBrowserWebsocketClientConnector(address);
        client = new Buttplug.ButtplugClient("Device Control Example");
        client.addListener("deviceadded", async (device) => {
            try {
                devices = client.devices;
            } catch (error) {}
        });
        client.addListener("deviceremoved", async (device) => {
            try {
                devices = client.devices;
            } catch (error) {}
        });

        await client.connect(connector);

        await client.startScanning();
    } catch (error) { console.log(error); return -1;}
    return;
}

async function vibe(amount = currVibes) {
    if(!devices) return;
    
    devices.forEach(async device => {
        try {
            await device.vibrate(Math.min(1, amount*vibeFactor));
        } catch (e) {
            console.log(e);
        }
    });
}

async function stopVibing() {
    if(!devices) return;

    devices.forEach(async device => {
        try {
            await device.stop();
        } catch (e) {
            console.log(e);
        }
    });
}