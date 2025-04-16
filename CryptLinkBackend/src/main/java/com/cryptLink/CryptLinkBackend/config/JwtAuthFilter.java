package com.cryptLink.CryptLinkBackend.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.cryptLink.CryptLinkBackend.security.JwtUtil;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger jwtAuthFilterLogger = LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
                                    throws ServletException, IOException {
        jwtAuthFilterLogger.debug("Processing request: {}", request.getRequestURI());
        
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            jwtAuthFilterLogger.warn("Missing or invalid Authorization header");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);

        jwtAuthFilterLogger.debug("Extracted username from token: {}", email);
        if (email != null && jwtUtil.validateToken(token)) {
            UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(email, null, Collections.emptyList());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
            jwtAuthFilterLogger.debug("Authentication set for user: {}", email);
        } else {
            jwtAuthFilterLogger.warn("JWT token is invalid or expired");
        }

        filterChain.doFilter(request, response);
    }
}
