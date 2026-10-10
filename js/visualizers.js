/**
 * Visualizers Engine
 * Generates interactive HTML / DOM visualizations for cipher structures,
 * matrices, keystreams, paths, and mapping tables.
 */

const Visualizers = {
  // 1. Caesar Shift Strip Visualizer
  renderCaesar: (shiftVal) => {
    try {
      const shift = ((parseInt(shiftVal, 10) % 26) + 26) % 26 || 0;
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const shifted = alpha.map((_, i) => alpha[(i + shift) % 26]);

      return `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-arrows-alt-h"></i> Caesar Shift Alphabet Alignment (Shift = ${shift})</h4>
          <div style="overflow-x:auto; padding:10px 0;">
            <div style="display:flex; flex-direction:column; gap:6px; min-width:650px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:70px; font-size:11px; font-weight:700; color:var(--text-dim);">PLAIN:</span>
                <div style="display:flex; gap:4px; flex:1;">
                  ${alpha.map(c => `<span class="cell-mini">${c}</span>`).join('')}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:70px; font-size:11px; font-weight:700; color:var(--accent-cyan);">CIPHER:</span>
                <div style="display:flex; gap:4px; flex:1;">
                  ${shifted.map(c => `<span class="cell-mini highlight">${c}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 2. Monoalphabetic Substitution Mapping Table
  renderMonoalphabetic: (key) => {
    try {
      const validation = window.CryptoEngine.Monoalphabetic.validateKey(key);
      const cleanKey = validation.valid ? validation.cleanKey : 'QWERTYUIOPASDFGHJKLZXCVBNM';
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      return `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-exchange-alt"></i> Monoalphabetic Substitution Key Mapping</h4>
          <div style="overflow-x:auto; padding:10px 0;">
            <div style="display:flex; flex-direction:column; gap:6px; min-width:650px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:70px; font-size:11px; font-weight:700; color:var(--text-dim);">PLAIN:</span>
                <div style="display:flex; gap:4px; flex:1;">
                  ${alpha.map(c => `<span class="cell-mini">${c}</span>`).join('')}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="width:70px; font-size:11px; font-weight:700; color:var(--accent-purple);">CIPHER:</span>
                <div style="display:flex; gap:4px; flex:1;">
                  ${cleanKey.split('').map(c => `<span class="cell-mini highlight-purple">${c}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 3. Playfair 5x5 Matrix Visualizer
  renderPlayfair: (keyword) => {
    try {
      const cleanKey = window.CryptoEngine.cleanAlphabet(keyword || 'KEYWORD');
      const grid = window.CryptoEngine.Playfair.generateMatrix(cleanKey || 'MONARCHY');
      const keySet = new Set(cleanKey.replace(/J/g, 'I').split(''));

      let html = `
        <div class="visualizer-container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h4 class="vis-title" style="margin:0;"><i class="fas fa-th"></i> Playfair 5×5 Matrix Grid</h4>
            <span class="preset-pill" style="font-size:10px; color:var(--accent-cyan);"><i class="fas fa-info-circle"></i> 'I' & 'J' Combined</span>
          </div>
          <div class="playfair-grid">
      `;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const letter = grid[r][c];
          const isKeyLetter = keySet.has(letter);
          html += `<div class="grid-cell ${isKeyLetter ? 'highlight-key' : ''}">${letter}</div>`;
        }
      }
      html += `</div>
        <p style="font-size:11px; color:var(--text-dim); margin-top:10px; text-align:center;">
          Highlighted letters originate directly from keyword. Remaining cells populated with unassigned A-Z letters (excluding J).
        </p>
      </div>`;
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 4. Hill 2x2 Matrix & Determinant Breakdown
  renderHill: (keyInput) => {
    try {
      const keyInfo = window.CryptoEngine.Hill.parseKeyMatrix(keyInput || '5,8,17,3');
      const m = keyInfo.matrix;
      const invM = keyInfo.invMatrix;

      return `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-calculator"></i> Hill Cipher 2×2 Matrix & Modular Arithmetic</h4>
          <div class="hill-matrices">
            <div class="matrix-card">
              <h5>Encryption Matrix K</h5>
              <div class="matrix-box">
                <div class="matrix-row"><span>${m[0][0]}</span><span>${m[0][1]}</span></div>
                <div class="matrix-row"><span>${m[1][0]}</span><span>${m[1][1]}</span></div>
              </div>
              <p class="matrix-meta" style="color:var(--accent-cyan);">det(K) = ${keyInfo.det} (mod 26)</p>
              <p class="matrix-meta" style="color:var(--accent-emerald); font-size:11px;"><i class="fas fa-check-circle"></i> gcd(det, 26) = 1 (Coprime)</p>
            </div>

            <div class="matrix-card">
              <h5>Decryption Inverse Matrix K⁻¹</h5>
              <div class="matrix-box inverse">
                <div class="matrix-row"><span>${invM[0][0]}</span><span>${invM[0][1]}</span></div>
                <div class="matrix-row"><span>${invM[1][0]}</span><span>${invM[1][1]}</span></div>
              </div>
              <p class="matrix-meta" style="color:var(--accent-purple);">det⁻¹ = ${keyInfo.detInv} (mod 26)</p>
              <p class="matrix-meta" style="font-size:11px; color:var(--text-dim);">(K · K⁻¹ = I₂ mod 26)</p>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 5. Rail Fence Zigzag Path Matrix
  renderRailFence: (text, rails) => {
    try {
      const depth = Math.max(2, parseInt(rails, 10) || 3);
      const cleanText = text && text.trim().length > 0 ? text : 'NETWORKSECURITY';
      const matrix = Array.from({ length: depth }, () => Array(cleanText.length).fill('.'));

      let rail = 0;
      let direction = 1;
      for (let i = 0; i < cleanText.length; i++) {
        matrix[rail][i] = cleanText[i];
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      let html = `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-stream"></i> Rail Fence Zigzag Path Matrix (${depth} Rails)</h4>
          <div class="rail-grid-scroll">
            <table class="rail-table">
      `;
      for (let r = 0; r < depth; r++) {
        html += `<tr><td class="rail-header">Rail ${r + 1}</td>`;
        for (let c = 0; c < cleanText.length; c++) {
          const char = matrix[r][c];
          const active = char !== '.';
          html += `<td class="rail-cell ${active ? 'rail-active' : 'rail-empty'}">${active ? char : ''}</td>`;
        }
        html += `</tr>`;
      }
      html += `</table></div></div>`;
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 6. Columnar Transposition Grid & Extraction Order
  renderColumnar: (text, key, padWithX = false) => {
    try {
      const rawKey = (key || 'SECRET').toString().trim();
      const isNumeric = /^[\d\s,]+$/.test(rawKey);

      let keyOrder = [];
      let numCols = 0;
      let headers = [];

      if (isNumeric) {
        keyOrder = window.CryptoEngine.ColumnarTransposition.getKeyOrder(rawKey);
        numCols = keyOrder.length;
        headers = Array.from({ length: numCols }, (_, i) => `Col ${i + 1}`);
      } else {
        const cleanKey = window.CryptoEngine.cleanAlphabet(rawKey || 'SECRET');
        if (!cleanKey) return `<div class="vis-error">Enter a valid keyword or numeric column order.</div>`;
        numCols = cleanKey.length;
        headers = cleanKey.split('');
        keyOrder = window.CryptoEngine.ColumnarTransposition.getKeyOrder(cleanKey);
      }

      let cleanText = window.CryptoEngine.cleanAlphabet(text || 'NETWORKSECURITY');
      if (!cleanText) cleanText = 'NETWORKSECURITY';

      const numRows = Math.ceil(cleanText.length / numCols);
      if (padWithX) {
        const paddedLength = numRows * numCols;
        cleanText = cleanText.padEnd(paddedLength, 'X');
      }

      const readSequence = keyOrder.map((colIdx, rank) =>
        `<span class="chip key-chip">Step ${rank + 1}: ${headers[colIdx]}</span>`
      ).join(' <i class="fas fa-arrow-right" style="font-size:10px; color:var(--text-dim);"></i> ');

      let html = `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-columns"></i> Columnar Transposition Matrix Grid</h4>
          <div style="margin-bottom:12px; font-size:12px; color:var(--text-muted);">
            <strong>Column Reading Sequence:</strong>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:6px;">${readSequence}</div>
          </div>
          <div class="columnar-scroll">
            <table class="columnar-table">
              <thead>
                <tr class="key-row">
                  <th style="width:60px; font-size:11px; color:var(--text-dim);">Row</th>
                  ${headers.map((h, colIdx) => {
                    const readRank = keyOrder.indexOf(colIdx) + 1;
                    return `<th>${h}<div class="order-badge">#${readRank}</div></th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
      `;

      for (let r = 0; r < numRows; r++) {
        html += `<tr><td style="font-size:11px; color:var(--text-dim); text-align:center;">R${r + 1}</td>`;
        for (let c = 0; c < numCols; c++) {
          const idx = r * numCols + c;
          const char = idx < cleanText.length ? cleanText[idx] : '<span style="color:var(--text-dim);">-</span>';
          html += `<td>${char}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table></div></div>`;
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // 7. Vigenère Keystream Alignment
  renderVigenere: (text, key) => {
    try {
      const cleanKey = window.CryptoEngine.cleanAlphabet(key || 'KEY');
      const cleanText = window.CryptoEngine.cleanAlphabet(text || 'NETWORKSECURITY');

      if (!cleanKey) return `<div class="vis-error">Enter a valid alphabetic key for Vigenère.</div>`;

      let keyStream = '';
      for (let i = 0; i < cleanText.length; i++) {
        keyStream += cleanKey[i % cleanKey.length];
      }

      return `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-key"></i> Vigenère Keystream Repetition Alignment</h4>
          <div class="vigenere-stream-box">
            <div class="stream-row">
              <span class="row-label">Plaintext:</span>
              <div class="char-chips">${cleanText.split('').map(c => `<span class="chip text-chip">${c}</span>`).join('')}</div>
            </div>
            <div class="stream-row">
              <span class="row-label">Keystream:</span>
              <div class="char-chips">${keyStream.split('').map(k => `<span class="chip key-chip">${k}</span>`).join('')}</div>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  }
};

if (typeof window !== 'undefined') {
  window.Visualizers = Visualizers;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Visualizers;
}
