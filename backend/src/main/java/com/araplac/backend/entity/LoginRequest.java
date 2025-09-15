package com.araplac.backend.entity;

import com.fasterxml.jackson.annotation.JsonAlias;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @JsonAlias({"usuario","email"}) String usuario,
        @NotBlank @JsonAlias({"senha"})            String senha
) {}
