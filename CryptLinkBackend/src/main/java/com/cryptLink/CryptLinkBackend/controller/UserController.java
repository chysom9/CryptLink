package com.cryptLink.CryptLinkBackend.controller;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cryptLink.CryptLinkBackend.dto.UserLoginDto;
import com.cryptLink.CryptLinkBackend.model.User;
import com.cryptLink.CryptLinkBackend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"}) // Allow frontend requests
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    // Register User API with Debug Logs
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user) {
        logger.info("Received request to register user: {}", user.getEmail());
        
        try {
            userService.registerUser(user);
            logger.info("User registered successfully: {}", user.getEmail());
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException e) {
            logger.error("Error registering user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get User by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        logger.info("Fetching user with ID: {}", id);
        
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            logger.info("User found: {}", user.get());
            return ResponseEntity.ok(user.get());
        } else {
            logger.warn("User with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
    }

    // Login User API with Debug Logs
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody UserLoginDto loginDto) {
        logger.info("Login attempt for user: {}", loginDto.getEmail());
        
        try {
            String token = userService.authenticateUser(loginDto.getEmail(), loginDto.getPassword());
            logger.info("Login successful for user: {}", loginDto.getEmail());
            return ResponseEntity.ok(token);
        } catch (RuntimeException e) {
            logger.warn("Invalid login attempt for user: {}", loginDto.getEmail());
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    // Update User API with Debug Logs
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User user) {
        logger.info("Updating user with ID: {}", id);
        
        try {
            User updatedUser = userService.updateUser(id, user);
            logger.info("User updated successfully: {}", updatedUser);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            logger.warn("User update failed for ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // Delete User API with Debug Logs
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        logger.info("Deleting user with ID: {}", id);
        
        try {
            userService.deleteUser(id);
            logger.info("User deleted successfully: {}", id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            logger.warn("Failed to delete user with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
    }
}
