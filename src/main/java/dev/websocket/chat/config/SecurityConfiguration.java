package dev.websocket.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity

@RequiredArgsConstructor
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    private static final String[] PERMIT_ALL_PATTERNS = {

        // propios del frontend
            "/",
            "/index.html",
            "/chat",
            "/login",

            "/api/v1/auth/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",

            // https://stomp-js.github.io/faqs/faqs.html#p-can-i-use-token-based-authentication-with-these-libraries-p
            // para clientes como stom-js, no hay manera de agregar headers de
            // autenticacion para usar al momento del handshake asi que se permite la
            // conexion y se valida luego en
            // el frame de connect
            "/secured/**",
            "/secured/success",
            "/secured/socket",
            "/secured/success" };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HandlerMappingIntrospector introspector)
            throws Exception {

        XorCsrfTokenRequestAttributeHandler delegate = new XorCsrfTokenRequestAttributeHandler();
        // set the name of the attribute the CsrfToken will be populated on
        delegate.setCsrfRequestAttributeName("_csrf");
        // Use only the handle() method of XorCsrfTokenRequestAttributeHandler and the
        // default implementation of resolveCsrfTokenValue() from
        // CsrfTokenRequestHandler
        // CsrfTokenRequestHandler requestHandler = delegate::handle;

        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        // set the name of the attribute the CsrfToken will be populated on
        requestHandler.setCsrfRequestAttributeName("_csrf");

        http

                .csrf((csrf) -> csrf
                        // .disable()

                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers(
                                AntPathRequestMatcher.antMatcher("/h2-console/**")))

                .cors(Customizer.withDefaults()) // The cors() method will add the default
                // Spring-provided CorsFilter to the
                // application context, bypassing the authorization
                // checks for OPTIONS requests.
                .headers(headers -> headers.frameOptions().disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(PERMIT_ALL_PATTERNS)
                        .permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/h2-console/**"))
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .sessionManagement(management -> management
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    @Order(-1)
    SecurityFilterChain staticResources(HttpSecurity http) throws Exception {

        http.securityMatchers(matches -> matches.requestMatchers(
                "/static/**"))
                .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll());

        return http.build();
    }

}
