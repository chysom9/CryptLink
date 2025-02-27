package com.cryptLink.CryptLinkBackend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cryptLink.CryptLinkBackend.model.User;

// This interface extends JpaRepository, which provides CRUD operations for User
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Finds a user by email (useful for authentication)
    Optional<User> findByEmail(String email);

    // Checks if an email is already registered (useful for registration validation)
    boolean existsByEmail(String email);
}
