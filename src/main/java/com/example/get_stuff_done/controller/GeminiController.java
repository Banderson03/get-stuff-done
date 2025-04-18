package com.example.get_stuff_done.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.get_stuff_done.service.GeminiService;

import java.util.Map;

@RestController 
@RequestMapping("/api/gemini")
public class GeminiController {

    @Autowired
    private GeminiService gemini;


    @PostMapping
    public String generate(@RequestBody Map<String, String> body) {
        return gemini.generateAdvice(body.get("prompt"));
    }
}
