from extensions import db

class LicenciaAlumno(db.Model):
    __tablename__ = 'licencias_alumnos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumnos.id'), nullable=False)
    tipo_licencia_id = db.Column(db.Integer, db.ForeignKey('tipos_licencia.id'), nullable=False)
    fecha_pago = db.Column(db.Date, nullable=True)
    fecha_inicio_validez = db.Column(db.Date, nullable=True)
    fecha_fin_validez = db.Column(db.Date, nullable=True)
    estado_pago = db.Column(db.Enum('pagado', 'pendiente', name='estado_pago_enum'), default='pendiente')

    alumno = db.relationship('Alumno', backref='licencias')
    tipo_licencia = db.relationship('TipoLicencia', backref=db.backref('alumnos_licenciados', cascade='all, delete-orphan'))
