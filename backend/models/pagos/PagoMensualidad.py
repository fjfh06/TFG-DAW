from extensions import db

class PagoMensualidad(db.Model):
    __tablename__ = 'pagos_mensualidad'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alumno_id = db.Column(db.Integer, db.ForeignKey('alumnos.id'), nullable=False)
    mes = db.Column(db.Integer, nullable=False)
    anio = db.Column(db.Integer, nullable=False)
    tarifa_aplicada_id = db.Column(db.Integer, db.ForeignKey('tarifas_mensuales.id'), nullable=True)
    cantidad = db.Column(db.Numeric(10, 2), nullable=False)
    estado = db.Column(db.Enum('pagado', 'pendiente', 'parcial', name='estado_mensualidad_enum'), default='pendiente')
    fecha_pago = db.Column(db.Date, nullable=True)
    observaciones = db.Column(db.Text, nullable=True)

    __table_args__ = (db.UniqueConstraint('alumno_id', 'mes', 'anio', name='uk_pago_unico_mes'),)

    alumno = db.relationship('Alumno', backref='pagos')
    tarifa_aplicada = db.relationship('TarifaMensual')
