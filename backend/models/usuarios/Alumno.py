from extensions import db

class Alumno(db.Model):
    __tablename__ = 'alumnos'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Optional link to a user account
    grado_actual_id = db.Column(db.Integer, db.ForeignKey('cinturones.id'), nullable=True)
    
    nombre = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    dni = db.Column(db.String(20), nullable=True)
    fecha_nacimiento = db.Column(db.Date, nullable=True)
    telefono = db.Column(db.String(20), nullable=True)
    direccion = db.Column(db.String(255), nullable=True)
    foto = db.Column(db.String(255), nullable=True)
    
    activo = db.Column(db.Boolean, default=True)

    grado = db.relationship('Cinturon', backref='alumnos')
