package dev.websocket.chat.websocketconfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.util.StringUtils;

import dev.websocket.chat.config.JwtService;

public class CustomInboundChannelInterceptor implements ChannelInterceptor {

    @Autowired
    @Qualifier("clientOutboundChannel")
    private MessageChannel outChannel;

    @Autowired
    JwtService jwtService;

    @Autowired
    UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        final StompHeaderAccessor headerAccessor = MessageHeaderAccessor.getAccessor(message,
                StompHeaderAccessor.class);

        if (headerAccessor == null) {
            sendErrorMessage(message, "Error getting accesor");
            return null;
        }

        StompCommand command = headerAccessor.getCommand();
        boolean isConnect = StompCommand.CONNECT.equals(command) || StompCommand.STOMP.equals(command);

        if (isConnect) {

            final String authHeader = headerAccessor.getFirstNativeHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendErrorMessage(message, "No access token provided as bearer");
                return null;
            }

            var jwt = authHeader.substring(7);
            var userEmail = jwtService.extractUsername(jwt);
            if (userEmail == null) {
                sendErrorMessage(message, "Invalid access token");
                return null;
            }

            var userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            var authToken = new JWTUsernamePasswordAuthenticationToken(
                    userDetails,
                    null, userDetails.getAuthorities(), jwt);
            // se establece la asociacion del principal con la sesion cuyo id (sessionId) se
            // encuentra en el mensaje
            headerAccessor.setUser(authToken);
            return message;

        }
        var authToken = (JWTUsernamePasswordAuthenticationToken) headerAccessor.getUser();
        if (authToken == null) {
            sendErrorMessage(message, "Session not authenticated");
            return null;
        }

        var jwt = authToken.getAccessToken();
        var userEmail = jwtService.extractUsername(jwt);

        if (userEmail == null) {
            sendErrorMessage(message, "Invalid access token");
            return null;
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {

        StompHeaderAccessor inAccessor = StompHeaderAccessor.wrap(message);
        String receipt = inAccessor.getReceipt();
        if (!StringUtils.hasText(receipt)) {
            return;
        }
        StompHeaderAccessor outAccessor = StompHeaderAccessor.create(StompCommand.RECEIPT);
        outAccessor.setSessionId(inAccessor.getSessionId());
        outAccessor.setReceiptId(receipt);
        outAccessor.setUser(inAccessor.getUser());
        outAccessor.setLeaveMutable(true);
        outAccessor.setDestination(inAccessor.getDestination());

        Message<byte[]> outMessage = MessageBuilder.createMessage(new byte[0], outAccessor.getMessageHeaders());

        outChannel.send(outMessage);
    }

    // Note: the connection will close after sending the message. The framework
    // complies with the STOMP protocol which requires a server to
    // close the connection after sending an ERROR frame
    private void sendErrorMessage(Message<?> message, String errorMessage) {
        StompHeaderAccessor inAccessor = StompHeaderAccessor.wrap(message);

        StompHeaderAccessor outAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
        outAccessor.setSessionId(inAccessor.getSessionId());

        outAccessor.setUser(inAccessor.getUser());
        outAccessor.setLeaveMutable(true);
        outAccessor.setDestination(inAccessor.getDestination());

        Message<byte[]> outMessage = MessageBuilder.createMessage(errorMessage.getBytes(),
                outAccessor.getMessageHeaders());

        outChannel.send(outMessage);
    }

}
