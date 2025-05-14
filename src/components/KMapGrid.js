import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Helper for Gray code order for 3-variable K-map columns
const grayCodeOrder = [0, 1, 3, 2]; // C̅C: 00, 01, 11, 10

const kmap2Labels = [
  { label: 'A̅B̅', minterm: 0 }, // m0
  { label: 'A̅B', minterm: 1 },  // m1
  { label: 'AB̅', minterm: 2 },  // m2
  { label: 'AB', minterm: 3 },   // m3
];

// For 3-variable K-map, Gray code order for columns: B̅C̅, B̅C, BC, BC̅
const kmap3Labels = [
  // Row 0: A̅
  [
    { label: 'A̅B̅C̅', minterm: 0 }, // B̅C̅
    { label: 'A̅B̅C', minterm: 1 },  // B̅C
    { label: 'A̅BC', minterm: 3 },   // BC
    { label: 'A̅BC̅', minterm: 2 },  // BC̅
  ],
  // Row 1: A
  [
    { label: 'AB̅C̅', minterm: 4 }, // B̅C̅
    { label: 'AB̅C', minterm: 5 },  // B̅C
    { label: 'ABC', minterm: 7 },   // BC
    { label: 'ABC̅', minterm: 6 },  // BC̅
  ],
];

const cLabels = ['C̅', 'C', 'C', 'C̅']; // Gray code order for C below columns
const bLabels = ['B̅', 'B̅', 'B', 'B']; // B̅ for first two columns, B for last two

const simplify2VarKMapWithGroups = (cells) => {
  if (cells.every(v => v === 1)) return { expr: "F = 1", groups: ["Quad (all cells)"] };
  if (cells.every(v => v === 0)) return { expr: "F = 0", groups: [] };
  let terms = [];
  let groups = [];
  // Horizontal/vertical pairs
  if (cells[0] === 1 && cells[1] === 1) { terms.push("A'"); groups.push("Horizontal: A̅ row (A' group)"); }
  if (cells[2] === 1 && cells[3] === 1) { terms.push("A"); groups.push("Horizontal: A row (A group)"); }
  if (cells[0] === 1 && cells[2] === 1) { terms.push("B'"); groups.push("Vertical: B̅ column (B' group)"); }
  if (cells[1] === 1 && cells[3] === 1) { terms.push("B"); groups.push("Vertical: B column (B group)"); }
  // Singles (if not already covered by pairs)
  if (terms.length === 0) {
    if (cells[0] === 1) { terms.push("A'B'"); groups.push("Single: A'B'"); }
    if (cells[1] === 1) { terms.push("A'B"); groups.push("Single: A'B"); }
    if (cells[2] === 1) { terms.push("AB'"); groups.push("Single: AB'"); }
    if (cells[3] === 1) { terms.push("AB"); groups.push("Single: AB"); }
  } else {
    if (cells[0] === 1 && !(terms.includes("A'") || terms.includes("B'"))) { terms.push("A'B'"); groups.push("Single: A'B'"); }
    if (cells[1] === 1 && !(terms.includes("A'") || terms.includes("B"))) { terms.push("A'B"); groups.push("Single: A'B"); }
    if (cells[2] === 1 && !(terms.includes("A") || terms.includes("B'"))) { terms.push("AB'"); groups.push("Single: AB'"); }
    if (cells[3] === 1 && !(terms.includes("A") || terms.includes("B"))) { terms.push("AB"); groups.push("Single: AB"); }
  }
  return { expr: `F = ${terms.join(' + ')}`, groups };
};

const get2VarGroupBoxes = (cells) => {
  // Returns an array of group objects: { type: 'row'|'col'|'single', cells: [indices], color: string }
  const groups = [];
  // Colors for different groups
  const colors = [
    'border-blue-400',
    'border-pink-400',
    'border-green-400',
    'border-yellow-400',
    'border-red-400',
    'border-purple-400',
  ];
  let colorIdx = 0;
  // Horizontal pairs
  if (cells[0] === 1 && cells[1] === 1) groups.push({ type: 'row', cells: [0, 1], color: colors[colorIdx++] });
  if (cells[2] === 1 && cells[3] === 1) groups.push({ type: 'row', cells: [2, 3], color: colors[colorIdx++] });
  // Vertical pairs
  if (cells[0] === 1 && cells[2] === 1) groups.push({ type: 'col', cells: [0, 2], color: colors[colorIdx++] });
  if (cells[1] === 1 && cells[3] === 1) groups.push({ type: 'col', cells: [1, 3], color: colors[colorIdx++] });
  // Singles (not covered by any group)
  const grouped = new Set(groups.flatMap(g => g.cells));
  [0, 1, 2, 3].forEach(idx => {
    if (cells[idx] === 1 && !grouped.has(idx)) {
      groups.push({ type: 'single', cells: [idx], color: colors[colorIdx++] });
    }
  });
  return groups;
};

const get3VarGroupBoxes = (cells) => {
  // Returns an array of group objects: { type: 'quad'|'row'|'col'|'pair'|'single', cells: [indices], color: string }
  const groups = [];
  const colors = [
    'border-blue-400',
    'border-pink-400',
    'border-green-400',
    'border-yellow-400',
    'border-red-400',
    'border-purple-400',
    'border-cyan-400',
    'border-orange-400',
  ];
  let colorIdx = 0;
  // Quads
  if (cells[0] && cells[1] && cells[2] && cells[3]) groups.push({ type: 'row-quad', cells: [0,1,2,3], color: colors[colorIdx++] });
  if (cells[4] && cells[5] && cells[6] && cells[7]) groups.push({ type: 'row-quad', cells: [4,5,6,7], color: colors[colorIdx++] });
  if (cells[0] && cells[1] && cells[4] && cells[5]) groups.push({ type: 'col-quad', cells: [0,1,4,5], color: colors[colorIdx++] });
  if (cells[2] && cells[3] && cells[6] && cells[7]) groups.push({ type: 'col-quad', cells: [2,3,6,7], color: colors[colorIdx++] });
  if (cells[1] && cells[2] && cells[5] && cells[6]) groups.push({ type: 'mid-quad', cells: [1,2,5,6], color: colors[colorIdx++] });
  if (cells[0] && cells[3] && cells[4] && cells[7]) groups.push({ type: 'outer-quad', cells: [0,3,4,7], color: colors[colorIdx++] });
  // Horizontal pairs (wrap-around included)
  const hPairs = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
  ];
  hPairs.forEach(pair => {
    if (cells[pair[0]] && cells[pair[1]]) groups.push({ type: 'h-pair', cells: pair, color: colors[colorIdx % colors.length] });
    colorIdx++;
  });
  // Vertical pairs
  const vPairs = [
    [0,4],[1,5],[2,6],[3,7],
  ];
  vPairs.forEach(pair => {
    if (cells[pair[0]] && cells[pair[1]]) groups.push({ type: 'v-pair', cells: pair, color: colors[colorIdx % colors.length] });
    colorIdx++;
  });
  // Singles (not covered by any group)
  const grouped = new Set(groups.flatMap(g => g.cells));
  for (let idx = 0; idx < 8; idx++) {
    if (cells[idx] && !grouped.has(idx)) {
      groups.push({ type: 'single', cells: [idx], color: colors[colorIdx % colors.length] });
      colorIdx++;
    }
  }
  return groups;
};

// Improved 3-variable minimization: remove duplicates, take common terms
function minimize3VarTerms(terms) {
  // Remove duplicates
  terms = Array.from(new Set(terms));
  // Try to combine terms (e.g., AB'C' + AB'C = AB')
  // Only basic combining for now
  const combined = [];
  const used = Array(terms.length).fill(false);
  for (let i = 0; i < terms.length; i++) {
    if (used[i]) continue;
    let found = false;
    for (let j = i + 1; j < terms.length; j++) {
      if (used[j]) continue;
      // Combine if only one variable differs
      const t1 = terms[i];
      const t2 = terms[j];
      let diff = 0, idx = -1;
      for (let k = 0; k < 3; k++) {
        if (t1[k] !== t2[k]) { diff++; idx = k; }
      }
      if (diff === 1) {
        // Remove the differing variable
        let combinedTerm = '';
        for (let k = 0; k < 3; k++) {
          if (k !== idx) combinedTerm += t1[k];
        }
        combined.push(combinedTerm);
        used[i] = used[j] = true;
        found = true;
        break;
      }
    }
    if (!found && !used[i]) combined.push(terms[i]);
  }
  // Convert to Boolean notation
  return combined.map(t => {
    let out = '';
    if (t[0] === "A") out += 'A';
    if (t[0] === "a") out += "A'";
    if (t[1] === "B") out += 'B';
    if (t[1] === "b") out += "B'";
    if (t[2] === "C") out += 'C';
    if (t[2] === "c") out += "C'";
    return out;
  });
}

// 3-variable K-map simplification
const simplify3VarKMapWithGroups = (cells) => {
  // cells: [m0, m1, m3, m2, m4, m5, m7, m6] (Gray code order)
  // m0: A̅B̅C̅, m1: A̅B̅C, m3: A̅BC, m2: A̅BC̅, m4: AB̅C̅, m5: AB̅C, m7: ABC, m6: ABC̅
  // Indices: 0 1 2 3 (row 0), 4 5 6 7 (row 1)
  if (cells.every(v => v === 1)) return { expr: "F = 1", groups: ["Octet (all cells)"] };
  if (cells.every(v => v === 0)) return { expr: "F = 0", groups: [] };
  let terms = [];
  let groups = [];
  const used = Array(8).fill(false);
  // Check for quads (groups of 4)
  // Top row quad (A̅)
  if (cells[0] && cells[1] && cells[2] && cells[3]) {
    terms.push("aBB");
    groups.push("Quad: Top row (A̅)");
    [0,1,2,3].forEach(i => used[i] = true);
  }
  // Bottom row quad (A)
  if (cells[4] && cells[5] && cells[6] && cells[7]) {
    terms.push("ABB");
    groups.push("Quad: Bottom row (A)");
    [4,5,6,7].forEach(i => used[i] = true);
  }
  // Left columns quad (B̅)
  if (cells[0] && cells[1] && cells[4] && cells[5]) {
    terms.push("AaB");
    groups.push("Quad: Left columns (B̅)");
    [0,1,4,5].forEach(i => used[i] = true);
  }
  // Right columns quad (B)
  if (cells[2] && cells[3] && cells[6] && cells[7]) {
    terms.push("AB");
    groups.push("Quad: Right columns (B)");
    [2,3,6,7].forEach(i => used[i] = true);
  }
  // Middle vertical quad (C)
  if (cells[1] && cells[2] && cells[5] && cells[6]) {
    terms.push("ABC");
    groups.push("Quad: Middle columns (C)");
    [1,2,5,6].forEach(i => used[i] = true);
  }
  // Outer vertical quad (C̅)
  if (cells[0] && cells[3] && cells[4] && cells[7]) {
    terms.push("ABc");
    groups.push("Quad: Outer columns (C̅)");
    [0,3,4,7].forEach(i => used[i] = true);
  }
  // Check for pairs (adjacent horizontally or vertically, including wrap-around)
  const pairs = [
    // Horizontal pairs
    [0,1], [1,2], [2,3], [3,0], // top row
    [4,5], [5,6], [6,7], [7,4], // bottom row
    // Vertical pairs
    [0,4], [1,5], [2,6], [3,7],
  ];
  const pairTerms = [
    [[0,1], "aBb", "Pair: A'B' (top left)"],
    [[1,2], "aBB", "Pair: A'B (top mid)"],
    [[2,3], "aBB", "Pair: A'B (top right)"],
    [[3,0], "aBc", "Pair: A'B (top wrap)"],
    [[4,5], "ABb", "Pair: AB' (bottom left)"],
    [[5,6], "ABB", "Pair: AB (bottom mid)"],
    [[6,7], "ABB", "Pair: AB (bottom right)"],
    [[7,4], "ABc", "Pair: AB (bottom wrap)"],
    [[0,4], "aBB", "Pair: B' (left col)"],
    [[1,5], "aBB", "Pair: B' (2nd col)"],
    [[2,6], "ABB", "Pair: B (3rd col)"],
    [[3,7], "ABB", "Pair: B (right col)"],
  ];
  pairTerms.forEach(([indices, term, desc]) => {
    if (indices.every(i => cells[i] && !used[i])) {
      terms.push(term);
      groups.push(desc);
      indices.forEach(i => used[i] = true);
    }
  });
  // Singles (not covered by any group)
  for (let i = 0; i < 8; i++) {
    if (cells[i] && !used[i]) {
      // Use a/b/c for A/A'/B/B'/C/C'
      let t = '';
      t += (i < 4) ? 'a' : 'A';
      t += ([0,1,4,5].includes(i)) ? 'b' : 'B';
      t += ([0,3,4,7].includes(i)) ? 'c' : 'C';
      terms.push(t);
      groups.push(`Single: ${kmap3Labels[Math.floor(i/4)][[0,1,3,2].indexOf(i%4)]?.label || `m${i}`}`);
    }
  }
  // Minimize and convert to Boolean notation
  const minimized = minimize3VarTerms(terms);
  return { expr: `F = ${minimized.join(' + ')}`, groups };
};

// Helper to parse 2-variable Boolean equation and fill K-map cells
function parse2VarEquation(equation) {
  // Only supports terms with A, B, A', B', e.g. A'B, AB', AB, A'B'
  // Returns [m0, m1, m2, m3] (A'B', A'B, AB', AB)
  const minterms = [0, 0, 0, 0];
  const cleaned = equation.replace(/F\s*=\s*/i, '').replace(/\s+/g, '');
  const terms = cleaned.split('+');
  terms.forEach(term => {
    if (term === "A'B'") minterms[0] = 1;
    if (term === "A'B") minterms[1] = 1;
    if (term === "AB'") minterms[2] = 1;
    if (term === "AB") minterms[3] = 1;
  });
  return minterms;
}

// Helper to parse 3-variable Boolean equation and fill K-map cells
function parse3VarEquation(equation) {
  // Only supports terms with A, B, C, A', B', C', e.g. A'B'C, AB'C', etc.
  // Returns [m0, m1, m3, m2, m4, m5, m7, m6] (Gray code order)
  const minterms = [0,0,0,0,0,0,0,0];
  const cleaned = equation.replace(/F\s*=\s*/i, '').replace(/\s+/g, '');
  const terms = cleaned.split('+');
  // Map term to index in Gray code order
  const termToIdx = {
    "A'B'C'": 0, "A'B'C": 1, "A'BC": 2, "A'BC'": 3,
    "AB'C'": 4, "AB'C": 5, "ABC": 6, "ABC'": 7
  };
  // But our grid is [0,1,3,2,4,5,7,6]
  const grayOrder = [0,1,3,2,4,5,7,6];
  terms.forEach(term => {
    const idx = termToIdx[term];
    if (idx !== undefined) {
      const grayIdx = grayOrder.indexOf(idx);
      if (grayIdx !== -1) minterms[grayIdx] = 1;
    }
  });
  return minterms;
}

const GAME_LEVELS_2VAR = [
  { eq: "F = A'B'", cells: [0] },
  { eq: "F = A'B", cells: [1] },
  { eq: "F = AB'", cells: [2] },
  { eq: "F = AB", cells: [3] },
  { eq: "F = A'B' + A'B", cells: [0,1] },
  { eq: "F = AB' + AB", cells: [2,3] },
  { eq: "F = A'B' + AB'", cells: [0,2] },
  { eq: "F = A'B + AB", cells: [1,3] },
  { eq: "F = A'B' + AB", cells: [0,3] },
  { eq: "F = A'B + AB'", cells: [1,2] },
  { eq: "F = A'B' + A'B + AB'", cells: [0,1,2] },
  { eq: "F = A'B' + A'B + AB", cells: [0,1,3] },
  { eq: "F = A'B' + AB' + AB", cells: [0,2,3] },
  { eq: "F = A'B + AB' + AB", cells: [1,2,3] },
  { eq: "F = A'B' + AB' + A'B", cells: [0,1,2] },
  { eq: "F = AB' + AB + A'B'", cells: [0,2,3] },
  { eq: "F = A'B' + AB' + AB", cells: [0,2,3] },
  { eq: "F = A'B + AB' + AB", cells: [1,2,3] },
  { eq: "F = A'B' + A'B + AB' + AB", cells: [0,1,2,3] },
  { eq: "F = A'B' + AB'", cells: [0,2] },
  { eq: "F = A'B + AB", cells: [1,3] },
  { eq: "F = AB' + AB", cells: [2,3] },
  { eq: "F = A'B' + AB", cells: [0,3] },
  { eq: "F = A'B + AB'", cells: [1,2] },
  { eq: "F = A'B' + A'B'", cells: [0] },
  { eq: "F = AB' + AB'", cells: [2] },
  { eq: "F = AB + AB", cells: [3] },
  { eq: "F = A'B' + AB' + AB'", cells: [0,2] },
  { eq: "F = A'B + AB + AB", cells: [1,3] },
  { eq: "F = A'B' + A'B + AB' + AB", cells: [0,1,2,3] },
  { eq: "F = 1", cells: [0,1,2,3] },
  { eq: "F = 0", cells: [] },
  { eq: "F = A'", cells: [0,1] },
  { eq: "F = A", cells: [2,3] },
  { eq: "F = B'", cells: [0,2] },
  { eq: "F = B", cells: [1,3] },
  { eq: "F = A' + B'", cells: [0,1,2] },
  { eq: "F = A + B", cells: [1,2,3] },
  { eq: "F = A' + B", cells: [0,1,3] },
  { eq: "F = A + B'", cells: [0,2,3] },
  { eq: "F = (A'B')'", cells: [1,2,3] },
  { eq: "F = (AB)'", cells: [0,1,2] },
  { eq: "F = (A'B)'", cells: [0,2,3] },
  { eq: "F = (AB')'", cells: [0,1,3] },
  { eq: "F = (A' + B')'", cells: [3] },
  { eq: "F = (A + B)'", cells: [0] },
  { eq: "F = (A' + B)'", cells: [2] },
  { eq: "F = (A + B' + C')'", cells: [5] },
  { eq: "F = AB + A'B'", cells: [0,3] },
  { eq: "F = AB' + A'B", cells: [1,2] },
  { eq: "F = AB + AB'", cells: [2,3] },
  { eq: "F = AB + A'B", cells: [1,3] },
  { eq: "F = AB' + A'B'", cells: [0,2] },
  { eq: "F = (A + B)(A' + B')", cells: [0,1,2,3] },
  { eq: "F = (A' + B')(A + B)", cells: [1,2,3] },
  { eq: "F = (A'B + AB')'", cells: [0,3] },
  { eq: "F = (AB + A'B')'", cells: [1,2] },
  { eq: "F = (A'B'C' + AB'C')'", cells: [0,5] },
  { eq: "F = (A'B'C + AB'C' + ABC')'", cells: [0,2,3,4,5,7] },
];

const GAME_LEVELS_3VAR = [
  { eq: "F = A'B'C'", cells: [0] },
  { eq: "F = A'B'C", cells: [1] },
  { eq: "F = A'BC", cells: [2] },
  { eq: "F = A'BC'", cells: [3] },
  { eq: "F = AB'C'", cells: [4] },
  { eq: "F = AB'C", cells: [5] },
  { eq: "F = ABC", cells: [6] },
  { eq: "F = ABC'", cells: [7] },
  { eq: "F = A'B'C' + A'B'C", cells: [0,1] },
  { eq: "F = A'BC + A'BC'", cells: [2,3] },
  { eq: "F = AB'C' + AB'C", cells: [4,5] },
  { eq: "F = ABC + ABC'", cells: [6,7] },
  { eq: "F = A'B'C' + AB'C'", cells: [0,4] },
  { eq: "F = A'B'C + AB'C", cells: [1,5] },
  { eq: "F = A'BC + ABC", cells: [2,6] },
  { eq: "F = A'BC' + ABC'", cells: [3,7] },
  { eq: "F = A'B'C' + A'B'C + A'BC", cells: [0,1,2] },
  { eq: "F = AB'C' + AB'C + ABC", cells: [4,5,6] },
  { eq: "F = A'B'C' + AB'C' + ABC'", cells: [0,4,7] },
  { eq: "F = A'B'C + AB'C + ABC", cells: [1,5,6] },
  { eq: "F = A'BC + ABC + ABC'", cells: [2,6,7] },
  { eq: "F = A'BC' + ABC' + AB'C'", cells: [3,7,4] },
  { eq: "F = A'B'C' + A'B'C + AB'C' + AB'C", cells: [0,1,4,5] },
  { eq: "F = A'BC + A'BC' + ABC + ABC'", cells: [2,3,6,7] },
  { eq: "F = A'B'C' + A'BC' + AB'C' + ABC'", cells: [0,3,4,7] },
  { eq: "F = A'B'C + A'BC + AB'C + ABC", cells: [1,2,5,6] },
  { eq: "F = A'B'C' + A'B'C + A'BC + A'BC'", cells: [0,1,2,3] },
  { eq: "F = AB'C' + AB'C + ABC + ABC'", cells: [4,5,6,7] },
  { eq: "F = A'B'C' + AB'C' + AB'C + ABC'", cells: [0,4,5,7] },
  { eq: "F = A'B'C + AB'C + ABC + ABC'", cells: [1,5,6,7] },
  { eq: "F = A'BC + ABC + AB'C' + AB'C", cells: [2,6,4,5] },
  { eq: "F = A'BC' + ABC' + AB'C' + AB'C", cells: [3,7,4,5] },
  { eq: "F = A'B'C' + A'B'C + AB'C' + AB'C + ABC + ABC'", cells: [0,1,4,5,6,7] },
  { eq: "F = A'B'C' + A'B'C + A'BC + A'BC' + AB'C' + AB'C + ABC + ABC'", cells: [0,1,2,3,4,5,6,7] },
  { eq: "F = 1", cells: [0,1,2,3,4,5,6,7] },
  { eq: "F = 0", cells: [] },
  { eq: "F = A'", cells: [0,1,2,3] },
  { eq: "F = A", cells: [4,5,6,7] },
  { eq: "F = B'", cells: [0,1,4,5] },
  { eq: "F = B", cells: [2,3,6,7] },
  { eq: "F = C'", cells: [0,3,4,7] },
  { eq: "F = C", cells: [1,2,5,6] },
  { eq: "F = A' + B'", cells: [0,1,2,3,4,5] },
  { eq: "F = A + B", cells: [2,3,4,5,6,7] },
  { eq: "F = A' + C'", cells: [0,1,2,3,4,7] },
  { eq: "F = A + C", cells: [1,2,3,4,5,6] },
  { eq: "F = B' + C'", cells: [0,1,3,4,5,7] },
  { eq: "F = B + C", cells: [1,2,3,5,6,7] },
  { eq: "F = A' + B + C'", cells: [0,1,2,3,4,5,7] },
  { eq: "F = A + B' + C", cells: [1,2,3,4,5,6,7] },
  { eq: "F = (A'B')'", cells: [1,2,3,4,5,6,7] },
  { eq: "F = (ABC)'", cells: [0,1,2,3,4,5,7] },
  { eq: "F = (A'B'C')'", cells: [1,2,3,4,5,6,7] },
  { eq: "F = (A' + B' + C')'", cells: [6] },
  { eq: "F = (A + B + C)'", cells: [0] },
  { eq: "F = (A' + B + C)'", cells: [2] },
  { eq: "F = (A + B' + C')'", cells: [5] },
  { eq: "F = AB + BC' + AC", cells: [6,7,2,3,4,5] },
  { eq: "F = A'B + AB' + BC", cells: [1,2,5,6] },
  { eq: "F = AB + AC' + B'C", cells: [5,6,7,1,2] },
  { eq: "F = A'B'C + AB'C' + ABC", cells: [1,4,6] },
  { eq: "F = (A + B)(B' + C)", cells: [1,2,3,4,5,6,7] },
  { eq: "F = (A' + C)(B + C')", cells: [0,1,2,3,4,7] },
  { eq: "F = (A'B + AC)'", cells: [0,1,3,4,5,7] },
  { eq: "F = (AB' + BC)'", cells: [0,1,3,4,7] },
  { eq: "F = (A'B'C' + AB'C)'", cells: [0,5] },
  { eq: "F = (A'B'C + AB'C' + ABC)'", cells: [0,2,3,4,5,7] },
];

const getCellsFromEquation2Var = (eq) => parse2VarEquation(eq);

const getCellsFromEquation3Var = (eq) => parse3VarEquation(eq);

const getDefaultCells = (gridType) => Array(gridType === '2var' ? 4 : 8).fill(0);

const getGameLevels = (gridType) => gridType === '2var' ? GAME_LEVELS_2VAR : GAME_LEVELS_3VAR;

const LOCALSTORAGE_KEY = 'kmap_game_level';

const KMapGrid = () => {
  const [mode, setMode] = useState('custom'); // 'custom' or 'game'
  const [gridType, setGridType] = useState('2var');
  const [cells, setCells] = useState(getDefaultCells('2var'));
  const [hoveredCell, setHoveredCell] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [equation, setEquation] = useState('F = A\'B + AB\'');
  const [inputValue, setInputValue] = useState('F = A\'B + AB\'');
  const [inputError, setInputError] = useState('');
  const [gameLevel, setGameLevel] = useState(0);
  const [gameFeedback, setGameFeedback] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);

  const exampleEquations = {
    twoVariables: [
      "F = A'B + AB'",
      "F = A + B",
      "F = A' + B'",
      "F = AB + A'B'",
      "F = A'B + AB' + AB"
    ],
    threeVariables: [
      "F = A'B'C' + A'BC + ABC",
      "F = A'B' + BC' + AC",
      "F = A'B'C + AB'C' + ABC",
      "F = A'B' + B'C + AC'",
      "F = A'B'C' + A'BC' + ABC'"
    ]
  };

  const steps = [
    {
      title: "Step 1: Equation Select Karein",
      content: "Pehle example equations mein se ek select karein ya apna equation enter karein"
    },
    {
      title: "Step 2: Grid Size Select Karein",
      content: "Two variables ke liye 2x2 grid, three variables ke liye 4x2 grid select karein"
    },
    {
      title: "Step 3: Values Check Karein",
      content: "Equation se values automatically set ho jayengi. Agar koi value galat hai to manually change kar sakte hain."
    },
    {
      title: "Step 4: Groups Banayein",
      content: "1s ko groups mein organize karein. Groups adjacent cells ke honge aur har group mein cells ki taadad 2 ki power honi chahiye."
    }
  ];

  // Load game progress from localStorage
  useEffect(() => {
    if (mode === 'game') {
      const saved = localStorage.getItem(LOCALSTORAGE_KEY + '_' + gridType);
      if (saved) setGameLevel(Number(saved));
      else setGameLevel(0);
      setGameFeedback('');
      setCells(getDefaultCells(gridType));
    }
  }, [mode, gridType]);

  // Reset cells and equation on gridType/mode change
  useEffect(() => {
    if (mode === 'custom') {
      setCells(getDefaultCells(gridType));
      setInputValue(gridType === '2var' ? "F = A'B + AB'" : "F = A'B'C' + AB'C");
      setEquation(gridType === '2var' ? "F = A'B + AB'" : "F = A'B'C' + AB'C");
      setInputError('');
    }
  }, [gridType, mode]);

  const handleCellClick = (index) => {
    if (mode === 'game' && gameFeedback === 'correct') return; // lock after correct
    const newCells = [...cells];
    newCells[index] = cells[index] === 0 ? 1 : 0;
    setCells(newCells);
    setGameFeedback('');
  };

  const handleEquationSubmit = (e) => {
    e.preventDefault();
    let newCells;
    try {
      if (gridType === '2var') {
        newCells = parse2VarEquation(inputValue);
        if (!newCells.some(x => x === 1)) throw new Error();
      } else {
        newCells = parse3VarEquation(inputValue);
        if (!newCells.some(x => x === 1)) throw new Error();
      }
      setCells(newCells);
      setEquation(inputValue);
      setInputError('');
    } catch {
      setInputError('Invalid equation or format. Try: F = A\'B + AB\'');
    }
  };

  // Game mode: check user's solution
  const handleGameCheck = () => {
    const levels = getGameLevels(gridType);
    const level = levels[gameLevel];
    if (!level) return;
    // Compare cells
    const userCells = cells;
    const correctCells = getDefaultCells(gridType);
    level.cells.forEach(idx => { correctCells[idx] = 1; });
    const isCorrect = userCells.every((v, i) => v === correctCells[i]);
    if (isCorrect) {
      setGameFeedback('correct');
      setShowCongrats(true);
      // Save progress
      if (gameLevel + 1 > (Number(localStorage.getItem(LOCALSTORAGE_KEY + '_' + gridType)) || 0)) {
        localStorage.setItem(LOCALSTORAGE_KEY + '_' + gridType, String(gameLevel + 1));
      }
    } else {
      setGameFeedback('wrong');
    }
  };

  // Game mode: auto-solve for current level
  const handleGameSolve = () => {
    const levels = getGameLevels(gridType);
    const level = levels[gameLevel];
    if (!level) return;
    const correctCells = getDefaultCells(gridType);
    level.cells.forEach(idx => { correctCells[idx] = 1; });
    setCells(correctCells);
    setGameFeedback('correct');
    // Save progress
    if (gameLevel + 1 > (Number(localStorage.getItem(LOCALSTORAGE_KEY + '_' + gridType)) || 0)) {
      localStorage.setItem(LOCALSTORAGE_KEY + '_' + gridType, String(gameLevel + 1));
    }
  };

  const handleGameNext = () => {
    setGameLevel(lvl => lvl + 1);
    setCells(getDefaultCells(gridType));
    setGameFeedback('');
  };

  const handleCongratsOk = () => {
    setShowCongrats(false);
    handleGameNext();
  };

  // Minimal, clean 2-variable K-map
  const render2VarGrid = () => {
    const groupBoxes = get2VarGroupBoxes(cells);
    // For each cell, find which groups it belongs to (can be more than one)
    const cellGroups = [[], [], [], []];
    groupBoxes.forEach((group, gIdx) => {
      group.cells.forEach(idx => {
        cellGroups[idx].push({ ...group, groupIdx: gIdx });
      });
    });
    return (
      <div className="inline-block bg-white rounded-2xl shadow p-6 border border-gray-200">
        <div className="flex justify-center mb-3">
          <span className="w-12"></span>
          <span className="w-16 text-center font-semibold text-gray-700">B̅</span>
          <span className="w-16 text-center font-semibold text-gray-700">B</span>
        </div>
        <div className="flex">
          <div className="flex flex-col">
            <span className="h-16 flex items-center font-semibold text-gray-700">A̅</span>
            <span className="h-16 flex items-center font-semibold text-gray-700">A</span>
          </div>
          <div>
            {[0, 1].map(row => (
              <div className="flex" key={row}>
                {[0, 1].map(col => {
                  const idx = row * 2 + col;
                  // Compose border classes for all groups this cell is in
                  const borderClasses = cellGroups[idx].map(g => `${g.color} border-2`).join(' ');
                  // If in multiple groups, use border-4
                  const borderWidth = cellGroups[idx].length > 1 ? 'border-4' : 'border-2';
                  return (
                    <motion.div
                      key={col}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-16 h-16 m-2 rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 shadow-sm
                        ${cells[idx] === 1 ? 'text-purple-700 font-bold' : 'hover:bg-purple-50 text-purple-700'}
                        ${hoveredCell === idx ? 'ring-2 ring-purple-200' : ''}
                        ${borderClasses} ${borderWidth}`}
                      onClick={() => handleCellClick(idx)}
                      onMouseEnter={() => setHoveredCell(idx)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span className="text-xs font-medium mb-1">{kmap2Labels[idx].label}</span>
                      <span className="text-2xl font-bold leading-none">{cells[idx]}</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Minimal, clean 3-variable K-map (textbook style headings)
  const render3VarGrid = () => {
    const groupBoxes = get3VarGroupBoxes(cells);
    // For each cell, find which groups it belongs to (can be more than one)
    const cellGroups = Array(8).fill(null).map(() => []);
    groupBoxes.forEach((group, gIdx) => {
      group.cells.forEach(idx => {
        cellGroups[idx].push({ ...group, groupIdx: gIdx });
      });
    });
    return (
      <div className="inline-block bg-white rounded-2xl shadow p-6 border border-gray-200">
        {/* Top B headings */}
        <div className="flex justify-center mb-1">
          <span className="w-12"></span>
          {bLabels.map((b, i) => (
            <span key={i} className="w-16 text-center font-semibold text-gray-700">{b}</span>
          ))}
        </div>
        {/* Grid */}
        <div className="flex">
          <div className="flex flex-col">
            <span className="h-16 flex items-center font-semibold text-gray-700">A̅</span>
            <span className="h-16 flex items-center font-semibold text-gray-700">A</span>
          </div>
          <div>
            {[0, 1].map(row => (
              <div className="flex" key={row}>
                {grayCodeOrder.map((col, i) => {
                  const idx = row * 4 + col;
                  const label = kmap3Labels[row][i].label;
                  // Compose border classes for all groups this cell is in
                  const borderClasses = cellGroups[idx].map(g => `${g.color} border-2`).join(' ');
                  const borderWidth = cellGroups[idx].length > 1 ? 'border-4' : 'border-2';
                  return (
                    <motion.div
                      key={col}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-16 h-16 m-2 rounded-lg bg-white flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 shadow-sm
                        ${cells[idx] === 1 ? 'text-purple-700 font-bold' : 'hover:bg-purple-50 text-purple-700'}
                        ${hoveredCell === idx ? 'ring-2 ring-purple-200' : ''}
                        ${borderClasses} ${borderWidth}`}
                      onClick={() => handleCellClick(idx)}
                      onMouseEnter={() => setHoveredCell(idx)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span className="text-xs font-medium mb-1">{label}</span>
                      <span className="text-2xl font-bold leading-none">{cells[idx]}</span>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Bottom C headings */}
        <div className="flex justify-center mt-1">
          <span className="w-12"></span>
          {cLabels.map((c, i) => (
            <span key={i} className="w-16 text-center font-semibold text-gray-700">{c}</span>
          ))}
        </div>
      </div>
    );
  };

  // Always show result below grid
  const resultObj = gridType === '2var'
    ? simplify2VarKMapWithGroups(cells)
    : simplify3VarKMapWithGroups(cells);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Modal: Congratulation after correct answer */}
      {showCongrats && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center border-2 border-purple-300">
            <div className="text-2xl font-bold text-purple-700 mb-2">🎉</div>
            <div className="text-lg font-semibold text-gray-800 mb-2">Congratulation Tehreem!</div>
            <div className="text-sm text-gray-600 mb-4">Abb agla level bhi complete karo, K-Map ko expert karney ke liye.</div>
            <button
              onClick={handleCongratsOk}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
            >
              OK
            </button>
          </div>
        </motion.div>
      )}
      {/* Mode Toggle */}
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setMode('custom')}
          className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${mode === 'custom' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
        >
          Custom Mode
        </button>
        <button
          onClick={() => setMode('game')}
          className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${mode === 'game' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
        >
          Game Mode
        </button>
      </div>

      {/* Equation Input or Game Level */}
      {mode === 'custom' ? (
        <form onSubmit={handleEquationSubmit} className="mb-4 flex flex-col items-center">
          <label className="block text-sm font-semibold text-purple-700 mb-1">Enter Boolean Equation:</label>
          <div className="flex w-full max-w-xs">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={gridType === '2var' ? "F = A'B + AB'" : "F = A'B'C' + AB'C"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded-r-md text-sm font-semibold hover:bg-purple-600 transition-colors"
            >
              Solve
            </button>
          </div>
          {inputError && <div className="text-xs text-red-500 mt-1">{inputError}</div>}
          <div className="text-xs text-gray-500 mt-1">Sample: {gridType === '2var' ? "F = A'B + AB'" : "F = A'B'C' + AB'C"}</div>
        </form>
      ) : (
        <div className="mb-4 flex flex-col items-center">
          <div className="text-sm font-semibold text-purple-700 mb-1">Level {gameLevel + 1}</div>
          <div className="text-base font-bold text-purple-800 mb-2">{getGameLevels(gridType)[gameLevel]?.eq || 'All levels complete!'}</div>
          {gameFeedback === 'correct' ? (
            <div className="text-green-600 font-semibold mb-2">Correct! <button onClick={handleGameNext} className="ml-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Next Level</button></div>
          ) : gameFeedback === 'wrong' ? (
            <div className="text-red-500 font-semibold mb-2">Wrong! Try again.</div>
          ) : null}
          {getGameLevels(gridType)[gameLevel] && (
            <div className="flex space-x-2 mt-2">
              <button
                onClick={handleGameCheck}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-semibold hover:bg-purple-600 transition-colors"
              >
                Check
              </button>
              <button
                onClick={handleGameSolve}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                Tum Solve Karo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid Type Toggle */}
      <div className="flex justify-center mb-4 space-x-2">
        <button
          onClick={() => setGridType('2var')}
          className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${gridType === '2var' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
        >
          2 Variables
        </button>
        <button
          onClick={() => setGridType('3var')}
          className={`px-4 py-1 rounded-lg text-sm font-semibold transition-colors ${gridType === '3var' ? 'bg-purple-500 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-purple-100'}`}
        >
          3 Variables
        </button>
      </div>

      {/* K-Map Grid */}
      <div className="flex justify-center mb-4">
        {gridType === '2var' ? render2VarGrid() : render3VarGrid()}
      </div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-green-50 p-4 rounded-xl text-center shadow border border-green-100"
      >
        <p className="text-sm font-semibold text-green-800 mb-1">Result:</p>
        <>
          <p className="text-lg font-mono text-green-700 mb-2">{resultObj.expr}</p>
          {resultObj.groups.length > 0 && (
            <div className="text-xs text-green-900 text-left max-w-xs mx-auto">
              <span className="font-semibold">Groups:</span>
              <ul className="list-disc list-inside mt-1">
                {resultObj.groups.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      </motion.div>

      {/* Stepper/Instructions Card */}
      <div className="bg-white rounded-xl shadow p-5 mb-4 max-w-lg mx-auto border border-purple-100">
        <div className="flex items-center mb-2">
          <span className="text-purple-700 font-semibold mr-2">{steps[currentStep].title}</span>
          <div className="flex space-x-1 ml-auto">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${currentStep === idx ? 'bg-purple-400' : 'bg-purple-200'}`}
              />
            ))}
          </div>
        </div>
        <div className="text-gray-600 text-sm mb-1">{steps[currentStep].content}</div>
      </div>

      <div className="mt-2 text-center text-xs text-gray-400">
        Cell par tap karke value change karein (0 ↔ 1)
      </div>
    </div>
  );
};

export default KMapGrid; 