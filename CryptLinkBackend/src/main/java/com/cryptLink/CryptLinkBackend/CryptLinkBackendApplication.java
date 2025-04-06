package com.cryptLink.CryptLinkBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class CryptLinkBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CryptLinkBackendApplication.class, args);
	}

}
