package com.araplac.backend.security;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.araplac.backend.entity.Usuario;
import com.araplac.backend.repository.UsuarioRepository;

@Service
public class UsuarioUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    public UsuarioUserDetailsService(UsuarioRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario u = repo.findByUsuarioIgnoreCaseAndEstaAtivoTrue(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado ou inativo"));

        // não retornamos roles no response; aqui só damos uma role padrão para o Spring
        return User.withUsername(u.getUsuario())
                .password(u.getSenha()) // hash BCrypt do banco
                .roles("USER")
                .disabled(!u.isEstaAtivo())
                .build();
    }
}

