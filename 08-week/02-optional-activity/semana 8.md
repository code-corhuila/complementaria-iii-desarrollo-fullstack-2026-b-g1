# CRUD REST Endpoints — Sistema de Control de Asistencia

## 1. Recurso seleccionado

Para implementar el CRUD REST se utilizará el recurso:

```text
Attendance
```

Este recurso representa el registro de asistencia de un estudiante en una clase.

La estructura utilizada será:

```text
Controller
    |
    v
Service
    |
    v
Repository
    |
    v
Entity
```

---

# 2. Entity

La entidad `Attendance` representa la información almacenada en la base de datos.

```java
@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private Long classSessionId;

    private LocalDateTime checkInTime;

    private String status;

}
```

---

# 3. Repository

El Repository permite realizar operaciones de acceso a datos utilizando JPA.

```java
@Repository
public interface AttendanceRepository 
        extends JpaRepository<Attendance, Long> {

}
```

Al extender `JpaRepository` se obtienen automáticamente las operaciones CRUD básicas.

---

# 4. Service

La capa Service contiene la lógica del negocio y comunica el Controller con el Repository.

```java
@Service
public class AttendanceService {

    private final AttendanceRepository repository;

    public AttendanceService(AttendanceRepository repository){
        this.repository = repository;
    }


    public List<Attendance> findAll(){
        return repository.findAll();
    }


    public Attendance findById(Long id){
        return repository.findById(id)
                .orElseThrow();
    }


    public Attendance save(Attendance attendance){
        return repository.save(attendance);
    }


    public void delete(Long id){
        repository.deleteById(id);
    }
}
```

---

# 5. Controller REST

El Controller expone los endpoints HTTP para que la aplicación pueda consumirlos.

```java
@RestController
@RequestMapping("/api/attendances")
public class AttendanceController {


    private final AttendanceService service;


    public AttendanceController(AttendanceService service){
        this.service = service;
    }


    @GetMapping
    public List<Attendance> getAll(){

        return service.findAll();

    }


    @GetMapping("/{id}")
    public Attendance getById(
            @PathVariable Long id){

        return service.findById(id);

    }


    @PostMapping
    public Attendance create(
            @RequestBody Attendance attendance){

        return service.save(attendance);

    }


    @PutMapping("/{id}")
    public Attendance update(
            @PathVariable Long id,
            @RequestBody Attendance attendance){

        attendance.setId(id);

        return service.save(attendance);

    }


    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id){

        service.delete(id);

    }

}
```

---

# 6. Endpoints REST implementados

Los endpoints utilizan métodos HTTP correctos y URLs con sustantivos.

| Acción | Método HTTP | URL | Descripción |
|---|---|---|---|
| Crear asistencia | POST | `/api/attendances` | Registra una nueva asistencia |
| Listar asistencias | GET | `/api/attendances` | Obtiene todas las asistencias |
| Obtener una asistencia | GET | `/api/attendances/{id}` | Consulta una asistencia específica |
| Actualizar asistencia | PUT | `/api/attendances/{id}` | Modifica una asistencia |
| Eliminar asistencia | DELETE | `/api/attendances/{id}` | Elimina una asistencia |

---

# 7. Pruebas de endpoints

Las pruebas se pueden realizar utilizando Postman.

---

## Crear asistencia

### Request

```http
POST /api/attendances
```

Body:

```json
{
    "studentId": 15,
    "classSessionId": 3,
    "checkInTime": "2026-09-26T10:30:00",
    "status": "PRESENT"
}
```

Respuesta esperada:

```json
{
    "id":1,
    "studentId":15,
    "classSessionId":3,
    "checkInTime":"2026-09-26T10:30:00",
    "status":"PRESENT"
}
```

Código:

```text
201 Created
```

---

# Listar asistencias

### Request

```http
GET /api/attendances
```

Respuesta:

```json
[
 {
  "id":1,
  "studentId":15,
  "status":"PRESENT"
 }
]
```

Código:

```text
200 OK
```

---

# Obtener asistencia por ID

### Request

```http
GET /api/attendances/1
```

Respuesta:

```json
{
"id":1,
"studentId":15,
"status":"PRESENT"
}
```

Código:

```text
200 OK
```

---

# Actualizar asistencia

### Request

```http
PUT /api/attendances/1
```

Body:

```json
{
    "studentId":15,
    "classSessionId":3,
    "status":"LATE"
}
```

Respuesta:

```json
{
"id":1,
"status":"LATE"
}
```

Código:

```text
200 OK
```

---

# Eliminar asistencia

### Request

```http
DELETE /api/attendances/1
```

Respuesta:

```text
Sin contenido
```

Código:

```text
204 No Content
```

---

# 8. Evidencia de pruebas

Para la evidencia se deben incluir capturas de Postman mostrando:

- Endpoint POST funcionando.
- Endpoint GET mostrando registros.
- Endpoint GET por ID.
- Endpoint PUT actualizando información.
- Endpoint DELETE eliminando el registro.

Ejemplo de evidencia:

```text
Postman
 |
 |-- POST /api/attendances       ✓
 |
 |-- GET /api/attendances        ✓
 |
 |-- GET /api/attendances/{id}   ✓
 |
 |-- PUT /api/attendances/{id}   ✓
 |
 |-- DELETE /api/attendances/{id} ✓
```

---

# Conclusión

El CRUD REST del recurso Attendance permite administrar los registros de asistencia utilizando correctamente los métodos HTTP y una estructura por capas.

La separación entre Controller, Service, Repository y Entity facilita el mantenimiento del sistema y permite realizar pruebas completas desde la creación hasta la eliminación de registros.
