from flask import Blueprint, jsonify, request
from extensions import db
from models.eventos.Asistencia import Asistencia
from datetime import datetime
from flask_jwt_extended import jwt_required

asistencia_bp = Blueprint('asistencia_bp', __name__)

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@asistencia_bp.route('/', methods=['GET'])
@jwt_required()
def get_asistencias():
    alumno_id = request.args.get('alumno_id')
    fecha_inicio = parse_date(request.args.get('fecha_inicio'))
    fecha_fin = parse_date(request.args.get('fecha_fin'))
    
    query = Asistencia.query
    if alumno_id:
        query = query.filter_by(alumno_id=alumno_id)
    if fecha_inicio:
        query = query.filter(Asistencia.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Asistencia.fecha <= fecha_fin)
        
    asistencias = query.all()
    return jsonify([{
        'id': a.id, 'fecha': a.fecha.isoformat(), 'alumno_id': a.alumno_id
    } for a in asistencias]), 200

@asistencia_bp.route('/', methods=['POST'])
@jwt_required()
def record_asistencia():
    data = request.json
    try:
        fecha = parse_date(data['fecha'])
        
        # Check duplicate
        exists = Asistencia.query.filter_by(alumno_id=data['alumno_id'], fecha=fecha).first()
        if exists:
            return jsonify({'message': 'Asistencia already recorded'}), 200 # Idempotent

        new_asis = Asistencia(
            fecha=fecha,
            alumno_id=data['alumno_id']
        )
        db.session.add(new_asis)
        db.session.commit()
        return jsonify({'message': 'Asistencia recorded', 'id': new_asis.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@asistencia_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_asistencia(id):
    asistencia = Asistencia.query.get_or_404(id)
    try:
        db.session.delete(asistencia)
        db.session.commit()
        return jsonify({'message': 'Asistencia deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
