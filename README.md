## Foxhole - Warden News Network Discord Bot

Reads War Correspondancy from the official Discord Channel and 
* analyzes it, tracking relevant statistics.
* reports Warden Propaganda to other Discord Servers/Channels based on it.

### Installation

Requires NPM and NodeJS:

```bash
npm install
```

The Bot will need it's own Discord Account (not an official Bot Account). Make sure to enter the Auth Token of that account here:
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