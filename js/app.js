/**
 * Classical Cryptography Toolkit — Main Application Controller
 * Ultra 3D Cyberpunk Edition
 * Wires all UI interactions, cipher engine, visualizers, benchmarks, file I/O
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   PARTICLES BACKGROUND
═══════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  const particles = [];
  const count = Math.min(60, Math.floor(W / 20));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6 ? '0,242,254' : (Math.random() > 0.5 ? '168,85,247' : '0,255,157')
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();

      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });

    // Draw connection lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,242,254,${0.04 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(drawParticles);
  }

  drawParticles();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });
})();


/* ═══════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
═══════════════════════════════════════════════════════════════ */
function showToast(msg, type = 'info', duration = 3200) {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}


/* ═══════════════════════════════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════════════════════════════ */
function activateTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

  const tab = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
  const panel = document.getElementById(tabId);
  if (tab) tab.classList.add('active');
  if (panel) {
    panel.classList.add('active');
    panel.style.animation = 'none';
    requestAnimationFrame(() => { panel.style.animation = ''; });
  }
}

document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.tab));
});

document.getElementById('brand-home-link')?.addEventListener('click', () => activateTab('dashboard-view'));

// Hero CTAs
document.querySelectorAll('.hero-cta').forEach(btn => {
  btn.addEventListener('click', () => activateTab(btn.dataset.target));
});

// Quick launch cards
document.querySelectorAll('.quick-card').forEach(card => {
  card.addEventListener('click', () => activateTab(card.dataset.jump));
  // 3D tilt on hover
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    card.style.transform = `translateY(-6px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ═══════════════════════════════════════════════════════════════
   CIPHER CONFIGURATION STATE
═══════════════════════════════════════════════════════════════ */
const cipherConfigs = {
  caesar: {
    label: 'Caesar Cipher', category: 'Substitution', categoryClass: 'badge-cyan',
    keyLabel: 'Shift Value (Integer)', keyHelp: 'Shift value must be an integer (e.g. 1–25).', defaultKey: '5',
    showSlider: true, showHill: false, showColumnar: false,
    context: '<strong>Caesar Cipher</strong>: Each letter is shifted by a fixed integer (0–25). Key space = 26. Trivially broken by brute force or frequency analysis.',
    keyGen: () => (Math.floor(Math.random() * 25) + 1).toString()
  },
  mono: {
    label: 'Monoalphabetic', category: 'Substitution', categoryClass: 'badge-cyan',
    keyLabel: '26-Char Substitution Alphabet', keyHelp: 'Enter all 26 unique letters (e.g. QWERTYUIOPASDFGHJKLZXCVBNM).',
    defaultKey: 'QWERTYUIOPASDFGHJKLZXCVBNM', showSlider: false, showHill: false, showColumnar: false,
    context: '<strong>Monoalphabetic Cipher</strong>: Each letter maps to a unique substitute letter. Key space = 26! ≈ 4×10²⁶. Breakable by letter frequency analysis.',
    keyGen: () => CryptoEngine.Monoalphabetic.generateRandomKey()
  },
  playfair: {
    label: 'Playfair Cipher', category: 'Polygraphic Substitution', categoryClass: 'badge-cyan',
    keyLabel: 'Keyword (Alphabetic)', keyHelp: 'A keyword used to build the 5×5 key matrix (J merged into I).',
    defaultKey: 'KEYWORD', showSlider: false, showHill: false, showColumnar: false,
    context: '<strong>Playfair Cipher</strong>: Encrypts letter pairs (digraphs) using a 5×5 matrix. J/I merged. Digraph frequency analysis needed to break.',
    keyGen: () => { const words = ['MONARCHY', 'SECURITY', 'CRYPTOGRAPHY', 'NETWORK', 'PLAYFAIR', 'DIAMOND']; return words[Math.floor(Math.random() * words.length)]; }
  },
  hill: {
    label: 'Hill Cipher', category: 'Polygraphic Substitution', categoryClass: 'badge-cyan',
    keyLabel: 'Hill 2×2 Matrix', keyHelp: 'Enter 4 integers (0–25). Matrix must be invertible mod 26.',
    defaultKey: '5,8,17,3', showSlider: false, showHill: true, showColumnar: false,
    context: '<strong>Hill Cipher</strong>: 2×2 matrix multiplication mod 26. Encrypts digraphs. Matrix must be invertible (gcd(det,26)=1). Broken by known-plaintext attack.',
    keyGen: () => {
      const validMatrices = [[6,24,1,13],[5,8,17,3],[3,3,2,5],[2,3,1,4],[7,4,3,6]];
      const m = validMatrices[Math.floor(Math.random() * validMatrices.length)];
      document.getElementById('hill-k11').value = m[0];
      document.getElementById('hill-k12').value = m[1];
      document.getElementById('hill-k21').value = m[2];
      document.getElementById('hill-k22').value = m[3];
      updateHillStatus();
      return null; // signals null = no key-input update
    }
  },
  vigenere: {
    label: 'Vigenère Cipher', category: 'Polyalphabetic Substitution', categoryClass: 'badge-purple',
    keyLabel: 'Alphabetic Keyword', keyHelp: 'Keyword is repeated to form the keystream (e.g. "KEYWORD").',
    defaultKey: 'KEYWORD', showSlider: false, showHill: false, showColumnar: false,
    context: '<strong>Vigenère Cipher</strong>: Polyalphabetic substitution. The keyword is repeated as a keystream. Vulnerable to Kasiski analysis and Index of Coincidence.',
    keyGen: () => { const words = ['SECRET', 'MATRIX', 'CIPHER', 'SECURE', 'NETWORK', 'QUANTUM']; return words[Math.floor(Math.random() * words.length)]; }
  },
  otp: {
    label: 'One-Time Pad', category: 'Perfect Secrecy', categoryClass: 'badge-purple',
    keyLabel: 'Random Key (same length as text)', keyHelp: 'Key must be ≥ the number of letters in the plaintext. Use Auto Key!',
    defaultKey: 'RANDOMKEYABCDEFP', showSlider: false, showHill: false, showColumnar: false,
    context: '<strong>One-Time Pad</strong>: Provably perfectly secret when key is truly random, used once, and ≥ plaintext length. Never reuse the key!',
    keyGen: () => {
      const text = document.getElementById('plaintext-input').value;
      const letterCount = (text.match(/[a-zA-Z]/g) || []).length || 16;
      return CryptoEngine.OneTimePad.generateRandomKey(Math.max(letterCount, 16));
    }
  },
  railfence: {
    label: 'Rail Fence', category: 'Transposition', categoryClass: 'badge-purple',
    keyLabel: 'Number of Rails (≥ 2)', keyHelp: 'An integer ≥ 2 specifying the number of zigzag rails.',
    defaultKey: '3', showSlider: false, showHill: false, showColumnar: false,
    context: '<strong>Rail Fence Cipher</strong>: Text is written in a zigzag across N rails. Characters are then read row by row. Easily broken by trying rail counts.',
    keyGen: () => (Math.floor(Math.random() * 4) + 2).toString()
  },
  columnar: {
    label: 'Columnar Transposition', category: 'Transposition', categoryClass: 'badge-purple',
    keyLabel: 'Keyword or Column Order', keyHelp: 'A keyword (e.g. "SECRET") or numeric order (e.g. "3,1,4,2").',
    defaultKey: 'SECRET', showSlider: false, showHill: false, showColumnar: true,
    context: '<strong>Columnar Transposition</strong>: Text is written row-by-row into a grid and columns are reordered by key alphabetical order. Key = keyword or column indices.',
    keyGen: () => { const words = ['SECRET', 'CRYPTO', 'MATRIX', 'SECURE', 'SHIELD']; return words[Math.floor(Math.random() * words.length)]; }
  }
};

let currentCipher = 'caesar';
let useFlaskBackend = false;

function updateHillStatus() {
  try {
    const k11 = parseInt(document.getElementById('hill-k11').value) || 0;
    const k12 = parseInt(document.getElementById('hill-k12').value) || 0;
    const k21 = parseInt(document.getElementById('hill-k21').value) || 0;
    const k22 = parseInt(document.getElementById('hill-k22').value) || 0;
    const rawDet = k11 * k22 - k12 * k21;
    const det = ((rawDet % 26) + 26) % 26;
    const gcd = CryptoEngine.gcd(det, 26);
    const inv = CryptoEngine.modInverse(det, 26);

    document.getElementById('hill-det-val').textContent = det;
    document.getElementById('hill-det-inv-val').textContent = inv !== null ? inv : '–';

    const badge = document.getElementById('hill-coprime-badge');
    if (gcd === 1 && inv !== null) {
      badge.className = 'badge badge-emerald';
      badge.innerHTML = '<i class="fas fa-check"></i> Coprime';
    } else {
      badge.className = 'badge badge-red';
      badge.innerHTML = '<i class="fas fa-xmark"></i> Not Invertible';
    }
  } catch (e) {}
}

function setCipherConfig(cipherId) {
  currentCipher = cipherId;
  const config = cipherConfigs[cipherId];
  if (!config) return;

  // Category badge
  const catBadge = document.getElementById('cipher-category-badge');
  catBadge.textContent = config.category;
  catBadge.className = `badge ${config.categoryClass}`;

  // Key label & help
  document.getElementById('key-input-label').textContent = config.keyLabel;
  document.getElementById('key-help-text').textContent = config.keyHelp;

  // Show/hide panels
  document.getElementById('grp-key-standard').style.display = config.showHill ? 'none' : '';
  document.getElementById('grp-key-hill').style.display = config.showHill ? '' : 'none';
  document.getElementById('caesar-slider-box').style.display = config.showSlider ? '' : 'none';
  document.getElementById('grp-key-columnar-options').style.display = config.showColumnar ? '' : 'none';

  // Context callout
  document.getElementById('cipher-context-callout').innerHTML = config.context || '';

  // Default key
  if (!config.showHill) {
    document.getElementById('key-input').value = config.defaultKey;
    if (config.showSlider) {
      const slider = document.getElementById('caesar-slider');
      slider.value = parseInt(config.defaultKey, 10) || 5;
      document.getElementById('caesar-slider-val').textContent = `Shift: ${slider.value}`;
    }
  } else {
    updateHillStatus();
  }

  // Validate key
  validateKey();
  updateCharCounts();
}

// ─── Key Validation ───
function validateKey() {
  if (currentCipher === 'hill') { return; }
  const keyVal = document.getElementById('key-input').value;
  const badge = document.getElementById('key-validation-badge');
  let valid = false;
  let msg = '';

  try {
    switch (currentCipher) {
      case 'caesar': {
        const n = parseInt(keyVal, 10);
        valid = !isNaN(n);
        msg = valid ? '' : 'Must be an integer.';
        break;
      }
      case 'mono': {
        const res = CryptoEngine.Monoalphabetic.validateKey(keyVal);
        valid = res.valid;
        msg = res.message || '';
        break;
      }
      case 'playfair':
        valid = CryptoEngine.cleanAlphabet(keyVal).length >= 2;
        msg = valid ? '' : 'Keyword must be at least 2 alphabetic characters.';
        break;
      case 'vigenere':
        valid = CryptoEngine.cleanAlphabet(keyVal).length >= 1;
        msg = valid ? '' : 'Keyword must be alphabetic.';
        break;
      case 'otp': {
        const letterCount = (document.getElementById('plaintext-input').value.match(/[a-zA-Z]/g) || []).length;
        const cleanKey = CryptoEngine.cleanAlphabet(keyVal);
        valid = cleanKey.length >= Math.max(1, letterCount);
        msg = valid ? '' : `Key too short (need ${letterCount}, have ${cleanKey.length}).`;
        break;
      }
      case 'railfence': {
        const n2 = parseInt(keyVal, 10);
        valid = !isNaN(n2) && n2 >= 2;
        msg = valid ? '' : 'Must be an integer ≥ 2.';
        break;
      }
      case 'columnar':
        valid = (keyVal.trim().length > 0);
        msg = valid ? '' : 'Key is required.';
        break;
      default: valid = true;
    }
  } catch (e) { valid = false; msg = e.message; }

  badge.className = `badge ${valid ? 'badge-emerald' : 'badge-red'}`;
  badge.innerHTML = valid ? '<i class="fas fa-check"></i> Valid' : '<i class="fas fa-xmark"></i> Invalid';
  document.getElementById('metric-key-status').textContent = valid ? 'Valid' : 'Invalid';
  document.getElementById('metric-key-status').style.color = valid ? 'var(--emerald)' : 'var(--red)';
}

function updateCharCounts() {
  const text = document.getElementById('plaintext-input').value;
  const chars = text.length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  document.getElementById('char-count-badge').textContent = `${chars} Chars`;
  document.getElementById('letter-count-badge').textContent = `${letters} Letters`;
}


/* ═══════════════════════════════════════════════════════════════
   CIPHER ENGINE — GET KEY / EXECUTE
═══════════════════════════════════════════════════════════════ */
function getKey() {
  if (currentCipher === 'hill') {
    return [
      parseInt(document.getElementById('hill-k11').value) || 0,
      parseInt(document.getElementById('hill-k12').value) || 0,
      parseInt(document.getElementById('hill-k21').value) || 0,
      parseInt(document.getElementById('hill-k22').value) || 0
    ];
  }
  return document.getElementById('key-input').value;
}

function getColPad() {
  return document.getElementById('col-pad-toggle').checked;
}

function runCipher(operation) {
  const text = document.getElementById('plaintext-input').value;
  if (!text.trim()) {
    showToast('Please enter text before encrypting/decrypting.', 'warning');
    return;
  }
  const key = getKey();
  const colPad = getColPad();
  const start = performance.now();
  let result, error;

  try {
    switch (currentCipher) {
      case 'caesar':     result = CryptoEngine.Caesar[operation](text, key); break;
      case 'mono':       result = CryptoEngine.Monoalphabetic[operation](text, key); break;
      case 'playfair':   result = CryptoEngine.Playfair[operation](text, key); break;
      case 'hill':       result = CryptoEngine.Hill[operation](text, key); break;
      case 'vigenere':   result = CryptoEngine.Vigenere[operation](text, key); break;
      case 'otp':        result = CryptoEngine.OneTimePad[operation](text, key); break;
      case 'railfence':  result = CryptoEngine.RailFence[operation](text, key); break;
      case 'columnar':   result = CryptoEngine.ColumnarTransposition[operation](text, key, colPad); break;
      default: throw new Error('Unknown cipher.');
    }
  } catch (e) { error = e.message; }

  const elapsed = (performance.now() - start).toFixed(3);

  if (error) {
    document.getElementById('status-indicator').className = 'status-indicator error';
    document.getElementById('status-indicator').innerHTML = '<i class="fas fa-circle-xmark"></i> Error';
    showToast(error, 'error');
    document.getElementById('metric-key-status').textContent = 'Error';
    document.getElementById('metric-key-status').style.color = 'var(--red)';
    return;
  }

  // Update UI
  document.getElementById('status-indicator').className = 'status-indicator ready';
  document.getElementById('status-indicator').innerHTML = '<i class="fas fa-circle-check"></i> Done';

  if (operation === 'encrypt') {
    document.getElementById('ciphertext-output').textContent = result;
    document.getElementById('output-cipher-length').textContent = `${result.length} Chars`;
    // Auto-decrypt for verification
    try {
      let dec;
      switch (currentCipher) {
        case 'caesar':    dec = CryptoEngine.Caesar.decrypt(result, key); break;
        case 'mono':      dec = CryptoEngine.Monoalphabetic.decrypt(result, key); break;
        case 'playfair':  dec = CryptoEngine.Playfair.decrypt(result, key); break;
        case 'hill':      dec = CryptoEngine.Hill.decrypt(result, key); break;
        case 'vigenere':  dec = CryptoEngine.Vigenere.decrypt(result, key); break;
        case 'otp':       dec = CryptoEngine.OneTimePad.decrypt(result, key); break;
        case 'railfence': dec = CryptoEngine.RailFence.decrypt(result, key); break;
        case 'columnar':  dec = CryptoEngine.ColumnarTransposition.decrypt(result, key, colPad); break;
      }
      document.getElementById('decrypted-output').textContent = dec || '';
      document.getElementById('output-dec-length').textContent = `${(dec || '').length} Chars`;
      const cleaned = CryptoEngine.cleanAlphabet(text);
      const decCleaned = CryptoEngine.cleanAlphabet(dec || '');
      const match = cleaned === decCleaned;
      setVerification(match ? 'match' : 'mismatch', match);
    } catch (e) {
      setVerification('mismatch', false, e.message);
    }
  } else {
    document.getElementById('decrypted-output').textContent = result;
    document.getElementById('output-dec-length').textContent = `${result.length} Chars`;
  }

  // Metrics
  document.getElementById('metric-exec-time').textContent = `${elapsed} ms`;
  const entropy = CryptoEngine.calculateEntropy(CryptoEngine.cleanAlphabet(result));
  document.getElementById('metric-entropy').textContent = `${entropy} bits`;
  document.getElementById('metric-engine').textContent = useFlaskBackend ? 'Flask' : 'JS';

  // Mini visualizer
  renderMiniVis();
}

function setVerification(state, match, errorMsg) {
  const banner = document.getElementById('verification-banner');
  const title = document.getElementById('veri-status-title');
  const desc = document.getElementById('veri-status-desc');
  banner.className = `verification-bar ${state}`;
  if (state === 'match') {
    title.innerHTML = '<i class="fas fa-shield-check"></i> Decryption Verified ✓';
    desc.textContent = 'Decryption accurately restores original plaintext.';
  } else {
    title.innerHTML = '<i class="fas fa-shield-xmark"></i> Verification Notice';
    desc.textContent = errorMsg || 'Minor difference (padding chars are expected for some ciphers).';
  }
}

// ─── Button Bindings ───
document.getElementById('btn-encrypt').addEventListener('click', () => runCipher('encrypt'));
document.getElementById('btn-decrypt').addEventListener('click', () => runCipher('decrypt'));

document.getElementById('btn-swap').addEventListener('click', () => {
  const cipherOut = document.getElementById('ciphertext-output').textContent;
  const plainIn = document.getElementById('plaintext-input').value;
  document.getElementById('plaintext-input').value = cipherOut;
  document.getElementById('ciphertext-output').textContent = plainIn;
  updateCharCounts();
  showToast('Swapped: output → input', 'info');
});

document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('plaintext-input').value = '';
  document.getElementById('ciphertext-output').textContent = '';
  document.getElementById('decrypted-output').textContent = '';
  document.getElementById('mini-vis-container').innerHTML = '';
  updateCharCounts();
  showToast('Inputs cleared.', 'info');
});

document.getElementById('btn-reset').addEventListener('click', () => {
  document.getElementById('plaintext-input').value = 'NETWORK SECURITY';
  setCipherConfig(currentCipher);
  showToast('Reset to defaults.', 'info');
});

// ─── Auto Key Gen ───
document.getElementById('btn-gen-key').addEventListener('click', () => {
  const config = cipherConfigs[currentCipher];
  if (!config) return;
  const newKey = config.keyGen();
  if (newKey !== null && newKey !== undefined) {
    document.getElementById('key-input').value = newKey;
    if (config.showSlider) {
      document.getElementById('caesar-slider').value = parseInt(newKey, 10) || 5;
      document.getElementById('caesar-slider-val').textContent = `Shift: ${parseInt(newKey, 10) || 5}`;
    }
  }
  validateKey();
  showToast(`Auto-generated key for ${config.label}.`, 'success');
});

// Caesar slider sync
document.getElementById('caesar-slider').addEventListener('input', e => {
  const val = e.target.value;
  document.getElementById('key-input').value = val;
  document.getElementById('caesar-slider-val').textContent = `Shift: ${val}`;
  validateKey();
});

document.getElementById('key-input').addEventListener('input', () => {
  if (currentCipher === 'caesar') {
    const val = parseInt(document.getElementById('key-input').value, 10);
    if (!isNaN(val) && val >= 0 && val <= 25) {
      document.getElementById('caesar-slider').value = val;
      document.getElementById('caesar-slider-val').textContent = `Shift: ${val}`;
    }
  }
  validateKey();
});

// Hill inputs
['hill-k11','hill-k12','hill-k21','hill-k22'].forEach(id => {
  document.getElementById(id).addEventListener('input', updateHillStatus);
});

// Columnar pad toggle
document.getElementById('col-pad-toggle').addEventListener('change', () => {
  const checked = document.getElementById('col-pad-toggle').checked;
  document.getElementById('col-pad-mode-label').textContent = checked ? 'Pad with X' : 'Exact Incomplete Rows';
});

// Cipher select
document.getElementById('cipher-select').addEventListener('change', e => {
  setCipherConfig(e.target.value);
});

// Plaintext input
document.getElementById('plaintext-input').addEventListener('input', () => {
  updateCharCounts();
  validateKey();
});

// Preset pills
document.querySelectorAll('.preset-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.getElementById('plaintext-input').value = pill.dataset.preset;
    updateCharCounts();
    validateKey();
  });
});

// Copy buttons
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (!target) return;
    const text = target.textContent.trim();
    if (!text) { showToast('Nothing to copy.', 'warning'); return; }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Copy failed — check browser permissions.', 'error');
    });
  });
});

// Download ciphertext
document.getElementById('btn-download-ciphertext').addEventListener('click', () => {
  const text = document.getElementById('ciphertext-output').textContent.trim();
  if (!text) { showToast('No ciphertext to download.', 'warning'); return; }
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `ciphertext_${currentCipher}_${Date.now()}.txt`;
  a.click();
  showToast('Ciphertext downloaded.', 'success');
});

// Engine toggle
document.getElementById('engine-status-toggle').addEventListener('click', () => {
  useFlaskBackend = !useFlaskBackend;
  document.getElementById('engine-mode-text').textContent = useFlaskBackend ? 'Flask API' : 'JS Engine';
  document.getElementById('metric-engine').textContent = useFlaskBackend ? 'Flask' : 'JS';
  document.querySelector('.engine-dot').style.background = useFlaskBackend ? 'var(--purple)' : 'var(--emerald)';
  showToast(`Switched to ${useFlaskBackend ? 'Python Flask Backend' : 'Client-side JS Engine'}.`, 'info');
});


/* ═══════════════════════════════════════════════════════════════
   MINI VISUALIZER (inline in playground)
═══════════════════════════════════════════════════════════════ */
function renderMiniVis() {
  const container = document.getElementById('mini-vis-container');
  if (!container) return;
  container.innerHTML = '';
  try {
    const text = document.getElementById('plaintext-input').value;
    const key = document.getElementById('key-input').value;
    switch (currentCipher) {
      case 'playfair': {
        const grid = CryptoEngine.Playfair.generateMatrix(CryptoEngine.cleanAlphabet(key));
        container.innerHTML = `<p style="font-size:10px; color:var(--text-dim); margin-bottom:8px; letter-spacing:0.1em; text-transform:uppercase;">Playfair 5×5 Key Matrix</p>`;
        const gridEl = document.createElement('div');
        gridEl.style.cssText = 'display:grid; grid-template-columns:repeat(5,40px); gap:3px;';
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.style.cssText = 'width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:15px;font-weight:700;color:var(--cyan);background:rgba(0,242,254,0.06);border:1px solid rgba(0,242,254,0.12);border-radius:6px;';
            cell.textContent = grid[r][c];
            gridEl.appendChild(cell);
          }
        }
        container.appendChild(gridEl);
        break;
      }
      case 'caesar': {
        const shift = parseInt(key, 10) || 5;
        container.innerHTML = `<p style="font-size:10px; color:var(--text-dim); margin-bottom:8px; letter-spacing:0.1em; text-transform:uppercase;">Caesar Shift Strip (shift=${shift})</p>`;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; flex-wrap:wrap; gap:2px;';
        for (let i = 0; i < 26; i++) {
          const orig = String.fromCharCode(65 + i);
          const shifted = String.fromCharCode(((i + shift) % 26) + 65);
          const cell = document.createElement('div');
          cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:1px;';
          cell.innerHTML = `<span style="font-family:var(--font-mono);font-size:10px;color:var(--cyan);background:rgba(0,242,254,0.06);border:1px solid rgba(0,242,254,0.12);border-radius:4px;padding:3px 5px;">${orig}</span><span style="font-size:9px;color:var(--text-dim);">↓</span><span style="font-family:var(--font-mono);font-size:10px;color:var(--emerald);background:rgba(0,255,157,0.06);border:1px solid rgba(0,255,157,0.12);border-radius:4px;padding:3px 5px;">${shifted}</span>`;
          row.appendChild(cell);
        }
        container.appendChild(row);
        break;
      }
      case 'vigenere': {
        const cleanKey = CryptoEngine.cleanAlphabet(key);
        const cleanText = CryptoEngine.cleanAlphabet(text).slice(0, 20);
        if (!cleanKey || !cleanText) break;
        container.innerHTML = `<p style="font-size:10px; color:var(--text-dim); margin-bottom:8px; letter-spacing:0.1em; text-transform:uppercase;">Vigenère Keystream Alignment</p>`;
        const table = document.createElement('div');
        table.style.cssText = 'display:flex; flex-direction:column; gap:3px; overflow-x:auto;';
        const labels = ['Plaintext', 'Key', 'Ciphertext'];
        const colors = ['var(--cyan)', 'var(--purple)', 'var(--emerald)'];
        const bgs = ['rgba(0,242,254,0.06)', 'rgba(168,85,247,0.06)', 'rgba(0,255,157,0.06)'];
        const borders = ['rgba(0,242,254,0.12)', 'rgba(168,85,247,0.12)', 'rgba(0,255,157,0.12)'];
        const rows = [
          cleanText.split(''),
          cleanText.split('').map((_, i) => cleanKey[i % cleanKey.length]),
          cleanText.split('').map((ch, i) => String.fromCharCode(((ch.charCodeAt(0) - 65 + cleanKey.charCodeAt(i % cleanKey.length) - 65) % 26) + 65))
        ];
        rows.forEach((rowData, ri) => {
          const rowEl = document.createElement('div');
          rowEl.style.cssText = 'display:flex; align-items:center; gap:2px;';
          const lbl = document.createElement('span');
          lbl.style.cssText = `font-size:9px;color:var(--text-dim);width:70px;flex-shrink:0;letter-spacing:0.06em;`;
          lbl.textContent = labels[ri];
          rowEl.appendChild(lbl);
          rowData.forEach(ch => {
            const cell = document.createElement('div');
            cell.style.cssText = `width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:11px;font-weight:700;color:${colors[ri]};background:${bgs[ri]};border:1px solid ${borders[ri]};border-radius:3px;`;
            cell.textContent = ch;
            rowEl.appendChild(cell);
          });
          table.appendChild(rowEl);
        });
        container.appendChild(table);
        break;
      }
      case 'hill': {
        const k11 = parseInt(document.getElementById('hill-k11').value) || 0;
        const k12 = parseInt(document.getElementById('hill-k12').value) || 0;
        const k21 = parseInt(document.getElementById('hill-k21').value) || 0;
        const k22 = parseInt(document.getElementById('hill-k22').value) || 0;
        try {
          const info = CryptoEngine.Hill.parseKeyMatrix([k11, k12, k21, k22]);
          container.innerHTML = `<p style="font-size:10px; color:var(--text-dim); margin-bottom:12px; letter-spacing:0.1em; text-transform:uppercase;">Hill 2×2 Matrix K &amp; K⁻¹ (mod 26)</p>`;
          const wrap = document.createElement('div');
          wrap.style.cssText = 'display:flex; gap:20px; align-items:center; flex-wrap:wrap;';
          const mkEl = m => {
            const el = document.createElement('div');
            el.style.cssText = 'display:grid; grid-template-columns:repeat(2,52px); gap:4px;';
            m.flat().forEach(v => {
              const c = document.createElement('div');
              c.style.cssText = 'width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:18px;font-weight:700;border-radius:8px;';
              return c;
            });
            return el;
          };
          const drawMatrix = (data, isInv) => {
            const el = document.createElement('div');
            el.style.cssText = 'text-align:center;';
            const label = document.createElement('div');
            label.style.cssText = `font-size:10px;letter-spacing:0.08em;color:${isInv ? 'var(--purple)' : 'var(--cyan)'};margin-bottom:6px;text-transform:uppercase;`;
            label.textContent = isInv ? 'K⁻¹ (mod 26)' : 'K (key matrix)';
            el.appendChild(label);
            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid; grid-template-columns:repeat(2,52px); gap:4px;';
            data.flat().forEach(v => {
              const c = document.createElement('div');
              c.style.cssText = `width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:18px;font-weight:700;border-radius:8px;border:1px solid;color:${isInv ? 'var(--purple)' : 'var(--cyan)'};background:${isInv ? 'rgba(168,85,247,0.06)' : 'rgba(0,242,254,0.06)'};border-color:${isInv ? 'rgba(168,85,247,0.3)' : 'rgba(0,242,254,0.3)'};`;
              c.textContent = v;
              grid.appendChild(c);
            });
            el.appendChild(grid);
            return el;
          };
          wrap.appendChild(drawMatrix(info.matrix, false));
          const arrow = document.createElement('div');
          arrow.style.cssText = 'font-size:20px; color:var(--text-dim);';
          arrow.textContent = '→';
          wrap.appendChild(arrow);
          wrap.appendChild(drawMatrix(info.invMatrix, true));
          const info2 = document.createElement('div');
          info2.style.cssText = 'font-family:var(--font-mono);font-size:11px;color:var(--text-sub);line-height:1.6;';
          info2.innerHTML = `det = <span style="color:var(--cyan);">${info.det}</span><br>det⁻¹ = <span style="color:var(--purple);">${info.detInv}</span>`;
          wrap.appendChild(info2);
          container.appendChild(wrap);
        } catch(e) {
          container.innerHTML = `<p class="text-dim" style="font-size:11px;">${e.message}</p>`;
        }
        break;
      }
      default:
        container.innerHTML = `<p class="text-dim" style="font-size:11px; font-style:italic;">Click Encrypt or Decrypt to see results and inline visualization.</p>`;
    }
  } catch (e) {
    container.innerHTML = `<p class="text-dim" style="font-size:11px;">No visualization available.</p>`;
  }
}


/* ═══════════════════════════════════════════════════════════════
   VISUALIZER VIEW
═══════════════════════════════════════════════════════════════ */
let activeVis = 'playfair';

document.querySelectorAll('.vis-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.vis-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeVis = btn.dataset.vis;
    // Sync key field hint
    renderVisualizer();
  });
});

document.getElementById('btn-render-vis').addEventListener('click', renderVisualizer);

function renderVisualizer() {
  const container = document.getElementById('visualizer-main-container');
  if (!container) return;
  container.innerHTML = '';
  const input = document.getElementById('vis-input').value || 'HELLO WORLD';
  const key = document.getElementById('vis-key').value || '5';

  try {
    if (typeof VisualizerEngine !== 'undefined') {
      const html = VisualizerEngine.render(activeVis, input, key);
      container.innerHTML = html || '<p class="text-dim" style="padding:20px; font-size:12px;">No visualization available for current inputs.</p>';
    } else {
      // Built-in fallback renderer
      renderBuiltinVis(container, activeVis, input, key);
    }
  } catch (e) {
    container.innerHTML = `<div style="padding:20px; color:var(--red); font-size:12px;"><i class="fas fa-triangle-exclamation"></i> ${e.message}</div>`;
  }
}

function renderBuiltinVis(container, vis, input, key) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'padding: 28px;';

  switch (vis) {
    case 'playfair': {
      const cleanKey = CryptoEngine.cleanAlphabet(key) || 'KEYWORD';
      const grid = CryptoEngine.Playfair.generateMatrix(cleanKey);
      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Playfair 5×5 Key Matrix (keyword: "${cleanKey}")`;
      wrap.appendChild(title);

      const gridEl = document.createElement('div');
      gridEl.style.cssText = 'display:grid; grid-template-columns:repeat(5,64px); gap:5px; width:fit-content;';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = document.createElement('div');
          cell.className = 'matrix-cell';
          cell.textContent = grid[r][c];
          gridEl.appendChild(cell);
        }
      }
      wrap.appendChild(gridEl);

      // Preprocessed pairs
      const preprocessed = CryptoEngine.Playfair.preprocessText(input);
      if (preprocessed) {
        const pairInfo = document.createElement('div');
        pairInfo.style.cssText = 'margin-top:20px;';
        pairInfo.innerHTML = `<p style="font-size:10px; color:var(--text-dim); margin-bottom:10px; letter-spacing:0.1em; text-transform:uppercase;">Digraph Pairs (preprocessed input)</p>`;
        const pairs = document.createElement('div');
        pairs.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px;';
        for (let i = 0; i < preprocessed.length; i += 2) {
          const pair = document.createElement('div');
          pair.style.cssText = 'padding:6px 12px; background:rgba(0,242,254,0.08); border:1px solid rgba(0,242,254,0.2); border-radius:6px; font-family:var(--font-mono); font-size:14px; font-weight:700; color:var(--cyan);';
          pair.textContent = `${preprocessed[i]}${preprocessed[i+1] || ''}`;
          pairs.appendChild(pair);
        }
        pairInfo.appendChild(pairs);
        wrap.appendChild(pairInfo);
      }
      break;
    }

    case 'hill': {
      try {
        const info = CryptoEngine.Hill.parseKeyMatrix(key);
        const title = document.createElement('p');
        title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:20px; letter-spacing:0.12em; text-transform:uppercase;';
        title.textContent = `Hill 2×2 Key Matrix — det(K) = ${info.det} (mod 26), det⁻¹ = ${info.detInv}`;
        wrap.appendChild(title);

        const hillVis = document.createElement('div');
        hillVis.className = 'hill-vis';

        const mkMatrix = (data, label, isInv) => {
          const el = document.createElement('div');
          el.style.cssText = 'text-align:center;';
          const lbl = document.createElement('div');
          lbl.style.cssText = `font-size:10px; letter-spacing:0.08em; color:${isInv ? 'var(--purple)' : 'var(--cyan)'}; margin-bottom:8px; text-transform:uppercase;`;
          lbl.textContent = label;
          el.appendChild(lbl);
          const grid = document.createElement('div');
          grid.className = 'hill-matrix-display';
          data.flat().forEach(v => {
            const c = document.createElement('div');
            c.className = `hill-mval ${isInv ? 'inv' : 'orig'}`;
            c.textContent = v;
            grid.appendChild(c);
          });
          el.appendChild(grid);
          return el;
        };

        hillVis.appendChild(mkMatrix(info.matrix, 'K (Key Matrix)', false));
        const sym = document.createElement('div');
        sym.className = 'hill-op-symbol';
        sym.textContent = '⟶';
        hillVis.appendChild(sym);
        hillVis.appendChild(mkMatrix(info.invMatrix, 'K⁻¹ (mod 26)', true));
        wrap.appendChild(hillVis);

        const formula = document.createElement('div');
        formula.className = 'theory-formula';
        formula.style.cssText += 'margin-top:16px;';
        formula.textContent = `Encryption: C = K × P (mod 26)\nDecryption: P = K⁻¹ × C (mod 26)\n\nK:\n  [${info.matrix[0][0]}  ${info.matrix[0][1]}]    K⁻¹:\n  [${info.invMatrix[0][0]}  ${info.invMatrix[0][1]}]\n  [${info.matrix[1][0]}  ${info.matrix[1][1]}]          [${info.invMatrix[1][0]}  ${info.invMatrix[1][1]}]`;
        wrap.appendChild(formula);
      } catch (e) {
        wrap.innerHTML = `<div style="color:var(--red); font-size:12px;"><i class="fas fa-triangle-exclamation"></i> ${e.message}</div>`;
      }
      break;
    }

    case 'railfence': {
      const depth = Math.max(2, Math.min(parseInt(key, 10) || 3, 8));
      const text = input.replace(/\s/g, '').toUpperCase().slice(0, 40);
      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Rail Fence Zigzag — ${depth} Rails, Input: "${text}"`;
      wrap.appendChild(title);

      // Build zigzag grid
      const matrix = Array.from({length: depth}, () => Array(text.length).fill(null));
      let rail = 0, dir = 1;
      for (let i = 0; i < text.length; i++) {
        matrix[rail][i] = text[i];
        rail += dir;
        if (rail === depth - 1 || rail === 0) dir *= -1;
      }

      const rfGrid = document.createElement('div');
      rfGrid.className = 'railfence-grid';
      for (let r = 0; r < depth; r++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'rf-row';
        for (let c = 0; c < text.length; c++) {
          const cell = document.createElement('div');
          cell.className = `rf-cell ${matrix[r][c] !== null ? 'active' : 'empty'}`;
          cell.textContent = matrix[r][c] !== null ? matrix[r][c] : '·';
          if (matrix[r][c] === null) cell.style.color = 'rgba(255,255,255,0.05)';
          rowEl.appendChild(cell);
        }
        wrap.appendChild(rowEl);
      }

      const result = CryptoEngine.RailFence.encrypt(text, depth);
      const res = document.createElement('div');
      res.style.cssText = 'margin-top:16px; font-family:var(--font-mono); font-size:12px;';
      res.innerHTML = `<span style="color:var(--text-dim); font-size:10px; letter-spacing:0.1em; text-transform:uppercase;">Ciphertext: </span><span style="color:var(--emerald);">${result}</span>`;
      wrap.appendChild(res);
      break;
    }

    case 'columnar': {
      const colKey = key.trim() || 'SECRET';
      const cleanText = CryptoEngine.cleanAlphabet(input) || 'NETWORKSECURITY';
      const keyOrder = CryptoEngine.ColumnarTransposition.getKeyOrder(colKey);
      const numCols = keyOrder.length;
      const numRows = Math.ceil(cleanText.length / numCols);

      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Columnar Grid — Key: "${CryptoEngine.cleanAlphabet(colKey) || colKey}" (${numCols} cols × ${numRows} rows)`;
      wrap.appendChild(title);

      const tableEl = document.createElement('div');
      tableEl.className = 'col-grid';
      tableEl.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

      // Key order row
      const sortedOrder = keyOrder.slice().sort((a,b) => a - b);
      const colKey2 = CryptoEngine.cleanAlphabet(colKey.toString()) || colKey.toString();
      for (let c = 0; c < numCols; c++) {
        const cell = document.createElement('div');
        cell.className = 'col-header-cell';
        const readPos = keyOrder.indexOf(c);
        cell.textContent = colKey2.length > c ? `${colKey2[c]} (${readPos + 1})` : `C${c+1}`;
        tableEl.appendChild(cell);
      }

      // Data rows
      const paddedText = cleanText.padEnd(numRows * numCols, '·');
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          const cell = document.createElement('div');
          cell.className = 'col-cell';
          const ch = paddedText[r * numCols + c];
          cell.textContent = ch;
          if (ch === '·') cell.style.color = 'var(--text-dim)';
          tableEl.appendChild(cell);
        }
      }
      wrap.appendChild(tableEl);

      const result = CryptoEngine.ColumnarTransposition.encrypt(input, colKey);
      const res = document.createElement('div');
      res.style.cssText = 'margin-top:16px; font-family:var(--font-mono); font-size:12px;';
      res.innerHTML = `<span style="color:var(--text-dim); font-size:10px; letter-spacing:0.1em; text-transform:uppercase;">Read Order: </span><span style="color:var(--purple);">${keyOrder.map(i => i + 1).join(' → ')}</span><br><span style="color:var(--text-dim); font-size:10px; letter-spacing:0.1em; text-transform:uppercase;">Ciphertext: </span><span style="color:var(--emerald);">${result}</span>`;
      wrap.appendChild(res);
      break;
    }

    case 'vigenere': {
      const cleanKey = CryptoEngine.cleanAlphabet(key) || 'KEY';
      const cleanText = CryptoEngine.cleanAlphabet(input) || 'HELLO';
      const limit = Math.min(cleanText.length, 24);

      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Vigenère Keystream Alignment — Key: "${cleanKey}"`;
      wrap.appendChild(title);

      const rows = [
        { label: 'Plaintext', data: cleanText.slice(0, limit).split(''), color: 'var(--cyan)', bg: 'rgba(0,242,254,0.08)', border: 'rgba(0,242,254,0.15)' },
        { label: 'Key', data: cleanText.slice(0, limit).split('').map((_, i) => cleanKey[i % cleanKey.length]), color: 'var(--purple)', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)' },
        { label: 'Shifts', data: cleanText.slice(0, limit).split('').map((_, i) => cleanKey.charCodeAt(i % cleanKey.length) - 65), color: 'var(--text-dim)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)', small: true },
        { label: 'Ciphertext', data: cleanText.slice(0, limit).split('').map((ch, i) => String.fromCharCode(((ch.charCodeAt(0) - 65 + cleanKey.charCodeAt(i % cleanKey.length) - 65) % 26) + 65)), color: 'var(--emerald)', bg: 'rgba(0,255,157,0.08)', border: 'rgba(0,255,157,0.15)' }
      ];

      rows.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.style.cssText = 'display:flex; align-items:center; gap:4px; margin-bottom:4px; overflow-x:auto;';
        const lbl = document.createElement('span');
        lbl.style.cssText = 'font-size:10px; color:var(--text-dim); width:75px; flex-shrink:0; letter-spacing:0.06em; font-family:var(--font-mono);';
        lbl.textContent = row.label;
        rowEl.appendChild(lbl);
        row.data.forEach(ch => {
          const cell = document.createElement('div');
          cell.style.cssText = `width:${row.small ? '22px' : '26px'};height:${row.small ? '22px' : '26px'};display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:${row.small ? '9px' : '11px'};font-weight:${row.small ? '400' : '700'};color:${row.color};background:${row.bg};border:1px solid ${row.border};border-radius:4px;flex-shrink:0;`;
          cell.textContent = ch;
          rowEl.appendChild(cell);
        });
        wrap.appendChild(rowEl);
      });
      break;
    }

    case 'caesar': {
      const shift = ((parseInt(key, 10) || 5) % 26 + 26) % 26;
      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Caesar Cipher Shift Strip — Shift: ${shift}`;
      wrap.appendChild(title);

      const strip = document.createElement('div');
      strip.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px;';
      for (let i = 0; i < 26; i++) {
        const orig = String.fromCharCode(65 + i);
        const enc = String.fromCharCode(((i + shift) % 26) + 65);
        const pair = document.createElement('div');
        pair.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:2px;';
        pair.innerHTML = `
          <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--cyan);background:rgba(0,242,254,0.08);border:1px solid rgba(0,242,254,0.15);border-radius:4px;">${orig}</div>
          <div style="font-size:9px;color:var(--text-dim);">↓</div>
          <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--emerald);background:rgba(0,255,157,0.08);border:1px solid rgba(0,255,157,0.15);border-radius:4px;">${enc}</div>`;
        strip.appendChild(pair);
      }
      wrap.appendChild(strip);
      break;
    }

    case 'mono': {
      const validation = CryptoEngine.Monoalphabetic.validateKey(key);
      if (!validation.valid) {
        wrap.innerHTML = `<div style="color:var(--red);font-size:12px;"><i class="fas fa-triangle-exclamation"></i> ${validation.message}</div>`;
        break;
      }
      const cleanKey = validation.cleanKey;
      const title = document.createElement('p');
      title.style.cssText = 'font-size:11px; color:var(--text-dim); margin-bottom:16px; letter-spacing:0.12em; text-transform:uppercase;';
      title.textContent = `Monoalphabetic Substitution Map`;
      wrap.appendChild(title);

      const mapEl = document.createElement('div');
      mapEl.className = 'mono-map';
      const topRow = document.createElement('div');
      topRow.className = 'mono-row';
      const botRow = document.createElement('div');
      botRow.className = 'mono-row';
      for (let i = 0; i < 26; i++) {
        const t = document.createElement('div'); t.className = 'mono-cell mono-top'; t.textContent = String.fromCharCode(65 + i); topRow.appendChild(t);
        const b = document.createElement('div'); b.className = 'mono-cell mono-bottom'; b.textContent = cleanKey[i]; botRow.appendChild(b);
      }
      mapEl.appendChild(topRow);
      const arrowRow = document.createElement('div');
      arrowRow.style.cssText = 'display:flex; gap:2px;';
      for (let i = 0; i < 26; i++) {
        const a = document.createElement('div');
        a.style.cssText = 'width:32px; height:14px; display:flex; align-items:center; justify-content:center; font-size:9px; color:var(--text-dim);';
        a.textContent = '↓';
        arrowRow.appendChild(a);
      }
      mapEl.appendChild(arrowRow);
      mapEl.appendChild(botRow);
      wrap.appendChild(mapEl);
      break;
    }

    default:
      wrap.innerHTML = `<p class="text-dim" style="font-size:12px;">Select a visualizer tab and click Render to see the step-by-step visualization.</p>`;
  }

  container.appendChild(wrap);
}


/* ═══════════════════════════════════════════════════════════════
   BENCHMARK / COMPARISON VIEW
═══════════════════════════════════════════════════════════════ */
// Checkbox styling
document.querySelectorAll('.cipher-check input').forEach(cb => {
  cb.addEventListener('change', () => {
    cb.closest('.cipher-check').classList.toggle('active', cb.checked);
  });
});

document.getElementById('btn-select-all-ciphers').addEventListener('click', () => {
  document.querySelectorAll('[name="bench-cipher"]').forEach(cb => {
    cb.checked = true;
    cb.closest('.cipher-check').classList.add('active');
  });
});

document.getElementById('btn-deselect-all-ciphers').addEventListener('click', () => {
  document.querySelectorAll('[name="bench-cipher"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.cipher-check').classList.remove('active');
  });
});

document.getElementById('btn-run-benchmark').addEventListener('click', runBenchmark);

function runBenchmark() {
  const text = document.getElementById('benchmark-input-text').value.trim();
  if (!text) { showToast('Enter benchmark test text.', 'warning'); return; }

  const selected = [...document.querySelectorAll('[name="bench-cipher"]:checked')].map(cb => cb.value);
  if (selected.length === 0) { showToast('Select at least one cipher.', 'warning'); return; }

  const btn = document.getElementById('btn-run-benchmark');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Running...';

  setTimeout(() => {
    try {
      if (typeof BenchmarkEngine !== 'undefined') {
        BenchmarkEngine.run(text, selected);
      } else {
        runBuiltinBenchmark(text, selected);
      }
    } catch (e) {
      showToast(`Benchmark error: ${e.message}`, 'error');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Run Benchmark';
  }, 50);
}

const BENCHMARK_DEFAULTS = {
  caesar: { key: 7, name: 'Caesar Cipher', category: 'Substitution' },
  mono: { key: 'QWERTYUIOPASDFGHJKLZXCVBNM', name: 'Monoalphabetic', category: 'Substitution' },
  playfair: { key: 'MONARCHY', name: 'Playfair (5×5)', category: 'Substitution' },
  hill: { key: [6,24,1,13], name: 'Hill (2×2)', category: 'Substitution' },
  vigenere: { key: 'SECRET', name: 'Vigenère', category: 'Substitution' },
  otp: { key: null, name: 'One-Time Pad', category: 'Substitution' },
  railfence: { key: 3, name: 'Rail Fence', category: 'Transposition' },
  columnar: { key: 'SECRET', name: 'Columnar', category: 'Transposition' }
};

function runBuiltinBenchmark(text, selected) {
  const results = [];
  const ITERS = 100;

  selected.forEach(cipherId => {
    const cfg = BENCHMARK_DEFAULTS[cipherId];
    if (!cfg) return;
    let key = cfg.key;

    // OTP needs a key at least as long as text
    if (cipherId === 'otp') {
      const letterCount = (text.match(/[a-zA-Z]/g) || []).length;
      key = CryptoEngine.OneTimePad.generateRandomKey(letterCount);
    }

    let encTotal = 0, decTotal = 0, ciphertext = '', decrypted = '';
    for (let i = 0; i < ITERS; i++) {
      const t1 = performance.now();
      try {
        switch (cipherId) {
          case 'caesar':    ciphertext = CryptoEngine.Caesar.encrypt(text, key); break;
          case 'mono':      ciphertext = CryptoEngine.Monoalphabetic.encrypt(text, key); break;
          case 'playfair':  ciphertext = CryptoEngine.Playfair.encrypt(text, key); break;
          case 'hill':      ciphertext = CryptoEngine.Hill.encrypt(text, key); break;
          case 'vigenere':  ciphertext = CryptoEngine.Vigenere.encrypt(text, key); break;
          case 'otp':       ciphertext = CryptoEngine.OneTimePad.encrypt(text, key); break;
          case 'railfence': ciphertext = CryptoEngine.RailFence.encrypt(text, key); break;
          case 'columnar':  ciphertext = CryptoEngine.ColumnarTransposition.encrypt(text, key); break;
        }
      } catch (e) {}
      encTotal += performance.now() - t1;

      const t2 = performance.now();
      try {
        switch (cipherId) {
          case 'caesar':    decrypted = CryptoEngine.Caesar.decrypt(ciphertext, key); break;
          case 'mono':      decrypted = CryptoEngine.Monoalphabetic.decrypt(ciphertext, key); break;
          case 'playfair':  decrypted = CryptoEngine.Playfair.decrypt(ciphertext, key); break;
          case 'hill':      decrypted = CryptoEngine.Hill.decrypt(ciphertext, key); break;
          case 'vigenere':  decrypted = CryptoEngine.Vigenere.decrypt(ciphertext, key); break;
          case 'otp':       decrypted = CryptoEngine.OneTimePad.decrypt(ciphertext, key); break;
          case 'railfence': decrypted = CryptoEngine.RailFence.decrypt(ciphertext, key); break;
          case 'columnar':  decrypted = CryptoEngine.ColumnarTransposition.decrypt(ciphertext, key); break;
        }
      } catch (e) {}
      decTotal += performance.now() - t2;
    }

    const encMs = (encTotal / ITERS).toFixed(4);
    const decMs = (decTotal / ITERS).toFixed(4);
    const cleanOrig = CryptoEngine.cleanAlphabet(text);
    const cleanDec = CryptoEngine.cleanAlphabet(decrypted);
    const verified = cleanOrig === cleanDec;
    const entropy = CryptoEngine.calculateEntropy(CryptoEngine.cleanAlphabet(ciphertext));
    const charsPerSec = text.length > 0 ? Math.round((text.length / (encTotal / ITERS)) * 1000) : 0;

    results.push({
      id: cipherId,
      name: cfg.name,
      category: cfg.category,
      key: Array.isArray(key) ? key.join(',') : String(key).slice(0, 20),
      snippet: ciphertext.slice(0, 16),
      encMs, decMs, verified, entropy,
      charsPerSec: charsPerSec.toLocaleString(),
      encTotal: parseFloat(encMs)
    });
  });

  // Render table
  const tbody = document.getElementById('benchmark-results-body');
  tbody.innerHTML = '';
  results.forEach(r => {
    const tr = document.createElement('tr');
    const catColor = r.category === 'Substitution' ? 'var(--cyan)' : 'var(--purple)';
    tr.innerHTML = `
      <td>${r.name}</td>
      <td><span class="badge ${r.category === 'Substitution' ? 'badge-cyan' : 'badge-purple'}">${r.category}</span></td>
      <td style="font-family:var(--font-mono); font-size:11px; color:var(--text-sub);">${r.key}</td>
      <td style="font-family:var(--font-mono); font-size:11px; color:var(--cyan);">${r.snippet}…</td>
      <td style="font-family:var(--font-mono); color:var(--gold);">${r.encMs}</td>
      <td style="font-family:var(--font-mono); color:var(--gold);">${r.decMs}</td>
      <td>${r.verified ? '<span class="badge badge-emerald"><i class="fas fa-check"></i> Match</span>' : '<span class="badge badge-red"><i class="fas fa-xmark"></i> Partial</span>'}</td>
      <td style="font-family:var(--font-mono); color:var(--purple);">${r.entropy}</td>
      <td style="font-family:var(--font-mono); font-size:11px; color:var(--text-sub);">${r.charsPerSec} c/s</td>`;
    tbody.appendChild(tr);
  });

  // Render bar chart
  const chartContainer = document.getElementById('benchmark-chart-bars');
  chartContainer.innerHTML = '';
  const maxVal = Math.max(...results.map(r => r.encTotal), 0.001);
  results.forEach(r => {
    const pct = ((r.encTotal / maxVal) * 100).toFixed(1);
    const barRow = document.createElement('div');
    barRow.className = 'bar-row';
    barRow.innerHTML = `
      <span class="bar-label">${r.name}</span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;"></div>
      </div>
      <span class="bar-val">${r.encMs} ms</span>`;
    chartContainer.appendChild(barRow);
  });

  showToast(`Benchmark complete — tested ${results.length} cipher${results.length !== 1 ? 's' : ''} (${ITERS} iterations).`, 'success');
}


/* ═══════════════════════════════════════════════════════════════
   FILE CRYPTOGRAPHY VIEW
═══════════════════════════════════════════════════════════════ */
let fileContent = null;
let processedContent = null;

const dropzone = document.getElementById('file-dropzone');
const fileInput = document.getElementById('file-upload-input');

document.getElementById('btn-browse-file').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
  if (e.target.files && e.target.files[0]) loadFile(e.target.files[0]);
});

dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
});

function loadFile(file) {
  if (!file.name.endsWith('.txt')) {
    showToast('Only .txt files are supported.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    fileContent = e.target.result;
    // Check for embedded metadata header
    if (fileContent.startsWith('---CCT-HEADER---')) {
      try {
        const lines = fileContent.split('\n');
        let headerEnd = -1;
        const meta = {};
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].startsWith('---END-HEADER---')) { headerEnd = i; break; }
          const [k, v] = lines[i].split(':');
          if (k && v) meta[k.trim()] = v.trim();
        }
        if (headerEnd >= 0) {
          fileContent = lines.slice(headerEnd + 1).join('\n');
          if (meta.CIPHER && document.getElementById('file-cipher-select').querySelector(`option[value="${meta.CIPHER}"]`)) {
            document.getElementById('file-cipher-select').value = meta.CIPHER;
            updateFileKeyLabel();
          }
          if (meta.KEY) document.getElementById('file-key-input').value = meta.KEY;
          showToast('Detected embedded metadata — cipher & key auto-loaded!', 'success');
        }
      } catch (e) {}
    }
    document.getElementById('file-info-badge').style.display = 'flex';
    document.getElementById('file-name-display').textContent = file.name;
    const sizeKB = (file.size / 1024).toFixed(1);
    document.getElementById('file-size-display').textContent = `${sizeKB} KB • ${fileContent.length} Chars`;
    document.getElementById('file-preview-text').textContent = fileContent;
    const lines = fileContent.split('\n').length;
    document.getElementById('file-preview-lines').textContent = `${lines} Lines`;
    processedContent = null;
    document.getElementById('btn-download-file').disabled = true;
  };
  reader.readAsText(file);
}

document.getElementById('btn-remove-file').addEventListener('click', () => {
  fileContent = null; processedContent = null;
  document.getElementById('file-info-badge').style.display = 'none';
  document.getElementById('file-preview-text').textContent = 'No text file loaded. Please upload a .txt document.';
  document.getElementById('file-preview-lines').textContent = '0 Lines';
  document.getElementById('btn-download-file').disabled = true;
  fileInput.value = '';
});

document.getElementById('file-cipher-select').addEventListener('change', updateFileKeyLabel);

function updateFileKeyLabel() {
  const id = document.getElementById('file-cipher-select').value;
  const cfg = cipherConfigs[id];
  if (cfg) document.getElementById('file-key-label').textContent = cfg.keyLabel;
}

document.getElementById('btn-file-gen-key').addEventListener('click', () => {
  const id = document.getElementById('file-cipher-select').value;
  const cfg = cipherConfigs[id];
  if (!cfg) return;
  let newKey;
  if (id === 'otp') {
    const lc = (fileContent || '').replace(/[^a-zA-Z]/g, '').length || 16;
    newKey = CryptoEngine.OneTimePad.generateRandomKey(lc);
  } else {
    newKey = cfg.keyGen();
  }
  if (newKey !== null && newKey !== undefined) {
    document.getElementById('file-key-input').value = newKey;
    showToast(`Auto-generated key for ${cfg.label}.`, 'success');
  }
});

function processFile(operation) {
  if (!fileContent) { showToast('Please load a text file first.', 'warning'); return; }
  const cipherId = document.getElementById('file-cipher-select').value;
  const key = document.getElementById('file-key-input').value;
  const embedMeta = document.getElementById('file-embed-metadata-toggle').checked;

  try {
    let result;
    switch (cipherId) {
      case 'caesar':    result = CryptoEngine.Caesar[operation](fileContent, key); break;
      case 'mono':      result = CryptoEngine.Monoalphabetic[operation](fileContent, key); break;
      case 'playfair':  result = CryptoEngine.Playfair[operation](fileContent, key); break;
      case 'hill':      result = CryptoEngine.Hill[operation](fileContent, key); break;
      case 'vigenere':  result = CryptoEngine.Vigenere[operation](fileContent, key); break;
      case 'railfence': result = CryptoEngine.RailFence[operation](fileContent, key); break;
      case 'columnar':  result = CryptoEngine.ColumnarTransposition[operation](fileContent, key); break;
      default: throw new Error('Unknown cipher.');
    }

    if (operation === 'encrypt' && embedMeta) {
      const ts = new Date().toISOString();
      result = `---CCT-HEADER---\nCIPHER:${cipherId}\nKEY:${key}\nTIMESTAMP:${ts}\n---END-HEADER---\n${result}`;
    }

    processedContent = result;
    document.getElementById('file-preview-text').textContent = result;
    const lines = result.split('\n').length;
    document.getElementById('file-preview-lines').textContent = `${lines} Lines`;
    document.getElementById('btn-download-file').disabled = false;
    showToast(`File ${operation}ed successfully!`, 'success');
  } catch (e) {
    showToast(`${operation} error: ${e.message}`, 'error');
  }
}

document.getElementById('btn-file-encrypt').addEventListener('click', () => processFile('encrypt'));
document.getElementById('btn-file-decrypt').addEventListener('click', () => processFile('decrypt'));

document.getElementById('btn-download-file').addEventListener('click', () => {
  if (!processedContent) { showToast('No processed content to download.', 'warning'); return; }
  const blob = new Blob([processedContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `processed_${document.getElementById('file-cipher-select').value}_${Date.now()}.txt`;
  a.click();
  showToast('File downloaded.', 'success');
});


/* ═══════════════════════════════════════════════════════════════
   THEORY / HELP VIEW
═══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.theory-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theory-nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTheory(btn.dataset.cipher);
  });
});

function renderTheory(cipherId) {
  const container = document.getElementById('theory-content-body');
  if (typeof TheoryData !== 'undefined' && TheoryData[cipherId]) {
    container.innerHTML = TheoryData[cipherId];
    return;
  }
  // Built-in theory fallback
  container.innerHTML = getBuiltinTheory(cipherId);
}

function getBuiltinTheory(id) {
  const theories = {
    caesar: `
      <div class="theory-section active">
        <h2 class="theory-title">Caesar Cipher</h2>
        <p class="theory-subtitle">// Monoalphabetic Shift Substitution | 26 possible keys</p>
        <h4>Historical Background</h4>
        <p>Named after Julius Caesar (100–44 BC), this cipher was used in military communication to shift each letter by 3 positions. It's the simplest example of a substitution cipher and forms the foundation of classical cryptography.</p>
        <h4>Mathematical Formula</h4>
        <div class="theory-formula">Encryption: C(i) = (P(i) + k) mod 26
Decryption: P(i) = (C(i) - k + 26) mod 26

Where: P = plaintext letter (0-25), C = ciphertext letter, k = shift key</div>
        <h4>Example</h4>
        <div class="theory-formula">Plaintext:  N E T W O R K   S E C U R I T Y
Shift k=5: S J Y B T W P   X J H Z W N Y D
Ciphertext: SJYBTWP XJHZWNYD</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>Single integer shift value (0–25)</li><li>Shift 0 = identity (no change)</li><li>Negative shifts wrap around correctly</li></ul>
        <h4>Security Analysis</h4>
        <p>Key space = only 26 possible keys. Trivially broken by brute force (try all 26 shifts) or letter frequency analysis in <1 second. <strong>Completely insecure for modern use.</strong></p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Only 26 possible keys — zero security</li><li>Preserves word boundaries (spaces unchanged)</li><li>Frequency distribution of letters is preserved, enabling instant frequency analysis</li><li>Special characters and numbers are passed through unchanged</li></ul>
      </div>`,
    mono: `
      <div class="theory-section active">
        <h2 class="theory-title">Monoalphabetic Substitution</h2>
        <p class="theory-subtitle">// Fixed 26-character bijective substitution map | Key space: 26! ≈ 4×10²⁶</p>
        <h4>Principle</h4>
        <p>Each letter in the plaintext is replaced by a fixed substitute letter defined by a 26-character key alphabet. The substitution is bijective — every plaintext letter maps to a unique ciphertext letter.</p>
        <h4>Mathematical Formula</h4>
        <div class="theory-formula">Encryption: C = Key[P]     (where P = position 0-25 in standard alphabet)
Decryption: P = Key⁻¹[C]   (inverse mapping)

Key: a permutation of ABCDEFGHIJKLMNOPQRSTUVWXYZ
e.g. Key = QWERTYUIOPASDFGHJKLZXCVBNM</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>Exactly 26 unique alphabetic characters</li><li>Each letter appears exactly once (bijection)</li><li>Auto-Key generates a cryptographically random permutation</li></ul>
        <h4>Security Analysis</h4>
        <p>Key space = 26! ≈ 4×10²⁶ — far too large for brute force. However, the cipher preserves the relative frequency of letters. English frequency analysis (<i>e, t, a, o, i</i>) can crack it in seconds with automated tools.</p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Vulnerable to frequency analysis (letter patterns remain)</li><li>Bigram and trigram analysis further reduces cryptanalysis effort</li><li>Does not provide diffusion — each letter is independently substituted</li></ul>
      </div>`,
    playfair: `
      <div class="theory-section active">
        <h2 class="theory-title">Playfair Cipher</h2>
        <p class="theory-subtitle">// Polygraphic Digraph Substitution | 5×5 Key Matrix (J=I)</p>
        <h4>Historical Background</h4>
        <p>Invented by Charles Wheatstone in 1854, popularized by Lord Playfair. Used by British forces in WWI and WWII. First cipher to encrypt letter pairs (digraphs), making simple frequency analysis harder.</p>
        <h4>5×5 Matrix Construction</h4>
        <div class="theory-formula">1. Write keyword letters (remove duplicates, J=I)
2. Fill remaining alphabet letters in order
3. Arrange in 5×5 grid

Example (keyword = MONARCHY):
M O N A R
C H Y B D
E F G I K
L P Q S T
U V W X Z</div>
        <h4>Encryption Rules</h4>
        <ul class="theory-list"><li>Preprocess: remove J→I, split into pairs, insert X between duplicate pairs</li><li>Same row: shift each letter one position right (circular)</li><li>Same column: shift each letter one position down (circular)</li><li>Rectangle: swap column positions of the two letters</li></ul>
        <h4>Security Analysis</h4>
        <p>Resists simple frequency analysis but requires digraph frequency analysis (676 possible pairs). Cracked during WWII. Still stronger than Caesar or Monoalphabetic in practice.</p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>J and I are treated as identical characters</li><li>Padding X characters must be removed after decryption</li><li>Only processes alphabetic characters (non-letters stripped)</li><li>Ciphertext must have even length for decryption</li></ul>
      </div>`,
    hill: `
      <div class="theory-section active">
        <h2 class="theory-title">Hill Cipher</h2>
        <p class="theory-subtitle">// Linear Algebra Polygraphic Substitution | 2×2 Matrix mod 26</p>
        <h4>Historical Background</h4>
        <p>Invented by Lester S. Hill in 1929. First cryptographic system to use linear algebra and modular arithmetic for encryption. Encrypts multiple letters simultaneously using matrix multiplication.</p>
        <h4>Mathematical Formula</h4>
        <div class="theory-formula">Encryption: C = K × P (mod 26)    [Column vector multiplication]
Decryption: P = K⁻¹ × C (mod 26)

K = [[k₁₁, k₁₂],    K⁻¹ = det⁻¹(K) × adj(K) (mod 26)
     [k₂₁, k₂₂]]

Invertibility: gcd(det(K), 26) = 1  (required condition)

det(K) = k₁₁·k₂₂ - k₁₂·k₂₁  (mod 26)</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>4 integers (k₁₁, k₁₂, k₂₁, k₂₂) each 0–25</li><li>OR 4-letter keyword (letters mapped to 0–25 via A=0, B=1...)</li><li>Matrix must be invertible mod 26 (gcd of determinant with 26 must = 1)</li><li>Odd-length plaintext is padded with X</li></ul>
        <h4>Security Analysis</h4>
        <p>Resistant to simple frequency analysis. However, <strong>known-plaintext attack</strong> can recover the key matrix using linear algebra with just 4 known plaintext-ciphertext character pairs.</p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Only alphabetic characters processed (non-letters stripped)</li><li>Key matrix must be invertible mod 26</li><li>Odd-length plaintexts padded with X</li><li>Vulnerable to known-plaintext attacks</li></ul>
      </div>`,
    vigenere: `
      <div class="theory-section active">
        <h2 class="theory-title">Vigenère Cipher</h2>
        <p class="theory-subtitle">// Polyalphabetic Keyword Substitution | Repeating Keystream</p>
        <h4>Historical Background</h4>
        <p>Described by Giovan Battista Bellaso (1553), later attributed to Blaise de Vigenère. Called "le chiffre indéchiffrable" (the indecipherable cipher) for 300 years until Charles Babbage (1854) broke it via the Kasiski test.</p>
        <h4>Mathematical Formula</h4>
        <div class="theory-formula">Encryption: C(i) = (P(i) + K(i mod n)) mod 26
Decryption: P(i) = (C(i) - K(i mod n) + 26) mod 26

Where: K = keyword repeated, n = keyword length
Example: Key = "SECRET" → repeats as S,E,C,R,E,T,S,E,C,R,E,T...</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>Alphabetic keyword of any length</li><li>Key is cyclically repeated to match plaintext length</li><li>Longer, more random keys provide better security</li></ul>
        <h4>Security Analysis</h4>
        <p>Resists simple frequency analysis because each letter uses a different shift. Broken by: (1) Kasiski test to find key length, (2) Index of Coincidence to confirm length, (3) frequency analysis on each sub-alphabet. <strong>Completely insecure today.</strong></p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Vulnerable to Kasiski test when key is short</li><li>Periodic key structure reveals patterns for repeated keywords</li><li>Only alphabetic characters encrypted; others preserved</li></ul>
      </div>`,
    otp: `
      <div class="theory-section active">
        <h2 class="theory-title">One-Time Pad (OTP)</h2>
        <p class="theory-subtitle">// Information-Theoretically Perfect Secrecy | Shannon 1949</p>
        <h4>Historical Background</h4>
        <p>Invented by Gilbert Vernam (1917) and independently by Joseph Mauborgne. Claude Shannon proved its perfect secrecy in 1949. Used in diplomatic communications (Washington-Moscow hotline). The ONLY proven perfectly secure cipher.</p>
        <h4>Mathematical Formula</h4>
        <div class="theory-formula">Encryption: C(i) = (P(i) + K(i)) mod 26
Decryption: P(i) = (C(i) - K(i) + 26) mod 26

The Four Rules of OTP (Shannon's conditions):
1. Key must be truly random (cryptographically secure)
2. Key must be at least as long as the plaintext
3. Key must NEVER be reused (one-time use only!)
4. Key must be kept completely secret</div>
        <h4>Security Analysis</h4>
        <p>The OTP is <strong>information-theoretically perfectly secret</strong> — even with unlimited computational power, no information about the plaintext can be derived from the ciphertext alone (proven by Shannon, 1949). This is the gold standard of secrecy.</p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Key must be truly random (pseudo-random is insufficient)</li><li>Key distribution problem: securely sharing a key as long as the message</li><li>Key reuse completely breaks security (two-time pad attack)</li><li>No authentication — vulnerable to bit-flipping attacks</li><li>Impractical for large messages due to key size requirements</li></ul>
      </div>`,
    railfence: `
      <div class="theory-section active">
        <h2 class="theory-title">Rail Fence Cipher</h2>
        <p class="theory-subtitle">// Zigzag Route Transposition | N-rail fence pattern</p>
        <h4>Principle</h4>
        <p>A transposition cipher that rearranges characters in a zigzag (fence) pattern across N rails (rows), then reads each rail sequentially to produce the ciphertext. No substitution occurs — characters are identical but reordered.</p>
        <h4>Algorithm</h4>
        <div class="theory-formula">Example: "NETWORK SECURITY" with 3 rails

Rail 0: N . . . O . . . S . . . R . . Y
Rail 1: . E . W . R . K . E . U . I . .
Rail 2: . . T . . . . . . C . . . T . .

Read rails in order:
Rail 0: NOSR Y
Rail 1: EWRKEUIY
Rail 2: TCT
Ciphertext: NOSRYEWRKEUIYTCT</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>Single integer ≥ 2 (number of rails)</li><li>Rail count ≥ text length → no transposition occurs</li><li>Optimal confusion achieved with 2-6 rails for short texts</li></ul>
        <h4>Security Analysis</h4>
        <p>Trivially broken by trying all reasonable rail counts (typically 2–50). No statistical disguise — only rearrangement. Key space is tiny. <strong>Not secure in isolation.</strong></p>
        <h4>Limitations</h4>
        <ul class="theory-list"><li>Extremely small key space (rail count usually 2–20)</li><li>No confusion — character frequencies unchanged</li><li>Easily recognized by the distinct ciphertext length patterns</li></ul>
      </div>`,
    columnar: `
      <div class="theory-section active">
        <h2 class="theory-title">Columnar Transposition</h2>
        <p class="theory-subtitle">// Keyword-Permuted Column Transposition | Grid Rearrangement</p>
        <h4>Principle</h4>
        <p>Plaintext is written row-by-row into a rectangular grid. Columns are then read in a specific order determined by the keyword (alphabetical ordering of the key characters), producing the ciphertext. No character substitution occurs.</p>
        <h4>Algorithm</h4>
        <div class="theory-formula">Plaintext: "NETWORK SECURITY", Key: "SECRET"
Column Order (S=5,E=1,C=0,R=4,E=2,T=5): 
Sorted: C(0),E(1),E(2),R(4),S(5),T(5) → columns: 2,1,4,3,0,5

Grid layout:
  S  E  C  R  E  T
  N  E  T  W  O  R
  K  S  E  C  U  R
  I  T  Y  X  X  X

Read cols in order (C=2,E=1,E=4,R=3,S=0,T=5):
Ciphertext: TEYOWESX CKNI ESXRRX</div>
        <h4>Key Format</h4>
        <ul class="theory-list"><li>Alphabetic keyword (e.g. "SECRET") — columns ordered by alphabet</li><li>Numeric column order (e.g. "3,1,4,2") — explicit ordering</li><li>Repeated letters in keyword use stable sort (left-to-right order)</li><li>Option to pad incomplete final rows with X</li></ul>
        <h4>Security Analysis</h4>
        <p>Stronger than Rail Fence. Can be further strengthened by double transposition (applying twice). Vulnerable to anagramming attacks if message structure is known. <strong>Insecure alone for modern applications.</strong></p>
      </div>`,
    limitations: `
      <div class="theory-section active">
        <h2 class="theory-title">Educational Limitations</h2>
        <p class="theory-subtitle">// Why Classical Ciphers are Cryptographically Obsolete</p>
        <h4>The Cryptanalysis Threat Landscape</h4>
        <p>All 8 classical ciphers implemented in this toolkit can be broken in milliseconds by modern computers using techniques that were already understood in the 19th and early 20th centuries.</p>
        <h4>Attack Methods Against Classical Ciphers</h4>
        <ul class="theory-list">
          <li><strong>Brute Force:</strong> Caesar's 26-key space is exhausted instantly. Rail Fence (2–20 rails) in microseconds.</li>
          <li><strong>Letter Frequency Analysis:</strong> English letters follow a known distribution (E=12.7%, T=9.1%...). All substitution ciphers are vulnerable.</li>
          <li><strong>Kasiski Test:</strong> Finds Vigenère key length by detecting repeated ciphertext sequences.</li>
          <li><strong>Index of Coincidence:</strong> Confirms polyalphabetic key length statistically.</li>
          <li><strong>Known-Plaintext Attack:</strong> Hill Cipher yields key matrix with just 4 known character pairs via linear algebra.</li>
          <li><strong>Digraph Analysis:</strong> Playfair and Hill ciphers are broken by 676-pair frequency tables.</li>
          <li><strong>Anagramming:</strong> Columnar and Rail Fence transpositions are attacked by word-pattern recognition.</li>
        </ul>
        <h4>Modern Cryptographic Standards (Contrast)</h4>
        <ul class="theory-list">
          <li><strong>AES-256:</strong> 2²⁵⁶ key space, confusion + diffusion, resistant to all known attacks.</li>
          <li><strong>RSA-4096:</strong> Based on integer factorization — computationally infeasible to break.</li>
          <li><strong>ECDSA/Ed25519:</strong> Elliptic curve discrete logarithm — 256-bit = 128-bit security level.</li>
          <li><strong>ChaCha20-Poly1305:</strong> Modern stream cipher with authentication (used in TLS 1.3).</li>
        </ul>
        <h4>Educational Value of Classical Ciphers</h4>
        <p>Despite their obsolescence, classical ciphers are invaluable for teaching: substitution (confusion), transposition (diffusion), key spaces, frequency analysis, and the evolution of cryptographic thinking that led to Shannon's information theory and modern cryptography.</p>
        <div class="advisory" style="margin-top:20px;">
          <div class="advisory-icon"><i class="fas fa-triangle-exclamation"></i></div>
          <div>
            <h4>Critical Security Warning</h4>
            <p>NEVER use classical ciphers for real-world security. Use AES-GCM, ChaCha20-Poly1305, or other NIST-approved algorithms for actual data protection.</p>
          </div>
        </div>
      </div>`
  };
  return theories[id] || `<div class="theory-section active"><h2 class="theory-title">${id}</h2><p class="text-dim">Theory content not available.</p></div>`;
}


/* ═══════════════════════════════════════════════════════════════
   INITIALIZATION
═══════════════════════════════════════════════════════════════ */
(function init() {
  setCipherConfig('caesar');
  updateCharCounts();
  renderTheory('caesar');
  renderVisualizer();

  // Initial mini vis
  setTimeout(() => {
    renderMiniVis();
  }, 100);

  // 3D card tilt on playground cards
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      card.style.transform = `perspective(1200px) rotateX(${-y * 1.5}deg) rotateY(${x * 1.5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  console.log('%c🔐 Classical Cryptography Toolkit v2.0', 'color:#00f2fe; font-size:16px; font-weight:bold;');
  console.log('%cAll 8 classical ciphers initialized. Dual Engine (JS + Flask) ready.', 'color:#94b8d8;');
})();
