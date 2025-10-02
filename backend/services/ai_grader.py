import requests
import os

HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-mnli"
HF_TOKEN = ""

def analyze_subjective_answer(student_answer: str, grading_rules: str):
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    sequence_to_classify = f"Student's answer: '{student_answer}'. Grading criteria: '{grading_rules}'"
    candidate_labels = ["conceptual error", "interpretational error", "procedural error", "correct"]
    payload = {
        "inputs": sequence_to_classify,
        "parameters": {"candidate_labels": candidate_labels},
    }
    try:
        response = requests.post(HUGGING_FACE_API_URL, headers=headers, json=payload)
        result = response.json()
        if "labels" not in result or not result["labels"]:
            return {
                "error_analysis": "none",
                "feedback": "AI analysis unavailable."
            }
        top_label = result['labels'][0]
        feedback = f"AI analysis suggests this might be a {top_label}."
        error_type_str = top_label.split(" ")[0]
        if error_type_str == "correct":
            error_type_str = "none"
        return {
            "error_analysis": error_type_str,
            "feedback": feedback
        }
    except Exception as e:
        return {
            "error_analysis": "none",
            "feedback": f"AI error: {str(e)}"
        }
