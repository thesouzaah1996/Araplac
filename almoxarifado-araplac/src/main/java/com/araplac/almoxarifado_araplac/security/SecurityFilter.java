package com.araplac.almoxarifado_araplac.security;

import com.araplac.almoxarifado_araplac.exception.CustomAccessDenialHandler;
import com.araplac.almoxarifado_araplac.exception.CustomAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityFilter {

    private final AuthFilter authFilter;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CustomAccessDenialHandler customAccessDenialHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) {
        httpSecurity.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .exceptionHandling(exception -> exception
                        .accessDeniedHandler(customAccessDenialHandler)
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                )
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/api/almoxarifado/**").permitAll().anyRequest().authenticated()
                )
                .sessionManagement(manager -> manager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }
}
