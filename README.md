# pz-saver
### Game save util for Project Zomboid

## Known bugs
- Restoring of currently active world can break save
- Save state could be broken with autosave

## Features
- World state backup
- World state restore
- Autosave
- Custom directories
- Backups rotation

## Dependencies
- Tested with node v19.1.0

## How to
```bash
git clone https://github.com/denisgrtv/pz-saver.git

cd pz-saver

# Shows help
./pz-saver --help

# You can see any command options with ./pz-saver [command] --help
./pz-saver save --help

# Making backup with default parameters
./pz-saver save

# Restores backup
./pz-saver restore
```

## Todo
- Add web server
- Add binary
- Test with game server