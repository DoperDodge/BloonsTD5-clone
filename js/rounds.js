// Round/wave definitions. Each round has a list of spawn groups.
// A spawn group has: type, count, spacing (sec between bloons), delay (sec before group starts), and optional camo/regrow/fortified flags.

const Rounds = [];

function round(...groups) { Rounds.push(groups); }

// Round 1-10: basic introduction
round({ type: 'red', count: 20, spacing: 0.6, delay: 0 });
round({ type: 'red', count: 30, spacing: 0.45, delay: 0 });
round(
  { type: 'red', count: 20, spacing: 0.4, delay: 0 },
  { type: 'blue', count: 6, spacing: 0.5, delay: 9 }
);
round(
  { type: 'red', count: 25, spacing: 0.35, delay: 0 },
  { type: 'blue', count: 10, spacing: 0.4, delay: 9 }
);
round(
  { type: 'blue', count: 20, spacing: 0.35, delay: 0 },
  { type: 'green', count: 5, spacing: 0.6, delay: 8 }
);
round(
  { type: 'red', count: 15, spacing: 0.3, delay: 0 },
  { type: 'blue', count: 15, spacing: 0.35, delay: 5 },
  { type: 'green', count: 8, spacing: 0.5, delay: 12 }
);
round(
  { type: 'blue', count: 30, spacing: 0.3, delay: 0 },
  { type: 'green', count: 10, spacing: 0.4, delay: 10 }
);
round(
  { type: 'green', count: 20, spacing: 0.4, delay: 0 },
  { type: 'yellow', count: 4, spacing: 0.5, delay: 8 }
);
round(
  { type: 'green', count: 25, spacing: 0.35, delay: 0 },
  { type: 'yellow', count: 8, spacing: 0.4, delay: 9 }
);
round(
  { type: 'green', count: 15, spacing: 0.3, delay: 0 },
  { type: 'yellow', count: 12, spacing: 0.4, delay: 4 },
  { type: 'pink', count: 3, spacing: 0.5, delay: 12 }
);

// Round 11-20: mid game - introduces black/white/lead
round(
  { type: 'yellow', count: 20, spacing: 0.35, delay: 0 },
  { type: 'pink', count: 6, spacing: 0.4, delay: 8 }
);
round(
  { type: 'black', count: 5, spacing: 1.0, delay: 0 },
  { type: 'white', count: 5, spacing: 1.0, delay: 6 },
  { type: 'yellow', count: 15, spacing: 0.4, delay: 12 }
);
round(
  { type: 'pink', count: 20, spacing: 0.35, delay: 0 },
  { type: 'lead', count: 4, spacing: 1.2, delay: 8 }
);
round(
  { type: 'green', count: 30, spacing: 0.25, delay: 0, regrow: true },
  { type: 'yellow', count: 10, spacing: 0.4, delay: 9 }
);
round(
  { type: 'black', count: 10, spacing: 0.7, delay: 0 },
  { type: 'white', count: 10, spacing: 0.7, delay: 4 },
  { type: 'zebra', count: 5, spacing: 0.8, delay: 12 }
);
round(
  { type: 'yellow', count: 40, spacing: 0.2, delay: 0 },
  { type: 'pink', count: 10, spacing: 0.35, delay: 9 }
);
round(
  { type: 'lead', count: 8, spacing: 0.9, delay: 0 },
  { type: 'pink', count: 15, spacing: 0.35, delay: 10 }
);
round(
  { type: 'zebra', count: 10, spacing: 0.5, delay: 0 },
  { type: 'lead', count: 8, spacing: 0.9, delay: 9 }
);
round(
  { type: 'rainbow', count: 4, spacing: 1.0, delay: 0 },
  { type: 'pink', count: 25, spacing: 0.25, delay: 8 }
);
round(
  { type: 'rainbow', count: 8, spacing: 0.8, delay: 0 },
  { type: 'pink', count: 30, spacing: 0.2, delay: 10 }
);

// Round 21-30: ceramics and camo
round(
  { type: 'rainbow', count: 12, spacing: 0.6, delay: 0 },
  { type: 'zebra', count: 10, spacing: 0.5, delay: 9 }
);
round(
  { type: 'ceramic', count: 3, spacing: 1.2, delay: 0 },
  { type: 'rainbow', count: 10, spacing: 0.5, delay: 8 }
);
round(
  { type: 'pink', count: 50, spacing: 0.15, delay: 0 },
  { type: 'yellow', count: 30, spacing: 0.15, delay: 9, camo: true }
);
round(
  { type: 'ceramic', count: 8, spacing: 0.9, delay: 0 },
  { type: 'pink', count: 20, spacing: 0.2, delay: 9 }
);
round(
  { type: 'green', count: 50, spacing: 0.12, delay: 0, regrow: true },
  { type: 'yellow', count: 30, spacing: 0.15, delay: 9, regrow: true }
);
round(
  { type: 'lead', count: 15, spacing: 0.6, delay: 0 },
  { type: 'ceramic', count: 5, spacing: 0.8, delay: 10 }
);
round(
  { type: 'rainbow', count: 15, spacing: 0.4, delay: 0, camo: true },
  { type: 'ceramic', count: 4, spacing: 1.0, delay: 9 }
);
round(
  { type: 'ceramic', count: 12, spacing: 0.7, delay: 0 },
  { type: 'rainbow', count: 10, spacing: 0.4, delay: 12 }
);
round(
  { type: 'ceramic', count: 6, spacing: 0.8, delay: 0, regrow: true },
  { type: 'rainbow', count: 15, spacing: 0.35, delay: 10 }
);
round(
  { type: 'ceramic', count: 20, spacing: 0.5, delay: 0 }
);

// Round 31-40: blimps appear
round(
  { type: 'moab', count: 1, spacing: 0, delay: 0 },
  { type: 'pink', count: 30, spacing: 0.2, delay: 10 }
);
round(
  { type: 'ceramic', count: 8, spacing: 0.6, delay: 0, camo: true },
  { type: 'rainbow', count: 20, spacing: 0.3, delay: 10 }
);
round(
  { type: 'moab', count: 2, spacing: 4, delay: 0 },
  { type: 'lead', count: 20, spacing: 0.5, delay: 12 }
);
round(
  { type: 'ceramic', count: 15, spacing: 0.5, delay: 0, regrow: true }
);
round(
  { type: 'moab', count: 3, spacing: 3, delay: 0 },
  { type: 'ceramic', count: 8, spacing: 0.6, delay: 15 }
);
round(
  { type: 'rainbow', count: 30, spacing: 0.25, delay: 0, regrow: true }
);
round(
  { type: 'ceramic', count: 6, spacing: 0.8, delay: 0, regrow: true, camo: true },
  { type: 'rainbow', count: 20, spacing: 0.3, delay: 12 }
);
round(
  { type: 'moab', count: 4, spacing: 2.5, delay: 0 },
  { type: 'ceramic', count: 15, spacing: 0.4, delay: 14 }
);
round(
  { type: 'ceramic', count: 30, spacing: 0.35, delay: 0 }
);
round(
  { type: 'bfb', count: 1, spacing: 0, delay: 0 },
  { type: 'ceramic', count: 10, spacing: 0.6, delay: 18 }
);

// Round 41-50: heavy blimps
round(
  { type: 'moab', count: 6, spacing: 2.5, delay: 0 }
);
round(
  { type: 'ceramic', count: 40, spacing: 0.25, delay: 0 }
);
round(
  { type: 'bfb', count: 1, spacing: 0, delay: 0 },
  { type: 'moab', count: 3, spacing: 3, delay: 12 }
);
round(
  { type: 'ceramic', count: 30, spacing: 0.3, delay: 0, regrow: true }
);
round(
  { type: 'moab', count: 2, spacing: 2, delay: 0 },
  { type: 'bfb', count: 1, spacing: 0, delay: 8 }
);
round(
  { type: 'ceramic', count: 25, spacing: 0.3, delay: 0, camo: true, regrow: true }
);
round(
  { type: 'bfb', count: 2, spacing: 6, delay: 0 },
  { type: 'ceramic', count: 15, spacing: 0.4, delay: 16 }
);
round(
  { type: 'moab', count: 5, spacing: 2, delay: 0, fortified: true }
);
round(
  { type: 'ceramic', count: 50, spacing: 0.2, delay: 0 }
);
round(
  { type: 'zomg', count: 1, spacing: 0, delay: 0 }
);

// Round 51-60: late game
round(
  { type: 'bfb', count: 3, spacing: 5, delay: 0 },
  { type: 'moab', count: 5, spacing: 2, delay: 18 }
);
round(
  { type: 'moab', count: 10, spacing: 1.8, delay: 0 }
);
round(
  { type: 'ceramic', count: 30, spacing: 0.25, delay: 0, regrow: true, fortified: true }
);
round(
  { type: 'bfb', count: 4, spacing: 4, delay: 0 }
);
round(
  { type: 'zomg', count: 1, spacing: 0, delay: 0, fortified: true },
  { type: 'ceramic', count: 30, spacing: 0.3, delay: 14 }
);
round(
  { type: 'bfb', count: 2, spacing: 3, delay: 0, fortified: true },
  { type: 'moab', count: 10, spacing: 1.5, delay: 12 }
);
round(
  { type: 'ceramic', count: 60, spacing: 0.2, delay: 0, camo: true, regrow: true }
);
round(
  { type: 'zomg', count: 1, spacing: 0, delay: 0 },
  { type: 'bfb', count: 2, spacing: 4, delay: 18 }
);
round(
  { type: 'moab', count: 20, spacing: 1.2, delay: 0 }
);
round(
  { type: 'zomg', count: 2, spacing: 10, delay: 0 },
  { type: 'bfb', count: 4, spacing: 3, delay: 30 }
);

const TOTAL_ROUNDS = Rounds.length;

// Income for each round (cash on round complete)
function roundReward(roundIdx, mode) {
  let base = 100 + roundIdx * 20;
  if (mode === 'deflation') base = 0;
  return base;
}

// Generate a freeplay round procedurally for rounds beyond defined
function generateFreeplayRound(roundIdx) {
  const groups = [];
  const moabCount = 1 + Math.floor((roundIdx - 60) / 4);
  const bfbCount = Math.floor((roundIdx - 60) / 3);
  const zomgCount = Math.floor((roundIdx - 60) / 8);
  if (moabCount > 0) groups.push({ type: 'moab', count: moabCount, spacing: 1.5, delay: 0, fortified: roundIdx > 70 });
  if (bfbCount > 0) groups.push({ type: 'bfb', count: bfbCount, spacing: 3, delay: 8, fortified: roundIdx > 80 });
  if (zomgCount > 0) groups.push({ type: 'zomg', count: zomgCount, spacing: 6, delay: 18, fortified: roundIdx > 90 });
  groups.push({ type: 'ceramic', count: 20 + roundIdx, spacing: 0.2, delay: 30, regrow: true, camo: roundIdx > 70 });
  return groups;
}

function getRound(idx) {
  if (idx < Rounds.length) return Rounds[idx];
  return generateFreeplayRound(idx);
}
