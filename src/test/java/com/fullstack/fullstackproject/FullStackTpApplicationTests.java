package com.fullstack.fullstackproject;

import com.fullstack.fullstackproject.web.VoitureController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class FullStackTpApplicationTests {

    @Autowired
    VoitureController voitureController;

    @Test
    void contextLoads() {
        // Verifies the controller bean was created and injected successfully
        assertThat(voitureController).isNotNull();
    }
}
