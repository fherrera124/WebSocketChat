package dev.websocket.chat.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.ExternalDocumentation;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@Configuration
@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP, bearerFormat = "JWT", scheme = "bearer")
public class SwaggerConfig {
    
    @Bean
	public GroupedOpenApi appApis() { // exclude all APIs with `tests` in the path
		return GroupedOpenApi.builder()
				.group("ChatApp")
				.pathsToExclude("/**/tests/**")
				.packagesToScan("dev.websocket.chat")
				.build();
	}
	
	@Bean
	public GroupedOpenApi testApis() { // group all APIs with `tests` in the path
		return GroupedOpenApi.builder()
				.group("tests")
				.pathsToMatch("/**/tests/**")
				.packagesToScan("dev.websocket.chat")
				.build();
	}

}
