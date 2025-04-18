package com.example.get_stuff_done.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.get_stuff_done.service.CalendarService;

import java.util.List;

@RestController
@RequestMapping("/api/calendar")
public class CalendarController {
    
    @Autowired
    private CalendarService cal;
    
    @GetMapping("/events")
    public List<Object> listEvents() {
        return cal.fetchUpcomingEvents();
    }
}
