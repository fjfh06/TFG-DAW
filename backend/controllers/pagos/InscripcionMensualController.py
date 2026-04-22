from flask import Blueprint, jsonify, request
from extensions import db
from models.pagos.InscripcionMensual import InscripcionMensual
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuarios.User import User
from models.usuarios.Alumno import Alumno
from utils.decorators import roles_required

inscripcion_bp = Blueprint('inscripcion_bp', __name__)

@inscripcion_bp.route('/', methods=['GET'])
@jwt_required()
def get_inscripciones():
    alumno_id = request.args.get('alumno_id')
    temporada_id = request.args.get('temporada_id')
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    query = InscripcionMensual.query
    
    if user.roles not in ['admin', 'ayudante']:
        alumno = Alumno.query.filter_by(user_id=current_user_id).first()
        if not alumno:
            return jsonify([]), 200
        query = query.filter_by(alumno_id=alumno.id)
    else:
        if alumno_id:
            query = query.filter_by(alumno_id=alumno_id)
            
    if temporada_id:
        query = query.filter_by(temporada_id=temporada_id)
        
    inscripciones = query.all()
    
    return jsonify([{
        'id': i.id, 'alumno_id': i.alumno_id, 
        'tarifa_mensual_id': i.tarifa_mensual_id, 'temporada_id': i.temporada_id
    } for i in inscripciones]), 200

@inscripcion_bp.route('/', methods=['POST'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def create_inscripcion():
    data = request.json
    try:
        new_inscr = InscripcionMensual(
            alumno_id=data['alumno_id'],
            tarifa_mensual_id=data['tarifa_mensual_id'],
            temporada_id=data['temporada_id']
        )
        db.session.add(new_inscr)
        db.session.commit()
        return jsonify({'message': 'Inscripcion created', 'id': new_inscr.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inscripcion_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def update_inscripcion(id):
    inscripcion = InscripcionMensual.query.get_or_404(id)
    data = request.json
    try:
        if 'tarifa_mensual_id' in data: inscripcion.tarifa_mensual_id = data['tarifa_mensual_id']
        if 'temporada_id' in data: inscripcion.temporada_id = data['temporada_id']
        
        db.session.commit()
        return jsonify({'message': 'Inscripcion updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@inscripcion_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def delete_inscripcion(id):
    inscripcion = InscripcionMensual.query.get_or_404(id)
    try:
        db.session.delete(inscripcion)
        db.session.commit()
        return jsonify({'message': 'Inscripcion deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
