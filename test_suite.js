const engine = require('./js/ciphers.js');

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

console.log("=== COMPREHENSIVE CLASSICAL CIPHER TEST SUITE ===");

// 1. Caesar
const c1 = engine.Caesar.encrypt("The Quick Brown Fox Jumps Over 13 Lazy Dogs!", 7);
const c2 = engine.Caesar.decrypt(c1, 7);
assert(c2 === "The Quick Brown Fox Jumps Over 13 Lazy Dogs!", "Caesar: full roundtrip preserves punctuation, numbers, spaces, case");

// 2. Monoalphabetic
const monoKey = engine.Monoalphabetic.generateRandomKey();
assert(engine.Monoalphabetic.validateKey(monoKey).valid, "Monoalphabetic: generated key is strictly 26 unique letters");
const m1 = engine.Monoalphabetic.encrypt("Hello, World! 2026", monoKey);
const m2 = engine.Monoalphabetic.decrypt(m1, monoKey);
assert(m2 === "Hello, World! 2026", "Monoalphabetic: full roundtrip preserves non-alpha & case");
try {
  engine.Monoalphabetic.encrypt("Test", "ABC");
  assert(false, "Monoalphabetic: rejected short key");
} catch (e) {
  assert(true, "Monoalphabetic: properly rejected invalid key length");
}

// 3. Playfair
const pf1 = engine.Playfair.encrypt("FOXXES BALLOON", "MONARCHY");
const pf2 = engine.Playfair.decrypt(pf1, "MONARCHY");
assert(pf1.length % 2 === 0, "Playfair: ciphertext is even length digraphs");
assert(pf2.includes("FOX") && pf2.includes("BAL"), "Playfair: decrypt recovers processed digraphs with fillers");

// 4. Hill (2x2)
const h1 = engine.Hill.encrypt("ACT", "5,8,17,3");
const h2 = engine.Hill.decrypt(h1, "5,8,17,3");
assert(h2 === "ACTX", "Hill: encrypts with odd padding and decrypts accurately");
try {
  engine.Hill.encrypt("TEST", "2,4,6,8"); // det=16-24=-8=18, gcd(18,26)=2
  assert(false, "Hill: rejected non-invertible matrix");
} catch (e) {
  assert(true, "Hill: properly catches non-invertible matrix (gcd != 1)");
}

// 5. Vigenere
const v1 = engine.Vigenere.encrypt("Cyber Security 2026!", "SECRET");
const v2 = engine.Vigenere.decrypt(v1, "SECRET");
assert(v2 === "Cyber Security 2026!", "Vigenere: preserves spaces, case, numbers");

// 6. One-Time Pad
const textOtp = "ATTACK AT DAWN";
const keyOtp = engine.OneTimePad.generateRandomKey(12); // exactly 12 letters
const o1 = engine.OneTimePad.encrypt(textOtp, keyOtp);
const o2 = engine.OneTimePad.decrypt(o1, keyOtp);
assert(o2 === textOtp, "One-Time Pad: roundtrip preserves format with equal length key");
try {
  engine.OneTimePad.encrypt(textOtp, "SHORT");
  assert(false, "OTP: rejected short key");
} catch (e) {
  assert(true, "OTP: properly rejected key shorter than message letter count");
}

// 7. Rail Fence
const rf1 = engine.RailFence.encrypt("MEET ME AT THE PARK TONIGHT", 4);
const rf2 = engine.RailFence.decrypt(rf1, 4);
assert(rf2 === "MEET ME AT THE PARK TONIGHT", "Rail Fence: roundtrip matches exactly");
try {
  engine.RailFence.encrypt("TEST", 1);
  assert(false, "Rail Fence: rejected rail count < 2");
} catch (e) {
  assert(true, "Rail Fence: properly rejected rail count < 2");
}

// 8. Columnar Transposition (Repeated letters, unpadded incomplete rows & padded)
const colUnpaddedEnc = engine.ColumnarTransposition.encrypt("NETWORKSECURITY", "BALLOON", false);
const colUnpaddedDec = engine.ColumnarTransposition.decrypt(colUnpaddedEnc, "BALLOON", false);
assert(colUnpaddedDec === "NETWORKSECURITY", "Columnar: repeated keyword letters with unpadded incomplete final rows matches exactly");

const colPaddedEnc = engine.ColumnarTransposition.encrypt("NETWORKSECURITY", "BALLOON", true);
const colPaddedDec = engine.ColumnarTransposition.decrypt(colPaddedEnc, "BALLOON", true);
assert(colPaddedDec === "NETWORKSECURITYXXXXXX", "Columnar: repeated keyword letters with padded 'X' matches exactly");

// Numeric order test
const colNumEnc = engine.ColumnarTransposition.encrypt("ATTACKATDAWN", "3,1,4,2", false);
const colNumDec = engine.ColumnarTransposition.decrypt(colNumEnc, "3,1,4,2", false);
assert(colNumDec === "ATTACKATDAWN", "Columnar: numeric column order (3,1,4,2) matches exactly");

console.log(`\nResults: ${passed} / ${total} tests passed.`);
process.exit(passed === total ? 0 : 1);
