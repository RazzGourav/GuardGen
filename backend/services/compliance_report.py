import json


class ComplianceReportGenerator:

    @staticmethod
    def generate(bias_flags, missing_citations, harmful_flags):

        score = 1.0

        if bias_flags:
            score -= 0.3

        if missing_citations:
            score -= 0.4

        if harmful_flags:
            score -= 0.5

        score = max(score, 0.0)

        passed = score >= 0.7

        report = {
            "passed": passed,
            "bias_flags": bias_flags,
            "missing_citations": missing_citations,
            "harmful_flags": harmful_flags,
            "overall_score": score,
            "recommendation": "APPROVED" if passed else "REVIEW REQUIRED"
        }

        return report