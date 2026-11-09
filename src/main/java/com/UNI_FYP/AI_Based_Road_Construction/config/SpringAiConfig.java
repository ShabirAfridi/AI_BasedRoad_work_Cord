package com.UNI_FYP.AI_Based_Road_Construction.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringAiConfig {
    @Bean
    public ChatClient chatClient (OllamaChatModel ollamaChatModel){
        return ChatClient.builder(ollamaChatModel)
                .defaultSystem("\"\"\"\n" +
                        "                        You are an AI assistant embedded in a road\n" +
                        "                        excavation coordination system. You help predict delays,\n" +
                        "                        recommend scheduling, and classify citizen complaints.\n" +
                        "                        Always respond concisely and professionally. When asked\n" +
                        "                        for structured output, follow the requested format exactly.\n" +
                        "                        \"\"\"").build();
    }
}
