import re
import numpy as np
from collections import Counter


class Evaluator:

    @staticmethod
    def ai_probability(text: str) -> float:
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]

        if len(sentences) < 3:
            return 0.9  # very short text looks AI-ish

        # Sentence length variance
        lengths = [len(s.split()) for s in sentences]
        variance = np.var(lengths)

        # Lexical diversity
        words = re.findall(r'\w+', text.lower())
        unique_words = len(set(words))
        ttr = unique_words / (len(words) + 1)

        # Bigram repetition
        bigrams = list(zip(words, words[1:]))
        bigram_counts = Counter(bigrams)
        repetition = sum(1 for c in bigram_counts.values() if c > 2)

        # Normalize into probability (heuristic model)
        score = 0.0

        if variance < 15:
            score += 0.3

        if ttr < 0.35:
            score += 0.3

        if repetition > 5:
            score += 0.2

        if len(sentences) > 20 and variance < 10:
            score += 0.2

        return min(score, 1.0)