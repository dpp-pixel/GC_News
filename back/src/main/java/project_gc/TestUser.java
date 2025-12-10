package project_gc;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class TestUser {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
}