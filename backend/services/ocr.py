import pytesseract
from PIL import Image
import io

def extract_text_from_image(image_bytes: bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))
        print(f"[OCR] Image format: {image.format}, size: {image.size}, mode: {image.mode}")
        text = pytesseract.image_to_string(image)
        print(f"[OCR] Extracted text: {text}")
        return text.strip() if text else None
    except Exception as e:
        import traceback
        print(f"[OCR] Local OCR failed: {e}")
        traceback.print_exc()
        return None
