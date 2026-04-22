from extensions import db

class TipoLicencia(db.Model):
    __tablename__ = 'tipos_licencia'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    temporada_id = db.Column(db.Integer, db.ForeignKey('temporadas.id'), nullable=False)
