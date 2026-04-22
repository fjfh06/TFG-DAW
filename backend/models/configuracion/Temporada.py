from extensions import db

class Temporada(db.Model):
    __tablename__ = 'temporadas'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False) # 2025/2026
    fecha_inicio = db.Column(db.Date, nullable=False)
    fecha_fin = db.Column(db.Date, nullable=False)
    activa = db.Column(db.Boolean, default=False)
    eliminada = db.Column(db.Boolean, default=False)

    tarifas = db.relationship('TarifaMensual', backref='temporada', lazy=True, cascade='all, delete-orphan')
    tipos_licencia = db.relationship('TipoLicencia', backref='temporada', lazy=True, cascade='all, delete-orphan')
