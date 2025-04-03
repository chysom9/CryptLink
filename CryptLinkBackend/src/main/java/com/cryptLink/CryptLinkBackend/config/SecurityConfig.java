package com.cryptLink.CryptLinkBackend.config; 

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        System.out.println(" PasswordEncoder Bean Initialized");
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // Correct way to disable CSRF in Spring Security 6+
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/register", "/api/users/login", "/ws/**","/api/auth/send-otp", "/api/auth/verify-otp").permitAll() // Public access
                .anyRequest().authenticated() // Secure other endpoints
            )
            .formLogin(form -> form.disable()) // Disable default login form
            .httpBasic(httpBasic -> httpBasic.disable()); // Disable HTTP Basic Auth
        
        return http.build();
    }
}
