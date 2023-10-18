package dev.websocket.chat.websocketconfig;

import java.util.Collection;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

/*
 * Clase que extiende UsernamePasswordAuthenticationToken y que almacena el JWT access
 * token con el cual se obtuvo informacion de autenticacion
 */
public class JWTUsernamePasswordAuthenticationToken extends UsernamePasswordAuthenticationToken {

    private final String jwt;

    public JWTUsernamePasswordAuthenticationToken(Object principal, Object credentials,
            Collection<? extends GrantedAuthority> authorities, String jwt) {
        super(principal, credentials, authorities);
        this.jwt = jwt;
    }

    public String getAccessToken() {
        return this.jwt;
    }

}
