import os
import math
import time
import secrets
import string
from flask import Flask, request, jsonify, send_file, send_from_directory, render_template_string
import io

app = Flask(__name__, static_folder='.', static_url_path='')

# ==============================================================================
# PURE PYTHON CRYPTOGRAPHIC ENGINE
# ==============================================================================

def clean_alphabet(text):
    return ''.join(c.upper() for c in (text or '') if c.isalpha())

def gcd(a, b):
    return math.gcd(abs(a), abs(b))

def mod_inverse(a, m=26):
    a = ((a % m) + m) % m
    for x in range(1, m):
        if (a * x) % m == 1:
            return x
    return None

def calculate_entropy(text):
    if not text:
        return 0.0
    freqs = {}
    for char in text:
        freqs[char] = freqs.get(char, 0) + 1
    total = len(text)
    ent = 0.0
    for count in freqs.values():
        p = count / total
        ent -= p * math.log2(p)
    return round(ent, 3)

# 1. Caesar Cipher
def caesar_encrypt(text, shift):
    shift = int(shift) % 26
    res = []
    for char in text:
        if char.isalpha():
            base = ord('a') if char.islower() else ord('A')
            res.append(chr((ord(char) - base + shift) % 26 + base))
        else:
            res.append(char)
    return ''.join(res)

def caesar_decrypt(text, shift):
    return caesar_encrypt(text, -int(shift))

# 2. Monoalphabetic Cipher
def mono_validate(key):
    clean = clean_alphabet(key)
    if len(clean) != 26:
        raise ValueError(f"Key length is {len(clean)}; exactly 26 letters required.")
    if len(set(clean)) != 26:
        raise ValueError("Key contains duplicate letters. All 26 letters must be unique.")
    return clean

def mono_encrypt(text, key):
    clean_key = mono_validate(key)
    alpha = string.ascii_uppercase
    res = []
    for char in text:
        if char.isalpha():
            is_lower = char.islower()
            idx = alpha.index(char.upper())
            sub = clean_key[idx]
            res.append(sub.lower() if is_lower else sub)
        else:
            res.append(char)
    return ''.join(res)

def mono_decrypt(text, key):
    clean_key = mono_validate(key)
    alpha = string.ascii_uppercase
    res = []
    for char in text:
        if char.isalpha():
            is_lower = char.islower()
            idx = clean_key.index(char.upper())
            orig = alpha[idx]
            res.append(orig.lower() if is_lower else orig)
        else:
            res.append(char)
    return ''.join(res)

# 3. Playfair Cipher
def playfair_matrix(keyword):
    clean_key = clean_alphabet(keyword).replace('J', 'I')
    used = set()
    chars = []
    for c in clean_key:
        if c not in used:
            used.add(c)
            chars.append(c)
    for c in "ABCDEFGHIKLMNOPQRSTUVWXYZ":
        if c not in used:
            used.add(c)
            chars.append(c)
    grid = [chars[r*5:(r+1)*5] for r in range(5)]
    return grid

def playfair_find(grid, letter):
    if letter == 'J':
        letter = 'I'
    for r in range(5):
        for c in range(5):
            if grid[r][c] == letter:
                return r, c
    return None

def playfair_preprocess(text):
    clean = clean_alphabet(text).replace('J', 'I')
    if not clean:
        return ""
    res = []
    i = 0
    while i < len(clean):
        first = clean[i]
        second = clean[i+1] if i + 1 < len(clean) else None
        if second is None:
            filler = 'Z' if first == 'X' else 'X'
            res.append(first + filler)
            i += 1
        elif first == second:
            filler = 'Z' if first == 'X' else 'X'
            res.append(first + filler)
            i += 1
        else:
            res.append(first + second)
            i += 2
    return ''.join(res)

def playfair_encrypt(text, keyword):
    if not clean_alphabet(keyword):
        raise ValueError("Playfair Cipher requires a keyword.")
    grid = playfair_matrix(keyword)
    pre = playfair_preprocess(text)
    res = []
    for i in range(0, len(pre), 2):
        r1, c1 = playfair_find(grid, pre[i])
        r2, c2 = playfair_find(grid, pre[i+1])
        if r1 == r2:
            res.append(grid[r1][(c1 + 1) % 5] + grid[r2][(c2 + 1) % 5])
        elif c1 == c2:
            res.append(grid[(r1 + 1) % 5][c1] + grid[(r2 + 1) % 5][c2])
        else:
            res.append(grid[r1][c2] + grid[r2][c1])
    return ''.join(res)

def playfair_decrypt(text, keyword):
    if not clean_alphabet(keyword):
        raise ValueError("Playfair Cipher requires a keyword.")
    grid = playfair_matrix(keyword)
    clean = clean_alphabet(text).replace('J', 'I')
    if len(clean) % 2 != 0:
        raise ValueError("Playfair ciphertext must have an even number of letters.")
    res = []
    for i in range(0, len(clean), 2):
        r1, c1 = playfair_find(grid, clean[i])
        r2, c2 = playfair_find(grid, clean[i+1])
        if r1 == r2:
            res.append(grid[r1][(c1 + 4) % 5] + grid[r2][(c2 + 4) % 5])
        elif c1 == c2:
            res.append(grid[(r1 + 4) % 5][c1] + grid[(r2 + 4) % 5][c2])
        else:
            res.append(grid[r1][c2] + grid[r2][c1])
    return ''.join(res)

# 4. Hill Cipher (2x2 Matrix)
def hill_parse_key(key_input):
    if isinstance(key_input, str):
        clean_str = key_input.strip()
        if ',' in clean_str or ' ' in clean_str:
            nums = [int(x) for x in clean_str.replace(',', ' ').split() if x]
        else:
            clean = clean_alphabet(clean_str)
            nums = [ord(c) - 65 for c in clean]
    elif isinstance(key_input, (list, tuple)):
        nums = [int(x) for x in key_input]
    else:
        nums = []

    if len(nums) != 4:
        raise ValueError("Hill Cipher (2x2) requires 4 numbers or 4 letters as key (e.g., '5,8,17,3').")

    k11, k12, k21, k22 = [n % 26 for n in nums]
    det = (k11 * k22 - k12 * k21) % 26
    g = gcd(det, 26)
    if g != 1:
        raise ValueError(f"Matrix determinant {det} is not coprime with 26 (gcd={g}). Matrix is non-invertible mod 26.")
    det_inv = mod_inverse(det, 26)

    inv11 = (k22 * det_inv) % 26
    inv12 = (-k12 * det_inv) % 26
    inv21 = (-k21 * det_inv) % 26
    inv22 = (k11 * det_inv) % 26

    return {
        'matrix': [[k11, k12], [k21, k22]],
        'det': det,
        'det_inv': det_inv,
        'inv_matrix': [[inv11, inv12], [inv21, inv22]]
    }

def hill_encrypt(text, key_input):
    info = hill_parse_key(key_input)
    clean = clean_alphabet(text)
    if not clean:
        return ""
    if len(clean) % 2 != 0:
        clean += 'X'
    res = []
    m = info['matrix']
    for i in range(0, len(clean), 2):
        p1 = ord(clean[i]) - 65
        p2 = ord(clean[i+1]) - 65
        c1 = (m[0][0] * p1 + m[0][1] * p2) % 26
        c2 = (m[1][0] * p1 + m[1][1] * p2) % 26
        res.append(chr(c1 + 65) + chr(c2 + 65))
    return ''.join(res)

def hill_decrypt(text, key_input):
    info = hill_parse_key(key_input)
    clean = clean_alphabet(text)
    if not clean:
        return ""
    if len(clean) % 2 != 0:
        raise ValueError("Hill ciphertext length must be an even number.")
    res = []
    im = info['inv_matrix']
    for i in range(0, len(clean), 2):
        c1 = ord(clean[i]) - 65
        c2 = ord(clean[i+1]) - 65
        p1 = (im[0][0] * c1 + im[0][1] * c2) % 26
        p2 = (im[1][0] * c1 + im[1][1] * c2) % 26
        res.append(chr(p1 + 65) + chr(p2 + 65))
    return ''.join(res)

# 5. Vigenère Cipher
def vigenere_encrypt(text, key):
    clean_key = clean_alphabet(key)
    if not clean_key:
        raise ValueError("Vigenère Cipher requires an alphabetic keyword.")
    res = []
    k_idx = 0
    k_len = len(clean_key)
    for char in text:
        if char.isalpha():
            base = ord('a') if char.islower() else ord('A')
            p = ord(char) - base
            k = ord(clean_key[k_idx % k_len]) - 65
            k_idx += 1
            res.append(chr((p + k) % 26 + base))
        else:
            res.append(char)
    return ''.join(res)

def vigenere_decrypt(text, key):
    clean_key = clean_alphabet(key)
    if not clean_key:
        raise ValueError("Vigenère Cipher requires an alphabetic keyword.")
    res = []
    k_idx = 0
    k_len = len(clean_key)
    for char in text:
        if char.isalpha():
            base = ord('a') if char.islower() else ord('A')
            c = ord(char) - base
            k = ord(clean_key[k_idx % k_len]) - 65
            k_idx += 1
            res.append(chr((c - k + 26) % 26 + base))
        else:
            res.append(char)
    return ''.join(res)

# 6. One-Time Pad
def otp_generate_key(length):
    return ''.join(secrets.choice(string.ascii_uppercase) for _ in range(max(1, length)))

def otp_encrypt(text, key):
    clean_key = clean_alphabet(key)
    letters = [c for c in text if c.isalpha()]
    if not clean_key:
        raise ValueError("One-Time Pad requires an alphabetic key.")
    if len(clean_key) < len(letters):
        raise ValueError(f"OTP key length ({len(clean_key)}) is shorter than plaintext letter count ({len(letters)}).")
    res = []
    k_idx = 0
    for char in text:
        if char.isalpha():
            base = ord('a') if char.islower() else ord('A')
            p = ord(char) - base
            k = ord(clean_key[k_idx]) - 65
            k_idx += 1
            res.append(chr((p + k) % 26 + base))
        else:
            res.append(char)
    return ''.join(res)

def otp_decrypt(text, key):
    clean_key = clean_alphabet(key)
    letters = [c for c in text if c.isalpha()]
    if not clean_key:
        raise ValueError("One-Time Pad requires an alphabetic key.")
    if len(clean_key) < len(letters):
        raise ValueError(f"OTP key length ({len(clean_key)}) is shorter than ciphertext letter count ({len(letters)}).")
    res = []
    k_idx = 0
    for char in text:
        if char.isalpha():
            base = ord('a') if char.islower() else ord('A')
            c = ord(char) - base
            k = ord(clean_key[k_idx]) - 65
            k_idx += 1
            res.append(chr((c - k + 26) % 26 + base))
        else:
            res.append(char)
    return ''.join(res)

# 7. Rail Fence Cipher
def railfence_encrypt(text, rails):
    depth = int(rails)
    if depth < 2:
        raise ValueError("Rail Fence Cipher requires at least 2 rails.")
    if len(text) <= 1 or depth >= len(text):
        return text
    matrix = [[] for _ in range(depth)]
    rail = 0
    direction = 1
    for char in text:
        matrix[rail].append(char)
        rail += direction
        if rail == depth - 1 or rail == 0:
            direction *= -1
    return ''.join(''.join(r) for r in matrix)

def railfence_decrypt(text, rails):
    depth = int(rails)
    if depth < 2:
        raise ValueError("Rail Fence Cipher requires at least 2 rails.")
    if len(text) <= 1 or depth >= len(text):
        return text
    n = len(text)
    mark_matrix = [[None] * n for _ in range(depth)]
    rail = 0
    direction = 1
    for i in range(n):
        mark_matrix[rail][i] = '*'
        rail += direction
        if rail == depth - 1 or rail == 0:
            direction *= -1

    idx = 0
    for r in range(depth):
        for c in range(n):
            if mark_matrix[r][c] == '*' and idx < n:
                mark_matrix[r][c] = text[idx]
                idx += 1

    res = []
    rail = 0
    direction = 1
    for i in range(n):
        res.append(mark_matrix[rail][i])
        rail += direction
        if rail == depth - 1 or rail == 0:
            direction *= -1
    return ''.join(res)

# 8. Columnar Transposition Cipher
def columnar_key_order(key):
    key_str = str(key).strip()
    if not key_str:
        raise ValueError("Columnar Transposition requires a keyword or numeric column order.")
    # Check numeric order e.g. "3,1,4,2"
    if all(part.isdigit() for part in key_str.replace(',', ' ').split()):
        nums = [int(p) for p in key_str.replace(',', ' ').split()]
        min_v = min(nums)
        zero_indexed = [n - 1 if min_v == 1 else n for n in nums]
        if len(set(zero_indexed)) != len(zero_indexed):
            raise ValueError("Numeric column order contains duplicates.")
        return zero_indexed

    clean = clean_alphabet(key_str)
    if not clean:
        raise ValueError("Columnar Transposition requires an alphabetic keyword.")
    indexed = sorted(enumerate(clean), key=lambda x: (x[1], x[0]))
    return [item[0] for item in indexed]

def columnar_encrypt(text, key, pad_with_x=False):
    order = columnar_key_order(key)
    num_cols = len(order)
    clean = clean_alphabet(text)
    if not clean:
        return ""
    num_rows = math.ceil(len(clean) / num_cols)

    if pad_with_x:
        padded = clean.ljust(num_rows * num_cols, 'X')
        res = []
        for col_idx in order:
            for r in range(num_rows):
                res.append(padded[r * num_cols + col_idx])
        return ''.join(res)
    else:
        full_cols = len(clean) % num_cols
        col_lens = [num_rows if (full_cols == 0 or c < full_cols) else num_rows - 1 for c in range(num_cols)]
        res = []
        for col_idx in order:
            l = col_lens[col_idx]
            for r in range(l):
                res.append(clean[r * num_cols + col_idx])
        return ''.join(res)

def columnar_decrypt(text, key, pad_with_x=False):
    order = columnar_key_order(key)
    num_cols = len(order)
    clean = clean_alphabet(text)
    if not clean:
        return ""
    num_rows = math.ceil(len(clean) / num_cols)

    if pad_with_x:
        grid = [[''] * num_cols for _ in range(num_rows)]
        idx = 0
        for col_idx in order:
            for r in range(num_rows):
                if idx < len(clean):
                    grid[r][col_idx] = clean[idx]
                    idx += 1
        res = []
        for r in range(num_rows):
            for c in range(num_cols):
                res.append(grid[r][c])
        return ''.join(res)
    else:
        full_cols = len(clean) % num_cols
        col_lens = [num_rows if (full_cols == 0 or c < full_cols) else num_rows - 1 for c in range(num_cols)]
        grid = [[None] * num_cols for _ in range(num_rows)]
        idx = 0
        for col_idx in order:
            l = col_lens[col_idx]
            for r in range(l):
                if idx < len(clean):
                    grid[r][col_idx] = clean[idx]
                    idx += 1
        res = []
        for r in range(num_rows):
            for c in range(num_cols):
                if grid[r][c] is not None:
                    res.append(grid[r][c])
        return ''.join(res)

# ==============================================================================
# FLASK ROUTING & API ENDPOINTS
# ==============================================================================

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/styles.css')
def css():
    return send_from_directory('.', 'styles.css')

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'suite': 'Classical Cryptography Toolkit',
        'ciphers': 8,
        'backend': 'Flask / Python 3'
    })

@app.route('/api/process', methods=['POST'])
def process():
    data = request.get_json() or {}
    cipher = data.get('cipher', 'caesar')
    mode = data.get('mode', 'encrypt')
    text = data.get('text', '')
    key = data.get('key', '')
    pad_x = data.get('padWithX', False)

    t0 = time.perf_counter()
    try:
        if mode == 'encrypt':
            if cipher == 'caesar': out = caesar_encrypt(text, key)
            elif cipher == 'mono': out = mono_encrypt(text, key)
            elif cipher == 'playfair': out = playfair_encrypt(text, key)
            elif cipher == 'hill': out = hill_encrypt(text, key)
            elif cipher == 'vigenere': out = vigenere_encrypt(text, key)
            elif cipher == 'otp': out = otp_encrypt(text, key)
            elif cipher == 'railfence': out = railfence_encrypt(text, key)
            elif cipher == 'columnar': out = columnar_encrypt(text, key, pad_x)
            else: raise ValueError(f"Unknown cipher: {cipher}")

            # Verify decryption
            if cipher == 'caesar': dec = caesar_decrypt(out, key)
            elif cipher == 'mono': dec = mono_decrypt(out, key)
            elif cipher == 'playfair': dec = playfair_decrypt(out, key)
            elif cipher == 'hill': dec = hill_decrypt(out, key)
            elif cipher == 'vigenere': dec = vigenere_decrypt(out, key)
            elif cipher == 'otp': dec = otp_decrypt(out, key)
            elif cipher == 'railfence': dec = railfence_decrypt(out, key)
            elif cipher == 'columnar': dec = columnar_decrypt(out, key, pad_x)
            else: dec = ""

        else: # decrypt
            if cipher == 'caesar': out = caesar_decrypt(text, key)
            elif cipher == 'mono': out = mono_decrypt(text, key)
            elif cipher == 'playfair': out = playfair_decrypt(text, key)
            elif cipher == 'hill': out = hill_decrypt(text, key)
            elif cipher == 'vigenere': out = vigenere_decrypt(text, key)
            elif cipher == 'otp': out = otp_decrypt(text, key)
            elif cipher == 'railfence': out = railfence_decrypt(text, key)
            elif cipher == 'columnar': out = columnar_decrypt(text, key, pad_x)
            else: raise ValueError(f"Unknown cipher: {cipher}")
            dec = out

        t1 = time.perf_counter()
        exec_ms = round((t1 - t0) * 1000, 3)
        entropy = calculate_entropy(out)

        return jsonify({
            'success': True,
            'output': out,
            'decrypted': dec,
            'execTimeMs': exec_ms,
            'entropy': entropy,
            'keyStatus': 'Valid'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'keyStatus': 'Invalid'
        }), 400

@app.route('/api/file/encrypt', methods=['POST'])
def file_encrypt():
    uploaded_file = request.files.get('file')
    cipher = request.form.get('cipher', 'caesar')
    key = request.form.get('key', '')
    embed_meta = request.form.get('embedMeta', 'false').lower() == 'true'

    if not uploaded_file:
        return jsonify({'success': False, 'error': 'No file provided.'}), 400

    content = uploaded_file.read().decode('utf-8', errors='replace')
    try:
        if cipher == 'caesar': out = caesar_encrypt(content, key)
        elif cipher == 'mono': out = mono_encrypt(content, key)
        elif cipher == 'playfair': out = playfair_encrypt(content, key)
        elif cipher == 'hill': out = hill_encrypt(content, key)
        elif cipher == 'vigenere': out = vigenere_encrypt(content, key)
        elif cipher == 'otp': out = otp_encrypt(content, key)
        elif cipher == 'railfence': out = railfence_encrypt(content, key)
        elif cipher == 'columnar': out = columnar_encrypt(content, key)
        else: raise ValueError("Unsupported cipher.")

        if embed_meta:
            meta_header = (
                "----- BEGIN CLASSICAL CRYPTOGRAPHY ENCRYPTED FILE -----\n"
                f"Cipher: {cipher.upper()}\n"
                f"Key: {key}\n"
                f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}\n"
                "----- ENCRYPTED PAYLOAD -----\n"
            )
            meta_footer = "\n----- END CLASSICAL CRYPTOGRAPHY ENCRYPTED FILE -----\n"
            final_content = meta_header + out + meta_footer
        else:
            final_content = out

        bio = io.BytesIO(final_content.encode('utf-8'))
        bio.seek(0)
        return send_file(bio, as_attachment=True, download_name=f"encrypted_{uploaded_file.filename}", mimetype='text/plain')
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/file/decrypt', methods=['POST'])
def file_decrypt():
    uploaded_file = request.files.get('file')
    cipher = request.form.get('cipher', 'caesar')
    key = request.form.get('key', '')

    if not uploaded_file:
        return jsonify({'success': False, 'error': 'No file provided.'}), 400

    raw = uploaded_file.read().decode('utf-8', errors='replace')
    payload = raw

    # Detect metadata header if embedded
    detected_cipher = None
    detected_key = None
    if "----- BEGIN CLASSICAL CRYPTOGRAPHY ENCRYPTED FILE -----" in raw:
        lines = raw.splitlines()
        payload_lines = []
        is_payload = False
        for line in lines:
            if line.startswith("Cipher:"):
                detected_cipher = line.split(":", 1)[1].strip().lower()
            elif line.startswith("Key:"):
                detected_key = line.split(":", 1)[1].strip()
            elif "----- ENCRYPTED PAYLOAD -----" in line:
                is_payload = True
            elif "----- END CLASSICAL CRYPTOGRAPHY ENCRYPTED FILE -----" in line:
                is_payload = False
            elif is_payload:
                payload_lines.append(line)
        payload = "\n".join(payload_lines)
        if detected_cipher:
            cipher = detected_cipher
        if detected_key:
            key = detected_key

    try:
        if cipher == 'caesar': out = caesar_decrypt(payload, key)
        elif cipher == 'mono': out = mono_decrypt(payload, key)
        elif cipher == 'playfair': out = playfair_decrypt(payload, key)
        elif cipher == 'hill': out = hill_decrypt(payload, key)
        elif cipher == 'vigenere': out = vigenere_decrypt(payload, key)
        elif cipher == 'otp': out = otp_decrypt(payload, key)
        elif cipher == 'railfence': out = railfence_decrypt(payload, key)
        elif cipher == 'columnar': out = columnar_decrypt(payload, key)
        else: raise ValueError("Unsupported cipher.")

        bio = io.BytesIO(out.encode('utf-8'))
        bio.seek(0)
        return send_file(bio, as_attachment=True, download_name=f"decrypted_{uploaded_file.filename}", mimetype='text/plain')
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Classical Cryptography Toolkit running on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False)
