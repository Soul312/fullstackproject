package com.fullstack.fullstackproject.modele;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

@Entity
@Data
@RequiredArgsConstructor   // generates constructor for @NonNull fields
@NoArgsConstructor          // generates no-arg constructor (required by JPA)
public class Voiture {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NonNull
    private String marque;      // Brand (e.g. Toyota)

    @NonNull
    private String modele;      // Model (e.g. Corolla)

    @NonNull
    private String couleur;     // Color

    @NonNull
    private String immatricule; // License plate

    @NonNull
    private Integer annee;      // Year

    @NonNull
    private Integer prix;       // Price

    // Relationship to owner
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire")
    @JsonIgnore
    private Proprietaire proprietaire;
}
