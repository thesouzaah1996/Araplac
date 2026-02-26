package com.araplac.login_araplac.users.repo;

import com.araplac.login_araplac.users.entity.PasswordResetCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetRepo extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByCode(String code);
    void deleteByUserId(Long userId);
}
