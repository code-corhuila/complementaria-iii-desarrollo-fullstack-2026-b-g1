package com.gamevault.api.service;

import com.gamevault.api.model.Usuario;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generarToken(Usuario usuario) {

        Instant ahora = Instant.now();
        Instant vencimiento = ahora.plus(2, ChronoUnit.HOURS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
            .issuer("gamevault-api")
            .issuedAt(ahora)
            .expiresAt(vencimiento)
            .subject(usuario.getCorreo())
            .claim("usuarioId", usuario.getId())
            .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
            .build();

        return jwtEncoder.encode(
            JwtEncoderParameters.from(header, claims)
        ).getTokenValue();
    }
}
