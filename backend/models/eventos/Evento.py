from extensions import db

class Evento(db.Model):
    __tablename__ = 'eventos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.Enum('campeonato', 'exhibicion', 'curso', 'concentracion', 'examen', name='tipo_evento_enum'), nullable=False)
    fecha_inicio = db.Column(db.DateTime, nullable=False)
    fecha_fin = db.Column(db.DateTime, nullable=False)
    lugar = db.Column(db.String(255), nullable=True)
    precio_inscripcion = db.Column(db.Numeric(10, 2), default=0.00)
    estado = db.Column(db.Enum('programado', 'realizado', 'cancelado', name='estado_evento_enum'), default='programado')
    temporada_id = db.Column(db.Integer, db.ForeignKey('temporadas.id'), nullable=False)

    temporada = db.relationship('Temporada', backref=db.backref('eventos', cascade='all, delete-orphan'))
