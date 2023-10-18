package dev.websocket.chat.demo;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin
@RequestMapping("/api/v1/demo-controller")
@SecurityRequirement(name = "bearerAuth")
public class DemoController implements ErrorController {

    private static final String PATH = "/error";

    @RequestMapping(value = PATH)
    public String error() {
        return "forward:/index.html";
    }

    /* @Override
    public String getErrorPath() {
        return PATH;
    } */

    @GetMapping
    public ResponseEntity<String> sayHello() {
        return ResponseEntity.ok("Hello from secured endpoint");
    }

    @GetMapping("/response")
    public @ResponseBody HttpServletResponse test(HttpServletResponse response) {
        return response;
    }
    @GetMapping("/request")
    public @ResponseBody HttpServletRequest test2(HttpServletRequest request) {
        return request;
    }
}
