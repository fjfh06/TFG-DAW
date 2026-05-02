# 🥋 Club Shaolin - Sistema de Gestión de Artes Marciales

![Logo del Proyecto](/frontend/app/public/icon-192.png)

## 📝 Resumen del Proyecto

**Gestión del Club Shaolin** es una aplicación web diseñada para la digitalización y gestión administrativa del gimnasio **Club Shaolin Las Gabias**. Este proyecto nace como parte del **Trabajo de Fin de Grado (TFG) de Desarrollo de Aplicaciones Web (DAW)** y tiene como objetivo modernizar la gestión tradicional (basada en papel u hojas de cálculo) de este centro, centralizando el control de alumnos, asistencias, eventos, pagos y licencias en una plataforma web intuitiva y eficiente.

---

## Características Principales

*   **Gestión de Alumnos:** Registro completo de expedientes, datos personales e historial.
*   **Control de Pagos y Cuotas:** Automatización y seguimiento de mensualidades y licencias.
*   **Gestión de Eventos:** Organización e inscripcion de los alumnos en exámenes, concentraciones y competiciones.
*   **Licencias:** Gestión de estados de pago de las licencias.
*   **Seguridad:** Autenticación basada en JWT (JSON Web Tokens) y control de acceso por roles (Administrador, Ayudante y Alumno).
*   **Diseño Responsivo:** Interfaz optimizada para su uso tanto en ordenadores como en dispositivos móviles y tablets.

---

## 🛠️ Tecnologías Utilizadas

El proyecto se basa en una arquitectura de microservicios dockerizados, utilizando un stack:

### **Frontend**
*   **React 19:** Biblioteca principal para la interfaz de usuario.
*   **TypeScript:** Para un desarrollo tipado y seguro sobre JavaScript.
*   **Vite:** Herramienta de construcción y servidor de desarrollo.
*   **React Router 7:** Gestión de navegación y rutas.
*   **Lucide React:** Set de iconos.
*   **Sonner:** Sistema de notificaciones (Toasts).
*   **Vanilla CSS:** Estilado personalizado y flexible.

### **Backend**
*   **Python / Flask:** Framework ágil para la creación del API RESTful.
*   **Flask-SQLAlchemy:** ORM para la interacción con la base de datos.
*   **Flask-Migrate:** Gestión de versiones y migraciones de la base de datos.
*   **Flask-JWT-Extended:** Implementación de seguridad y autenticación.
*   **Pillow / Pillow-Heif:** Procesamiento avanzado de imágenes (incluyendo formatos HEIC).

### **Infraestructura y Base de Datos**
*   **MySQL:** Base de datos relacional para el almacenamiento persistente.
*   **Nginx:** Servidor web y proxy inverso para la entrega de contenido y seguridad.
*   **Docker & Docker Compose:** Containerización de todos los servicios para garantizar la portabilidad.

---

## 🚀 Despliegue con Docker (Recomendado)

Para levantar el entorno completo (Backend, Frontend, Base de Datos y Nginx) de manera automática:

1.  **Clonar el repositorio:**

    **HTTPS**
    ```bash
    git clone https://github.com/fjfh06/TFG-DAW.git
    cd TFG-DAW
    ```
    **Recomendado (SSH)**
    ```bash
    git clone git@github.com:fjfh06/TFG-DAW.git
    cd TFG-DAW
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz (puedes basarte en `.env.ejemplo`) con las credenciales necesarias.

3.  **Levantar servicios:**
    ```bash
    docker-compose up --build -d
    ```

4.  **Acceso:**
    *   **Aplicación Web:** `http://localhost`
    *   **API (Backend):** `http://localhost/api` (vía Nginx)
    *   **Base de Datos (Administración opcional):** PHPMyAdmin en el puerto configurado.

---

## 📂 Estructura del Proyecto

```text
.
├── backend/            # API REST desarrollada con Flask
│   ├── app.py          # Punto de entrada de la aplicación
│   ├── models/         # Modelos de la base de datos (SQLAlchemy)
│   ├── controllers/    # Lógica de negocio y rutas
│   └── migrations/     # Historial de cambios en la base de datos
├── frontend/           # Aplicación Single Page (SPA)
│   └── app/
│       ├── src/        # Componentes, hooks y servicios de React
│       └── public/     # Recursos estáticos
├── nginx/              # Configuración del servidor y proxy inverso
└── docker-compose.yml  # Orquestación de contenedores
```

---

## 📸 Capturas de Pantalla

![Dashboard Admins](/docs/imagenes/DashboardAdmins.png)
*Dashboard para administradores.*

![Dashboard Ayudantes](/docs/imagenes/DashboardAyudantes.png)
*Dashboard para ayudantes.*

![Dashboard Alumnos](/docs/imagenes/DashboardAlumnos.png)
*Dashboard para alumnos.*

![Gestión de Alumnos](/docs/imagenes/Alumnos.png)
*Vista de alumnos.*

---

## ✒️ Autor

*   **Francisco Javier Fdez Hdez** - *Desarrollo Integral* - [GitHub](https://github.com/fjfh06)

---
> **Nota:** Este proyecto ha sido desarrollado como proyecto final para el Grado Superior en Desarrollo de Aplicaciones Web. Para una explicación detallada del modelo de datos, roles de usuario y casos de uso, consulte el archivo **Documentacion.pdf** incluido en la entrega del TFG.
