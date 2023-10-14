package dev.websocket.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OutputMessage {

    private String from;
    private String text;
    private String time;

}
