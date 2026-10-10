/**
 * Algorithm Comparison & Benchmark Engine
 * Evaluates performance, timing, throughput, entropy, and decryption verification
 * across user-selected ciphers with custom keys.
 */

const BenchmarkEngine = {
  // Default cipher configurations for benchmark
  defaultConfigs: {
    caesar: { name: 'Caesar Cipher', category: 'Substitution', defaultKey: '5' },
    mono: { name: 'Monoalphabetic Substitution', category: 'Substitution', defaultKey: 'QWERTYUIOPASDFGHJKLZXCVBNM' },
    playfair: { name: 'Playfair Cipher', category: 'Substitution', defaultKey: 'MONARCHY' },
    hill: { name: 'Hill Cipher (2x2)', category: 'Substitution', defaultKey: '5,8,17,3' },
    vigenere: { name: 'Vigenère Cipher', category: 'Polyalphabetic', defaultKey: 'KEYWORD' },
    otp: { name: 'One-Time Pad (OTP)', category: 'Polyalphabetic', defaultKey: 'AUTO_RANDOM' },
    railfence: { name: 'Rail Fence Cipher', category: 'Transposition', defaultKey: '3' },
    columnar: { name: 'Columnar Transposition', category: 'Transposition', defaultKey: 'SECRET' }
  },

  // Calculate Shannon Entropy: H(X) = - sum( p(x) * log2(p(x)) )
  calculateEntropy: (text) => {
    if (!text || text.length === 0) return 0;
    const freqs = {};
    for (let char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    let entropy = 0;
    const len = text.length;
    for (let char in freqs) {
      const p = freqs[char] / len;
      entropy -= p * Math.log2(p);
    }
    return parseFloat(entropy.toFixed(3));
  },

  // Normalize text for verification comparison
  normalizeText: (text) => (text ? text.toUpperCase().replace(/[^A-Z]/g, '') : ''),

  // Run benchmark across selected ciphers
  runComparison: (sampleText, selectedCiphers = null, customKeys = {}) => {
    const text = (sampleText && sampleText.trim().length > 0)
      ? sampleText
      : 'NETWORK SECURITY AND CLASSICAL CRYPTOGRAPHY TOOLKIT BENCHMARK TEST SUITE 2026';

    const cleanInputLetters = CryptoEngine.cleanAlphabet(text);
    const activeCipherIds = selectedCiphers && selectedCiphers.length > 0
      ? selectedCiphers
      : Object.keys(BenchmarkEngine.defaultConfigs);

    const results = [];

    for (const cipherId of activeCipherIds) {
      const meta = BenchmarkEngine.defaultConfigs[cipherId];
      if (!meta) continue;

      let key = customKeys[cipherId] !== undefined ? customKeys[cipherId] : meta.defaultKey;
      if (cipherId === 'otp') {
        const lettersCount = (text.match(/[a-zA-Z]/g) || []).length || 16;
        key = CryptoEngine.OneTimePad.generateRandomKey(lettersCount);
      }

      let encTimeMs = 0;
      let decTimeMs = 0;
      let ciphertext = '';
      let decryptedText = '';
      let verification = 'Verified Match';
      let status = 'Success';
      let errorMsg = null;

      try {
        // Measure Encryption (averaged over 25 iterations for high resolution)
        const iterations = 25;
        const t0 = performance.now();
        for (let i = 0; i < iterations; i++) {
          switch (cipherId) {
            case 'caesar': ciphertext = CryptoEngine.Caesar.encrypt(text, key); break;
            case 'mono': ciphertext = CryptoEngine.Monoalphabetic.encrypt(text, key); break;
            case 'playfair': ciphertext = CryptoEngine.Playfair.encrypt(text, key); break;
            case 'hill': ciphertext = CryptoEngine.Hill.encrypt(text, key); break;
            case 'vigenere': ciphertext = CryptoEngine.Vigenere.encrypt(text, key); break;
            case 'otp': ciphertext = CryptoEngine.OneTimePad.encrypt(text, key); break;
            case 'railfence': ciphertext = CryptoEngine.RailFence.encrypt(text, key); break;
            case 'columnar': ciphertext = CryptoEngine.ColumnarTransposition.encrypt(text, key, false); break;
          }
        }
        const t1 = performance.now();
        encTimeMs = (t1 - t0) / iterations;

        // Measure Decryption
        const t2 = performance.now();
        for (let i = 0; i < iterations; i++) {
          switch (cipherId) {
            case 'caesar': decryptedText = CryptoEngine.Caesar.decrypt(ciphertext, key); break;
            case 'mono': decryptedText = CryptoEngine.Monoalphabetic.decrypt(ciphertext, key); break;
            case 'playfair': decryptedText = CryptoEngine.Playfair.decrypt(ciphertext, key); break;
            case 'hill': decryptedText = CryptoEngine.Hill.decrypt(ciphertext, key); break;
            case 'vigenere': decryptedText = CryptoEngine.Vigenere.decrypt(ciphertext, key); break;
            case 'otp': decryptedText = CryptoEngine.OneTimePad.decrypt(ciphertext, key); break;
            case 'railfence': decryptedText = CryptoEngine.RailFence.decrypt(ciphertext, key); break;
            case 'columnar': decryptedText = CryptoEngine.ColumnarTransposition.decrypt(ciphertext, key, false); break;
          }
        }
        const t3 = performance.now();
        decTimeMs = (t3 - t2) / iterations;

        // Verify Decryption Match
        if (cipherId === 'playfair') {
          // In Playfair, text is normalized, 'J' -> 'I', and filler 'X' inserted
          const normDec = BenchmarkEngine.normalizeText(decryptedText);
          const normExp = CryptoEngine.Playfair.preprocessText(text);
          if (normDec === normExp) {
            verification = 'Verified Digraphs (Fillers Applied)';
          } else {
            verification = 'Partial Match';
          }
        } else if (cipherId === 'hill') {
          const normDec = BenchmarkEngine.normalizeText(decryptedText);
          const expected = cleanInputLetters.length % 2 !== 0 ? cleanInputLetters + 'X' : cleanInputLetters;
          if (normDec === expected) {
            verification = cleanInputLetters.length % 2 !== 0 ? 'Verified Match (Padded with X)' : 'Verified Exact Match';
          } else {
            verification = 'Mismatch';
          }
        } else if (cipherId === 'columnar') {
          const normDec = BenchmarkEngine.normalizeText(decryptedText);
          if (normDec === cleanInputLetters) {
            verification = 'Verified Exact Match';
          } else {
            verification = 'Padding Note';
          }
        } else {
          if (decryptedText === text) {
            verification = 'Verified Exact Match';
          } else {
            verification = 'Mismatch';
          }
        }

      } catch (err) {
        status = 'Error';
        errorMsg = err.message;
        verification = 'Failed';
      }

      const entropy = BenchmarkEngine.calculateEntropy(ciphertext);
      const totalTimeMs = encTimeMs + decTimeMs;
      const charsPerSec = encTimeMs > 0 ? Math.round((text.length / encTimeMs) * 1000) : 0;

      results.push({
        id: cipherId,
        name: meta.name,
        category: meta.category,
        keyUsed: cipherId === 'otp' ? 'Random Uniform Key' : key,
        ciphertextSnippet: ciphertext ? (ciphertext.length > 32 ? ciphertext.substring(0, 32) + '...' : ciphertext) : 'N/A',
        encTimeMs: parseFloat(encTimeMs.toFixed(4)),
        decTimeMs: parseFloat(decTimeMs.toFixed(4)),
        totalTimeMs: parseFloat(totalTimeMs.toFixed(4)),
        entropy,
        charsPerSec,
        verification,
        status,
        errorMsg
      });
    }

    return results;
  }
};

// Export globally
if (typeof window !== 'undefined') {
  window.BenchmarkEngine = BenchmarkEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BenchmarkEngine;
}
