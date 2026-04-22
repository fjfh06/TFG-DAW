from flask import Blueprint, jsonify, request
from extensions import db
from models.usuarios.Cinturon import Cinturon
from flask_jwt_extended import jwt_required

cinturon_bp = Blueprint('cinturon_bp', __name__)

@cinturon_bp.route('/', methods=['GET'])
@jwt_required()
def get_cinturones():
    cinturones = Cinturon.query.order_by(Cinturon.orden_jerarquia).all()
    return jsonify([{
        'id': c.id, 'nombre': c.nombre, 'orden_jerarquia': c.orden_jerarquia
    } for c in cinturones]), 200

@cinturon_bp.route('/', methods=['POST'])
@jwt_required()
def create_cinturon():
    data = request.json
    try:
        new_cinturon = Cinturon(nombre=data['nombre'], orden_jerarquia=data['orden_jerarquia'])
        db.session.add(new_cinturon)
        db.session.commit()
        return jsonify({'message': 'Cinturon created', 'id': new_cinturon.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cinturon_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_cinturon(id):
    cinturon = Cinturon.query.get_or_404(id)
    data = request.json
    try:
        if 'nombre' in data: cinturon.nombre = data['nombre']
        if 'orden_jerarquia' in data: cinturon.orden_jerarquia = data['orden_jerarquia']
        
        db.session.commit()
        return jsonify({'message': 'Cinturon updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cinturon_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_cinturon(id):
    cinturon = Cinturon.query.get_or_404(id)
    try:
        db.session.delete(cinturon)
        db.session.commit()
        return jsonify({'message': 'Cinturon deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
