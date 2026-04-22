from flask import Blueprint, jsonify, request
from extensions import db
from models.configuracion.TarifaMensual import TarifaMensual
from flask_jwt_extended import jwt_required

tarifa_bp = Blueprint('tarifa_bp', __name__)

@tarifa_bp.route('/', methods=['GET'])
@jwt_required()
def get_tarifas():
    temporada_id = request.args.get('temporada_id')
    query = TarifaMensual.query
    if temporada_id:
        query = query.filter_by(temporada_id=temporada_id)
        
    tarifas = query.all()
    return jsonify([{
        'id': t.id, 'nombre': t.nombre, 'precio_base': str(t.precio_base),
        'temporada_id': t.temporada_id
    } for t in tarifas]), 200

@tarifa_bp.route('/', methods=['POST'])
@jwt_required()
def create_tarifa():
    data = request.json
    try:
        new_t = TarifaMensual(
            nombre=data['nombre'],
            precio_base=data['precio_base'],
            temporada_id=data['temporada_id']
        )
        db.session.add(new_t)
        db.session.commit()
        return jsonify({'message': 'Tarifa created', 'id': new_t.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tarifa_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_tarifa(id):
    tarifa = TarifaMensual.query.get_or_404(id)
    data = request.json
    try:
        if 'nombre' in data: tarifa.nombre = data['nombre']
        if 'precio_base' in data: tarifa.precio_base = data['precio_base']
        if 'temporada_id' in data: tarifa.temporada_id = data['temporada_id']
        
        db.session.commit()
        return jsonify({'message': 'Tarifa updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tarifa_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tarifa(id):
    tarifa = TarifaMensual.query.get_or_404(id)
    try:
        db.session.delete(tarifa)
        db.session.commit()
        return jsonify({'message': 'Tarifa deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
