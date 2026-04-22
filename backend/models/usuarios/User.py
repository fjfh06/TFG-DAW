from extensions import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    roles = db.Column(db.String(50), default='user') # admin, ayudante, user

    alumnos = db.relationship('Alumno', backref='user', lazy=True)
