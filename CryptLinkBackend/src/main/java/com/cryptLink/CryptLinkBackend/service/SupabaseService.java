package com.cryptLink.CryptLinkBackend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class SupabaseService {
    private static final Logger logger = LoggerFactory.getLogger(SupabaseService.class);
    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.bucket}")
    private String bucketName;

    @Value("${supabase.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String uploadFile(String path, byte[] fileBytes) {
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + path + "?upsert=true";
        logger.debug("Constructed Supabase upload URL: {}", uploadUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.set("apikey", apiKey);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    
        HttpEntity<byte[]> request = new HttpEntity<>(fileBytes, headers);
        try{
            ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, request, String.class);
            logger.debug("supasbase reponse status: {}", response.getStatusCode());
            logger.debug("Supabase response body: {}", response.getBody());
        
            if (response.getStatusCode().is2xxSuccessful()) {
                return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + path;
            } else {
                return null;
            }
        } catch (Exception e) {
            logger.error("Error during Supabase upload", e);
            return null;
        }
    }

    public byte[] downloadFile(String publicUrl) {
        logger.debug("Constructed Supabase download URL: {}", publicUrl);
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(publicUrl, HttpMethod.GET, null, byte[].class);
            logger.debug("Download response status: {}", response.getStatusCode());
            return response.getBody();
        } catch (Exception e) {
            logger.error("Error during Supabase download", e);
            return null;
        }
    }
}
    

