package dev.websocket.chat.frontcontroller;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.resource.TransformedResource;

@Service
public class FrontControllerHandler {

    private static final String BASE_HREF_PLACEHOLDER = "#base-href#";
    private static final String FRONT_CONTROLLER_ENCODING = StandardCharsets.UTF_8.name();
    public static final String URL_SEPARATOR = "/";
    public static final String FRONT_CONTROLLER = "index.html";

    private final ServerProperties serverProperties;

    public FrontControllerHandler(ServerProperties serverProperties) {
        this.serverProperties = serverProperties;
    }

    public TransformedResource buildFrontControllerResource(Resource resource) {
        Objects.requireNonNull(resource, "resource cannot be null");

        try {
            var frontControllerContent = IOUtils.toString(resource.getInputStream(), FRONT_CONTROLLER_ENCODING);
            if (!frontControllerContent.contains(BASE_HREF_PLACEHOLDER)) {
                throw new FrontControllerException(frontControllerContent + "   " + FRONT_CONTROLLER
                        + " does not contain " + BASE_HREF_PLACEHOLDER);
            }

            frontControllerContent = frontControllerContent.replace(BASE_HREF_PLACEHOLDER, buildBaseHref());
            return new TransformedResource(resource, frontControllerContent.getBytes(FRONT_CONTROLLER_ENCODING));
        } catch (IOException e) {
            throw new FrontControllerException("Unable to perform " + FRONT_CONTROLLER + " tranformation", e);
        }
    }


    private String buildBaseHref() {
        var contextPath = StringUtils.stripToNull(serverProperties.getServlet().getContextPath());

        return null == contextPath || contextPath.equals(URL_SEPARATOR)
                ? URL_SEPARATOR
                : contextPath + URL_SEPARATOR;
    }
}
