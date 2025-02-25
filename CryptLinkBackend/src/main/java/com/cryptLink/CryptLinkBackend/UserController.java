package com.cryptLink.CryptLinkBackend;

public class UserController {
    private UserService UserService;

    public UserController(UserService challengeService){
        this.UserService = challengeService;
        
    }

}
