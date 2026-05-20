package com.fullstack.fullstackproject;

import com.fullstack.fullstackproject.modele.Voiture;
import com.fullstack.fullstackproject.modele.VoitureRepo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
// @DataJpaTest configures H2, Hibernate, and Spring Data automatically for testing.
// Only JPA components are loaded — no web layer, no security.
public class VoitureRepoTest {

    @Autowired
    private TestEntityManager entityManager;
    // TestEntityManager is a test-only JPA helper for persisting entities directly.

    @Autowired
    VoitureRepo voitureRepo;

    @Test
    public void ajouterVoiture() {
        Voiture voiture = new Voiture("MiolaCar", "Uber", "Blanche", "M-2020", 2021, 180000);
        entityManager.persistAndFlush(voiture);
        // persistAndFlush writes to the in-memory H2 DB immediately

        assertThat(voiture.getId()).isNotNull();
        // Verifies the entity was given a generated ID
    }

    @Test
    public void supprimerVoiture() {
        entityManager.persistAndFlush(new Voiture("MiolaCar",    "Uber", "Blanche", "M-2020", 2021, 180000));
        entityManager.persistAndFlush(new Voiture("MiniCooper",  "Uber", "Rouge",   "C-2020", 2021, 180000));

        voitureRepo.deleteAll();

        assertThat(voitureRepo.findAll()).isEmpty();
        // Verifies all entities were deleted
    }
}
