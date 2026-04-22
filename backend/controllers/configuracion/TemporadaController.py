from flask import Blueprint, jsonify, request
from extensions import db
from models.configuracion.Temporada import Temporada
from datetime import datetime
from flask_jwt_extended import jwt_required

temporada_bp = Blueprint('temporada_bp', __name__)

def parse_date(date_str):
    if not date_str: return None
    try:
        # Avoid issues with full ISO strings
        if 'T' in date_str:
            date_str = date_str.split('T')[0]
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@temporada_bp.route('/', methods=['GET'])
@jwt_required()
def get_temporadas():
    temporadas = Temporada.query.filter_by(eliminada=False).all()
    return jsonify([{
        'id': t.id, 'nombre': t.nombre, 
        'fecha_inicio': t.fecha_inicio.isoformat() if t.fecha_inicio else None, 
        'fecha_fin': t.fecha_fin.isoformat() if t.fecha_fin else None, 
        'activa': t.activa
    } for t in temporadas]), 200

@temporada_bp.route('/', methods=['POST'])
@jwt_required()
def create_temporada():
    data = request.json
    try:
        new_t = Temporada(
            nombre=data['nombre'],
            fecha_inicio=parse_date(data['fecha_inicio']),
            fecha_fin=parse_date(data['fecha_fin']),
            activa=data.get('activa', False)
        )
        db.session.add(new_t)
        db.session.commit()
        return jsonify({'message': 'Temporada created', 'id': new_t.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@temporada_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_temporada(id):
    temporada = Temporada.query.get_or_404(id)
    data = request.json
    try:
        if 'nombre' in data: temporada.nombre = data['nombre']
        if 'fecha_inicio' in data: temporada.fecha_inicio = parse_date(data['fecha_inicio'])
        if 'fecha_fin' in data: temporada.fecha_fin = parse_date(data['fecha_fin'])
        if 'activa' in data: temporada.activa = data['activa']
        
        db.session.commit()
        return jsonify({'message': 'Temporada updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@temporada_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_temporada(id):
    temporada = Temporada.query.get_or_404(id)
    try:
        temporada.eliminada = True
        db.session.commit()
        return jsonify({'message': 'Temporada marcada como eliminada (Soft-Delete)'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
