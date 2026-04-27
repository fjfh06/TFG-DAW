import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, jwt
from models import * # Import all models to ensure they are registered with SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash

# Import Blueprints
from controllers.usuarios.UserController import user_bp
from controllers.usuarios.AlumnoController import alumno_bp
from controllers.usuarios.CinturonController import cinturon_bp
from controllers.configuracion.TemporadaController import temporada_bp
from controllers.configuracion.TarifaMensualController import tarifa_bp
from controllers.configuracion.TipoLicenciaController import tipolicencia_bp
from controllers.pagos.LicenciaAlumnoController import licencia_alumno_bp
from controllers.pagos.InscripcionMensualController import inscripcion_bp
from controllers.pagos.PagoMensualidadController import pago_bp
from controllers.eventos.EventoController import evento_bp
from controllers.eventos.ParticipacionController import participacion_bp
from controllers.eventos.AsistenciaController import asistencia_bp
from controllers.dashboard.DashboardController import dashboard_bp
from controllers.auth.AuthController import auth_bp
from controllers.utilidades.UtilsController import utils_bp

def create_app():
    app = Flask(__name__)

    # Configuration
    db_user = os.environ.get('MYSQL_USER', 'root')
    db_pass = os.environ.get('MYSQL_PASSWORD', 'root')
    db_host = os.environ.get('DB_HOST', 'db')
    db_port = os.environ.get('DB_PORT', '3306')
    db_name = os.environ.get('MYSQL_DATABASE', 'kungfu')
    
    database_url = os.environ.get(
        'DATABASE_URL', 
        f"mysql+pymysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
    )
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['DEBUG'] = os.environ.get('FLASK_DEBUG') == '1'
    
    # JWT Cookie Config
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    app.config['JWT_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
    app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True
    app.config["JWT_SESSION_COOKIE"] = False
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=14)

    # Extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, supports_credentials=True)

    @jwt.unauthorized_loader
    def custom_unauthorized_response(_err):
        return jsonify({"msg": "Acceso no autorizado: No se ha iniciado sesión."}), 401

    @jwt.expired_token_loader
    def custom_expired_token_response(jwt_header, jwt_payload):
        return jsonify({"msg": "Su sesión ha expirado. Por favor, inicie sesión nuevamente."}), 401

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(alumno_bp, url_prefix='/api/alumnos')
    app.register_blueprint(cinturon_bp, url_prefix='/api/cinturones')
    app.register_blueprint(temporada_bp, url_prefix='/api/config/temporadas')
    app.register_blueprint(tarifa_bp, url_prefix='/api/config/tarifas')
    app.register_blueprint(tipolicencia_bp, url_prefix='/api/config/tipos-licencia')
    app.register_blueprint(licencia_alumno_bp, url_prefix='/api/licencias')
    app.register_blueprint(inscripcion_bp, url_prefix='/api/pagos/inscripciones')
    app.register_blueprint(pago_bp, url_prefix='/api/pagos/mensualidades')
    app.register_blueprint(evento_bp, url_prefix='/api/eventos')
    app.register_blueprint(participacion_bp, url_prefix='/api/eventos/participaciones')
    app.register_blueprint(asistencia_bp, url_prefix='/api/asistencia')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(utils_bp, url_prefix='/api/utils')

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    import time
    from sqlalchemy.exc import OperationalError

    with app.app_context():
        max_retries = 10
        for i in range(max_retries):
            try:
                db.create_all()
                print("Database tables created successfully.")
                
                admin_username = os.environ.get('ADMIN_USER', 'shifu')
                admin_password = os.environ.get('ADMIN_PASSWORD', 'admin')
                
                if not User.query.filter_by(username=admin_username).first():
                    admin_user = User(
                        username=admin_username,
                        password=generate_password_hash(admin_password),
                        roles='admin'
                    )
                    db.session.add(admin_user)
                    db.session.commit()
                    print(f"Created default {admin_username} user (admin)")
                
                break
            except OperationalError as e:
                print(f"Database not ready... retrying in 5 seconds ({i+1}/{max_retries})")
                time.sleep(5)
            except Exception as e:
                print(f"Error creating database tables: {e}")
                import traceback
                traceback.print_exc()
                break
            
    port = int(os.environ.get('BACKEND_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', True))
