package com.blinkitclone.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BlinkitCloneApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlinkitCloneApplication.class, args);
    }
}
