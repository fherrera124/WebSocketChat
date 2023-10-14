package dev.websocket.chat.auth;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import dev.websocket.chat.config.JwtService;
import dev.websocket.chat.exception.TokenRefreshException;
import dev.websocket.chat.token.Token;
import dev.websocket.chat.token.TokenRepository;
import dev.websocket.chat.token.TokenType;
import dev.websocket.chat.user.Role;
import dev.websocket.chat.user.User;
import dev.websocket.chat.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final static ThreadLocal<User> threadLocal = new ThreadLocal<>();

    public static void storeUserOnThread(User data) {
        threadLocal.set(data);
    }

    public static User getUserFromThread() {
        User user = threadLocal.get();
        removeThreadLocalData();
        return user;
    }

    public static void removeThreadLocalData() {
        threadLocal.remove();
    }

    public AuthenticationResponse register(RegisterRequest request) {

        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        var savedUser = repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        saveUserRefreshToken(savedUser, refreshToken);
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                /* .refreshToken(refreshToken) */
                .build();
    }

    public String authenticate(AuthenticationRequest request, HttpServletResponse response) {
        // llama internamente a authenticationProvider, q a su vez llama a
        // userDetailsService
        authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken((request.getEmail()),
                        request.getPassword()));
        var user = getUserFromThread();
        var refreshToken = jwtService.generateRefreshToken(user);
        revokeAllUserRefreshTokens(user);
        saveUserRefreshToken(user, refreshToken);
        ResponseCookie cookie = jwtService.generateRefreshJwtCookie(refreshToken);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return jwtService.generateToken(user);
    }

    private void saveUserRefreshToken(User user, String jwtToken) {
        var token = Token.builder()
                .user(user)
                .token(jwtToken)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
    }

    private void revokeAllUserRefreshTokens(User user) {
        var validUserTokens = tokenRepository.findAllValidTokenByUser(user.getId());
        if (validUserTokens.isEmpty())
            return;
        validUserTokens.forEach(token -> {
            token.setExpired(true);
            token.setRevoked(true);
        });
        tokenRepository.saveAll(validUserTokens);
    }

    public String refreshToken(HttpServletRequest request) {
        final String refreshToken = jwtService.getJwtRefreshFromCookies(request);

        if ((refreshToken == null) || !(refreshToken.length() > 0)) {
            throw new TokenRefreshException("Refresh token is empty!");
        }

        return tokenRepository.findByValidToken(refreshToken)
                .map(jwtService::verifyExpiration)
                .map(Token::getUser)
                .map(jwtService::generateToken)
                .orElseThrow(() -> new TokenRefreshException("Refresh token is not in database!"));

    }

}
