package com.fullstack.fullstackproject;

import com.fullstack.fullstackproject.modele.Proprietaire;
import com.fullstack.fullstackproject.modele.ProprietaireRepo;
import com.fullstack.fullstackproject.modele.Voiture;
import com.fullstack.fullstackproject.modele.VoitureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FullStackTpApplication {

    @Autowired
    private VoitureRepo voitureRepo;

    @Autowired
    private ProprietaireRepo proprietaireRepo;

    public static void main(String[] args) {
        SpringApplication.run(FullStackTpApplication.class, args);
    }

    @Bean
    CommandLineRunner runner() {
        return args -> {
            // Create owners first
            Proprietaire p1 = new Proprietaire("Ali", "Hassan");
            Proprietaire p2 = new Proprietaire("Najat", "Bani");
            proprietaireRepo.save(p1);
            proprietaireRepo.save(p2);

            // Create cars and assign owners
            Voiture v1 = new Voiture("Toyota", "Corolla", "Grise", "A-1-9090", 2018, 95000);
            v1.setProprietaire(p1);
            voitureRepo.save(v1);

            Voiture v2 = new Voiture("Ford", "Fiesta", "Rouge", "A-2-8090", 2015, 90000);
            v2.setProprietaire(p1);
            voitureRepo.save(v2);

            Voiture v3 = new Voiture("Honda", "CRV", "Bleu", "A-3-7090", 2016, 140000);
            v3.setProprietaire(p2);
            voitureRepo.save(v3);
        };
    }
}
