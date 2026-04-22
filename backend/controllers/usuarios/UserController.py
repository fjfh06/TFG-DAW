from flask import Blueprint, jsonify, request
from extensions import db
from models.usuarios.User import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required
from utils.decorators import admin_required

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            'id': user.id,
            'username': user.username,
            'roles': user.roles
        })
    return jsonify(result), 200

@user_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'roles': user.roles
    }), 200

@user_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_user():
    data = request.json
    if not data or not 'username' in data or not 'password' in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        password=hashed_password,
        roles=data.get('roles', 'user')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'id': new_user.id}), 201

@user_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_user(id):
    user = User.query.get_or_404(id)
    data = request.json
    
    if 'username' in data:
        user.username = data['username']
    if 'password' in data:
        user.password = generate_password_hash(data['password'])
    if 'roles' in data:
        user.roles = data['roles']
        
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200

@user_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200
