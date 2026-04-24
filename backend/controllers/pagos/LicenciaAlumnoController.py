from flask import Blueprint, jsonify, request
from extensions import db
from models.pagos.LicenciaAlumno import LicenciaAlumno
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.usuarios.User import User
from models.usuarios.Alumno import Alumno
from utils.decorators import roles_required

licencia_alumno_bp = Blueprint('licencia_alumno_bp', __name__)

def parse_date(date_str):
    if not date_str: return None
    try:
        return datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return None

@licencia_alumno_bp.route('/', methods=['GET'])
@jwt_required()
def get_licencias():
    alumno_id = request.args.get('alumno_id')
    temporada_id = request.args.get('temporada_id')
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    from models.configuracion.TipoLicencia import TipoLicencia
    query = LicenciaAlumno.query
    
    if user.roles not in ['admin', 'ayudante']:
        # Si es alumno, forzar que solo vea lo suyo
        alumno = Alumno.query.filter_by(user_id=current_user_id).first()
        if not alumno:
            return jsonify([]), 200
        query = query.filter_by(alumno_id=alumno.id)
    else:
        if alumno_id:
            query = query.filter_by(alumno_id=alumno_id)
            
    if temporada_id:
        query = query.join(TipoLicencia).filter(TipoLicencia.temporada_id == temporada_id)
        
    licencias = query.all()
        
    return jsonify([{
        'id': l.id,
        'alumno_id': l.alumno_id,
        'tipo_licencia_id': l.tipo_licencia_id,
        'estado_pago': l.estado_pago,
        'fecha_pago': l.fecha_pago.isoformat() if l.fecha_pago else None,
        'fecha_inicio_validez': l.fecha_inicio_validez.isoformat() if l.fecha_inicio_validez else None,
        'fecha_fin_validez': l.fecha_fin_validez.isoformat() if l.fecha_fin_validez else None
    } for l in licencias]), 200

@licencia_alumno_bp.route('/', methods=['POST'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def create_licencia():
    data = request.json
    from models.configuracion.TipoLicencia import TipoLicencia
    
    try:
        # Check if license exists for this student in this season
        tipo_nuevo = TipoLicencia.query.get_or_404(data['tipo_licencia_id'])
        temporada_id = tipo_nuevo.temporada_id
        
        # Join with TipoLicencia to check the season
        existing = LicenciaAlumno.query.join(TipoLicencia).filter(
            LicenciaAlumno.alumno_id == data['alumno_id'],
            TipoLicencia.temporada_id == temporada_id
        ).first()
        
        if existing:
            if existing.estado_pago == 'pagado':
                return jsonify({'error': 'El alumno ya ha pagado la licencia de esta temporada'}), 400
            return jsonify({'error': 'El alumno ya tiene una licencia asignada (pendiente de pago) para esta temporada'}), 400

        new_licencia = LicenciaAlumno(
            alumno_id=data['alumno_id'],
            tipo_licencia_id=data['tipo_licencia_id'],
            fecha_pago=parse_date(data.get('fecha_pago')),
            fecha_inicio_validez=parse_date(data.get('fecha_inicio_validez')),
            fecha_fin_validez=parse_date(data.get('fecha_fin_validez')),
            estado_pago=data.get('estado_pago', 'pendiente')
        )
        db.session.add(new_licencia)
        db.session.commit()
        return jsonify({'message': 'Licencia assigned', 'id': new_licencia.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@licencia_alumno_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def update_licencia(id):
    licencia = LicenciaAlumno.query.get_or_404(id)
    data = request.json
    try:
        if 'estado_pago' in data: licencia.estado_pago = data['estado_pago']
        if 'fecha_pago' in data: licencia.fecha_pago = parse_date(data['fecha_pago'])
        if 'fecha_inicio_validez' in data: licencia.fecha_inicio_validez = parse_date(data['fecha_inicio_validez'])
        if 'fecha_fin_validez' in data: licencia.fecha_fin_validez = parse_date(data['fecha_fin_validez'])
        
        db.session.commit()
        return jsonify({'message': 'Licencia updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@licencia_alumno_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@roles_required(['admin', 'ayudante'])
def delete_licencia(id):
    licencia = LicenciaAlumno.query.get_or_404(id)
    try:
        db.session.delete(licencia)
        db.session.commit()
        return jsonify({'message': 'Licencia deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
