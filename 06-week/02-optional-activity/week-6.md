# Diseño de API en capas — Sistema de Control de Asistencia

## 1. Diagrama de capas de la API

La API del sistema de control de asistencia utiliza una arquitectura por capas donde cada componente tiene una responsabilidad específica.

```text
                 Cliente (App móvil)
                        |
                        v
              +----------------+
              |   Controller   |
              |   REST API     |
              +----------------+
                        |
                        v
              +----------------+
              |    Service     |
              | Lógica negocio |
              +----------------+
                        |
                        v
              +----------------+
              |  Repository    |
              | Acceso datos   |
              +----------------+
                        |
                        v
              +----------------+
              |    Entity      |
              |  Modelo BD     |
              +----------------+
                        |
                        v
                  PostgreSQL
```

---

# 2. Responsabilidades por capa

## Controller

### Responsabilidad

La capa Controller se encarga de recibir las solicitudes HTTP enviadas por el cliente, procesar los datos de entrada y comunicarse con la capa Service.

Esta capa no contiene reglas de negocio, solamente controla la comunicación entre la aplicación móvil y el backend.

### Funciones principales

- Recibir solicitudes REST.
- Validar datos básicos de entrada.
- Enviar respuestas HTTP al cliente.
- Manejar códigos de estado HTTP.

### Ejemplo en el sistema Attendance

Cuando un estudiante escanea un código QR, el Controller recibe la solicitud:

```http
POST /api/asistencias
```

---

# Service

### Responsabilidad

La capa Service contiene la lógica de negocio del sistema. Es la encargada de aplicar las reglas necesarias antes de guardar o consultar información.

### Funciones principales

- Validar códigos QR.
- Verificar que una clase esté activa.
- Evitar registros duplicados de asistencia.
- Crear nuevos registros de asistencia.
- Consultar información del usuario.

### Ejemplo

Clase:

```text
AttendanceService
```

Métodos:

```text
registrarAsistencia()
validarCodigoQR()
consultarHistorial()
```

---

# Repository

### Responsabilidad

La capa Repository se encarga de la comunicación con la base de datos.

Su función es realizar consultas, guardar, actualizar o eliminar información utilizando las entidades del sistema.

No contiene lógica de negocio.

### Funciones principales

- Guardar registros.
- Consultar información.
- Buscar datos mediante identificadores.

### Ejemplo

Clase:

```text
AttendanceRepository
```

Métodos:

```text
save()
findByStudentId()
findByClassId()
```

---

# Entity

### Responsabilidad

La capa Entity representa los objetos principales del sistema y su relación con las tablas de la base de datos.

Estas clases contienen los atributos que serán almacenados en PostgreSQL.

### Ejemplo

Entidad:

```text
Attendance
```

Atributos:

```text
id
student
classSession
dateTime
status
```

### Entidades principales del sistema

```text
User
Course
ClassSession
QRCode
Attendance
```

---

# 3. Ejemplo de endpoint y recorrido por las capas

## Endpoint

Registrar asistencia mediante código QR.

```http
POST /api/asistencias
```

---

## Flujo de la petición

### 1. Controller

La aplicación móvil envía la información del estudiante y el código QR:

```json
{
  "qrCode": "ABC123",
  "studentId": 15
}
```

El Controller recibe la petición y la envía al Service.

---

### 2. Service

El Service procesa la lógica del sistema:

- Verifica que el código QR exista.
- Comprueba que el código no esté expirado.
- Valida que el estudiante no tenga una asistencia registrada.
- Genera el registro de asistencia.

---

### 3. Repository

El Repository guarda la información en la base de datos:

```java
attendanceRepository.save(attendance);
```

---

### 4. Entity

La entidad representa el registro almacenado:

```text
Attendance
-----------------
id
student_id
class_id
date_time
status
```

Finalmente, la información queda almacenada en PostgreSQL.

---

# Conclusión

La arquitectura en capas permite separar responsabilidades dentro de la API del sistema Attendance.

El Controller administra las solicitudes HTTP, el Service contiene las reglas del negocio, el Repository controla el acceso a los datos y las Entity representan la información almacenada.

Esta separación facilita el mantenimiento, las pruebas y la evolución del sistema.
