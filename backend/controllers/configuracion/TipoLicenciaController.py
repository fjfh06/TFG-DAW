from flask import Blueprint, jsonify, request
from extensions import db
from models.configuracion.TipoLicencia import TipoLicencia
from flask_jwt_extended import jwt_required

tipolicencia_bp = Blueprint('tipolicencia_bp', __name__)

@tipolicencia_bp.route('/', methods=['GET'])
@jwt_required()
def get_tipos_licencia():
    temporada_id = request.args.get('temporada_id')
    query = TipoLicencia.query
    if temporada_id:
        query = query.filter_by(temporada_id=temporada_id)
        
    tipos = query.all()
    return jsonify([{
        'id': t.id, 'nombre': t.nombre, 'precio': str(t.precio), 'temporada_id': t.temporada_id
    } for t in tipos]), 200
    
@tipolicencia_bp.route('/', methods=['POST'])
@jwt_required()
def create_tipo_licencia():
    data = request.json
    try:
        new_l = TipoLicencia(
            nombre=data['nombre'],
            precio=data['precio'],
            temporada_id=data['temporada_id']
        )
        db.session.add(new_l)
        db.session.commit()
        return jsonify({'message': 'Tipo Licencia created', 'id': new_l.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tipolicencia_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_tipo_licencia(id):
    tipo = TipoLicencia.query.get_or_404(id)
    data = request.json
    try:
        if 'nombre' in data: tipo.nombre = data['nombre']
        if 'precio' in data: tipo.precio = data['precio']
        if 'temporada_id' in data: tipo.temporada_id = data['temporada_id']
        
        db.session.commit()
        return jsonify({'message': 'Tipo Licencia updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tipolicencia_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tipo_licencia(id):
    tipo = TipoLicencia.query.get_or_404(id)
    try:
        db.session.delete(tipo)
        db.session.commit()
        return jsonify({'message': 'Tipo Licencia deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
