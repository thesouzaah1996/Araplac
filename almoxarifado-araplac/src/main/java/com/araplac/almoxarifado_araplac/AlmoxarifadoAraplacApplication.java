package com.araplac.almoxarifado_araplac;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class AlmoxarifadoAraplacApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlmoxarifadoAraplacApplication.class, args);
	}

}
