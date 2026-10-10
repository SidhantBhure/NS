/**
 * Classical Cryptography Engine
 * Complete, mathematically rigorous implementation of 8 classical ciphers
 * with full input validation, edge-case handling, and cryptographic telemetry.
 */

const CryptoEngine = {
  // Helper: sanitize input to uppercase A-Z only
  cleanAlphabet: (text) => (text ? text.toUpperCase().replace(/[^A-Z]/g, '') : ''),

  // Helper: GCD (Greatest Common Divisor)
  gcd: (a, b) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },

  // Helper: Modular Multiplicative Inverse modulo m (default 26)
  modInverse: (a, m = 26) => {
    a = ((a % m) + m) % m;
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return null;
  },

  // Helper: Shannon Entropy in bits per character
  calculateEntropy: (text) => {
    if (!text || text.length === 0) return 0;
    const freqs = {};
    for (const char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    let entropy = 0;
    const len = text.length;
    for (const char in freqs) {
      const p = freqs[char] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(3));
  },

  // Helper: Secure Random Alphabet Generation (Web Crypto API / fallback)
  getRandomValues: (count) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint8Array(count);
      crypto.getRandomValues(arr);
      return arr;
    }
    // Fallback for Node.js / older engines
    const arr = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },

  // ==========================================
  // 1. CAESAR CIPHER
  // ==========================================
  Caesar: {
    encrypt: (text, shift) => {
      if (text === null || text === undefined) return '';
      const s = parseInt(shift, 10);
      if (isNaN(s)) throw new Error('Caesar Cipher shift key must be a valid integer.');
      const normShift = ((s % 26) + 26) % 26;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const base = char >= 'a' ? 97 : 65;
        return String.fromCharCode(((char.charCodeAt(0) - base + normShift) % 26) + base);
      });
    },

    decrypt: (text, shift) => {
      if (text === null || text === undefined) return '';
      const s = parseInt(shift, 10);
      if (isNaN(s)) throw new Error('Caesar Cipher shift key must be a valid integer.');
      return CryptoEngine.Caesar.encrypt(text, -s);
    }
  },

  // ==========================================
  // 2. MONOALPHABETIC SUBSTITUTION CIPHER
  // ==========================================
  Monoalphabetic: {
    generateRandomKey: () => {
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const randBytes = CryptoEngine.getRandomValues(alpha.length * 2);
      for (let i = alpha.length - 1; i > 0; i--) {
        const j = randBytes[i] % (i + 1);
        [alpha[i], alpha[j]] = [alpha[j], alpha[i]];
      }
      return alpha.join('');
    },

    validateKey: (key) => {
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (cleanKey.length !== 26) {
        return { valid: false, message: `Key contains ${cleanKey.length} letters; exactly 26 unique letters required.` };
      }
      const unique = new Set(cleanKey.split(''));
      if (unique.size !== 26) {
        const missing = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c => !unique.has(c));
        return { valid: false, message: `Key contains duplicate letters. Missing letters: ${missing.join(', ')}` };
      }
      return { valid: true, cleanKey };
    },

    encrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const validation = CryptoEngine.Monoalphabetic.validateKey(key);
      if (!validation.valid) throw new Error(validation.message);
      const cleanKey = validation.cleanKey;
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const idx = alpha.indexOf(char.toUpperCase());
        const subChar = cleanKey[idx];
        return isLower ? subChar.toLowerCase() : subChar;
      });
    },

    decrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const validation = CryptoEngine.Monoalphabetic.validateKey(key);
      if (!validation.valid) throw new Error(validation.message);
      const cleanKey = validation.cleanKey;
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const idx = cleanKey.indexOf(char.toUpperCase());
        const origChar = alpha[idx];
        return isLower ? origChar.toLowerCase() : origChar;
      });
    }
  },

  // ==========================================
  // 3. PLAYFAIR CIPHER (5x5 Matrix)
  // ==========================================
  Playfair: {
    generateMatrix: (keyword) => {
      const cleanKey = CryptoEngine.cleanAlphabet(keyword).replace(/J/g, 'I');
      const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // J omitted / merged into I
      const matrixChars = [];
      const used = new Set();

      for (const ch of cleanKey) {
        if (!used.has(ch)) {
          used.add(ch);
          matrixChars.push(ch);
        }
      }
      for (const ch of alphabet) {
        if (!used.has(ch)) {
          used.add(ch);
          matrixChars.push(ch);
        }
      }

      const grid = [];
      for (let r = 0; r < 5; r++) {
        grid.push(matrixChars.slice(r * 5, r * 5 + 5));
      }
      return grid;
    },

    findPosition: (grid, letter) => {
      if (letter === 'J') letter = 'I';
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (grid[r][c] === letter) return { r, c };
        }
      }
      return null;
    },

    preprocessText: (text) => {
      let clean = CryptoEngine.cleanAlphabet(text).replace(/J/g, 'I');
      if (!clean) return '';
      let result = '';
      let i = 0;
      while (i < clean.length) {
        const first = clean[i];
        const second = (i + 1 < clean.length) ? clean[i + 1] : null;

        if (!second) {
          // Odd length final letter padded with 'X' (or 'Z' if first is 'X')
          result += first + (first === 'X' ? 'Z' : 'X');
          i += 1;
        } else if (first === second) {
          // Repeated letters: insert filler 'X' (or 'Z' if letter is 'X')
          result += first + (first === 'X' ? 'Z' : 'X');
          i += 1;
        } else {
          result += first + second;
          i += 2;
        }
      }
      return result;
    },

    encrypt: (text, keyword) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(keyword);
      if (!cleanKey) throw new Error('Playfair Cipher requires a non-empty alphabetic keyword.');

      const grid = CryptoEngine.Playfair.generateMatrix(cleanKey);
      const preprocessed = CryptoEngine.Playfair.preprocessText(text);
      if (!preprocessed) return '';

      let ciphertext = '';
      for (let i = 0; i < preprocessed.length; i += 2) {
        const p1 = CryptoEngine.Playfair.findPosition(grid, preprocessed[i]);
        const p2 = CryptoEngine.Playfair.findPosition(grid, preprocessed[i + 1]);

        if (p1.r === p2.r) {
          // Same row: shift right circularly
          ciphertext += grid[p1.r][(p1.c + 1) % 5];
          ciphertext += grid[p2.r][(p2.c + 1) % 5];
        } else if (p1.c === p2.c) {
          // Same column: shift down circularly
          ciphertext += grid[(p1.r + 1) % 5][p1.c];
          ciphertext += grid[(p2.r + 1) % 5][p2.c];
        } else {
          // Rectangle: swap column coordinates
          ciphertext += grid[p1.r][p2.c];
          ciphertext += grid[p2.r][p1.c];
        }
      }
      return ciphertext;
    },

    decrypt: (text, keyword) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(keyword);
      if (!cleanKey) throw new Error('Playfair Cipher requires a non-empty alphabetic keyword.');

      const grid = CryptoEngine.Playfair.generateMatrix(cleanKey);
      const clean = CryptoEngine.cleanAlphabet(text).replace(/J/g, 'I');
      if (!clean) return '';
      if (clean.length % 2 !== 0) {
        throw new Error('Playfair ciphertext must have an even number of letters (digraph pairs).');
      }

      let plaintext = '';
      for (let i = 0; i < clean.length; i += 2) {
        const p1 = CryptoEngine.Playfair.findPosition(grid, clean[i]);
        const p2 = CryptoEngine.Playfair.findPosition(grid, clean[i + 1]);
        if (!p1 || !p2) continue;

        if (p1.r === p2.r) {
          // Same row: shift left circularly
          plaintext += grid[p1.r][(p1.c + 4) % 5];
          plaintext += grid[p2.r][(p2.c + 4) % 5];
        } else if (p1.c === p2.c) {
          // Same column: shift up circularly
          plaintext += grid[(p1.r + 4) % 5][p1.c];
          plaintext += grid[(p2.r + 4) % 5][p2.c];
        } else {
          // Rectangle: swap column coordinates
          plaintext += grid[p1.r][p2.c];
          plaintext += grid[p2.r][p1.c];
        }
      }
      return plaintext;
    }
  },

  // ==========================================
  // 4. HILL CIPHER (2x2 Matrix)
  // ==========================================
  Hill: {
    parseKeyMatrix: (keyInput) => {
      let nums = [];

      if (Array.isArray(keyInput)) {
        nums = keyInput.map(n => parseInt(n, 10));
      } else {
        const cleanStr = (keyInput || '').toString().trim();
        if (cleanStr.includes(',') || cleanStr.includes(' ')) {
          nums = cleanStr.split(/[\s,]+/).map(n => parseInt(n, 10));
        } else {
          const alphaKey = CryptoEngine.cleanAlphabet(cleanStr);
          nums = alphaKey.split('').map(ch => ch.charCodeAt(0) - 65);
        }
      }

      if (nums.length !== 4 || nums.some(isNaN)) {
        throw new Error('Hill Cipher (2x2) requires 4 integer values or a 4-letter keyword (e.g., "5,8,17,3" or "HILL").');
      }

      const k11 = ((nums[0] % 26) + 26) % 26;
      const k12 = ((nums[1] % 26) + 26) % 26;
      const k21 = ((nums[2] % 26) + 26) % 26;
      const k22 = ((nums[3] % 26) + 26) % 26;

      const rawDet = k11 * k22 - k12 * k21;
      const det = ((rawDet % 26) + 26) % 26;
      const gcd = CryptoEngine.gcd(det, 26);

      if (gcd !== 1) {
        throw new Error(`Matrix is NOT invertible mod 26! Determinant is ${det} (mod 26), which shares factor with 26 (gcd=${gcd}). det must be coprime to 26.`);
      }

      const detInv = CryptoEngine.modInverse(det, 26);
      if (detInv === null) {
        throw new Error(`Could not find modular inverse for determinant ${det} modulo 26.`);
      }

      // Inverse Matrix = detInv * adj(K) (mod 26)
      // adj(K) = [[k22, -k12], [-k21, k11]]
      const inv11 = ((k22 * detInv) % 26 + 26) % 26;
      const inv12 = (((-k12) * detInv) % 26 + 26) % 26;
      const inv21 = (((-k21) * detInv) % 26 + 26) % 26;
      const inv22 = ((k11 * detInv) % 26 + 26) % 26;

      return {
        matrix: [[k11, k12], [k21, k22]],
        det,
        detInv,
        invMatrix: [[inv11, inv12], [inv21, inv22]]
      };
    },

    encrypt: (text, keyInput) => {
      if (text === null || text === undefined) return '';
      const keyInfo = CryptoEngine.Hill.parseKeyMatrix(keyInput);
      let clean = CryptoEngine.cleanAlphabet(text);
      if (!clean) return '';

      // Pad odd length with 'X'
      if (clean.length % 2 !== 0) clean += 'X';

      let result = '';
      for (let i = 0; i < clean.length; i += 2) {
        const p1 = clean.charCodeAt(i) - 65;
        const p2 = clean.charCodeAt(i + 1) - 65;

        const c1 = (keyInfo.matrix[0][0] * p1 + keyInfo.matrix[0][1] * p2) % 26;
        const c2 = (keyInfo.matrix[1][0] * p1 + keyInfo.matrix[1][1] * p2) % 26;

        result += String.fromCharCode(c1 + 65) + String.fromCharCode(c2 + 65);
      }
      return result;
    },

    decrypt: (text, keyInput) => {
      if (text === null || text === undefined) return '';
      const keyInfo = CryptoEngine.Hill.parseKeyMatrix(keyInput);
      const clean = CryptoEngine.cleanAlphabet(text);
      if (!clean) return '';
      if (clean.length % 2 !== 0) {
        throw new Error('Hill Cipher ciphertext length must be an even number (multiple of 2 for 2x2 matrix).');
      }

      let result = '';
      for (let i = 0; i < clean.length; i += 2) {
        const c1 = clean.charCodeAt(i) - 65;
        const c2 = clean.charCodeAt(i + 1) - 65;

        const p1 = (keyInfo.invMatrix[0][0] * c1 + keyInfo.invMatrix[0][1] * c2) % 26;
        const p2 = (keyInfo.invMatrix[1][0] * c1 + keyInfo.invMatrix[1][1] * c2) % 26;

        result += String.fromCharCode(p1 + 65) + String.fromCharCode(p2 + 65);
      }
      return result;
    }
  },

  // ==========================================
  // 5. VIGENÈRE CIPHER
  // ==========================================
  Vigenere: {
    encrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Vigenère Cipher requires an alphabetic keyword (e.g. "KEYWORD").');

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const p = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        keyIdx++;
        const c = (p + k) % 26;
        return String.fromCharCode(c + base);
      });
    },

    decrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      if (!cleanKey) throw new Error('Vigenère Cipher requires an alphabetic keyword (e.g. "KEYWORD").');

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const c = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
        keyIdx++;
        const p = (c - k + 26) % 26;
        return String.fromCharCode(p + base);
      });
    }
  },

  // ==========================================
  // 6. ONE-TIME PAD (OTP)
  // ==========================================
  OneTimePad: {
    generateRandomKey: (length) => {
      const len = Math.max(1, parseInt(length, 10) || 16);
      const randBytes = CryptoEngine.getRandomValues(len);
      let key = '';
      for (let i = 0; i < len; i++) {
        key += String.fromCharCode((randBytes[i] % 26) + 65);
      }
      return key;
    },

    encrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      const letterCount = (text.match(/[a-zA-Z]/g) || []).length;

      if (!cleanKey) throw new Error('One-Time Pad requires an alphabetic key.');
      if (cleanKey.length < letterCount) {
        throw new Error(`One-Time Pad key length (${cleanKey.length}) is shorter than plaintext letter count (${letterCount}). OTP requires key length >= letter count.`);
      }

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const p = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx) - 65;
        keyIdx++;
        const c = (p + k) % 26;
        return String.fromCharCode(c + base);
      });
    },

    decrypt: (text, key) => {
      if (text === null || text === undefined) return '';
      const cleanKey = CryptoEngine.cleanAlphabet(key);
      const letterCount = (text.match(/[a-zA-Z]/g) || []).length;

      if (!cleanKey) throw new Error('One-Time Pad requires an alphabetic key.');
      if (cleanKey.length < letterCount) {
        throw new Error(`One-Time Pad key length (${cleanKey.length}) is shorter than ciphertext letter count (${letterCount}).`);
      }

      let keyIdx = 0;
      return text.replace(/[a-zA-Z]/g, (char) => {
        const isLower = char >= 'a' && char <= 'z';
        const base = isLower ? 97 : 65;
        const c = char.charCodeAt(0) - base;
        const k = cleanKey.charCodeAt(keyIdx) - 65;
        keyIdx++;
        const p = (c - k + 26) % 26;
        return String.fromCharCode(p + base);
      });
    }
  },

  // ==========================================
  // 7. RAIL FENCE CIPHER (Zigzag Transposition)
  // ==========================================
  RailFence: {
    encrypt: (text, rails) => {
      if (text === null || text === undefined) return '';
      const depth = parseInt(rails, 10);
      if (isNaN(depth) || depth < 2) {
        throw new Error('Rail Fence Cipher requires at least 2 rails (depth >= 2).');
      }
      if (text.length <= 1 || depth >= text.length) return text;

      const matrix = Array.from({ length: depth }, () => []);
      let rail = 0;
      let direction = 1; // 1: down, -1: up

      for (let i = 0; i < text.length; i++) {
        matrix[rail].push(text[i]);
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      return matrix.map(r => r.join('')).join('');
    },

    decrypt: (text, rails) => {
      if (text === null || text === undefined) return '';
      const depth = parseInt(rails, 10);
      if (isNaN(depth) || depth < 2) {
        throw new Error('Rail Fence Cipher requires at least 2 rails (depth >= 2).');
      }
      if (text.length <= 1 || depth >= text.length) return text;

      // Mark matrix cells along zigzag trajectory
      const markMatrix = Array.from({ length: depth }, () => Array(text.length).fill(null));
      let rail = 0;
      let direction = 1;

      for (let i = 0; i < text.length; i++) {
        markMatrix[rail][i] = '*';
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      // Fill characters into marked cells row by row
      let idx = 0;
      for (let r = 0; r < depth; r++) {
        for (let c = 0; c < text.length; c++) {
          if (markMatrix[r][c] === '*' && idx < text.length) {
            markMatrix[r][c] = text[idx++];
          }
        }
      }

      // Read characters following zigzag trajectory
      let result = '';
      rail = 0;
      direction = 1;
      for (let i = 0; i < text.length; i++) {
        result += markMatrix[rail][i];
        rail += direction;
        if (rail === depth - 1 || rail === 0) direction *= -1;
      }

      return result;
    }
  },

  // ==========================================
  // 8. COLUMNAR TRANSPOSITION CIPHER
  // ==========================================
  ColumnarTransposition: {
    getKeyOrder: (key) => {
      const cleanKey = (key || '').toString().trim();
      if (!cleanKey) {
        throw new Error('Columnar Transposition requires a keyword (e.g., "SECRET") or numeric column order (e.g., "3,1,4,2").');
      }

      // Check for numeric order e.g. "3,1,4,2" or "3 1 4 2"
      if (/^[\d\s,]+$/.test(cleanKey)) {
        const nums = cleanKey.split(/[\s,]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
        if (nums.length === 0) throw new Error('Column order key must contain valid numbers.');
        const minVal = Math.min(...nums);
        // Map 1-indexed sequence to 0-indexed column indices
        const zeroIndexed = nums.map(n => minVal === 1 ? n - 1 : n);
        const unique = new Set(zeroIndexed);
        if (unique.size !== zeroIndexed.length) {
          throw new Error('Numeric column reading order contains duplicate indices.');
        }
        return zeroIndexed;
      }

      // Keyword alphabetical order with stable sort for repeated letters
      const cleanKeyStr = CryptoEngine.cleanAlphabet(cleanKey);
      if (!cleanKeyStr) throw new Error('Columnar Transposition requires a valid alphabetic keyword.');

      const indexedKey = cleanKeyStr.split('').map((char, index) => ({ char, index }));
      // Stable sort: when characters match, retain original left-to-right order
      indexedKey.sort((a, b) => a.char === b.char ? a.index - b.index : a.char.localeCompare(b.char));

      return indexedKey.map(item => item.index);
    },

    encrypt: (text, key, padWithX = false) => {
      if (text === null || text === undefined) return '';
      const keyOrder = CryptoEngine.ColumnarTransposition.getKeyOrder(key);
      const numCols = keyOrder.length;
      let cleanText = CryptoEngine.cleanAlphabet(text);
      if (cleanText.length === 0) return '';

      const numRows = Math.ceil(cleanText.length / numCols);

      if (padWithX) {
        const paddedLength = numRows * numCols;
        cleanText = cleanText.padEnd(paddedLength, 'X');
        let ciphertext = '';
        for (const colIdx of keyOrder) {
          for (let r = 0; r < numRows; r++) {
            ciphertext += cleanText[r * numCols + colIdx];
          }
        }
        return ciphertext;
      } else {
        // Incomplete final row (exact unpadded transposition)
        const fullCols = cleanText.length % numCols;
        const colLengths = Array.from({ length: numCols }, (_, c) =>
          (fullCols === 0 || c < fullCols) ? numRows : numRows - 1
        );

        let ciphertext = '';
        for (const colIdx of keyOrder) {
          const len = colLengths[colIdx];
          for (let r = 0; r < len; r++) {
            ciphertext += cleanText[r * numCols + colIdx];
          }
        }
        return ciphertext;
      }
    },

    decrypt: (text, key, padWithX = false) => {
      if (text === null || text === undefined) return '';
      const keyOrder = CryptoEngine.ColumnarTransposition.getKeyOrder(key);
      const numCols = keyOrder.length;
      const cleanText = CryptoEngine.cleanAlphabet(text);
      if (cleanText.length === 0) return '';

      const numRows = Math.ceil(cleanText.length / numCols);

      if (padWithX) {
        const grid = Array.from({ length: numRows }, () => Array(numCols).fill(''));
        let idx = 0;
        for (const colIdx of keyOrder) {
          for (let r = 0; r < numRows; r++) {
            if (idx < cleanText.length) {
              grid[r][colIdx] = cleanText[idx++];
            }
          }
        }
        let plaintext = '';
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            plaintext += grid[r][c];
          }
        }
        return plaintext;
      } else {
        // Incomplete final row (exact unpadded transposition)
        const fullCols = cleanText.length % numCols;
        const colLengths = Array.from({ length: numCols }, (_, c) =>
          (fullCols === 0 || c < fullCols) ? numRows : numRows - 1
        );

        const grid = Array.from({ length: numRows }, () => Array(numCols).fill(null));
        let idx = 0;
        for (const colIdx of keyOrder) {
          const len = colLengths[colIdx];
          for (let r = 0; r < len; r++) {
            if (idx < cleanText.length) {
              grid[r][colIdx] = cleanText[idx++];
            }
          }
        }

        let plaintext = '';
        for (let r = 0; r < numRows; r++) {
          for (let c = 0; c < numCols; c++) {
            if (grid[r][c] !== null) plaintext += grid[r][c];
          }
        }
        return plaintext;
      }
    }
  }
};

// Export globally for browser & module support
if (typeof window !== 'undefined') {
  window.CryptoEngine = CryptoEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoEngine;
}
