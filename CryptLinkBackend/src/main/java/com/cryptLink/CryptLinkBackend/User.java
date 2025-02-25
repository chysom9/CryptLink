package com.cryptLink.CryptLinkBackend;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment primary key
    private Long userID;

    @Column(nullable = false, unique = true) // Ensures email is unique
    private String email;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false)
    private String password;

    // Getters and Setters
    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}    

