# Productos API

API REST para la gestión de productos, construida con **Spring Boot 3**, **Spring Data JPA**, **H2** (en memoria) y documentada con **OpenAPI 3 / Swagger UI**.

## Tecnologías

- Java 17+
- Spring Boot 3.3.x (Web, Data JPA, Validation)
- H2 Database
- Lombok
- springdoc-openapi (`springdoc-openapi-starter-webmvc-ui`)

## Estructura de paquetes

```
com.ejemplo.productos
├── controller   -> ProductController
├── service      -> ProductService, impl/ProductServiceImpl
├── repository   -> ProductRepository
├── entity       -> Product
└── exception    -> ResourceNotFoundException, ErrorResponse, GlobalExceptionHandler
```

## Requisitos previos

- JDK 17 o superior
- Maven 3.8+
- Git

## Clonar y ejecutar

```bash
git clone <URL_DEL_REPOSITORIO>
cd productos-api
mvn spring-boot:run
```

La aplicación queda disponible en `http://localhost:8080`.

## Enlaces

| Recurso | URL |
|---|---|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| H2 Console | http://localhost:8080/h2-console |

**Conexión en la consola H2:**

- JDBC URL: `jdbc:h2:mem:productosdb`
- User Name: `sa`
- Password: *(vacío)*

## Modelo `Product`

| Campo | Tipo | Validación |
|---|---|---|
| `id` | Long | Generado automáticamente |
| `name` | String | Obligatorio (`@NotBlank`), máximo 100 caracteres |
| `description` | String | Opcional, máximo 500 caracteres |
| `price` | Double | Obligatorio, mayor que 0 (`@Positive`) |
| `stock` | Integer | Obligatorio, mayor o igual a 0 (`@PositiveOrZero`) |

## Colección de Postman

Importa `Productos-API.postman_collection.json` en Postman y ejecuta las 7 peticiones en orden. La petición 2 guarda el `id` creado en la variable `productId`, que usan las peticiones 3, 4 y 5.

## API Reference

This REST API manages a catalog of products and exposes five endpoints under the base path `/api/v1/products`. The `GET /api/v1/products` endpoint returns every stored product as a JSON array with status `200 OK`, while `GET /api/v1/products/{id}` returns a single product or responds with `404 Not Found` when the id does not exist. The `POST /api/v1/products` endpoint validates the JSON body, creates the product, and returns it with status `201 Created` and a `Location` header, or `400 Bad Request` when a field is invalid. The `PUT /api/v1/products/{id}` endpoint replaces the data of an existing product and returns it with status `200 OK`, responding with `404 Not Found` for an unknown id or `400 Bad Request` for invalid data. The `DELETE /api/v1/products/{id}` endpoint removes a product and returns `204 No Content` with an empty body, or `404 Not Found` when the product does not exist. Every product has the fields `id`, `name`, `description`, `price` and `stock`, where `name` must not be blank, `price` must be greater than zero and `stock` must not be negative. All error responses use a single JSON format containing `timestamp`, `status`, `error`, `message` and `path`, and validation errors add a `details` array that lists each failed field.
