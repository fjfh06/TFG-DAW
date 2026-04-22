from extensions import db

class Participacion(db.Model):
    __tablename__ = 'participaciones'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    evento_id = db.Column(db.Integer, db.ForeignKey('eventos.id'), nullable=False)
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumnos.id'), nullable=False)
    categoria = db.Column(db.String(100), nullable=True)
    estado_inscripcion = db.Column(db.Enum('inscrito', 'baja', name='estado_inscripcion_enum'), default='inscrito')
    estado_pago = db.Column(db.Enum('pagado', 'pendiente', 'no_aplica', name='estado_pago_participacion_enum'), default='pendiente')
    precio_pactado = db.Column(db.Numeric(10, 2), nullable=True) # Coste personalizado para este alumno en este evento

    evento = db.relationship('Evento', backref=db.backref('participantes', cascade='all, delete-orphan'))
    alumno = db.relationship('Alumno', backref='eventos_participados')
