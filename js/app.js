/**
 * Main Application Orchestrator
 * Connects UI events, cipher execution, visualizers, file handling, and benchmarking.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const cipherSelect = document.getElementById('cipher-select');
  const keyInputLabel = document.getElementById('key-input-label');
  const keyInput = document.getElementById('key-input');
  const keyHelpText = document.getElementById('key-help-text');
  const btnGenKey = document.getElementById('btn-gen-key');
  const plaintextInput = document.getElementById('plaintext-input');
  const charCountBadge = document.getElementById('char-count-badge');
  const btnEncrypt = document.getElementById('btn-encrypt');
  const btnDecrypt = document.getElementById('btn-decrypt');
  const btnClear = document.getElementById('btn-clear');
  const ciphertextOutput = document.getElementById('ciphertext-output');
  const decryptedOutput = document.getElementById('decrypted-output');
  const metricExecTime = document.getElementById('metric-exec-time');
  const metricEntropy = document.getElementById('metric-entropy');
  const metricKeyStatus = document.getElementById('metric-key-status');
  const playgroundMiniVis = document.getElementById('playground-mini-vis');
  const cipherCategoryBadge = document.getElementById('cipher-category-badge');

  // ==========================================
  // 1. TAB NAVIGATION
  // ==========================================
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = document.querySelectorAll('.view-panel');

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      navTabs.forEach(t => t.classList.remove('active'));
      viewPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetViewId = tab.dataset.tab;
      const targetView = document.getElementById(targetViewId);
      if (targetView) targetView.classList.add('active');

      // Auto-trigger tab specific actions
      if (targetViewId === 'visualizer-view') renderSelectedVisualizer();
      if (targetViewId === 'compare-view') runBenchmarkSuite();
      if (targetViewId === 'theory-view') loadTheory('caesar');
    });
  });

  // ==========================================
  // 2. CIPHER SELECTION & KEY CONFIGURATION
  // ==========================================
  const cipherConfigs = {
    caesar: {
      category: 'Substitution',
      label: 'Enter Key (Shift Value)',
      defaultKey: '5',
      help: 'Integer shift value between 1 and 25.',
      genKey: () => Math.floor(Math.random() * 25) + 1
    },
    mono: {
      category: 'Substitution',
      label: 'Substitution Alphabet (26 Unique Letters)',
      defaultKey: 'QWERTYUIOPASDFGHJKLZXCVBNM',
      help: 'Must contain all 26 uppercase letters A-Z without duplicates.',
      genKey: () => window.CryptoEngine.Monoalphabetic.generateRandomKey()
    },
    playfair: {
      category: 'Substitution',
      label: 'Keyword (Playfair Grid Keyword)',
      defaultKey: 'MONARCHY',
      help: 'Keyword used to construct the 5x5 key matrix.',
      genKey: () => ['MONARCHY', 'PLAYFAIR', 'KEYWORD', 'SECURITY', 'CRYPTOGRAPHY'][Math.floor(Math.random() * 5)]
    },
    hill: {
      category: 'Substitution',
      label: '2x2 Key Matrix (4 Numbers or Letters)',
      defaultKey: '5,8,17,3',
      help: '4 values mod 26 (e.g. 5,8,17,3 or HILL) with invertible matrix.',
      genKey: () => ['5,8,17,3', '3,5,1,2', '7,8,11,11', '2,3,1,4'][Math.floor(Math.random() * 4)]
    },
    vigenere: {
      category: 'Polyalphabetic',
      label: 'Vigenère Keyword',
      defaultKey: 'KEYWORD',
      help: 'Alphabetic keyword repeated across text.',
      genKey: () => ['KEYWORD', 'SECRET', 'CIPHER', 'MATRIX', 'VECTOR'][Math.floor(Math.random() * 5)]
    },
    otp: {
      category: 'Polyalphabetic',
      label: 'One-Time Pad Key',
      defaultKey: 'XMCKLPOIUYTREWQA',
      help: 'Key length must be greater than or equal to text length.',
      genKey: () => window.CryptoEngine.OneTimePad.generateRandomKey(plaintextInput.value.length || 16)
    },
    railfence: {
      category: 'Transposition',
      label: 'Number of Rails (Depth)',
      defaultKey: '3',
      help: 'Integer number of rails (minimum 2).',
      genKey: () => Math.floor(Math.random() * 4) + 2
    },
    columnar: {
      category: 'Transposition',
      label: 'Column Keyword or Custom Read Order (e.g. 3,1,4,2 or SECRET)',
      defaultKey: '3,1,4,2',
      help: 'Enter a keyword (e.g. SECRET) or numeric column reading sequence (e.g. 3,1,4,2).',
      genKey: () => ['3,1,4,2', 'SECRET', '4,2,1,3', '2,4,1,3', 'CIPHER'][Math.floor(Math.random() * 5)]
    }
  };

  function updateCipherUI() {
    const selected = cipherSelect.value;
    const cfg = cipherConfigs[selected];

    if (cfg) {
      cipherCategoryBadge.textContent = cfg.category;
      keyInputLabel.textContent = cfg.label;
      keyInput.value = cfg.defaultKey;
      keyHelpText.textContent = cfg.help;
    }
    processCipher('encrypt');
  }

  cipherSelect.addEventListener('change', updateCipherUI);

  btnGenKey.addEventListener('click', () => {
    const selected = cipherSelect.value;
    const cfg = cipherConfigs[selected];
    if (cfg && cfg.genKey) {
      keyInput.value = cfg.genKey();
      showToast('Generated random key!', 'info');
      processCipher('encrypt');
    }
  });

  // ==========================================
  // 3. EXECUTION ENGINE (ENCRYPT / DECRYPT)
  // ==========================================
  function processCipher(mode = 'encrypt') {
    const selected = cipherSelect.value;
    const text = plaintextInput.value;
    const key = keyInput.value;

    charCountBadge.textContent = `${text.length} Chars`;

    if (!text || text.trim().length === 0) {
      ciphertextOutput.textContent = '---';
      decryptedOutput.textContent = '---';
      metricExecTime.textContent = '0.00 ms';
      metricEntropy.textContent = '0.00 bits';
      playgroundMiniVis.innerHTML = '';
      return;
    }

    try {
      let ciphertext = '';
      let decryptedText = '';

      const t0 = performance.now();

      if (mode === 'encrypt') {
        switch (selected) {
          case 'caesar': ciphertext = window.CryptoEngine.Caesar.encrypt(text, key); break;
          case 'mono': ciphertext = window.CryptoEngine.Monoalphabetic.encrypt(text, key); break;
          case 'playfair': ciphertext = window.CryptoEngine.Playfair.encrypt(text, key); break;
          case 'hill': ciphertext = window.CryptoEngine.Hill.encrypt(text, key); break;
          case 'vigenere': ciphertext = window.CryptoEngine.Vigenere.encrypt(text, key); break;
          case 'otp': ciphertext = window.CryptoEngine.OneTimePad.encrypt(text, key); break;
          case 'railfence': ciphertext = window.CryptoEngine.RailFence.encrypt(text, key); break;
          case 'columnar': ciphertext = window.CryptoEngine.ColumnarTransposition.encrypt(text, key); break;
        }

        // Auto verify decryption for confirmation
        switch (selected) {
          case 'caesar': decryptedText = window.CryptoEngine.Caesar.decrypt(ciphertext, key); break;
          case 'mono': decryptedText = window.CryptoEngine.Monoalphabetic.decrypt(ciphertext, key); break;
          case 'playfair': decryptedText = window.CryptoEngine.Playfair.decrypt(ciphertext, key); break;
          case 'hill': decryptedText = window.CryptoEngine.Hill.decrypt(ciphertext, key); break;
          case 'vigenere': decryptedText = window.CryptoEngine.Vigenere.decrypt(ciphertext, key); break;
          case 'otp': decryptedText = window.CryptoEngine.OneTimePad.decrypt(ciphertext, key); break;
          case 'railfence': decryptedText = window.CryptoEngine.RailFence.decrypt(ciphertext, key); break;
          case 'columnar': decryptedText = window.CryptoEngine.ColumnarTransposition.decrypt(ciphertext, key); break;
        }

      } else {
        // Direct Decrypt mode: input is ciphertext
        switch (selected) {
          case 'caesar': decryptedText = window.CryptoEngine.Caesar.decrypt(text, key); break;
          case 'mono': decryptedText = window.CryptoEngine.Monoalphabetic.decrypt(text, key); break;
          case 'playfair': decryptedText = window.CryptoEngine.Playfair.decrypt(text, key); break;
          case 'hill': decryptedText = window.CryptoEngine.Hill.decrypt(text, key); break;
          case 'vigenere': decryptedText = window.CryptoEngine.Vigenere.decrypt(text, key); break;
          case 'otp': decryptedText = window.CryptoEngine.OneTimePad.decrypt(text, key); break;
          case 'railfence': decryptedText = window.CryptoEngine.RailFence.decrypt(text, key); break;
          case 'columnar': decryptedText = window.CryptoEngine.ColumnarTransposition.decrypt(text, key); break;
        }
        ciphertext = text;
      }

      const t1 = performance.now();
      const execTime = (t1 - t0).toFixed(3);

      ciphertextOutput.textContent = ciphertext;
      decryptedOutput.textContent = decryptedText;

      // Metrics
      metricExecTime.textContent = `${execTime} ms`;
      const entropy = window.BenchmarkEngine.calculateEntropy(ciphertext);
      metricEntropy.textContent = `${entropy} bits/char`;

      metricKeyStatus.textContent = 'Valid';
      metricKeyStatus.style.color = 'var(--accent-emerald)';

      // Render mini visualizer inside playground card
      renderPlaygroundMiniVisualizer(selected, key, text);

    } catch (err) {
      ciphertextOutput.textContent = 'ERROR';
      decryptedOutput.textContent = 'ERROR';
      metricKeyStatus.textContent = 'Invalid Key';
      metricKeyStatus.style.color = '#ef4444';
      playgroundMiniVis.innerHTML = `<div style="color:#ef4444; font-size:12px; margin-top:10px;"><i class="fas fa-exclamation-triangle"></i> ${err.message}</div>`;
    }
  }

  function renderPlaygroundMiniVisualizer(cipher, key, text) {
    if (cipher === 'playfair') {
      playgroundMiniVis.innerHTML = window.Visualizers.renderPlayfair(key);
    } else if (cipher === 'hill') {
      playgroundMiniVis.innerHTML = window.Visualizers.renderHill(key);
    } else if (cipher === 'railfence') {
      playgroundMiniVis.innerHTML = window.Visualizers.renderRailFence(text, key);
    } else if (cipher === 'columnar') {
      playgroundMiniVis.innerHTML = window.Visualizers.renderColumnar(text, key);
    } else if (cipher === 'vigenere') {
      playgroundMiniVis.innerHTML = window.Visualizers.renderVigenere(text, key);
    } else {
      playgroundMiniVis.innerHTML = '';
    }
  }

  // Input Event Listeners
  btnEncrypt.addEventListener('click', () => processCipher('encrypt'));
  btnDecrypt.addEventListener('click', () => processCipher('decrypt'));

  plaintextInput.addEventListener('input', () => processCipher('encrypt'));
  keyInput.addEventListener('input', () => processCipher('encrypt'));

  btnClear.addEventListener('click', () => {
    plaintextInput.value = '';
    ciphertextOutput.textContent = '---';
    decryptedOutput.textContent = '---';
    charCountBadge.textContent = '0 Chars';
    playgroundMiniVis.innerHTML = '';
  });

  // Sample Presets
  document.querySelectorAll('.preset-pill[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      plaintextInput.value = btn.dataset.preset;
      processCipher('encrypt');
    });
  });

  // Copy Buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetElem = document.getElementById(targetId);
      if (targetElem && targetElem.textContent !== '---') {
        navigator.clipboard.writeText(targetElem.textContent);
        showToast('Copied to clipboard!', 'success');
      }
    });
  });

  // ==========================================
  // 4. INTERACTIVE VISUALIZERS VIEW
  // ==========================================
  const visTabBtns = document.querySelectorAll('.vis-tab-btn');
  const visContainer = document.getElementById('visualizer-main-container');

  visTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      visTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSelectedVisualizer();
    });
  });

  function renderSelectedVisualizer() {
    const activeTab = document.querySelector('.vis-tab-btn.active');
    const visType = activeTab ? activeTab.dataset.vis : 'playfair';
    const text = plaintextInput.value || 'NETWORKSECURITY';

    let html = '';
    if (visType === 'playfair') html = window.Visualizers.renderPlayfair(keyInput.value || 'MONARCHY');
    else if (visType === 'hill') html = window.Visualizers.renderHill(keyInput.value || '5,8,17,3');
    else if (visType === 'railfence') html = window.Visualizers.renderRailFence(text, keyInput.value || '3');
    else if (visType === 'columnar') html = window.Visualizers.renderColumnar(text, keyInput.value || 'SECRET');
    else if (visType === 'vigenere') html = window.Visualizers.renderVigenere(text, keyInput.value || 'KEYWORD');

    visContainer.innerHTML = html;
  }

  // ==========================================
  // 5. ALGORITHM BENCHMARK ENGINE VIEW
  // ==========================================
  const btnRunBenchmark = document.getElementById('btn-run-benchmark');
  const benchmarkResultsBody = document.getElementById('benchmark-results-body');

  function runBenchmarkSuite() {
    const results = window.BenchmarkEngine.runComparison(plaintextInput.value);
    let html = '';

    const maxSpeed = Math.max(...results.map(r => r.charsPerSec || 1));

    results.forEach(r => {
      const percentage = Math.min(100, Math.max(8, Math.round((r.charsPerSec / maxSpeed) * 100)));
      html += `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td><span class="preset-pill">${r.category}</span></td>
          <td style="font-family:var(--font-mono);">${r.encTimeMs} ms</td>
          <td style="font-family:var(--font-mono);">${r.decTimeMs} ms</td>
          <td style="font-family:var(--font-mono); color:var(--accent-cyan);">${r.entropy}</td>
          <td style="width:240px;">
            <div style="font-size:11px; color:var(--text-muted); font-weight:600;">${r.charsPerSec.toLocaleString()} chars/sec</div>
            <div class="bar-container">
              <div class="bar-fill" style="width: ${percentage}%;"></div>
            </div>
          </td>
        </tr>
      `;
    });

    benchmarkResultsBody.innerHTML = html;
  }

  if (btnRunBenchmark) btnRunBenchmark.addEventListener('click', runBenchmarkSuite);

  // ==========================================
  // 6. FILE ENCRYPTION / DECRYPTION
  // ==========================================
  const fileUploadInput = document.getElementById('file-upload-input');
  const fileCipherSelect = document.getElementById('file-cipher-select');
  const fileKeyInput = document.getElementById('file-key-input');
  const btnFileEncrypt = document.getElementById('btn-file-encrypt');
  const btnFileDecrypt = document.getElementById('btn-file-decrypt');
  const filePreviewText = document.getElementById('file-preview-text');
  const btnDownloadFile = document.getElementById('btn-download-file');

  let uploadedFileContent = '';
  let processedFileContent = '';

  if (fileUploadInput) {
    fileUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          uploadedFileContent = event.target.result;
          filePreviewText.textContent = uploadedFileContent;
          showToast(`File "${file.name}" loaded successfully.`, 'info');
        };
        reader.readAsText(file);
      }
    });
  }

  if (btnFileEncrypt) {
    btnFileEncrypt.addEventListener('click', () => {
      if (!uploadedFileContent) return showToast('Please upload a .txt file first.', 'warning');
      const selected = fileCipherSelect.value;
      const key = fileKeyInput.value;
      try {
        switch (selected) {
          case 'caesar': processedFileContent = window.CryptoEngine.Caesar.encrypt(uploadedFileContent, key); break;
          case 'mono': processedFileContent = window.CryptoEngine.Monoalphabetic.encrypt(uploadedFileContent, key); break;
          case 'playfair': processedFileContent = window.CryptoEngine.Playfair.encrypt(uploadedFileContent, key); break;
          case 'hill': processedFileContent = window.CryptoEngine.Hill.encrypt(uploadedFileContent, key); break;
          case 'vigenere': processedFileContent = window.CryptoEngine.Vigenere.encrypt(uploadedFileContent, key); break;
          case 'railfence': processedFileContent = window.CryptoEngine.RailFence.encrypt(uploadedFileContent, key); break;
          case 'columnar': processedFileContent = window.CryptoEngine.ColumnarTransposition.encrypt(uploadedFileContent, key); break;
        }
        filePreviewText.textContent = processedFileContent;
        btnDownloadFile.disabled = false;
        showToast('File encrypted successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'warning');
      }
    });
  }

  if (btnFileDecrypt) {
    btnFileDecrypt.addEventListener('click', () => {
      if (!uploadedFileContent) return showToast('Please upload a .txt file first.', 'warning');
      const selected = fileCipherSelect.value;
      const key = fileKeyInput.value;
      try {
        switch (selected) {
          case 'caesar': processedFileContent = window.CryptoEngine.Caesar.decrypt(uploadedFileContent, key); break;
          case 'mono': processedFileContent = window.CryptoEngine.Monoalphabetic.decrypt(uploadedFileContent, key); break;
          case 'playfair': processedFileContent = window.CryptoEngine.Playfair.decrypt(uploadedFileContent, key); break;
          case 'hill': processedFileContent = window.CryptoEngine.Hill.decrypt(uploadedFileContent, key); break;
          case 'vigenere': processedFileContent = window.CryptoEngine.Vigenere.decrypt(uploadedFileContent, key); break;
          case 'railfence': processedFileContent = window.CryptoEngine.RailFence.decrypt(uploadedFileContent, key); break;
          case 'columnar': processedFileContent = window.CryptoEngine.ColumnarTransposition.decrypt(uploadedFileContent, key); break;
        }
        filePreviewText.textContent = processedFileContent;
        btnDownloadFile.disabled = false;
        showToast('File decrypted successfully!', 'success');
      } catch (err) {
        showToast(err.message, 'warning');
      }
    });
  }

  if (btnDownloadFile) {
    btnDownloadFile.addEventListener('click', () => {
      if (!processedFileContent) return;
      const blob = new Blob([processedFileContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'encrypted_result.txt';
      a.click();
      showToast('Downloading file...', 'info');
    });
  }

  // ==========================================
  // 7. THEORY HUB VIEW
  // ==========================================
  const theoryNavItems = document.querySelectorAll('.theory-nav-item');
  const theoryContentBody = document.getElementById('theory-content-body');

  theoryNavItems.forEach(item => {
    item.addEventListener('click', () => {
      theoryNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadTheory(item.dataset.cipher);
    });
  });

  function loadTheory(cipherKey) {
    const data = window.TheoryData.ciphers[cipherKey];
    if (!data) return;

    theoryContentBody.innerHTML = `
      <div class="card-header">
        <h2 class="card-title"><i class="fas fa-book"></i> ${data.name}</h2>
        <span class="preset-pill">${data.category}</span>
      </div>

      <p style="margin-bottom:16px;"><strong>Historical Background / Origin:</strong> ${data.inventor}</p>
      
      <p style="margin-bottom:16px;">${data.overview}</p>

      <div class="formula-card">
        <div><strong>Encryption Formula:</strong> ${data.formulaEnc}</div>
        <div><strong>Decryption Formula:</strong> ${data.formulaDec}</div>
      </div>

      <h4 style="color:var(--accent-cyan); margin-top:20px;">Worked Example</h4>
      <p class="text-muted" style="margin-bottom:16px;">${data.example}</p>

      <h4 style="color:var(--accent-emerald); margin-top:16px;">Strengths</h4>
      <p class="text-muted" style="margin-bottom:16px;">${data.strengths}</p>

      <h4 style="color:#ef4444; margin-top:16px;">Security Vulnerabilities & Cryptanalysis</h4>
      <p class="text-muted">${data.weakness} (Method: ${data.cryptanalysis})</p>
    `;
  }

  // ==========================================
  // TOAST NOTIFICATION HELPER
  // ==========================================
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // INITIAL LOAD
  updateCipherUI();
});
