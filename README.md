## Foxhole - Warden News Network Discord Bot

Reads war correspondence from the [official Foxhole Discord](https://discord.gg/S8mb6DS) and 
* analyzes it, tracking relevant statistics.
* reports Warden propaganda to other Discord servers/channels based on it.
  * Currently active at [Syther's/Foxtrot's Discord](https://discord.gg/5SujEGJ), filtered for general EU servers only

### Installation

Requires NPM and NodeJS:

```bash
npm install
```

### Configuration

The Bot will need it's own Discord account (not an official bot account). Make sure to enter the auth token of that account here:
```bash
cp auth.json.example auth.json
vi auth.json
```

Channels to listen to as well as output to are defined here:
```bash
vi config.json
```

### Running it
```bash
node index.js
```
It's recommended to run it inside a `screen` session.