from extensions import db

class ResultadoCompeticion(db.Model):
    __tablename__ = 'resultados_competicion'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    participacion_id = db.Column(db.Integer, db.ForeignKey('participaciones.id'), nullable=False)
    puesto = db.Column(db.String(50), nullable=True)
    categoria_final = db.Column(db.String(100), nullable=True)
    observaciones = db.Column(db.Text, nullable=True)

    participacion = db.relationship('Participacion', backref=db.backref('resultado', uselist=False, cascade='all, delete-orphan'))
