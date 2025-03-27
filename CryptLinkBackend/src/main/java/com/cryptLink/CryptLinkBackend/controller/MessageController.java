package com.cryptLink.CryptLinkBackend.controller;

import com.cryptLink.CryptLinkBackend.model.Message;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {

    private SimpMessagingTemplate simpMessagingTemplate;
    
    @MessageMapping("/message") // /app/message
    @SendTo("/chatroom/public")
    private Message receiPublicMessage(@Payload Message message){
            return message;
        
    }

    @MessageMapping("/private-message")
    private Message receivePrivateMessage(@Payload Message message){

        //simpMessagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private",message);// /user/Matt/private
        return message;
    }
}
