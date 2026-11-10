package com.ejemplo.productos.controller;

import com.ejemplo.productos.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.security.user.username=tester",
        "app.security.user.password=Secret123*",
        "app.security.jwt.secret=test-secret-with-at-least-32-characters-ok"
})
@AutoConfigureMockMvc
class ProductSecurityTest {

    private static final String PRODUCTS = "/api/v1/products";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Con un JWT válido el endpoint protegido devuelve 200 y los productos")
    void listProducts_withValidToken_returns200() throws Exception {
        String token = jwtService.generateToken("tester", "ROLE_USER");

        mockMvc.perform(get(PRODUCTS).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").isNotEmpty());
    }

    @Test
    @DisplayName("Error: sin token el endpoint protegido devuelve 401")
    void listProducts_withoutToken_returns401() throws Exception {
        mockMvc.perform(get(PRODUCTS))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Error: un token alterado devuelve 401")
    void listProducts_withTamperedToken_returns401() throws Exception {
        String token = jwtService.generateToken("tester", "ROLE_USER") + "x";

        mockMvc.perform(get(PRODUCTS).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("CORS: el preflight desde el frontend permitido responde con el origen")
    void preflight_fromAllowedOrigin_returnsCorsHeaders() throws Exception {
        mockMvc.perform(options(PRODUCTS)
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"));
    }

    @Test
    @DisplayName("CORS: un origen no permitido es rechazado")
    void preflight_fromUnknownOrigin_isRejected() throws Exception {
        mockMvc.perform(options(PRODUCTS)
                        .header(HttpHeaders.ORIGIN, "http://evil.example.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden());
    }
}
