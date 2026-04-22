import traceback

try:
    import os
    # Set env var BEFORE importing app so the global app instance uses it too
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

    import requests
    import unittest
    import threading
    import time
    from app import create_app, db
    from models import *

    # Configure test app
    app = create_app()
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False

    # Global var to store the server thread
    server_thread = None

    class TestAPI(unittest.TestCase):
        @classmethod
        def setUpClass(cls):
            try:
                # Create tables
                with app.app_context():
                    db.create_all()
                    
                # Run server in a separate thread
                cls.client = app.test_client()
                cls.ctx = app.app_context()
                cls.ctx.push()
            except Exception as e:
                import traceback
                with open('error_log.txt', 'w') as f:
                    f.write(traceback.format_exc())
                raise e

        @classmethod
        def tearDownClass(cls):
            try:
                cls.ctx.pop()
            except:
                pass

        def test_01_setup(self):
            # 1. Cinturones
            res = self.client.post('/api/cinturones/', json={'nombre': 'Blanco', 'orden_jerarquia': 1})
            self.assertEqual(res.status_code, 201)
            cinturon_id = res.json['id']
            
            # 2. Temporadas
            res = self.client.post('/api/config/temporadas/', json={
                'nombre': '2025/2026', 
                'fecha_inicio': '2025-09-01', 
                'fecha_fin': '2026-07-31', 
                'activa': True
            })
            self.assertEqual(res.status_code, 201)
            temporada_id = res.json['id']
            
            # 3. Tarifas
            res = self.client.post('/api/config/tarifas/', json={
                'nombre': 'Standard', 
                'precio_base': 30.00, 
                'temporada_id': temporada_id
            })
            self.assertEqual(res.status_code, 201)

        def test_02_alumno_photo(self):
            # Create dummy photo
            with open('test_photo.jpg', 'wb') as f:
                f.write(b'\x00' * 100)
                
            data = {
                'nombre': 'Juan',
                'apellidos': 'Perez',
                'activo': 'true'
            }
            with open('test_photo.jpg', 'rb') as f:
                res = self.client.post('/api/alumnos/', data={
                    'nombre': 'Juan',
                    'apellidos': 'Perez',
                    'foto': (f, 'test_photo.jpg')
                }, content_type='multipart/form-data')
                
            self.assertEqual(res.status_code, 201)
            alumno_id = res.json['id']
            
            # Verify photo name
            res = self.client.get(f'/api/alumnos/{alumno_id}')
            self.assertIn(f'{alumno_id}_Juan.jpg', res.json['foto'])
            
            # Clean up
            os.remove('test_photo.jpg')
            # We should clean up the uploaded file too, but for this test it's fine

        def test_03_pagos(self):
            # Basic flow: Create Alumno -> Create Pago
            # We reuse the setup from previous tests (DB is shared in memory for the class)
            
            res = self.client.post('/api/pagos/mensualidades/', json={
                'alumno_id': 1,
                'mes': 10, 
                'anio': 2025,
                'cantidad': 30.00,
                'estado': 'pagado',
                'fecha_pago': '2025-10-05'
            })
            self.assertEqual(res.status_code, 201)
            
            # Duplicate check
            res = self.client.post('/api/pagos/mensualidades/', json={
                'alumno_id': 1,
                'mes': 10, 
                'anio': 2025,
                'cantidad': 30.00
            })
            self.assertEqual(res.status_code, 400)

        def test_04_eventos(self):
            res = self.client.post('/api/eventos/', json={
                'nombre': 'Campeonato',
                'tipo': 'campeonato',
                'fecha_inicio': '2025-11-20 09:00:00',
                'fecha_fin': '2025-11-20 18:00:00',
                'temporada_id': 1,
                'precio_inscripcion': 10.00
            })
            self.assertEqual(res.status_code, 201)
            evento_id = res.json['id']
            
            # Participacion
            res = self.client.post(f'/api/eventos/participaciones/{evento_id}/crear', json={
                'alumno_id': 1,
                'categoria': '-60kg'
            })
            self.assertEqual(res.status_code, 201)

    if __name__ == '__main__':
        with open('error_log.txt', 'w') as f:
            runner = unittest.TextTestRunner(stream=f, verbosity=2)
            unittest.main(testRunner=runner, exit=False)
except Exception:
    with open('error_log.txt', 'a') as f:
        f.write(traceback.format_exc())
