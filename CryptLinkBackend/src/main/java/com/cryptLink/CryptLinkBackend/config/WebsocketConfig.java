// package com.cryptLink.CryptLinkBackend.config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.messaging.simp.config.MessageBrokerRegistry;
// import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
// import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
// import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// @Configuration
// @EnableWebSocketMessageBroker
// public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {
//     @SuppressWarnings("null")
//     @Override
//     public void registerStompEndpoints(StompEndpointRegistry registry) {
//         registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
//     }

//     @SuppressWarnings("null")
//     @Override
//     public void configureMessageBroker(MessageBrokerRegistry registry) {
//         registry.setApplicationDestinationPrefixes("/app");
//         registry.enableSimpleBroker("/chatroom","/user");
//         registry.setUserDestinationPrefix("/user");
//     }
// }

package com.cryptLink.CryptLinkBackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @SuppressWarnings("null")
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
            .addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }

    @SuppressWarnings("null")
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/chatroom", "/user");
        registry.setUserDestinationPrefix("/user");
    }

    @SuppressWarnings("null")
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        // Raise STOMP frame size and buffer limits to 5MB
        registration.setMessageSizeLimit(5 * 1024 * 1024);    // max incoming message size
        registration.setSendBufferSizeLimit(5 * 1024 * 1024); // max outgoing buffer size
        registration.setSendTimeLimit(20 * 1000);             // send timeout in ms
    }
}
