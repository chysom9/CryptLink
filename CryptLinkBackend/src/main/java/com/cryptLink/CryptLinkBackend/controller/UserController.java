package com.cryptLink.CryptLinkBackend.controller;

import com.cryptLink.CryptLinkBackend.model.User;
import com.cryptLink.CryptLinkBackend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController{

    @Autowired
    private UserService userService;

    //Api function to register with error handling
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody User user){
        try {
            userService.registerUser(user);
            return ResponseEntity.ok("User registered successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // api function to  search for a user by userID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
               .orElseGet(() -> ResponseEntity.notFound().build());
    }

    //api function to login, hashes the password typed and compares the stored hash
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestParam String email, @RequestParam String password) {
        try {
            String token = userService.authenticateUser(email, password);
            return ResponseEntity.ok(token);  // ✅ Return the JWT token
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }


    // api function that updates a user by userID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // api function that delets a user by userID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }




}