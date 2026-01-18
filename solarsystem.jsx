// solarsystem.jsx
// Minimalist solar system display with evenly spaced orbits
// Gap between Mars and Jupiter (asteroid belt)

export const command = `cat "$HOME/Library/Application Support/Übersicht/planet_positions.json" 2>/dev/null || echo '{}'`;

export const refreshFrequency = 3600000; // Refresh every hour

// Configuration
const BACKGROUND_COLOR = 'tan'; // Change to 'black' or 'tan'
const WIDGET_SIZE = 300;
const SUN_SIZE = 10;

// Planet colors
const PLANET_COLORS = {
  'Mercury': '#8C7853',
  'Venus': '#FFC649', 
  'Earth': '#4A90E2',
  'Mars': '#E27B58',
  'Jupiter': '#C88B3A',
  'Saturn': '#FAD5A5',
  'Uranus': '#4FD0E7',
  'Neptune': '#4166F5',
  'Pluto': '#A89078'
};

const PLANET_SIZES = {
  'Mercury': 2,
  'Venus': 3.5,
  'Earth': 3.5,
  'Mars': 2.5,
  'Jupiter': 7,
  'Saturn': 6,
  'Uranus': 4.5,
  'Neptune': 4.5,
  'Pluto': 1.5
};

// Evenly spaced orbital radii (in arbitrary units)
// Inner planets: 1-4, then gap, outer planets: 5.5-9.5
const ORBIT_RADII = {
  'Mercury': 1.0,
  'Venus': 1.7,
  'Earth': 2.4,
  'Mars': 3.1,
  // Gap here for asteroid belt
  'Jupiter': 5.0,
  'Saturn': 6.0,
  'Uranus': 7.0,
  'Neptune': 8.0,
  'Pluto': 9.0
};

export const className = `
  top: 20px;
  right: 20px;
  width: ${WIDGET_SIZE}px;
  height: ${WIDGET_SIZE}px;
  background: ${BACKGROUND_COLOR};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

export const render = ({ output, error }) => {
  if (error) {
    return (
      <div style={{ color: 'red', padding: 10, fontSize: 10 }}>
        Error: {error.message}
      </div>
    );
  }
  
  let data = {};
  try {
    data = JSON.parse(output || '{}');
  } catch (e) {
    return (
      <div style={{ color: 'red', padding: 10, fontSize: 10 }}>
        Error parsing data. Run fetch_planets.sh
      </div>
    );
  }
  
  const positions = data.positions || {};
  
  if (Object.keys(positions).length === 0) {
    return (
      <div style={{ color: '#666', padding: 10, fontSize: 10 }}>
        No data. Run: fetch_planets.sh
      </div>
    );
  }
  
  // Scale to fit all orbits with some padding
  const maxOrbitRadius = 9.0; // Pluto's orbit
  const scale = (WIDGET_SIZE / 2 - 15) / maxOrbitRadius;
  const centerX = WIDGET_SIZE / 2;
  const centerY = WIDGET_SIZE / 2;
  
  const orbitColor = BACKGROUND_COLOR === 'black' ? '#555' : '#fff';
  const textColor = BACKGROUND_COLOR === 'black' ? '#666' : '#999';
  
  // Calculate Saturn's position for rings
  let saturnX, saturnY;
  if (positions.Saturn) {
    const angle = Math.atan2(positions.Saturn.y, positions.Saturn.x);
    const orbitalRadius = ORBIT_RADII['Saturn'];
    saturnX = centerX + orbitalRadius * Math.cos(angle) * scale;
    saturnY = centerY - orbitalRadius * Math.sin(angle) * scale;
  }
  
  return (
    <svg width={WIDGET_SIZE} height={WIDGET_SIZE}>
      {/* Draw orbital circles - evenly spaced with gap */}
      {Object.entries(ORBIT_RADII).map(([planet, radius]) => (
        <circle
          key={`orbit-${planet}`}
          cx={centerX}
          cy={centerY}
          r={radius * scale}
          fill="none"
          stroke={orbitColor}
          strokeWidth="0.5"
          opacity="0.5"
        />
      ))}
      
      {/* Draw Sun */}
      <circle
        cx={centerX}
        cy={centerY}
        r={SUN_SIZE}
        fill="#FDB813"
      />
      
      {/* Draw Saturn's rings before Saturn */}
      {saturnX && saturnY && (
        <g>
          {/* Angled rings - filled */}
          <ellipse
            cx={saturnX}
            cy={saturnY}
            rx={10}
            ry={3}
            fill="#857756ff"
            opacity="0.8"
            transform={`rotate(-20 ${saturnX} ${saturnY})`}
          />
          {/* Background-colored circle to separate rings from planet body */}
          <circle
            cx={saturnX}
            cy={saturnY}
            r={PLANET_SIZES['Saturn'] + 1}
            fill={BACKGROUND_COLOR}
          />
        </g>
      )}
      
      {/* Draw planets on their evenly-spaced circles at actual angles */}
      {Object.entries(positions).map(([planet, pos]) => {
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
          return null;
        }
        
        // Calculate the angle from actual x,y coordinates
        const angle = Math.atan2(pos.y, pos.x);
        
        // Use the evenly-spaced orbital radius
        const orbitalRadius = ORBIT_RADII[planet];
        
        if (!orbitalRadius) return null;
        
        // Plot planet at evenly-spaced distance, at actual angle
        const x = centerX + orbitalRadius * Math.cos(angle) * scale;
        const y = centerY - orbitalRadius * Math.sin(angle) * scale; // Invert Y
        
        const size = PLANET_SIZES[planet] || 2.5;
        const color = PLANET_COLORS[planet] || '#999';
        
        return (
          <circle
            key={planet}
            cx={x}
            cy={y}
            r={size}
            fill={color}
          />
        );
      })}
      
      {/* Show timestamp in bottom left */}
      {data.timestamp && (
        <text
          x={5}
          y={WIDGET_SIZE - 5}
          fontSize="8"
          fill={textColor}
        >
          {new Date(data.timestamp).toLocaleDateString()}
        </text>
      )}
    </svg>
  );
};