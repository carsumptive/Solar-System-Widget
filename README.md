# Solar System Widget for Übersicht

A real-time solar system visualization widget displaying accurate planetary positions calculated using the Skyfield astronomy library and JPL ephemeris data.

![Solar System Widget Preview](ss.png)

## Features

- **Accurate planetary positions** calculated locally using Skyfield and JPL DE421 ephemeris
- **Real astronomical calculations** - positions computed from orbital mechanics, not approximations
- All 9 planets (including Pluto) with scientifically accurate colors
- Saturn's rings rendered with proper spacing and angle
- Customizable background (tan or black)
- Minimalist design with evenly-spaced orbital paths
- Auto-updates every hour
- Works offline after initial ephemeris download
- Automatic daily position updates via launch agent

## Prerequisites

- macOS
- [Übersicht](https://tracesof.net/uebersicht/) - A desktop widget system for macOS
- Python 3 (comes pre-installed on modern macOS)
- Skyfield astronomy library

## Installation

1. **Install Übersicht** if you haven't already:
   ```bash
   brew install --cask ubersicht
   ```
   Or download from [tracesof.net/uebersicht](https://tracesof.net/uebersicht/)

2. **Install Skyfield astronomy library**:
   ```bash
   pip3 install skyfield
   ```

3. **Clone or download this widget**:
   ```bash
   cd ~/Library/Application\ Support/Übersicht/widgets/
   git clone https://github.com/carsumptive/Solar-System-Widget.git
   ```

4. **Copy the fetch script to LaunchAgents folder** (required for macOS permissions):
   ```bash
   cp ~/Library/Application\ Support/Übersicht/widgets/Solar-System-Widget/fetch_planets.sh ~/Library/LaunchAgents/
   chmod +x ~/Library/LaunchAgents/fetch_planets.sh
   ```
   
   *Note: Due to macOS security restrictions on the Documents folder, the script must run from `~/Library/LaunchAgents/` to have proper file access permissions.*

5. **Pre-download the ephemeris data**:
   ```bash
   # Create cache directory
   mkdir -p ~/Library/Caches/skyfield
   
   # Download ephemeris file
   python3 << 'EOF'
   import os
   from skyfield.api import load
   load.directory = os.path.expanduser("~/Library/Caches/skyfield")
   ts = load.timescale()
   eph = load('de421.bsp')
   print("✓ Ephemeris downloaded successfully")
   EOF
   ```
   
   *This downloads the JPL DE421 ephemeris file (~17MB) to `~/Library/Caches/skyfield/`. This is a one-time download and enables offline operation afterward.*

6. **Run the initial position calculation**:
   ```bash
   ~/Library/LaunchAgents/fetch_planets.sh
   ```
   
   This creates `planet_positions.json` in `~/Library/Application Support/Übersicht/` with current planetary positions.

7. **Set up automatic daily updates** (optional but recommended):
   
   Copy the provided launch agent plist:
   ```bash
   cp ~/Library/Application\ Support/Übersicht/widgets/Solar-System-Widget/com.user.fetchplanets.plist ~/Library/LaunchAgents/
   ```
   
   Edit the plist to use your username:
   ```bash
   # Replace 'carsonlansdowne' with your actual username
   sed -i '' 's/carsonlansdowne/YOUR_USERNAME/g' ~/Library/LaunchAgents/com.user.fetchplanets.plist
   ```
   
   Load the launch agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.user.fetchplanets.plist
   ```
   
   This will:
   - Update planetary positions every time you boot/login (`RunAtLoad`)
   - Run daily at 7:00 AM (if your Mac is awake)
   
   To verify it's running:
   ```bash
   launchctl list | grep fetchplanets
   ```

8. **Refresh Übersicht** - The widget should now appear in the top-right corner of your screen

## Configuration

Open `solarsystem.jsx` and modify these settings:

### Background Color
```javascript
const BACKGROUND_COLOR = 'tan'; // Options: 'tan' or 'black'
```

### Widget Position
```javascript
export const className = `
  top: 20px;    // Distance from top
  right: 20px;  // Distance from right
  ...
```

### Widget Size
```javascript
const WIDGET_SIZE = 300; // Pixels (default is 300x300)
```

### Planet Spacing
The widget uses evenly-spaced orbits with a visible gap between Mars and Jupiter (representing the asteroid belt). Orbits are not to scale - this is intentional for better visibility of inner planets.

## How It Works

The widget uses a two-part system:

1. **fetch_planets.sh** - Shell script that uses Python and Skyfield to calculate current planetary positions from JPL ephemeris data and saves them to a JSON file
2. **solarsystem.jsx** - React component that reads the position data and renders an SVG visualization

The script calculates heliocentric coordinates (positions relative to the Sun) using precise orbital mechanics. Planets are displayed at their actual angular positions along evenly-spaced circular orbits. The widget automatically refreshes every hour to check for updated position data.

### What is Skyfield?

[Skyfield](https://rhodesmill.org/skyfield/) is a Python astronomy library that computes positions for stars, planets, and satellites. It uses JPL's Development Ephemeris (DE421) - the same data NASA uses for mission planning - to calculate planetary positions with high accuracy.

### Why the LaunchAgents Folder?

macOS has security restrictions (TCC - Transparency, Consent, and Control) that prevent launch agents from accessing certain protected folders like `~/Documents`. By placing the script in `~/Library/LaunchAgents/`, it can run with proper permissions without requiring Full Disk Access.

## Troubleshooting

**Widget shows "No data" or "Loading":**
- Run the fetch script manually: `~/Library/LaunchAgents/fetch_planets.sh`
- Check that `planet_positions.json` exists: `ls -la ~/Library/Application\ Support/Übersicht/planet_positions.json`
- Verify Skyfield is installed: `pip3 show skyfield`
- Check the timestamp in the JSON file: `cat ~/Library/Application\ Support/Übersicht/planet_positions.json | grep timestamp`

**"Skyfield not installed" error:**
- Install it: `pip3 install skyfield`
- If using a virtual environment, make sure it's activated

**Planets not moving over time:**
- Planetary motion is slow - positions update daily but changes are subtle over short periods
- Force an update: `launchctl start com.user.fetchplanets`
- Check logs: `cat /tmp/fetchplanets.log`

**Ephemeris download fails:**
- Skyfield needs to download the DE421 ephemeris file (~17MB) on first run
- Requires internet connection for initial download
- After download, everything runs offline
- Files are cached in `~/Library/Caches/skyfield/`
- If `de421.bsp` ends up in your home directory (`~/de421.bsp`), move it: `mv ~/de421.bsp ~/Library/Caches/skyfield/`

**Widget not appearing:**
- Refresh Übersicht: Right-click the Übersicht menu bar icon → Refresh All Widgets
- Check for JavaScript errors in Console.app
- Verify the widget file is in the correct location

**Launch agent not running:**
- Check if it's loaded: `launchctl list | grep fetchplanets`
- Check error logs: `cat /tmp/fetchplanets.error.log`
- Manually trigger it: `launchctl start com.user.fetchplanets`
- Verify script permissions: `ls -la ~/Library/LaunchAgents/fetch_planets.sh`

**"Read-only file system" errors:**
- Ensure the cache directory exists: `mkdir -p ~/Library/Caches/skyfield`
- Pre-download the ephemeris using the command in step 5
- The script sets `SKYFIELD_DATA_DIR` environment variable to `~/Library/Caches/skyfield`

**Manual testing:**
```bash
# Clear logs
rm /tmp/fetchplanets.log /tmp/fetchplanets.error.log

# Run the script manually
~/Library/LaunchAgents/fetch_planets.sh

# Check for errors
cat /tmp/fetchplanets.error.log

# Verify output was created
cat ~/Library/Application\ Support/Übersicht/planet_positions.json
```

## Planet Colors

- Mercury: Brown (#8C7853)
- Venus: Yellow-orange (#FFC649)
- Earth: Blue (#4A90E2)
- Mars: Red-orange (#E27B58)
- Jupiter: Tan (#C88B3A)
- Saturn: Pale gold (#FAD5A5) with angled rings
- Uranus: Cyan (#4FD0E7)
- Neptune: Deep blue (#4166F5)
- Pluto: Gray-brown (#A89078)

## Advanced: Date Testing

You can configure the script to calculate positions for a specific date by editing `TEST_DATE` in `fetch_planets.sh`:

```bash
TEST_DATE="2027-06-15"  # Format: YYYY-MM-DD
```

Leave it empty for current date. This is useful for visualizing planetary alignments or checking positions at specific times.

## File Structure

```
Solar-System-Widget/
├── solarsystem.jsx           # Main widget file
├── fetch_planets.sh          # Position calculation script
├── com.user.fetchplanets.plist # Launch agent configuration
├── README.md                 # This file
└── ss.png                    # Screenshot
```

## Credits

- Planetary calculations using [Skyfield](https://rhodesmill.org/skyfield/) by Brandon Rhodes
- Ephemeris data from [NASA JPL Development Ephemeris DE421](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/)
- Built for [Übersicht](https://tracesof.net/uebersicht/) by Felix Hageloh
- Widget created by Carson Lansdowne

## License

MIT License - Feel free to modify and share!