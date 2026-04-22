from flask import Blueprint, jsonify, request
from extensions import db
from models.usuarios.Alumno import Alumno
from models.pagos.LicenciaAlumno import LicenciaAlumno
from models.pagos.PagoMensualidad import PagoMensualidad
from models.configuracion.TipoLicencia import TipoLicencia
from models.configuracion.Temporada import Temporada
from flask_jwt_extended import jwt_required
from datetime import datetime
import sqlalchemy

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    temporada_id = request.args.get('temporada_id')
    if not temporada_id:
        return jsonify({"error": "temporada_id is required"}), 400

    # Get Season info
    temporada = Temporada.query.get(temporada_id)
    if not temporada:
        return jsonify({"error": "Temporada not found"}), 404

    # Total active students in the system (global)
    alumnos_activos = Alumno.query.filter_by(activo=True).all()
    alumnos_ids = [a.id for a in alumnos_activos]
    
    if not alumnos_ids:
        return jsonify({
            "sin_licencia": [],
            "sin_mes_actual": [],
            "meses_anteriores_deuda": [],
            "total_activos": 0
        }), 200

    # 1. Alumnos sin licencia en la temporada actual
    tipos_licencia_temporada = [t.id for t in TipoLicencia.query.filter_by(temporada_id=temporada_id).all()]
    alumnos_sin_licencia = []
    if tipos_licencia_temporada:
        pagos_licencias = db.session.query(LicenciaAlumno.alumno_id).filter(
            LicenciaAlumno.tipo_licencia_id.in_(tipos_licencia_temporada),
            LicenciaAlumno.estado_pago == 'pagado'
        ).all()
        ids_con_licencia = {p[0] for p in pagos_licencias}
        
        for a in alumnos_activos:
            if a.id not in ids_con_licencia:
                alumnos_sin_licencia.append({"id": a.id, "nombre": a.nombre, "apellidos": a.apellidos, "foto": a.foto})

    # 2. Alumnos sin el mes actual pagado
    current_date = datetime.now()
    cur_month = current_date.month
    cur_year = current_date.year

    pagos_ahora = db.session.query(PagoMensualidad.alumno_id).filter(
        PagoMensualidad.alumno_id.in_(alumnos_ids),
        PagoMensualidad.mes == cur_month,
        PagoMensualidad.anio == cur_year,
        PagoMensualidad.estado == 'pagado'
    ).all()
    ids_pagados_ahora = {p[0] for p in pagos_ahora}
    
    alumnos_sin_mes_actual = [
        {"id": a.id, "nombre": a.nombre, "apellidos": a.apellidos, "foto": a.foto}
        for a in alumnos_activos if a.id not in ids_pagados_ahora
    ]

    # 3. Alumnos con deudas de meses anteriores (desde el inicio de la temporada)
    start_date = temporada.fecha_inicio
    months_to_check = []
    
    temp_year = start_date.year
    temp_month = start_date.month
    
    while (temp_year < cur_year) or (temp_year == cur_year and temp_month < cur_month):
        months_to_check.append((temp_month, temp_year))
        temp_month += 1
        if temp_month > 12:
            temp_month = 1
            temp_year += 1
            
    if not months_to_check:
        alumnos_con_deuda_anterior = []
    else:
        past_payments = db.session.query(PagoMensualidad.alumno_id, PagoMensualidad.mes, PagoMensualidad.anio).filter(
            PagoMensualidad.alumno_id.in_(alumnos_ids),
            PagoMensualidad.estado == 'pagado'
        ).all()
        
        payment_map = {}
        for p in past_payments:
            if p[0] not in payment_map:
                payment_map[p[0]] = set()
            payment_map[p[0]].add((p[1], p[2]))
            
        alumnos_con_deuda_anterior = []
        for a in alumnos_activos:
            missing_months = []
            student_payments = payment_map.get(a.id, set())
            for month, year in months_to_check:
                if (month, year) not in student_payments:
                    missing_months.append({"mes": month, "anio": year})
            
            if missing_months:
                alumnos_con_deuda_anterior.append({
                    "id": a.id, 
                    "nombre": a.nombre, 
                    "apellidos": a.apellidos, 
                    "foto": a.foto,
                    "meses_impagados": missing_months
                })

    return jsonify({
        "sin_licencia": alumnos_sin_licencia,
        "sin_mes_actual": alumnos_sin_mes_actual,
        "meses_anteriores_deuda": alumnos_con_deuda_anterior,
        "total_activos": len(alumnos_activos)
    }), 200
