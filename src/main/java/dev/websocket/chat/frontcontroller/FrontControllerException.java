package dev.websocket.chat.frontcontroller;

class FrontControllerException extends RuntimeException {

    FrontControllerException(String message) {
        super(message);
    }

    FrontControllerException(String message, Throwable throwable) {
        super(message, throwable);
    }
}