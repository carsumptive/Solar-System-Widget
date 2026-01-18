#!/bin/bash

# Calculate planetary positions using skyfield
# Saves to ~/Library/Application Support/Übersicht/planet_positions.json

# CONFIGURATION: Set date for testing (leave empty for current date)
# Format: YYYY-MM-DD (e.g., "2026-06-15")
TEST_DATE="2027-01-23"  # New Year 2027

echo "Calculating planetary positions using skyfield..."

python3 << EOF
import json
import os
from datetime import datetime

try:
    from skyfield.api import load
except ImportError:
    print("ERROR: skyfield not installed")
    print("Install with: pip3 install skyfield")
    exit(1)

# Load ephemeris data
print("Loading ephemeris data...")
ts = load.timescale()
eph = load('de421.bsp')

# Get time - either test date or current
test_date = "$TEST_DATE"
if test_date:
    from datetime import datetime as dt
    date_obj = dt.strptime(test_date, '%Y-%m-%d')
    t = ts.utc(date_obj.year, date_obj.month, date_obj.day)
    print(f"Using test date: {test_date}")
else:
    t = ts.now()
    print(f"Using current date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

# Define planets
planets = {
    'Mercury': 'mercury',
    'Venus': 'venus',
    'Earth': 'earth',
    'Mars': 'mars',
    'Jupiter': 'jupiter barycenter',
    'Saturn': 'saturn barycenter',
    'Uranus': 'uranus barycenter',
    'Neptune': 'neptune barycenter',
    'Pluto': 'pluto barycenter'
}

sun = eph['sun']
positions = {}

for name, body_name in planets.items():
    try:
        planet = eph[body_name]
        
        # Get heliocentric position (relative to Sun)
        astrometric = (planet - sun).at(t)
        x, y, z = astrometric.position.au
        
        # Calculate actual distance from sun
        import math
        distance = math.sqrt(x*x + y*y + z*z)
        
        print(f"{name:10s}: x={x:8.4f} AU, y={y:8.4f} AU, z={z:8.4f} AU, r={distance:8.4f} AU")
        
        positions[name] = {
            'x': float(x), 
            'y': float(y), 
            'z': float(z),
            'distance': float(distance)
        }
    except Exception as e:
        print(f"{name:10s}: ERROR - {e}")

# Add metadata
output = {
    'timestamp': datetime.now().isoformat(),
    'test_date': test_date if test_date else None,
    'positions': positions
}

# Save to file
output_path = os.path.expanduser("~/Library/Application Support/Übersicht/planet_positions.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w') as f:
    json.dump(output, f, indent=2)

print(f"\n✓ Saved to {output_path}")
print(f"Total planets: {len(positions)}/9")
EOF