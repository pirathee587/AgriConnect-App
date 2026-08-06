package com.agriconnect.shared.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")     private String secret;
    @Value("${jwt.expiration}") private Long expiration;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes()); }

    public String generateToken(String phone, String role) {
        return Jwts.builder()
                .setSubject(phone)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractPhone(String token) { return claims(token).getSubject(); }
    public String extractRole(String token)  { return (String) claims(token).get("role"); }

    public boolean validate(String token) {
        try { claims(token); return true; }
        catch (JwtException e) { return false; }
    }

    private Claims claims(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
    }
}