from flask import Blueprint, jsonify, request
from extensions import db, jwt
from models.usuarios.User import User
from models.usuarios.Alumno import Alumno
from flask_jwt_extended import create_access_token, set_access_cookies, jwt_required, get_jwt_identity, unset_jwt_cookies
from werkzeug.security import check_password_hash

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        # We store the user id in the JWT (must be a string for flask-jwt-extended)
        access_token = create_access_token(identity=str(user.id))
        
        # En la DB, los nombres están en el Alumno enlazado. Si no hay alumno, se ponen vacíos
        nombre = ""
        apellidos = ""
        if user.alumnos and len(user.alumnos) > 0:
            nombre = user.alumnos[0].nombre
            apellidos = user.alumnos[0].apellidos
        elif user.username == 'shifu':
            nombre = "Shifu"
            
        user_data = {
            "id": user.id,
            "username": user.username,
            "nombre": nombre,
            "apellidos": apellidos,
            "rol": user.roles
        }
        
        resp = jsonify({
            # The token is returned in JSON for debugging but frontend will use the cookie
            "token": access_token, 
            "user": user_data
        })
        set_access_cookies(resp, access_token)
        return resp, 200
    
    return jsonify({"msg": "Credenciales inválidas"}), 401

@auth_bp.route('/logout', methods=['POST'])
def logout():
    resp = jsonify({'msg': 'Logout successful'})
    unset_jwt_cookies(resp)
    return resp, 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, str) and not current_user_id.isdigit():
        user = User.query.filter_by(username=current_user_id).first()
    else:
        user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    nombre = ""
    apellidos = ""
    if user.alumnos and len(user.alumnos) > 0:
        nombre = user.alumnos[0].nombre
        apellidos = user.alumnos[0].apellidos
    elif user.username == 'shifu':
        nombre = "Shifu"
        
    user_data = {
        "id": user.id,
        "username": user.username,
        "nombre": nombre,
        "apellidos": apellidos,
        "rol": user.roles
    }
    
    return jsonify(user_data), 200
