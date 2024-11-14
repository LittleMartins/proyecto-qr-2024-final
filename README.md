RegistrApp - Sistema de Registro de Asistencia Académica con Códigos QR

RegistrApp es una aplicación móvil desarrollada con Ionic/Angular que permite gestionar la asistencia académica a través de códigos QR. Diseñada para facilitar el registro de asistencia de profesores y estudiantes en entornos educativos.

📋 Características
Para Profesores
Generación de Códigos QR: Crea códigos QR únicos para cada clase.
Control de Validez del Código: Configura y administra la duración de validez de cada código.
Registro de Asistencia: Visualiza el historial y registros de asistencia.
Gestión de Cursos y Asignaturas: Organiza y administra cursos y asignaturas de manera eficiente.
Panel de Asistencias: Monitorea los datos de asistencia en tiempo real.
Para Estudiantes
Escaneo de Códigos QR: Registra asistencia mediante el escaneo de códigos QR en clase.
Historial de Asistencias: Accede a los registros de asistencia personales.
Seguimiento por Curso: Consulta el porcentaje de asistencia en cada curso.
Perfil Personalizado: Visualiza información académica y personal en un solo lugar.

🛠️ Tecnologías Utilizadas
Ionic Framework: Versión 8.4.0
Angular: Versión 18.2.9
Firebase: Para autenticación y base de datos
Capacitor: Versión 6.1.2
ZXing: Para escaneo de códigos QR
TypeScript

📂 Estructura del Proyecto
El proyecto está organizado en varios módulos principales:
Autenticación: Sistema de login diferenciado para estudiantes y profesores.
Generación de QR: Módulo para la creación y gestión de códigos QR.
Escaneo de QR: Funcionalidad de lectura de códigos mediante la cámara.
Gestión de Asistencias: Sistema para el registro y seguimiento de asistencia.
Perfiles: Gestión de información y perfiles de usuario.

🎨 Diseño y UI
Interfaz Adaptativa: Optimizada para diferentes dispositivos.
Modo Claro/Oscuro: Interfaz amigable con opciones de tema.
Diseño Moderno: Animaciones fluidas y componentes personalizados de Ionic.

🔒 Seguridad
Autenticación con Firebase: Control de acceso seguro.
Validez Temporal de QR: Códigos QR con tiempo de expiración.
Roles de Usuario: Permisos diferenciados según el rol (profesor o estudiante).
Protección de Rutas: Rutas protegidas de acuerdo al perfil de usuario.

📊 Base de Datos
Utiliza Firebase Firestore con las siguientes colecciones principales:
Usuarios: Información de los usuarios del sistema.
Asistencias: Registros de asistencia de cada clase.
Cursos: Información de cursos y asignaturas.
Mensajes: Notificaciones y mensajes en tiempo real.

🚀 Características Adicionales
Recuperación de Contraseña: Sistema para recuperar credenciales.
Estadísticas de Asistencia: Visualización de datos estadísticos.
Notificaciones en Tiempo Real: Alertas instantáneas de asistencia.
Interfaz Responsive: Adaptación para dispositivos móviles y tablets.

📋 Requisitos del Sistema
Node.js
Angular CLI
Ionic CLI
Android Studio (para desarrollo en Android)
Xcode (para desarrollo en iOS)
RegistrApp está diseñada para funcionar en dispositivos Android e iOS, con un enfoque en la experiencia móvil.
