package it.espressamente.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EspressamenteApplication {

    public static void main(String[] args) {
        SpringApplication.run(EspressamenteApplication.class, args);
    }
}
