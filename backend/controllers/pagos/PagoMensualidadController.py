from flask import Blueprint, jsonify, request
from extensions import db
from models.pagos.PagoMensualidad import PagoMensualidad
from models.configuracion.TarifaMensual import TarifaMensual
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuarios.User import User
from models.usuarios.Alumno import Alumno
from utils.decorators import roles_required

pago_bp = Blueprint('pago_bp', __name__)

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@pago_bp.route('/', methods=['GET'])
@jwt_required()
def get_pagos():
    alumno_id = request.args.get('alumno_id')
    mes = request.args.get('mes')
    anio = request.args.get('anio')
    temporada_id = request.args.get('temporada_id')
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    query = PagoMensualidad.query
    
    if user.roles not in ['admin', 'ayudante']:
        alumno = Alumno.query.filter_by(user_id=current_user_id).first()
        if not alumno:
            return jsonify([]), 200
        query = query.filter_by(alumno_id=alumno.id)
    else:
        if alumno_id:
            query = query.filter_by(alumno_id=alumno_id)
            
    if mes:
        query = query.filter_by(mes=mes)
    if anio:
        query = query.filter_by(anio=anio)
    if temporada_id:
        query = query.join(TarifaMensual).filter(TarifaMensual.temporada_id == temporada_id)
        
    pagos = query.join(Alumno).order_by(Alumno.nombre, Alumno.apellidos).all()
    return jsonify([{
        'id': p.id, 'alumno_id': p.alumno_id, 'mes': p.mes, 'anio': p.anio,
        'cantidad': str(p.cantidad), 'estado': p.estado,
        'fecha_pago': p.fecha_pago.isoformat() if p.fecha_pago else None,
        'observaciones': p.observaciones,
        'tarifa_aplicada_id': p.tarifa_aplicada_id
    } for p in pagos]), 200

@pago_bp.route('/', methods=['POST'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def create_pago():
    data = request.json
    # Check for existing payment unique constraint
    exists = PagoMensualidad.query.filter_by(
        alumno_id=data['alumno_id'], mes=data['mes'], anio=data['anio']
    ).first()
    
    if exists:
        return jsonify({'error': 'El alumno ya pago este mes'}), 400

    try:
        new_pago = PagoMensualidad(
            alumno_id=data['alumno_id'],
            mes=data['mes'],
            anio=data['anio'],
            tarifa_aplicada_id=data.get('tarifa_aplicada_id'),
            cantidad=data['cantidad'],
            estado=data.get('estado', 'pendiente'),
            fecha_pago=parse_date(data.get('fecha_pago')),
            observaciones=data.get('observaciones')
        )
        db.session.add(new_pago)
        db.session.commit()
        return jsonify({'message': 'Pago created', 'id': new_pago.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pago_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def update_pago(id):
    pago = PagoMensualidad.query.get_or_404(id)
    data = request.json
    try:
        if 'estado' in data: pago.estado = data['estado']
        if 'fecha_pago' in data: pago.fecha_pago = parse_date(data['fecha_pago'])
        if 'cantidad' in data: pago.cantidad = data['cantidad']
        if 'observaciones' in data: pago.observaciones = data['observaciones']
        if 'tarifa_aplicada_id' in data: pago.tarifa_aplicada_id = data['tarifa_aplicada_id']
        
        db.session.commit()
        return jsonify({'message': 'Pago updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@pago_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def delete_pago(id):
    pago = PagoMensualidad.query.get_or_404(id)
    try:
        db.session.delete(pago)
        db.session.commit()
        return jsonify({'message': 'Pago deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
