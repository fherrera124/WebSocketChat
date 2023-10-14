# Seguridad:

https://www.youtube.com/watch?v=KxqlJblhzfI

https://github.com/ali-bouali/spring-boot-3-jwt-security

Me guié tambien según:

https://www.bezkoder.com/spring-security-refresh-token/

La configuracion de seguridad:

refresh token se almacena como cookie http-only, con duracion de un dia, lo que si se devuelve es el access token (con duracion de 1 minuto)
que se debe proporcionar como bearer en cada endpoint protegido.
los refresh token se almacenan en una base de datos, de manera tal que ademas de ser valido, y estar vigente,
tiene que encontrarse en la bd como aun valido. Dando la posibilidad de deshabilitar un refresh token.

# Websocket

https://docs.spring.io/spring-security/reference/servlet/integrations/websocket.html


Partes a destacar:

CustomInboundChannelInterceptor: implementa la interface ChannelInterceptor

en preSend, se realiza la logica a priori de enviar el mensaje al canal.
Accedemos a los headers del mensaje, y evaluamos sus calores.
Si contiene el comando Stomp CONNECT, significa que el mensaje es un frame de tipo CONNECT
entonces se evalua que el mensaje contenga la informacion necesaria para validar la sesion.
En caso de ser correcto, se aplica setUser(user) en el accesor, que ademas de setear en el 
header con su valor, ejecutara userCallback, que es una implementacion de la interface funcional
Consumer.


StompSubProtocolHandler tiene el metodo handleMessageFromClient,
que es la encargada de recibir un WebSocketMessage y convertirlo en uno o multiples mensajes de tipo
Stomp, ahi es donde evalua por cada mensaje convertido, si es un frame de tipo CONNECT, llamar en su headerAccessor
el metodo setUserChangeCallback(cb) el cual setea la variable userCallback del accesor, con una instancia de una
clase que implementa la interfaz funcional Consumer<Principal>. Dicha instancia en su metodo accept
guarda en stompAuthentications (Map<String, Principal>) es asociar el el session id, con el principal. En dicho mapa, StompSubProtocolHandler lleva un registro de todos las sesiones y si estan autenticadas con un Principal.



    es la clase que setea el callBack en 
## desafios

https://docs.spring.io/spring-framework/reference/web/websocket/stomp/authentication-token-based.html

https://github.com/stomp-js/stompjs/issues/322#issuecomment-766698673
https://stomp-js.github.io/faqs/faqs.html#p-can-i-use-token-based-authentication-with-these-libraries-p


# CSRF

https://github.com/spring-projects/spring-security/issues/12094#issuecomment-1294150717

## Problema al setear cookies

Pues al ser con cors origins, es necesarios setear el header de credentials en true
https://stackoverflow.com/a/66671871



# TODO: implementar Redis

https://www.baeldung.com/spring-data-redis-tutorial