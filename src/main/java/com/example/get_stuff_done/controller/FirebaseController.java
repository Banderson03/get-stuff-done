package com.example.get_stuff_done.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.get_stuff_done.service.FirebaseService;

@RestController 
@RequestMapping("/api/firebase")
public class FirebaseController {
    
    @Autowired
    private FirebaseService fb;

    public FirebaseController(FirebaseService fb) {
        this.fb = fb;
    }

    @PostMapping("/saveHabits")
    public String saveHabits(@RequestBody Map<String, Object> payload) {
        fb.saveUserHabits(payload);
        return "ok";
    }
}
