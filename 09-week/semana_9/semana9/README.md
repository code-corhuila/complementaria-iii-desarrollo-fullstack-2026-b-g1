# Complementaria III - Corte 2: API REST con Spring Boot

## Descripción
Proyecto de API RESTful desarrollada con Java y Spring Boot aplicando arquitectura en capas (Controller, Service, Repository, Entity) y persistencia JPA con base de datos H2.

## Cómo Ejecutar
1. Clonar el repositorio.
2. Ejecutar con Maven: `./mvnw spring-boot:run` o desde tu IDE preferido.
3. La aplicación iniciará en `http://localhost:8080`.
4. Acceder a la documentación Swagger UI en: `http://localhost:8080/swagger-ui.html`

## API reference
The Spring Boot REST API exposes several HTTP endpoints to manage product resources effectively. The GET /api/productos endpoint retrieves a complete list of all stored products in JSON format. The GET /api/productos/{id} endpoint fetches a single product by its unique identifier, returning a 404 Not Found status code if the resource does not exist. The POST /api/productos endpoint creates a new product resource, returning a 400 Bad Request error if mandatory fields are missing. The PUT /api/productos/{id} endpoint updates an existing product record, while the DELETE /api/productos/{id} endpoint removes a product from the JPA database repository.