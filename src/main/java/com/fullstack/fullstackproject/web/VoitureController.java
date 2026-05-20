package com.fullstack.fullstackproject.web;

import com.fullstack.fullstackproject.modele.Voiture;
import com.fullstack.fullstackproject.modele.VoitureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")  // allow React dev server
public class VoitureController {

    @Autowired
    private VoitureRepo voitureRepo;

    // GET all cars
    @RequestMapping("/voitures")
    public Iterable<Voiture> getVoitures() {
        return voitureRepo.findAll();
    }

    // GET car by ID
    @GetMapping("/voitures/{id}")
    public Optional<Voiture> getVoitureById(@PathVariable Long id) {
        return voitureRepo.findById(id);
    }

    // POST create a new car
    @PostMapping("/voitures")
    public Voiture addVoiture(@RequestBody Voiture voiture) {
        return voitureRepo.save(voiture);
    }

    // PUT update an existing car
    @PutMapping("/voitures/{id}")
    public Voiture updateVoiture(@PathVariable Long id, @RequestBody Voiture voiture) {
        voiture.setId(id);
        return voitureRepo.save(voiture);
    }

    // DELETE a car by ID
    @DeleteMapping("/voitures/{id}")
    public Voiture deleteVoiture(@PathVariable Long id) {
        Optional<Voiture> voiture = voitureRepo.findById(id);
        voiture.ifPresent(v -> voitureRepo.delete(v));
        return voiture.orElse(null);
    }
}
