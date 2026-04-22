from extensions import db

class TarifaMensual(db.Model):
    __tablename__ = 'tarifas_mensuales'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    precio_base = db.Column(db.Numeric(10, 2), nullable=False)
    temporada_id = db.Column(db.Integer, db.ForeignKey('temporadas.id'), nullable=False)
