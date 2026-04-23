import os
from PIL import Image
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
except ImportError:
    # If pillow-heif is not available, we continue without HEIC support
    pass

def process_and_save_image(file_stream, output_path, max_size=(800, 800)):
    """
    Processes an image from a file stream, converts it to RGB (JPEG compatible),
    resizes it if necessary, and saves it as a JPEG.
    """
    try:
        # Reset stream position just in case
        file_stream.seek(0)
        
        # Open the image
        img = Image.open(file_stream)
        print(f"Processing image: format={img.format}, size={img.size}, mode={img.mode}")
        
        # Convert to RGB if it's not (e.g., RGBA, P, etc.)
        if img.mode in ("RGBA", "P"):
            # Create white background for transparent images
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")
            
        # Resize if it's larger than max_size while maintaining aspect ratio
        img.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save as JPEG
        img.save(output_path, "JPEG", quality=85, optimize=True)
        print(f"Image saved successfully to {output_path}")
        return True
    except Exception as e:
        import traceback
        print(f"Error processing image: {str(e)}")
        traceback.print_exc()
        return False
