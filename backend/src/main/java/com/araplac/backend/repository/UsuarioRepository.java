package com.araplac.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.araplac.backend.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>{
    Optional<Usuario> findByUsuarioIgnoreCaseAndEstaAtivoTrue(String usuario);
}
