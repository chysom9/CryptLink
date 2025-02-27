package com.cryptLink.CryptLinkBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.cryptLink.CryptLinkBackend.model.User;
import com.cryptLink.CryptLinkBackend.repository.UserRepository;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    // registers a user and hashes their password
    public void registerUser(User user){
        if(userRepository.existsByEmail(user.getEmail())){
            throw new RuntimeException("Email already in use");
        }
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        userRepository.save(user);
        
    }
    // search by userID
    public Optional<User> getUserById(Integer id){
        return userRepository.findById(id);

    }
    // method to check if passwords match and if they do return true to let person login
    public boolean authenticateUser(String email, String password){
        Optional<User> userOptional = userRepository.findByEmail(email);

        if(userOptional.isPresent()){
            User user = userOptional.get();
            return passwordEncoder.matches(password, user.getPassword());
        }
        return false;
    }    
    // method to update users
    public User updateUser(Integer userId, User updatedUser) {
        return userRepository.findById(userId).map(existingUser -> {
            existingUser.setFirstName(updatedUser.getFirstName());
            existingUser.setLastName(updatedUser.getLastName());
            existingUser.setEmail(updatedUser.getEmail());
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Method to delte user
    public void deleteUser(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }
}
