// Map definitions. Each map has a path (waypoints), terrain features, and visual theme.
// Path coordinates are designed for a 900x700 canvas.
const Maps = {
  meadow: {
    name: 'Meadow',
    difficulty: 'Beginner',
    theme: 'grass',
    bg: '#4ade80',
    accentBg: '#16a34a',
    pathColor: '#a8722b',
    pathBorder: '#6b4118',
    pathWidth: 36,
    path: [
      [-30, 350],
      [200, 350],
      [200, 150],
      [450, 150],
      [450, 550],
      [700, 550],
      [700, 250],
      [930, 250]
    ],
    decorations: [
      {type: 'tree', x: 100, y: 100},
      {type: 'tree', x: 320, y: 80},
      {type: 'tree', x: 80, y: 500},
      {type: 'tree', x: 350, y: 450},
      {type: 'tree', x: 600, y: 100},
      {type: 'tree', x: 820, y: 400},
      {type: 'tree', x: 580, y: 350},
      {type: 'bush', x: 250, y: 250},
      {type: 'bush', x: 500, y: 300},
      {type: 'bush', x: 760, y: 120},
      {type: 'rock', x: 150, y: 620},
      {type: 'rock', x: 800, y: 600},
      {type: 'flower', x: 380, y: 250},
      {type: 'flower', x: 250, y: 480},
      {type: 'flower', x: 650, y: 460}
    ]
  },
  desert: {
    name: 'Desert',
    difficulty: 'Easy',
    theme: 'sand',
    bg: '#fde68a',
    accentBg: '#fcd34d',
    pathColor: '#7c2d12',
    pathBorder: '#451a03',
    pathWidth: 40,
    path: [
      [450, -30],
      [450, 120],
      [200, 200],
      [200, 400],
      [450, 480],
      [700, 400],
      [700, 200],
      [450, 120],
      [450, 580],
      [-30, 580]
    ],
    decorations: [
      {type: 'cactus', x: 100, y: 100},
      {type: 'cactus', x: 800, y: 100},
      {type: 'cactus', x: 100, y: 650},
      {type: 'cactus', x: 800, y: 650},
      {type: 'cactus', x: 550, y: 50},
      {type: 'rock', x: 350, y: 300},
      {type: 'rock', x: 550, y: 300},
      {type: 'rock', x: 50, y: 400},
      {type: 'rock', x: 850, y: 400}
    ]
  },
  river: {
    name: 'River',
    difficulty: 'Medium',
    theme: 'mixed',
    bg: '#86efac',
    accentBg: '#22c55e',
    pathColor: '#a8722b',
    pathBorder: '#6b4118',
    pathWidth: 36,
    water: [{x: 0, y: 0, w: 900, h: 90}, {x: 0, y: 610, w: 900, h: 90}],
    path: [
      [-30, 350],
      [150, 350],
      [150, 150],
      [350, 150],
      [350, 550],
      [550, 550],
      [550, 150],
      [750, 150],
      [750, 550],
      [930, 550]
    ],
    decorations: [
      {type: 'tree', x: 60, y: 200},
      {type: 'tree', x: 60, y: 500},
      {type: 'tree', x: 470, y: 300},
      {type: 'tree', x: 850, y: 300},
      {type: 'bush', x: 250, y: 400},
      {type: 'bush', x: 650, y: 300},
      {type: 'rock', x: 220, y: 230}
    ]
  },
  volcano: {
    name: 'Volcano',
    difficulty: 'Hard',
    theme: 'lava',
    bg: '#7f1d1d',
    accentBg: '#991b1b',
    pathColor: '#4b2206',
    pathBorder: '#1c0701',
    pathWidth: 34,
    path: [
      [-30, 100],
      [200, 100],
      [200, 250],
      [400, 250],
      [400, 100],
      [600, 100],
      [600, 400],
      [300, 400],
      [300, 550],
      [800, 550],
      [800, 300],
      [930, 300]
    ],
    decorations: [
      {type: 'lavarock', x: 100, y: 200},
      {type: 'lavarock', x: 500, y: 200},
      {type: 'lavarock', x: 750, y: 100},
      {type: 'lavarock', x: 100, y: 450},
      {type: 'lavarock', x: 850, y: 450},
      {type: 'lavarock', x: 450, y: 500},
      {type: 'lavarock', x: 200, y: 650}
    ]
  },
  spiral: {
    name: 'Spiral',
    difficulty: 'Hard',
    theme: 'stone',
    bg: '#94a3b8',
    accentBg: '#64748b',
    pathColor: '#475569',
    pathBorder: '#1e293b',
    pathWidth: 30,
    path: [
      [-30, 350],
      [100, 350],
      [100, 100],
      [800, 100],
      [800, 600],
      [200, 600],
      [200, 200],
      [700, 200],
      [700, 500],
      [300, 500],
      [300, 300],
      [600, 300],
      [600, 400],
      [450, 400],
      [450, 700]
    ],
    decorations: []
  },
  crossroads: {
    name: 'Crossroads',
    difficulty: 'Medium',
    theme: 'grass',
    bg: '#65a30d',
    accentBg: '#4d7c0f',
    pathColor: '#a8722b',
    pathBorder: '#6b4118',
    pathWidth: 36,
    path: [
      [-30, 350],
      [350, 350],
      [350, 100],
      [550, 100],
      [550, 600],
      [350, 600],
      [350, 350],
      [930, 350]
    ],
    decorations: [
      {type: 'tree', x: 100, y: 200},
      {type: 'tree', x: 100, y: 500},
      {type: 'tree', x: 800, y: 200},
      {type: 'tree', x: 800, y: 500},
      {type: 'bush', x: 250, y: 200},
      {type: 'bush', x: 700, y: 500},
      {type: 'flower', x: 450, y: 250},
      {type: 'flower', x: 450, y: 450}
    ]
  },
  snowfield: {
    name: 'Snowfield',
    difficulty: 'Easy',
    theme: 'snow',
    bg: '#e2e8f0',
    accentBg: '#cbd5e1',
    pathColor: '#94a3b8',
    pathBorder: '#475569',
    pathWidth: 36,
    path: [
      [-30, 200],
      [250, 200],
      [250, 450],
      [500, 450],
      [500, 200],
      [750, 200],
      [750, 550],
      [930, 550]
    ],
    decorations: [
      {type: 'snowtree', x: 100, y: 400},
      {type: 'snowtree', x: 380, y: 300},
      {type: 'snowtree', x: 380, y: 600},
      {type: 'snowtree', x: 630, y: 350},
      {type: 'snowtree', x: 850, y: 350},
      {type: 'rock', x: 150, y: 600},
      {type: 'rock', x: 600, y: 100}
    ]
  },
  arena: {
    name: 'Arena',
    difficulty: 'Impoppable',
    theme: 'stone',
    bg: '#71717a',
    accentBg: '#52525b',
    pathColor: '#3f3f46',
    pathBorder: '#18181b',
    pathWidth: 32,
    path: [
      [-30, 350],
      [150, 350],
      [150, 150],
      [750, 150],
      [750, 550],
      [150, 550],
      [150, 350],
      [930, 350]
    ],
    decorations: [
      {type: 'rock', x: 100, y: 100},
      {type: 'rock', x: 800, y: 100},
      {type: 'rock', x: 100, y: 600},
      {type: 'rock', x: 800, y: 600},
      {type: 'rock', x: 450, y: 250},
      {type: 'rock', x: 450, y: 450}
    ]
  }
};

// Helper to enumerate maps for the menu
Maps._list = ['meadow', 'desert', 'snowfield', 'crossroads', 'river', 'volcano', 'spiral', 'arena'];
