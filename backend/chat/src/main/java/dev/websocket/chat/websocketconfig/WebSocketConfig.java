package dev.websocket.chat.websocketconfig;

import java.security.Principal;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;
import org.springframework.security.messaging.web.csrf.CsrfChannelInterceptor;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSocketMessageBroker // enable a broker-backed messaging over WebSocket using STOMP
@EnableWebSocketSecurity
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/secured/chat").setAllowedOriginPatterns("*")

                // ejemplo de como customizar el handler del handshake
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(
                            ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        return super.determineUser(request, wsHandler, attributes);
                    }

                });
    }

    @Bean
    AuthorizationManager<Message<?>> authorizationManager(
            MessageMatcherDelegatingAuthorizationManager.Builder messages) {
        messages
                .simpSubscribeDestMatchers("/user/queue/errors").permitAll()
                .simpDestMatchers("/secured/**").authenticated()
                .anyMessage().authenticated();
        return messages.build();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // We have to register an authorizationInterceptor that will be responsible
        // for validating access-token and user access rights for any incoming
        // CONNECTION attempts.
        registration.interceptors(channelInterceptor());
    }

    /**
     * Configure options related to the processing of messages received from and
     * sent to WebSocket clients.
     * Al final no lo uso, pero me parece una herramienta de configuracion muy interesante
     */
    /* @Override
    public void configureWebSocketTransport(final WebSocketTransportRegistration registration) {
        registration.addDecoratorFactory((final WebSocketHandler handler) -> {

            return new WebSocketHandlerDecorator(handler) {

                @Override
                public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
                    super.afterConnectionClosed(session, closeStatus);
                }

            };
        });
    } */

    @Bean
    public CustomInboundChannelInterceptor channelInterceptor() {
        return new CustomInboundChannelInterceptor();
    }

    /**
     * Bypass csrf validation
     *
     * @Bean(name = "csrfChannelInterceptor")
     *            ChannelInterceptor csrfChannelInterceptor() {
     *            return new ChannelInterceptor() {
     *            };
     *            }
     */

    /**
     * When using Cookie bases CSRF Protection, the raw CSRF Token is used and not
     * the Xored protected form. For Websockets, the default ChannelInterceptor
     * expects the Xored form of the token, so we have to make the system use the
     * interceptor which expects the raw token.
     * See
     * {@link org.springframework.security.config.annotation.web.socket.WebSocketMessageBrokerSecurityConfiguration#CSRF_CHANNEL_INTERCEPTOR_BEAN_NAME}
     * on how its applied.
     *
     * @return CsrfChannelInterceptor
     */

    @Bean(name = "csrfChannelInterceptor")
    public ChannelInterceptor csrfChannelInterceptor() {
        return new CsrfChannelInterceptor();
    }

}
