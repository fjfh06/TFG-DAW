from flask import Blueprint, jsonify, request
from extensions import db
from models.eventos.Participacion import Participacion
from models.eventos.ResultadoCompeticion import ResultadoCompeticion
from flask_jwt_extended import jwt_required

participacion_bp = Blueprint('participacion_bp', __name__)

@participacion_bp.route('/', methods=['GET'])
@jwt_required()
def get_participaciones():
    evento_id = request.args.get('evento_id')
    alumno_id = request.args.get('alumno_id')
    
    query = Participacion.query
    if evento_id:
        query = query.filter_by(evento_id=evento_id)
    if alumno_id:
        query = query.filter_by(alumno_id=alumno_id)
        
    participaciones = query.all()
    
    result = []
    for p in participaciones:
        res_data = None
        if p.resultado:
            res_data = {
                'id': p.resultado.id,
                'puesto': p.resultado.puesto,
                'categoria_final': p.resultado.categoria_final,
                'observaciones': p.resultado.observaciones
            }
            
        result.append({
            'id': p.id,
            'evento_id': p.evento_id,
            'alumno_id': p.alumno_id,
            'categoria': p.categoria,
            'estado_inscripcion': p.estado_inscripcion,
            'estado_pago': p.estado_pago,
            'precio_pactado': str(p.precio_pactado) if p.precio_pactado else None,
            'resultado': res_data
        })
        
    return jsonify(result), 200

@participacion_bp.route('/<int:evento_id>/crear', methods=['POST'])
@jwt_required()
def add_participante(evento_id):
    data = request.json
    try:
        # Check if already participating in THIS category
        exists = Participacion.query.filter_by(
            evento_id=evento_id, 
            alumno_id=data['alumno_id'],
            categoria=data.get('categoria')
        ).first()
        
        if exists:
            return jsonify({'error': 'El alumno ya está inscrito en esta categoría para este evento'}), 400

        new_part = Participacion(
            evento_id=evento_id,
            alumno_id=data['alumno_id'],
            categoria=data.get('categoria'),
            estado_inscripcion=data.get('estado_inscripcion', 'inscrito'),
            estado_pago=data.get('estado_pago', 'pendiente'),
            precio_pactado=data.get('precio_pactado')
        )
        db.session.add(new_part)
        db.session.commit()
        return jsonify({'message': 'Participacion created', 'id': new_part.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@participacion_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_participacion(id):
    part = Participacion.query.get_or_404(id)
    data = request.json
    try:
        if 'estado_pago' in data: part.estado_pago = data['estado_pago']
        if 'estado_inscripcion' in data: part.estado_inscripcion = data['estado_inscripcion']
        
        if 'categoria' in data:
            # Check if changing to a category that already exists for this student in this event
            if data['categoria'] != part.categoria:
                exists = Participacion.query.filter_by(
                    evento_id=part.evento_id,
                    alumno_id=part.alumno_id,
                    categoria=data['categoria']
                ).first()
                if exists:
                    return jsonify({'error': 'El alumno ya tiene una inscripción en esa categoría'}), 400
            part.categoria = data['categoria']
            
        if 'precio_pactado' in data: part.precio_pactado = data['precio_pactado']
        
        db.session.commit()
        return jsonify({'message': 'Participacion updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@participacion_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_participacion(id):
    part = Participacion.query.get_or_404(id)
    try:
        if part.resultado:
            db.session.delete(part.resultado)
        db.session.delete(part)
        db.session.commit()
        return jsonify({'message': 'Participacion deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Results often go with participations
@participacion_bp.route('/<int:id>/resultado', methods=['POST'])
@jwt_required()
def add_resultado(id):
    data = request.json
    try:
        # Check if result already exists
        if ResultadoCompeticion.query.filter_by(participacion_id=id).first():
             return jsonify({'error': 'Result already exists for this participation'}), 400
             
        new_res = ResultadoCompeticion(
            participacion_id=id,
            puesto=data.get('puesto'),
            categoria_final=data.get('categoria_final'),
            observaciones=data.get('observaciones')
        )
        db.session.add(new_res)
        db.session.commit()
        return jsonify({'message': 'Resultado added', 'id': new_res.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@participacion_bp.route('/resultado/<int:result_id>', methods=['PUT'])
@jwt_required()
def update_resultado(result_id):
    res = ResultadoCompeticion.query.get_or_404(result_id)
    data = request.json
    try:
        if 'puesto' in data: res.puesto = data['puesto']
        if 'categoria_final' in data: res.categoria_final = data['categoria_final']
        if 'observaciones' in data: res.observaciones = data['observaciones']
        
        db.session.commit()
        return jsonify({'message': 'Resultado updated'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
