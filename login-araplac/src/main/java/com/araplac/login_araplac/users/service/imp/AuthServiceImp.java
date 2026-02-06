package com.araplac.login_araplac.users.service.imp;

import com.araplac.login_araplac.exceptions.BadRequestException;
import com.araplac.login_araplac.exceptions.NotFoundException;
import com.araplac.login_araplac.notification.dto.NotificationDTO;
import com.araplac.login_araplac.notification.service.NotificationService;
import com.araplac.login_araplac.response.Response;
import com.araplac.login_araplac.roles.entity.Role;
import com.araplac.login_araplac.security.JwtService;
import com.araplac.login_araplac.users.dto.LoginRequest;
import com.araplac.login_araplac.users.dto.LoginResponse;
import com.araplac.login_araplac.users.dto.ResetPasswordRequest;
import com.araplac.login_araplac.users.entity.PasswordResetCode;
import com.araplac.login_araplac.users.entity.User;
import com.araplac.login_araplac.users.repo.PasswordResetRepo;
import com.araplac.login_araplac.users.repository.UserRepository;
import com.araplac.login_araplac.users.service.AuthService;
import com.araplac.login_araplac.users.service.CodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {

    private final UserRepository userRepo;
//    private final RoleRe roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;
//
//    private final PatientRepo patientRepo;
//    private final DoctorRepository doctorRepository;
//
    private final CodeGenerator codeGenerator;
    private final PasswordResetRepo passwordResetRepo;

    @Value("${password.reset.link}")
    private String resetLink;

//    @Override
//    public Response<String> register(RegistrationRequest request) {
//        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
//            throw new BadRequestException("User with email already exists.");
//        }
//
//        List<String> requestRoleNames = (request.getRoles() != null && !request.getRoles().isEmpty())
//                ? request.getRoles().stream().map(String::toUpperCase).toList()
//                : List.of("PATIENT");
//
//        return null;
//    }

    @Override
    public Response<LoginResponse> login(LoginRequest loginRequest) {

        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Password doesn't match.");
        }

        String token = jwtService.generateToken(user.getEmail());

        LoginResponse loginResponse = LoginResponse.builder()
                .roles(user.getRoles().stream().map(Role::getName).toList())
                .token(token)
                .build();

        return Response.<LoginResponse>builder()
                .statusCode(200)
                .message("Login successful.")
                .data(loginResponse)
                .build();
    }

    @Override
    public Response<?> forgetPassword(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        passwordResetRepo.deleteByUserId(user.getId());

        String code = codeGenerator.generateUniqueCode();

        PasswordResetCode resetCode = PasswordResetCode.builder()
                .user(user)
                .code(code)
                .expireDate(calculateExpiryDate())
                .used(false)
                .build();

        passwordResetRepo.save(resetCode);

        NotificationDTO passwordResetEmail = NotificationDTO.builder()
                .recipient(user.getEmail())
                .subject("Password reset code")
                .templateName("password-reset")
                .templateVariables(Map.of(
                        "name", user.getName(),
                        "resetLink", resetLink + code
                ))
                .build();

        notificationService.sendEmail(passwordResetEmail, user);

        return Response.builder()
                .statusCode(200)
                .message("Password reset code sent to your email.")
                .build();
    }

    @Override
    public Response<?> updatePasswordViaResetCode(ResetPasswordRequest resetPasswordRequest) {
        String code = resetPasswordRequest.getCode();
        String newPassword = resetPasswordRequest.getNewPassword();

        PasswordResetCode resetCode = passwordResetRepo.findByCode(code)
                .orElseThrow(() -> new BadRequestException("Invalid reset code."));

        if (resetCode.getExpireDate().isBefore(LocalDateTime.now())) {
            passwordResetRepo.delete(resetCode);
            throw new BadRequestException("Reset code has expired.");
        }

        User user = resetCode.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        passwordResetRepo.delete(resetCode);

        NotificationDTO passwordResetEmail = NotificationDTO.builder()
                .recipient(user.getEmail())
                .subject("Senha alterada com sucesso.")
                .templateName("password-update-confirmation")
                .templateVariables(Map.of(
                        "name", user.getName()
                ))
                .build();

        notificationService.sendEmail(passwordResetEmail, user);

        return Response.builder()
                .statusCode(200)
                .message("Password updated sucessfully")
                .build();
    }

    private LocalDateTime calculateExpiryDate() {
        return LocalDateTime.now().plusHours(5);
    }
}









































