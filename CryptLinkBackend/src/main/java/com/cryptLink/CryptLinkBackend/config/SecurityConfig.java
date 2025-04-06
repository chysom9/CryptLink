package com.cryptLink.CryptLinkBackend.config; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;



@Configuration
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

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
                .requestMatchers("/","/error","/api/users/register", 
                "/api/users/login",
                "/api/files/upload",
                "/api/files/{fileid}",
                "/ws/**",
                "/api/auth/send-otp",
                "/api/auth/verify-otp",
                "/api/files/user/{userId}"

                ).permitAll() // Public access
                .anyRequest().authenticated() // Secure other endpoints
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .formLogin(form -> form.disable()) // Disable default login form
            .httpBasic(httpBasic -> httpBasic.disable()); // Disable HTTP Basic Auth
        
        return http.build();
    }

    
}
