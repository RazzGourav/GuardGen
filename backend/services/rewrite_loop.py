from backend.services.stylizer import Stylizer
from backend.services.evaluator import Evaluator


class RewriteLoop:

    @staticmethod
    def humanize(text: str, max_iterations: int = 3): #max 5
        current_text = text
        iterations = 0

        for i in range(max_iterations):
            score = Evaluator.ai_probability(current_text)

            if score <= 0.10:
                return {
                    "final_text": current_text,
                    "score": score,
                    "iterations": iterations
                }

            current_text = Stylizer.rewrite(current_text)
            iterations += 1

        final_score = Evaluator.ai_probability(current_text)

        return {
            "final_text": current_text,
            "score": final_score,
            "iterations": iterations
        }