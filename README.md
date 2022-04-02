<div align="center">
<img src="https://violetics.pw/assets/images/logo.png" width="150" height="150" border="0" alt="Vio-MD">

# Vio Multi Device WhatsApp

### Use at your own risk!

## [![Javascript](https://img.shields.io/badge/JavaScript-d6cc0f?style=for-the-badge&logo=javascript&logoColor=white)](https://javascript.com) [![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

> Build with Baileys and JavaScript's native Map class ( as a command handler ), using https://violetics.pw/ for API <br />

</div><br />
<br />

## Highlights

-   [√] Easy to maintenance
-   [√] Support Multi-Device Connection
-   [√] Simple & Lightweight

### Installation

Rename config.json.example to config.json or create new file called config.json.
Fill in everything needed in the config.json file (follow config.json.example).

### Requirements

1. [NodeJS](https://nodejs.org/en/download) 16x/17x
2. [FFMPEG](https://ffmpeg.org)
3. [libWebP](https://developers.google.com/speed/webp/download)

### Clone Repository

```bash
# clone begin
git clone https://github.com/violetics/vio-md.git --branch "master"

# change dir
cd vio-md

# install npm dependencies
npm install

# in case @adiwajshing/baileys not compiled automatic
cd ./node_modules/@adiwajshing/baileys
npm install --global typescript # run as root/administrator
npm run build:tsc
```

### Start Bot

Start and Scan QR<br />

```bash
npm start
```

# Thanks To

-   [`Violetics`](https://violetics.pw/)
-   [`Faiz Bastomi`](https://github.com/FaizBastomi)
-   [`RzkyFdlh`](https://github.com/Rizky878/rzky-multidevice)
-   [`rzky-multidevice`](https://github.com/Rizky878/rzky-multidevice)
