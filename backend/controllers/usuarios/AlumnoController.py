from flask import Blueprint, jsonify, request, send_from_directory
from extensions import db
from models.usuarios.Alumno import Alumno
from models.usuarios.User import User
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import admin_required, roles_required
import os
import time

alumno_bp = Blueprint('alumno_bp', __name__)

UPLOAD_FOLDER = 'static/uploads/alumnos'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

@alumno_bp.route('/foto/<filename>', methods=['GET'])
@jwt_required()
def get_alumno_foto(filename):
    from flask import current_app
    base_dir = os.path.abspath(current_app.root_path)
    directory = os.path.join(base_dir, 'static', 'uploads', 'alumnos')
    
    if filename == 'default.png':
        return send_from_directory(directory, filename)
    
    # Extraer ID del alumno del nombre del archivo (formato: id_nombre_timestamp.ext)
    try:
        student_id_str = filename.split('_')[0]
        student_id = int(student_id_str)
    except (ValueError, IndexError):
        return jsonify({"msg": "Nombre de archivo inválido"}), 400
        
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
        
    # Administradores y ayudantes pueden ver todas las fotos
    if user.roles in ['admin', 'ayudante']:
        return send_from_directory(directory, filename)
        
    # Los alumnos solo pueden ver su propia foto
    alumno = Alumno.query.filter_by(id=student_id).first()
    if alumno and str(alumno.user_id) == str(current_user_id):
        return send_from_directory(directory, filename)
        
    return jsonify({"msg": "Acceso denegado: No tienes permiso para ver esta foto"}), 403

@alumno_bp.route('/', methods=['GET'])
@jwt_required()
def get_alumnos():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    # Si es admin o ayudante, ve todos. Si no, solo el suyo.
    if user.roles in ['admin', 'ayudante']:
        alumnos = Alumno.query.all()
    else:
        alumnos = Alumno.query.filter_by(user_id=current_user_id).all()
    
    result = []
    for a in alumnos:
        alumno_data = {
            'id': a.id,
            'nombre': a.nombre,
            'apellidos': a.apellidos,
            'dni': a.dni,
            'fecha_nacimiento': a.fecha_nacimiento.isoformat() if a.fecha_nacimiento else None,
            'telefono': a.telefono,
            'direccion': a.direccion,
            'grado_actual_id': a.grado_actual_id,
            'activo': a.activo,
            'foto': a.foto,
            'user_id': a.user_id
        }
        
        result.append(alumno_data)
        
    return jsonify(result), 200

@alumno_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_alumno(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    a = Alumno.query.get_or_404(id)
    
    # Solo admin/ayudante o el propio alumno
    if user.roles not in ['admin', 'ayudante'] and str(a.user_id) != str(current_user_id):
        return jsonify({"msg": "Acceso denegado"}), 403
    return jsonify({
        'id': a.id,
        'nombre': a.nombre,
        'apellidos': a.apellidos,
        'dni': a.dni,
        'fecha_nacimiento': a.fecha_nacimiento.isoformat() if a.fecha_nacimiento else None,
        'telefono': a.telefono,
        'direccion': a.direccion,
        'grado_actual_id': a.grado_actual_id,
        'activo': a.activo,
        'user_id': a.user_id,
        'foto': a.foto
    }), 200

@alumno_bp.route('/', methods=['POST'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def create_alumno():
    data = request.form
    
    try:
        new_alumno = Alumno(
            nombre=data['nombre'],
            apellidos=data['apellidos'],
            dni=data.get('dni'),
            fecha_nacimiento=data.get('fecha_nacimiento'),
            telefono=data.get('telefono'),
            direccion=data.get('direccion'),
            grado_actual_id=data.get('grado_actual_id'),
            activo=data.get('activo', 'true').lower() == 'true',
            user_id=data.get('user_id')
        )
        
        db.session.add(new_alumno)
        db.session.commit()
        
        if 'foto' in request.files:
            file = request.files['foto']
            if file and file.filename != '' and allowed_file(file.filename):
                extension = file.filename.rsplit('.', 1)[1].lower()
                clean_nombre = secure_filename(new_alumno.nombre)
                new_filename = f"{new_alumno.id}_{clean_nombre}_{int(time.time())}.{extension}"
                
                from flask import current_app
                base_dir = os.path.abspath(current_app.root_path)
                upload_dir = os.path.join(base_dir, 'static', 'uploads', 'alumnos')
                os.makedirs(upload_dir, exist_ok=True)
                
                file_path = os.path.join(upload_dir, new_filename)
                file.save(file_path)
                
                new_alumno.foto = new_filename
                db.session.commit()
                
        return jsonify({'message': 'Alumno created', 'id': new_alumno.id}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alumno_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def update_alumno(id):
    alumno = Alumno.query.get_or_404(id)
    
    if request.is_json:
        data = request.json
    else:
        data = request.form

    try:
        if 'nombre' in data: alumno.nombre = data['nombre']
        if 'apellidos' in data: alumno.apellidos = data['apellidos']
        if 'dni' in data: alumno.dni = data['dni'] if data['dni'] != '' else None
        if 'fecha_nacimiento' in data: alumno.fecha_nacimiento = data['fecha_nacimiento'] if data['fecha_nacimiento'] != '' else None
        if 'telefono' in data: alumno.telefono = data['telefono'] if data['telefono'] != '' else None
        if 'direccion' in data: alumno.direccion = data['direccion'] if data['direccion'] != '' else None
        if 'grado_actual_id' in data: alumno.grado_actual_id = data['grado_actual_id'] if data['grado_actual_id'] != '' else None
        if 'activo' in data: 
            val = data['activo']
            if isinstance(val, str):
                alumno.activo = val.lower() == 'true'
            else:
                alumno.activo = val
        if 'user_id' in data: alumno.user_id = data['user_id'] if data['user_id'] != '' else None

        if 'foto' in request.files:
            file = request.files['foto']
            if file and file.filename != '' and allowed_file(file.filename):
                from flask import current_app
                base_dir = os.path.abspath(current_app.root_path)
                upload_dir = os.path.join(base_dir, 'static', 'uploads', 'alumnos')
                if alumno.foto:
                    old_path = os.path.join(upload_dir, alumno.foto)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                
                extension = file.filename.rsplit('.', 1)[1].lower()
                clean_nombre = secure_filename(alumno.nombre)
                new_filename = f"{alumno.id}_{clean_nombre}_{int(time.time())}.{extension}"
                
                os.makedirs(upload_dir, exist_ok=True)
                file_path = os.path.join(upload_dir, new_filename)
                
                file.save(file_path)
                alumno.foto = new_filename

        db.session.commit()
        return jsonify({'message': 'Alumno updated'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@alumno_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_alumno(id):
    alumno = Alumno.query.get_or_404(id)
    
    try:
        if alumno.foto:
            from flask import current_app
            base_dir = os.path.abspath(current_app.root_path)
            photo_path = os.path.join(base_dir, 'static', 'uploads', 'alumnos', alumno.foto)
            if os.path.exists(photo_path):
                os.remove(photo_path)
                
        db.session.delete(alumno)
        db.session.commit()
        return jsonify({'message': 'Alumno deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
