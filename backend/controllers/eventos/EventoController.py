from flask import Blueprint, jsonify, request
from extensions import db
from models.eventos.Evento import Evento
from datetime import datetime
from flask_jwt_extended import jwt_required

evento_bp = Blueprint('evento_bp', __name__)

def parse_datetime(date_str):
    if not date_str: return None
    date_str = date_str.replace('Z', '+00:00')
    try:
        # Try full isoformat first
        return datetime.fromisoformat(date_str)
    except ValueError:
        try:
            # Fallback to simple YYYY-MM-DD HH:MM:SS
            return datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return None

@evento_bp.route('/', methods=['GET'])
@jwt_required()
def get_eventos():
    temporada_id = request.args.get('temporada_id')
    query = Evento.query
    if temporada_id:
        query = query.filter_by(temporada_id=temporada_id)
        
    all_eventos = query.all()
    
    # Sort logic: 
    # 1. Future events (closest first)
    # 2. Past events (most recent first)
    now = datetime.now()
    
    proximos = [e for e in all_eventos if e.fecha_inicio >= now]
    pasados = [e for e in all_eventos if e.fecha_inicio < now]
    
    proximos.sort(key=lambda x: x.fecha_inicio)
    pasados.sort(key=lambda x: x.fecha_inicio, reverse=True)
    
    eventos = proximos + pasados
        
    return jsonify([{
        'id': e.id, 'nombre': e.nombre, 'tipo': e.tipo,
        'fecha_inicio': e.fecha_inicio.isoformat() if e.fecha_inicio else None,
        'fecha_fin': e.fecha_fin.isoformat() if e.fecha_fin else None,
        'lugar': e.lugar, 'estado': e.estado,
        'precio_inscripcion': str(e.precio_inscripcion),
        'temporada_id': e.temporada_id
    } for e in eventos]), 200

@evento_bp.route('/', methods=['POST'])
@jwt_required()
def create_evento():
    data = request.json
    try:
        new_evento = Evento(
            nombre=data['nombre'],
            tipo=data['tipo'],
            fecha_inicio=parse_datetime(data['fecha_inicio']),
            fecha_fin=parse_datetime(data['fecha_fin']),
            lugar=data.get('lugar'),
            precio_inscripcion=data.get('precio_inscripcion', 0),
            temporada_id=data['temporada_id'],
            estado=data.get('estado', 'programado')
        )
        db.session.add(new_evento)
        db.session.commit()
        return jsonify({'message': 'Evento created', 'id': new_evento.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@evento_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_evento(id):
    evento = Evento.query.get_or_404(id)
    data = request.json
    try:
        if 'nombre' in data: evento.nombre = data['nombre']
        if 'tipo' in data: evento.tipo = data['tipo']
        if 'fecha_inicio' in data: evento.fecha_inicio = parse_datetime(data['fecha_inicio'])
        if 'fecha_fin' in data: evento.fecha_fin = parse_datetime(data['fecha_fin'])
        if 'lugar' in data: evento.lugar = data['lugar']
        if 'precio_inscripcion' in data: evento.precio_inscripcion = data['precio_inscripcion']
        if 'temporada_id' in data: evento.temporada_id = data['temporada_id']
        if 'estado' in data: evento.estado = data['estado']
        
        db.session.commit()
        return jsonify({'message': 'Evento updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@evento_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_evento(id):
    evento = Evento.query.get_or_404(id)
    try:
        db.session.delete(evento)
        db.session.commit()
        return jsonify({'message': 'Evento deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
