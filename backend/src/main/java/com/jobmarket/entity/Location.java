package com.jobmarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "locations",
       uniqueConstraints = @UniqueConstraint(columnNames = {"city", "country"}))
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String city;

    private String state;

    @Column(nullable = false)
    private String country;

    private BigDecimal latitude;
    private BigDecimal longitude;
}
