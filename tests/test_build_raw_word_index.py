import unittest

from scripts.build_raw_word_index import extract_candidates_from_page


class ExtractCandidatesTest(unittest.TestCase):
    def test_extracts_word_smart_uppercase_entries(self):
        text = """
ABATE [abeit] v to subside; to reduce
The storm finally abated.
ABDICATE [abdikeit] v to step down from power
"""
        result = extract_candidates_from_page("word-smart-nexus-ocr", 10, text)
        words = [item["word"] for item in result]
        self.assertIn("abate", words)
        self.assertIn("abdicate", words)

    def test_ignores_short_noise(self):
        text = """
A
K
TOEFL
SAT
"""
        result = extract_candidates_from_page("word-smart-nexus-ocr", 1, text)
        self.assertEqual(result, [])

    def test_extracts_lowercase_md_candidates(self):
        text = """
abandon / desert / forsake / give up
abate decrease / diminish / lessen / reduce
"""
        result = extract_candidates_from_page("md-voca-1-k1", 42, text)
        words = [item["word"] for item in result]
        self.assertIn("abandon", words)
        self.assertIn("abate", words)

    def test_extracts_voca_bible_theme_candidates_at_low_confidence(self):
        text = """
SYNONYM
TANTAMOUNT equivalent equal comparable
ETYMOLOGY
benevolent beneficial benediction
"""
        result = extract_candidates_from_page("voca-bible-a-4th-ocr", 12, text)
        by_word = {item["word"]: item for item in result}
        self.assertIn("tantamount", by_word)
        self.assertLess(by_word["tantamount"]["confidence"], 0.7)


if __name__ == "__main__":
    unittest.main()
