import unittest
import json
import app

class ClassicalCryptoTestSuite(unittest.TestCase):
    def setUp(self):
        self.client = app.app.test_client()

    def test_health(self):
        res = self.client.get('/api/health')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['ciphers'], 8)

    def test_caesar(self):
        p = "Hello, World! 123"
        c = app.caesar_encrypt(p, 5)
        d = app.caesar_decrypt(c, 5)
        self.assertEqual(d, p)

    def test_mono(self):
        key = "QWERTYUIOPASDFGHJKLZXCVBNM"
        p = "Secret Message!"
        c = app.mono_encrypt(p, key)
        d = app.mono_decrypt(c, key)
        self.assertEqual(d, p)

    def test_playfair(self):
        p = "BALLOON ATTACK"
        key = "MONARCHY"
        c = app.playfair_encrypt(p, key)
        d = app.playfair_decrypt(c, key)
        self.assertTrue(len(c) % 2 == 0)
        self.assertIn("BAL", d)

    def test_hill(self):
        p = "ACT"
        key = "5,8,17,3"
        c = app.hill_encrypt(p, key)
        d = app.hill_decrypt(c, key)
        self.assertEqual(d, "ACTX")

    def test_vigenere(self):
        p = "Classical Cryptography Suite 2026!"
        key = "LEMON"
        c = app.vigenere_encrypt(p, key)
        d = app.vigenere_decrypt(c, key)
        self.assertEqual(d, p)

    def test_otp(self):
        p = "ATTACK AT DAWN"
        key = app.otp_generate_key(12)
        c = app.otp_encrypt(p, key)
        d = app.otp_decrypt(c, key)
        self.assertEqual(d, p)

    def test_railfence(self):
        p = "DEFEND THE EAST SHORELINE"
        rails = 4
        c = app.railfence_encrypt(p, rails)
        d = app.railfence_decrypt(c, rails)
        self.assertEqual(d, p)

    def test_columnar(self):
        p = "NETWORKSECURITY"
        key = "BALLOON"
        # Unpadded
        c1 = app.columnar_encrypt(p, key, False)
        d1 = app.columnar_decrypt(c1, key, False)
        self.assertEqual(d1, p)
        # Padded
        c2 = app.columnar_encrypt(p, key, True)
        d2 = app.columnar_decrypt(c2, key, True)
        self.assertEqual(d2, "NETWORKSECURITYXXXXXX")

    def test_api_process(self):
        payload = {
            'cipher': 'caesar',
            'mode': 'encrypt',
            'text': 'Network Security',
            'key': '7'
        }
        res = self.client.post('/api/process', json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data['success'])
        self.assertEqual(data['decrypted'], 'Network Security')

    def test_static_files(self):
        res1 = self.client.get('/')
        self.assertEqual(res1.status_code, 200)
        self.assertIn(b'CLASSICAL CRYPTOGRAPHY TOOLKIT', res1.data)

        res2 = self.client.get('/styles.css')
        self.assertEqual(res2.status_code, 200)

        res3 = self.client.get('/js/ciphers.js')
        self.assertEqual(res3.status_code, 200)

if __name__ == '__main__':
    unittest.main()
