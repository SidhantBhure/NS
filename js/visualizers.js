/**
 * Visualizers Engine
 * Generates HTML/DOM elements for step-by-step graphical cipher displays.
 */

const Visualizers = {
  // Playfair 5x5 Matrix Visualizer
  renderPlayfair: (keyword) => {
    try {
      const grid = window.CryptoEngine.Playfair.generateMatrix(keyword || 'KEYWORD');
      let html = `<div class="visualizer-container">
        <h4 class="vis-title"><i class="fas fa-th"></i> Playfair 5x5 Key Matrix (J merged with I)</h4>
        <div class="playfair-grid">`;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const letter = grid[r][c];
          const isKeyLetter = keyword ? keyword.toUpperCase().includes(letter) : false;
          html += `<div class="grid-cell ${isKeyLetter ? 'highlight-key' : ''}">${letter}</div>`;
        }
      }
      html += `</div></div>`;
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // Hill 2x2 Matrix & Modular Math Visualizer
  renderHill: (keyStr) => {
    try {
      const keyInfo = window.CryptoEngine.Hill.parseKeyMatrix(keyStr || '5,8,17,3');
      const m = keyInfo.matrix;
      const invM = keyInfo.invMatrix;

      return `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-calculator"></i> Hill Cipher 2x2 Matrix Breakdown</h4>
          <div class="hill-matrices">
            <div class="matrix-card">
              <h5>Encryption Key Matrix K</h5>
              <div class="matrix-box">
                <div class="matrix-row"><span>${m[0][0]}</span><span>${m[0][1]}</span></div>
                <div class="matrix-row"><span>${m[1][0]}</span><span>${m[1][1]}</span></div>
              </div>
              <p class="matrix-meta">det(K) = ${keyInfo.det} (mod 26)</p>
            </div>

            <div class="matrix-card">
              <h5>Modular Inverse K⁻¹</h5>
              <div class="matrix-box inverse">
                <div class="matrix-row"><span>${invM[0][0]}</span><span>${invM[0][1]}</span></div>
                <div class="matrix-row"><span>${invM[1][0]}</span><span>${invM[1][1]}</span></div>
              </div>
              <p class="matrix-meta">det⁻¹ = ${keyInfo.detInv} (mod 26)</p>
            </div>
          </div>
        </div>
      `;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // Rail Fence Zigzag Grid Visualizer
  renderRailFence: (text, rails) => {
    try {
      const depth = parseInt(rails, 10) || 3;
      const cleanText = text || 'NETWORKSECURITY';
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
          <h4 class="vis-title"><i class="fas fa-stream"></i> Rail Fence Zigzag Path Matrix</h4>
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

  // Columnar Transposition Visualizer
  renderColumnar: (text, key) => {
    try {
      const rawKey = key ? key.toString().trim() : 'SECRET';
      const isNumeric = /^[\d\s,]+$/.test(rawKey);

      let keyOrder = [];
      let numCols = 0;
      let headers = [];

      if (isNumeric) {
        keyOrder = window.CryptoEngine.ColumnarTransposition.getKeyOrder(rawKey);
        numCols = keyOrder.length;
        headers = Array.from({ length: numCols }, (_, i) => `C${i + 1}`);
      } else {
        const cleanKey = window.CryptoEngine.cleanAlphabet(rawKey || 'SECRET');
        if (!cleanKey) return `<div class="vis-error">Enter a valid keyword or numeric order for Columnar Transposition.</div>`;
        numCols = cleanKey.length;
        headers = cleanKey.split('');
        keyOrder = window.CryptoEngine.ColumnarTransposition.getKeyOrder(cleanKey);
      }

      let cleanText = window.CryptoEngine.cleanAlphabet(text || 'NETWORKSECURITY');
      const numRows = Math.ceil((cleanText.length || 1) / numCols);
      while (cleanText.length < numRows * numCols) {
        cleanText += 'X';
      }

      // Build read sequence summary string e.g., "Read 1st: Col 3 ➔ Read 2nd: Col 1..."
      const readSequence = keyOrder.map((colIdx, rank) => `<span class="chip key-chip">Step ${rank + 1}: ${headers[colIdx]} (Col ${colIdx + 1})</span>`).join(' <i class="fas fa-arrow-right" style="font-size:10px; color:var(--text-dim);"></i> ');

      let html = `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-columns"></i> Columnar Transposition Grid & Readout Sequence</h4>
          <div style="margin-bottom:14px; font-size:12px; color:var(--text-muted);">
            <strong>Column Extraction Order:</strong>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:6px;">${readSequence}</div>
          </div>
          <div class="columnar-scroll">
            <table class="columnar-table">
              <thead>
                <tr class="key-row">
                  <th style="width:60px; font-size:11px; color:var(--text-dim);">Row #</th>
                  ${headers.map((h, colIdx) => {
                    const readRank = keyOrder.indexOf(colIdx) + 1;
                    return `<th>${h}<div class="order-badge">Read #${readRank}</div></th>`;
                  }).join('')}
                </tr>
              </thead>
              <tbody>
      `;

      for (let r = 0; r < numRows; r++) {
        html += `<tr><td style="font-size:11px; color:var(--text-dim); font-weight:600; text-align:center;">Row ${r + 1}</td>`;
        for (let c = 0; c < numCols; c++) {
          html += `<td>${cleanText[r * numCols + c]}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table></div></div>`;
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  },

  // Vigenère Stream Visualizer
  renderVigenere: (text, key) => {
    try {
      const cleanKey = window.CryptoEngine.cleanAlphabet(key || 'KEY');
      const cleanText = window.CryptoEngine.cleanAlphabet(text || 'NETWORKSECURITY');

      if (!cleanKey) return `<div class="vis-error">Enter a valid key for Vigenere.</div>`;

      let keyStream = '';
      for (let i = 0; i < cleanText.length; i++) {
        keyStream += cleanKey[i % cleanKey.length];
      }

      let html = `
        <div class="visualizer-container">
          <h4 class="vis-title"><i class="fas fa-key"></i> Vigenère Keystream Alignment</h4>
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
      return html;
    } catch (e) {
      return `<div class="vis-error">${e.message}</div>`;
    }
  }
};

window.Visualizers = Visualizers;
