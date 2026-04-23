from flask import Blueprint, request, send_file, jsonify
from utils.image_processing import process_and_save_image
from flask_jwt_extended import jwt_required
import os
import io
from PIL import Image

utils_bp = Blueprint('utils_bp', __name__)

@utils_bp.route('/convert-preview', methods=['POST'])
@jwt_required()
def convert_preview():
    if 'foto' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['foto']
    if not file:
        return jsonify({"error": "Empty file"}), 400

    try:
        # Convertir a una miniatura pequeña en memoria para previsualización
        img = Image.open(file)
        
        # Convertir a RGB
        if img.mode in ("RGBA", "P"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if img.mode == "RGBA" else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")
            
        # Miniatura pequeña para que viaje rápido por la red
        img.thumbnail((300, 300), Image.Resampling.LANCZOS)
        
        # Guardar en un buffer de memoria
        img_io = io.BytesIO()
        img.save(img_io, 'JPEG', quality=70)
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({"error": str(e)}), 500
