from extensions import db

class InscripcionMensual(db.Model):
    __tablename__ = 'inscripciones_mensuales'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumnos.id'), nullable=False)
    tarifa_mensual_id = db.Column(db.Integer, db.ForeignKey('tarifas_mensuales.id'), nullable=False)
    temporada_id = db.Column(db.Integer, db.ForeignKey('temporadas.id'), nullable=False)

    alumno = db.relationship('Alumno', backref='inscripciones')
    tarifa = db.relationship('TarifaMensual')
    temporada = db.relationship('Temporada', backref=db.backref('inscripciones', cascade='all, delete-orphan'))
