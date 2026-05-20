# Full-Stack Spring Boot + React + Docker — Complete Project Guide

> **Based on:** Ateliers Complet Full Stack (BackEnd 1 & 2, FrontEnd) + Atelier Docker-SpringBoot-MySQL  
> **Author of original labs:** Khalid Nafil — ENSIAS  
> **Stack:** Java 8+ · Spring Boot · Spring Data JPA · Spring Data REST · Spring Security · React · Axios · Docker · MySQL/MariaDB

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Backend — Part 1: Spring Boot Setup & JPA Entities](#3-backend--part-1-spring-boot-setup--jpa-entities)
4. [Backend — Part 2: RESTful Web Service & Spring Data REST](#4-backend--part-2-restful-web-service--spring-data-rest)
5. [Backend — Part 3: API Documentation with Springdoc-OpenAPI](#5-backend--part-3-api-documentation-with-springdoc-openapi)
6. [Backend — Part 4: Spring Security](#6-backend--part-4-spring-security)
7. [Backend — Part 5: Unit & Integration Testing](#7-backend--part-5-unit--integration-testing)
8. [Frontend — React Application](#8-frontend--react-application)
9. [Connecting Frontend to Backend (Axios)](#9-connecting-frontend-to-backend-axios)
10. [Docker Containerisation](#10-docker-containerisation)
11. [Docker Compose — One-Command Deployment](#11-docker-compose--one-command-deployment)
12. [Project Structure Reference](#12-project-structure-reference)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Overview

This project is an **online car dealership** application with:

- A **Spring Boot** backend exposing a RESTful API for CRUD operations on `Voiture` (Car) and `Proprietaire` (Owner) entities.
- A **React** frontend that displays, adds, edits, and deletes cars via the API.
- Everything packaged into **Docker containers** orchestrated with **Docker Compose**.

### Entity Relationship

```
Proprietaire  1 ──────── * Voiture
(Owner)                   (Car)
```

A `Proprietaire` owns many `Voiture`s. The `Voiture` side holds the foreign key (`@ManyToOne`).

---

## 2. Prerequisites

| Tool | Version (minimum) | Purpose |
|---|---|---|
| Java JDK | 8+ | Backend runtime |
| Maven | 3.6+ | Build tool |
| IntelliJ IDEA / STS | Any | IDE |
| Node.js + npm | Node 14+ / npm 6+ | Frontend runtime |
| VS Code | Any | Frontend IDE |
| Postman | Any | API testing |
| Docker Desktop | 20+ | Containerisation |
| MariaDB or MySQL | 10+ / 8+ | Production database |

---

## 3. Backend — Part 1: Spring Boot Setup & JPA Entities — ✅ done

### 3.1 Create the Spring Boot Project — ✅ done

1. Open IntelliJ IDEA → **New Project → Spring Initializr**
2. Set the following:
   - **Group:** `org.cours`
   - **Artifact / Name:** `SpringDataRest`
   - **Packaging:** Jar
   - **Java:** 8 (or higher)
3. Add these **dependencies** at project creation:
   - Spring Web
   - Spring Boot DevTools
   - Spring Data JPA
   - H2 Database *(for development/testing)*
   - Lombok
   - PostgreSQL Driver **or** MariaDB Driver *(for production)*

Your `pom.xml` should contain at minimum:

```xml
<dependencies>

    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- DevTools -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>

    <!-- JPA -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- H2 (dev/test) -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Spring Boot Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

</dependencies>
```

---

### 3.2 Configure application.properties (H2 — Development) — ✅ done

Create or edit `src/main/resources/application.properties`:

```properties
# H2 in-memory database
spring.h2.console.enabled=true
spring.datasource.platform=h2
spring.datasource.url=jdbc:h2:mem:testbd

# Show SQL (optional, useful for debugging)
spring.jpa.show-sql=true
```

Access the H2 console at `http://localhost:8080/h2-console` once the app runs.

---

### 3.3 Create the `Voiture` Entity — ✅ done

Create the package `org.cours.modele` and inside it the class `Voiture.java`:

```java
package org.cours.modele;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;

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
    private int annee;          // Year

    @NonNull
    private int prix;           // Price

    // Relationship to owner — added later in step 3.6
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire")
    @NonNull
    private Proprietaire proprietaire;
}
```

> **Lombok annotations explained:**
> - `@Data` — generates getters, setters, equals, hashCode, toString
> - `@RequiredArgsConstructor` — constructor for every `@NonNull` field
> - `@NoArgsConstructor` — mandatory empty constructor for JPA

---

### 3.4 Create the `VoitureRepo` Repository — ✅ done

```java
package org.cours.modele;

import org.springframework.data.repository.CrudRepository;

public interface VoitureRepo extends CrudRepository<Voiture, Long> {
    // Built-in methods from CrudRepository:
    // long count()
    // Iterable<T> findAll()
    // Optional<T> findById(ID id)
    // void delete(T entity)
    // void deleteAll()
    // <S extends T> S save(S entity)
}
```

---

### 3.5 Seed Data with CommandLineRunner — ✅ done

Modify the main application class to insert test data on startup:

```java
package org.cours;

import org.cours.modele.Voiture;
import org.cours.modele.VoitureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SpringDataRest {

    @Autowired
    private VoitureRepo voitureRepo;

    @Autowired
    private ProprietaireRepo proprietaireRepo;

    public static void main(String[] args) {
        SpringApplication.run(SpringDataRest.class, args);
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
            voitureRepo.save(new Voiture("Toyota", "Corolla", "Grise",  "A-1-9090", 2018, 95000,  p1));
            voitureRepo.save(new Voiture("Ford",   "Fiesta",  "Rouge",  "A-2-8090", 2015, 90000,  p1));
            voitureRepo.save(new Voiture("Honda",  "CRV",     "Bleu",   "A-3-7090", 2016, 140000, p2));
        };
    }
}
```

---

### 3.6 Create the `Proprietaire` Entity — ✅ done

```java
package org.cours.modele;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;
import java.util.List;

@Entity
@Data
@RequiredArgsConstructor
@NoArgsConstructor
public class Proprietaire {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @NonNull
    private String nom;     // Last name

    @NonNull
    private String prenom;  // First name

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "proprietaire")
    @JsonIgnore   // prevents infinite serialisation loop
    private List<Voiture> voitures;
}
```

---

### 3.7 Create the `ProprietaireRepo` Repository — ✅ done

```java
package org.cours.modele;

import org.springframework.data.repository.CrudRepository;

public interface ProprietaireRepo extends CrudRepository<Proprietaire, Long> {
}
```

---

### 3.8 Custom Query Methods (Optional Reference) — ✅ done

Spring Data JPA can derive queries from method names automatically. Here are the supported patterns for `VoitureRepo`:

```java
public interface VoitureRepo extends CrudRepository<Voiture, Long> {

    List<Voiture> findByMarque(String marque);
    List<Voiture> findByCouleur(String couleur);
    List<Voiture> findByAnnee(int annee);
    List<Voiture> findByMarqueAndModele(String marque, String modele);
    List<Voiture> findByMarqueOrCouleur(String marque, String couleur);
    List<Voiture> findByMarqueOrderByAnneeAsc(String marque);

    // JPQL custom query
    @Query("select v from Voiture v where v.marque = ?1")
    List<Voiture> findByMarqueJPQL(String marque);

    @Query("select v from Voiture v where v.marque like %?1")
    List<Voiture> findByMarqueEndsWith(String marque);
}
```

---

### 3.9 Switching to MariaDB / MySQL (Production) — ✅ done

Add the MariaDB driver to `pom.xml`:

```xml
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
</dependency>
```

Or for MySQL:

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

Then update `application.properties` (remove the H2 lines and replace with):

```properties
# MariaDB
spring.datasource.url=jdbc:mariadb://localhost:3306/compagnie
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
spring.jpa.generate-ddl=true
spring.jpa.hibernate.ddl-auto=create-drop

# OR for MySQL
# spring.datasource.url=jdbc:mysql://localhost:3306/springboot
# spring.datasource.username=root
# spring.datasource.password=YOUR_PASSWORD
# spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# spring.jpa.generate-ddl=true
# spring.jpa.hibernate.ddl-auto=create-drop

# REST base path
spring.data.rest.base-path=/api
```

---

## 4. Backend — Part 2: RESTful Web Service & Spring Data REST — ✅ done

### 4.1 Manual REST Controller — ✅ done

Create the package `org.cours.web` and inside it the class `VoitureController.java`:

```java
package org.cours.web;

import org.cours.modele.Voiture;
import org.cours.modele.VoitureRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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
}
```

> **Why `@CrossOrigin`?** The React app runs on port 3000, Spring Boot on 8080. Without this annotation the browser blocks cross-origin requests.

Test in Postman: `GET http://localhost:8080/voitures`

---

### 4.2 Fix the Serialisation Loop — ✅ done

Without `@JsonIgnore` Jackson will endlessly serialise `Voiture → Proprietaire → voitures → Voiture → …`.

Add `@JsonIgnore` to the bidirectional side of each entity:

**In `Proprietaire.java`:**
```java
@OneToMany(cascade = CascadeType.ALL, mappedBy = "proprietaire")
@JsonIgnore
private List<Voiture> voitures;
```

**In `Voiture.java`:**
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "proprietaire")
@JsonIgnore
private Proprietaire proprietaire;
```

---

### 4.3 Spring Data REST — Automatic CRUD Endpoints — ✅ done

Add the dependency to `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-rest</artifactId>
</dependency>
```

Add to `application.properties`:

```properties
spring.data.rest.base-path=/api
```

Restart the server and navigate to `http://localhost:8080/api`. You will see HAL (HyperText Application Language) formatted JSON with links to all exposed repositories.

#### Available auto-generated endpoints

| Method | URL | Action |
|--------|-----|--------|
| GET | `/api/voitures` | List all cars |
| GET | `/api/voitures/{id}` | Get car by ID |
| POST | `/api/voitures` | Create a car |
| PUT | `/api/voitures/{id}` | Replace a car |
| PATCH | `/api/voitures/{id}` | Update a car |
| DELETE | `/api/voitures/{id}` | Delete a car |

---

### 4.4 Custom Search Endpoints via `@RepositoryRestResource` — ✅ done

Annotate `VoitureRepo` and add `@Param`-annotated methods:

```java
package org.cours.modele;

import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource
public interface VoitureRepo extends CrudRepository<Voiture, Long> {

    List<Voiture> findByModele(@Param("modele") String modele);

    List<Voiture> findByCouleur(@Param("couleur") String couleur);
}
```

After restart, the response from `GET /api/voitures` will include a new `search` link. You can call:

```
GET http://localhost:8080/api/voitures/search/findByCouleur?couleur=Rouge
GET http://localhost:8080/api/voitures/search/findByModele?modele=Corolla
```

---

## 5. Backend — Part 3: API Documentation with Springdoc-OpenAPI — ✅ done

### 5.1 Add the Dependency — ✅ done

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.4.0</version>
</dependency>
```

### 5.2 Access the Documentation — ✅ done

After restarting:

| URL | Description |
|-----|-------------|
| `http://localhost:8080/swagger-ui.html` | Interactive Swagger UI — try every endpoint directly in the browser |
| `http://localhost:8080/v3/api-docs` | Raw OpenAPI 3.0 JSON spec |

The Swagger UI automatically discovers all controllers and their methods (GET, POST, PUT, DELETE, etc.) and presents them in an explorable interface. You can expand any method, fill in parameters, and click **Execute** to call the live API.

---

## 6. Backend — Part 4: Spring Security — ✅ done

### 6.1 Add the Dependency — ✅ done

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

### 6.2 Default Behaviour — ✅ done

On first launch with Spring Security, Spring Boot auto-generates a random password printed to the console:

```
Using generated security password: 263ab9a7-c5da-40c2-9660-aecd09b1937b
```

The default username is `user`.

### 6.3 Testing with Postman — ✅ done

All API calls now require HTTP Basic Authentication.

In Postman:
1. Open any request
2. Go to the **Authorization** tab
3. Select **Type → Basic Auth**
4. Enter `user` / `<generated-password>`

### 6.4 Custom Security Configuration (Optional) — ✅ done

To define your own credentials, add to `application.properties`:

```properties
spring.security.user.name=admin
spring.security.user.password=secret
```

Or create a full security configuration class for role-based access, JWT, OAuth2, etc.

---

## 7. Backend — Part 5: Unit & Integration Testing — ✅ done

### 7.1 Add H2 Test Dependency — ✅ done

```xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
```

---

### 7.2 Context Load Test — ✅ done

This test verifies the Spring context starts and the controller bean is injected correctly:

```java
package org.cours;

import org.cours.web.VoitureController;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
class SpringbootReactPart1ApplicationTests {

    @Autowired
    VoitureController voitureController;

    @Test
    void contextLoads() {
        // Verifies the controller bean was created and injected successfully
        assertThat(voitureController).isNotNull();
    }
}
```

---

### 7.3 Repository CRUD Tests — ✅ done

Create `src/test/java/org/cours/VoitureRepoTest.java`:

```java
package org.cours;

import org.cours.modele.Voiture;
import org.cours.modele.VoitureRepo;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
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
```

Run tests: **Right-click the class → Run As → JUnit Test**. A green bar means all tests pass.

---

## 8. Frontend — React Application — ✅ done

### 8.1 Setup Node.js and Create the React App — ✅ done

```bash
# Verify installations
node -v
npm -v

# Install Create React App globally
npm install -g create-react-app

# Create the React project inside the Spring Boot project
# (Recommended path: src/main/webapp/)
cd src/main/webapp
create-react-app reactjs
cd reactjs

# Start the development server (runs on http://localhost:3000)
npm start
```

---

### 8.2 Install Dependencies — ✅ done

```bash
# Stop the server first (Ctrl+C), then:

# React Bootstrap (UI components)
npm install react-bootstrap bootstrap

# React Router (client-side routing)
npm install --save react-router-dom

# Axios (HTTP client for API calls)
npm install axios

# Font Awesome icons
npm i --save @fortawesome/fontawesome-svg-core
npm i --save @fortawesome/free-solid-svg-icons
npm i --save @fortawesome/react-fontawesome

# Restart the server
npm start
```

---

### 8.3 Update `public/index.html` — ✅ done

Add Bootstrap CSS and a custom favicon inside the `<head>` tag:

```html
<link
  rel="stylesheet"
  href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
  integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
  crossorigin="anonymous"
/>
<link rel="icon" href="https://upload.wikimedia.org/wikipedia/commons/1/17/Tata_Tamo_Racemo.jpg" />
<title>Voiture Shop</title>

<!-- Dark background -->
<body style="background-color:#272B30">
```

---

### 8.4 Clear `src/index.css` — ✅ done

Empty the file completely — Bootstrap handles all base styling.

---

### 8.5 `src/App.js` — Main Application Shell — ✅ done

```jsx
import React from 'react';
import NavigationBar from './Components/NavigationBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';
import Bienvenue from './Components/Bienvenue';
import Footer from './Components/Footer';
import Voiture from './Components/Voiture';
import VoitureListe from './Components/VoitureListe';

function App() {
  const marginTop = { marginTop: "20px" };

  return (
    <Router>
      <NavigationBar />
      <Container>
        <Row>
          <Col lg={12} style={marginTop}>
            <Switch>
              <Route path="/"         exact component={Bienvenue}    />
              <Route path="/add"      exact component={Voiture}      />
              <Route path="/edit/:id" exact component={Voiture}      />
              <Route path="/list"     exact component={VoitureListe} />
            </Switch>
          </Col>
        </Row>
      </Container>
      <Footer />
    </Router>
  );
}

export default App;
```

---

### 8.6 Create the `src/Components/` Folder — ✅ done

All UI components live here.

---

### 8.7 `NavigationBar.js` — ✅ done

```jsx
import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class NavigationBar extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Link to={""} className="navbar-brand">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/1/17/Tata_Tamo_Racemo.jpg"
            width="25"
            height="25"
            alt="logo"
          />
        </Link>
        <Nav className="mr-auto">
          <Link to={"add"}  className="nav-link">Ajouter une Voiture</Link>
          <Link to={"list"} className="nav-link">Liste des Voitures</Link>
        </Nav>
      </Navbar>
    );
  }
}
```

---

### 8.8 `Bienvenue.js` — ✅ done

```jsx
import React from 'react';
import { Jumbotron } from 'react-bootstrap';

export default class Bienvenue extends React.Component {
  render() {
    return (
      <Jumbotron className="bg-dark text-white">
        <h1>Bienvenue au Magasin des Voitures</h1>
        <blockquote className="blockquote mb-0">
          <p>Le meilleur de nos voitures est exposé près de chez vous</p>
          <footer className="blockquote-footer">Master MIOLA</footer>
        </blockquote>
      </Jumbotron>
    );
  }
}
```

---

### 8.9 `Footer.js` — ✅ done

```jsx
import React from 'react';
import { Navbar, Container, Col } from 'react-bootstrap';

export default class Footer extends React.Component {
  render() {
    let fullYear = new Date().getFullYear();
    return (
      <Navbar fixed="bottom" bg="dark" variant="dark">
        <Container>
          <Col lg={12} className="text-center text-muted">
            <div>{fullYear}-{fullYear + 1}, All Rights Reserved by Master MIOLA</div>
          </Col>
        </Container>
      </Navbar>
    );
  }
}
```

---

### 8.10 `myToast.js` — Notification Component — ✅ done

```jsx
import React, { Component } from 'react';
import { Toast } from 'react-bootstrap';

export default class MyToast extends Component {
  render() {
    const toastCss = {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '1',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)'
    };

    return (
      <div style={this.props.children.show ? toastCss : null}>
        <Toast
          className={`border text-white ${this.props.children.type === "success"
            ? "border-success bg-success"
            : "border-danger bg-danger"}`}
          show={this.props.children.show}
        >
          <Toast.Header
            className={`text-white ${this.props.children.type === "success"
              ? "bg-success"
              : "bg-danger"}`}
            closeButton={false}
          >
            <strong className="mr-auto">
              {this.props.children.type === "success" ? "Succès" : "Supprimé"}
            </strong>
          </Toast.Header>
          <Toast.Body>
            {this.props.children.message}
          </Toast.Body>
        </Toast>
      </div>
    );
  }
}
```

---

### 8.11 `VoitureListe.js` — Car List with Edit & Delete — ✅ done

```jsx
import React, { Component } from 'react';
import { Card, Table, Button, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import MyToast from './myToast';

export default class VoitureListe extends Component {

  constructor(props) {
    super(props);
    this.state = {
      voitures: [],
      show: false
    };
  }

  // Called after component mounts — fetch cars from API
  componentDidMount() {
    axios.get("http://localhost:8080/voitures")
      .then(response => response.data)
      .then(data => {
        this.setState({ voitures: data });
      });
  }

  // Delete a car by ID
  deleteVoiture = (voitureId) => {
    axios.delete("http://localhost:8080/voitures/" + voitureId)
      .then(response => {
        if (response.data != null) {
          this.setState({ show: true });
          setTimeout(() => this.setState({ show: false }), 3000);
          // Remove deleted car from local state (no extra API call needed)
          this.setState({
            voitures: this.state.voitures.filter(v => v.id !== voitureId)
          });
        } else {
          this.setState({ show: false });
        }
      });
  };

  render() {
    return (
      <div>
        {/* Toast notification */}
        <div style={{ display: this.state.show ? "block" : "none" }}>
          <MyToast children={{ show: this.state.show, message: "Voiture supprimée avec succès.", type: "danger" }} />
        </div>

        <Card className={"border border-dark bg-dark text-white"}>
          <Card.Header>
            <FontAwesomeIcon icon={faList} /> Liste des Voitures
          </Card.Header>
          <Card.Body>
            <Table bordered hover striped variant="dark">
              <thead>
                <tr>
                  <th>Marque</th>
                  <th>Modele</th>
                  <th>Couleur</th>
                  <th>Immatricule</th>
                  <th>Annee</th>
                  <th>Prix</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {this.state.voitures.length === 0 ? (
                  <tr align="center">
                    <td colSpan="7">Aucune Voiture n'est disponible</td>
                  </tr>
                ) : (
                  this.state.voitures.map(voiture => (
                    <tr key={voiture.id}>
                      <td>{voiture.marque}</td>
                      <td>{voiture.modele}</td>
                      <td>{voiture.couleur}</td>
                      <td>{voiture.immatricule}</td>
                      <td>{voiture.annee}</td>
                      <td>{voiture.prix}</td>
                      <td>
                        <ButtonGroup>
                          {/* Edit button — navigates to /edit/:id */}
                          <Link to={"edit/" + voiture.id} className="btn btn-sm btn-outline-primary">
                            <FontAwesomeIcon icon={faEdit} />
                          </Link>{' '}
                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={this.deleteVoiture.bind(this, voiture.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    );
  }
}
```

---

### 8.12 `Voiture.js` — Add & Edit Form — ✅ done

```jsx
import React, { Component } from 'react';
import { Card, Form, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusSquare, faSave, faUndo } from '@fortawesome/free-solid-svg-icons';
import MyToast from './myToast';

export default class Voiture extends Component {

  constructor(props) {
    super(props);
    this.state = this.initialState;
    this.voitureChange  = this.voitureChange.bind(this);
    this.submitVoiture  = this.submitVoiture.bind(this);
  }

  // Default (empty) form state
  initialState = {
    id: '',
    marque: '',
    modele: '',
    couleur: '',
    immatricule: '',
    prix: '',
    annee: '',
    show: false
  };

  // If editing, load existing car data on mount
  componentDidMount() {
    const voitureId = this.props.match.params.id;
    if (voitureId) {
      axios.get("http://localhost:8080/voitures/" + voitureId)
        .then(response => {
          this.setState({
            id:          response.data.id,
            marque:      response.data.marque,
            modele:      response.data.modele,
            couleur:     response.data.couleur,
            immatricule: response.data.immatricule,
            prix:        response.data.prix,
            annee:       response.data.annee
          });
        });
    }
  }

  // Reset form to initial empty state
  resetVoiture = () => {
    this.setState(() => this.initialState);
  };

  // Controlled input handler — updates the field named by event.target.name
  voitureChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Form submit — POST (create) or PUT (update)
  submitVoiture = event => {
    event.preventDefault();

    const voiture = {
      marque:      this.state.marque,
      modele:      this.state.modele,
      couleur:     this.state.couleur,
      immatricule: this.state.immatricule,
      annee:       this.state.annee,
      prix:        this.state.prix
    };

    const voitureId = this.state.id;

    if (voitureId) {
      // Update existing car (PUT)
      axios.put("http://localhost:8080/voitures/" + voitureId, voiture)
        .then(response => {
          if (response.data != null) {
            this.setState({ show: true });
            setTimeout(() => this.setState({ show: false }), 3000);
          }
        });
    } else {
      // Create new car (POST)
      axios.post("http://localhost:8080/voitures", voiture)
        .then(response => {
          if (response.data != null) {
            this.setState(this.initialState);
            this.setState({ show: true });
            setTimeout(() => this.setState({ show: false }), 3000);
          }
        });
    }
  };

  render() {
    const { marque, modele, couleur, immatricule, prix, annee } = this.state;
    const title = this.state.id ? "Modifier Voiture" : "Ajouter une Voiture";

    return (
      <div>
        {/* Toast notification */}
        <div style={{ display: this.state.show ? "block" : "none" }}>
          <MyToast children={{ show: this.state.show, message: "Voiture enregistrée avec succès.", type: "success" }} />
        </div>

        <Card className={"border border-dark bg-dark text-white"}>
          <Card.Header>
            <FontAwesomeIcon icon={faPlusSquare} /> {title}
          </Card.Header>

          <Form onReset={this.resetVoiture} onSubmit={this.submitVoiture} id="VoitureFormId">
            <Card.Body>
              <Form.Row>
                <Form.Group as={Col} controlId="formGridMarque">
                  <Form.Label>Marque</Form.Label>
                  <Form.Control required name="marque" type="text"
                    value={marque} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Marque Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridModele">
                  <Form.Label>Modele</Form.Label>
                  <Form.Control required name="modele" type="text"
                    value={modele} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Modele Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridCouleur">
                  <Form.Label>Couleur</Form.Label>
                  <Form.Control required name="couleur" type="text"
                    value={couleur} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Couleur Voiture" />
                </Form.Group>
              </Form.Row>

              <Form.Row>
                <Form.Group as={Col} controlId="formGridImmatricule">
                  <Form.Label>Immatricule</Form.Label>
                  <Form.Control required name="immatricule" type="text"
                    value={immatricule} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Immatricule" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridPrix">
                  <Form.Label>Prix</Form.Label>
                  <Form.Control required name="prix" type="number"
                    value={prix} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Prix Voiture" />
                </Form.Group>

                <Form.Group as={Col} controlId="formGridAnnee">
                  <Form.Label>Annee</Form.Label>
                  <Form.Control required name="annee" type="number"
                    value={annee} autoComplete="off"
                    onChange={this.voitureChange}
                    className={"bg-dark text-white"}
                    placeholder="Entrez Annee Voiture" />
                </Form.Group>
              </Form.Row>
            </Card.Body>

            <Card.Footer style={{ textAlign: "right" }}>
              <Button size="sm" variant="success" type="submit">
                <FontAwesomeIcon icon={faSave} /> Submit
              </Button>{' '}
              <Button size="sm" variant="info" type="reset">
                <FontAwesomeIcon icon={faUndo} /> Reset
              </Button>
            </Card.Footer>
          </Form>
        </Card>
      </div>
    );
  }
}
```

---

## 9. Connecting Frontend to Backend (Axios) — ✅ done

### 9.1 React Component Lifecycle — Quick Reference

| Method | When it runs | Typical use |
|--------|-------------|-------------|
| `constructor(props)` | Before mount | Set initial state, bind methods |
| `render()` | On every state/props change | Return JSX |
| `componentDidMount()` | Once, immediately after mount | Fetch initial data from API |
| `componentDidUpdate()` | After every re-render | React to prop/state changes |

### 9.2 Axios Cheat Sheet

```js
// GET
axios.get("http://localhost:8080/voitures")
  .then(response => response.data)
  .then(data => this.setState({ voitures: data }));

// POST (create)
axios.post("http://localhost:8080/voitures", voitureObject)
  .then(response => { /* handle success */ });

// PUT (full replace)
axios.put("http://localhost:8080/voitures/" + id, voitureObject)
  .then(response => { /* handle success */ });

// DELETE
axios.delete("http://localhost:8080/voitures/" + id)
  .then(response => { /* handle success */ });
```

### 9.3 Handling CORS

The browser blocks requests from `localhost:3000` (React) to `localhost:8080` (Spring Boot) by default. Fix it by annotating the Spring controller:

```java
@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class VoitureController { ... }
```

---

## 10. Docker Containerisation — ✅ done

### 10.1 Pull and Run the MySQL Container

```bash
# Pull the official MySQL image
docker pull mysql

# Run MySQL container
# -p 3307:3306  maps host port 3307 to container port 3306
# -e            sets environment variables
docker run -p 3307:3306 \
  --name mysqldb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=miola \
  mysql
```

### 10.2 Access the Running MySQL Container

```bash
docker exec -it mysqldb /bin/bash
mysql -uroot -proot
show databases;
use miola;
show tables;
CREATE USER 'sa'@'localhost' IDENTIFIED BY 'azerty';
```

### 10.3 Update `application.properties` for Docker

```properties
spring.datasource.url=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/miola
spring.datasource.username=${MYSQL_USER:sa}
spring.datasource.password=${MYSQL_PASSWORD:azerty}
spring.jpa.hibernate.ddl-auto=update
server.port=8082
spring.data.rest.base-path=/api
```

The `${VAR:default}` syntax reads from environment variables with a fallback for local dev.

### 10.4 Configure VM Options in IntelliJ

Go to **Run → Edit Configurations** and add VM options:

```
-DMYSQL_USER=root -DMYSQL_PASSWORD=root -DMYSQL_PORT=3307
```

### 10.5 Build the JAR

```bash
# With Maven wrapper
./mvnw clean package -DskipTests

# Or via IntelliJ: Maven panel → Lifecycle → package
```

### 10.6 Create the `Dockerfile`

Place this file in the **project root** (same level as `pom.xml`):

```dockerfile
FROM openjdk:8-alpine
ADD target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 10.7 Build the Spring Boot Docker Image

```bash
docker build -t app .
```

### 10.8 Create a Docker Network

Containers cannot reach each other by container name unless they share a network:

```bash
docker network create spring-net

# Connect the already-running MySQL container to this network
docker network connect spring-net mysqldb

# Verify
docker container inspect mysqldb
```

### 10.9 Run the Spring Boot Container

```bash
# Remove old container if it exists
docker rm app

# Run on the shared network
docker run -p 9090:8082 \
  --name app \
  --net spring-net \
  -e MYSQL_HOST=mysqldb \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=root \
  -e MYSQL_PORT=3306 \
  app
```

Test at `http://localhost:9090/api`.

---

### 10.10 Environment Files

Create `.env` (Spring Boot app variables):

```env
MYSQL_HOST=mysqldb
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_PORT=3306
```

Create `.mysqlenv` (MySQL container variables):

```env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=miola
```

Run using env files:

```bash
docker run -p 9090:8082 --name app --net spring-net --env-file .env app
```

---

### 10.11 Persistent Data with Docker Volumes

Without a volume, all MySQL data is lost when the container is removed. Mount a host directory:

```bash
docker run -d -p 3307:3306 \
  --net spring-net \
  --name mysqldb \
  --env-file .mysqlenv \
  -v /your/local/path/db:/var/lib/mysql \
  mysql
```

Replace `/your/local/path/db` with a real directory on your machine (e.g., `/Users/yourname/db` on macOS or `C:/Users/yourname/db` on Windows).

Now you can destroy and recreate the MySQL container — data persists on your host.

---

## 11. Docker Compose — One-Command Deployment — ✅ done

Docker Compose lets you define and manage all containers as a single service stack.

### 11.1 `docker-compose.yml`

Create this file in the **project root**:

```yaml
version: "3"

services:

  springboot-app:
    image: springboot-app
    restart: always
    build: .           # build from the Dockerfile in this directory
    ports:
      - "9090:8082"
    environment:
      MYSQL_HOST: mysqldb
      MYSQL_USER: root
      MYSQL_PASSWORD: root
      MYSQL_PORT: 3306
    depends_on:
      - mysqldb        # wait for MySQL to start first

  mysqldb:
    container_name: mysqldb
    image: mysql
    ports:
      - "3307:3306"
    environment:
      MYSQL_DATABASE: miola
      MYSQL_ROOT_PASSWORD: root
    volumes:
      - db-data:/var/lib/mysql  # named volume for persistence

volumes:
  db-data:
```

### 11.2 Launch Everything

```bash
# Stop and remove any existing containers from previous steps
docker rm -f app mysqldb

# Build images and start all services in detached mode
docker-compose up -d --build

# Check running containers
docker ps

# Check logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes (wipes database data)
docker-compose down -v
```

### 11.3 Verify

Navigate to `http://localhost:9090/api` — you should see the HAL JSON response with links to `voitures` and `proprietaires`.

---

## 12. Project Structure Reference

```
SpringDataRest/
├── src/
│   ├── main/
│   │   ├── java/org/cours/
│   │   │   ├── SpringDataRest.java          ← Main class + CommandLineRunner
│   │   │   ├── modele/
│   │   │   │   ├── Voiture.java             ← JPA Entity
│   │   │   │   ├── VoitureRepo.java         ← Repository + custom queries
│   │   │   │   ├── Proprietaire.java        ← JPA Entity
│   │   │   │   └── ProprietaireRepo.java    ← Repository
│   │   │   └── web/
│   │   │       └── VoitureController.java   ← REST Controller
│   │   ├── resources/
│   │   │   └── application.properties
│   │   └── webapp/
│   │       └── reactjs/                     ← React app
│   │           ├── public/
│   │           │   └── index.html
│   │           └── src/
│   │               ├── App.js
│   │               ├── index.css            ← (empty)
│   │               └── Components/
│   │                   ├── NavigationBar.js
│   │                   ├── Bienvenue.js
│   │                   ├── Footer.js
│   │                   ├── Voiture.js       ← Add/Edit form
│   │                   ├── VoitureListe.js  ← List with delete/edit
│   │                   └── myToast.js       ← Notification toast
│   └── test/
│       └── java/org/cours/
│           ├── SpringbootReactPart1ApplicationTests.java
│           └── VoitureRepoTest.java
├── Dockerfile
├── docker-compose.yml
├── .env
├── .mysqlenv
└── pom.xml
```

---

## 13. Troubleshooting

### Port already in use

```bash
# Find the process using a port (e.g. 8080)
lsof -i tcp:8080          # macOS / Linux
netstat -ano | findstr 8080  # Windows

# Kill it
kill -9 <PID>             # macOS / Linux
taskkill /PID <PID> /F    # Windows
```

### CORS Error in Browser

Add `@CrossOrigin(origins = "http://localhost:3000")` to your `VoitureController` class.

### JSON Infinite Loop

Add `@JsonIgnore` to the `voitures` field in `Proprietaire` and to the `proprietaire` field in `Voiture`.

### Maven Not Found in IntelliJ

Go to **Preferences → Build, Execution, Deployment → Build Tools → Maven**, check **Use plugin registry**, click OK, then **File → Invalidate Caches / Restart**.

### Docker Container Can't Reach MySQL by Name

Both containers must be on the **same Docker network**:
```bash
docker network create spring-net
docker network connect spring-net mysqldb
# Then run the app container with --net spring-net
```

### H2 Console Not Loading

Make sure `application.properties` contains:
```properties
spring.h2.console.enabled=true
spring.datasource.url=jdbc:h2:mem:testbd
```
Then visit `http://localhost:8080/h2-console` and enter `jdbc:h2:mem:testbd` as the JDBC URL.

### `npm install` Missing `node_modules`

If you don't see `node_modules` after cloning or moving the project:
```bash
cd src/main/webapp/reactjs
npm install
npm start
```

---

*End of guide. Happy coding!*
