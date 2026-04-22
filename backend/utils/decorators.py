from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models.usuarios.User import User

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.roles != 'admin':
            return jsonify({"msg": "Acceso denegado: Se requieren permisos de administrador"}), 403
        return fn(*args, **kwargs)
    return wrapper

def roles_required(allowed_roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            if not user or user.roles not in allowed_roles:
                return jsonify({"msg": f"Acceso denegado: Se requiere uno de los siguientes roles: {', '.join(allowed_roles)}"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
