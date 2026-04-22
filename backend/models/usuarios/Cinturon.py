from extensions import db

class Cinturon(db.Model):
    __tablename__ = 'cinturones'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(50), nullable=False)
    orden_jerarquia = db.Column(db.Integer, nullable=False)
