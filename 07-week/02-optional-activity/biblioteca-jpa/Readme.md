# Biblioteca — Entity y Repository con JPA

Actividad de Desarrollo Fullstack, semana 7.

## Caso elegido

Una biblioteca necesita registrar libros, consultar su información,
actualizar sus datos y eliminar registros.

## Entity: Libro

La clase Libro representa la tabla libros mediante @Entity y @Table.

Sus atributos son:

- id: identificador único del libro.
- titulo: nombre del libro.
- autor: nombre del autor.
- anioPublicacion: año de publicación.

@Id establece la clave primaria.
@GeneratedValue permite generar el identificador automáticamente.
El constructor vacío permite que JPA cree instancias de la entidad.

## Repository: LibroRepository

LibroRepository extiende JpaRepository<Libro, Long>.

Libro es la entidad administrada y Long es el tipo de su identificador.
El repository proporciona operaciones para guardar, consultar y eliminar libros.

### Consulta por método

List<Libro> findByAutorIgnoreCase(String autor);

Este método consulta los libros cuyo autor coincide con el nombre indicado,
sin distinguir entre mayúsculas y minúsculas.

Por ejemplo, buscar "Gabriel García Márquez" devuelve los libros registrados
con ese autor.

## Operaciones CRUD

| Operación | Método | Uso en la biblioteca |
|---|---|---|
| Create | save(libro) | Registrar un libro nuevo. |
| Read | findAll() | Consultar todos los libros. |
| Read | findById(id) | Buscar un libro por su identificador. |
| Update | findById(id) y save(libro) | Consultar un libro existente, modificar sus atributos y guardar los cambios. |
| Delete | deleteById(id) | Eliminar un libro por su identificador. |

Para actualizar, primero se verifica que el libro exista. Luego se modifican
sus datos y se guarda la entidad conservando su identificador.

## Archivos

- Libro.java
- LibroRepository.java
- README.md

## Alcance

Esta actividad presenta la entity, el repository y la explicación del CRUD.
Para compilar e integrar las clases se necesita un proyecto Spring Boot
con la dependencia Spring Data JPA y una base de datos configurada.