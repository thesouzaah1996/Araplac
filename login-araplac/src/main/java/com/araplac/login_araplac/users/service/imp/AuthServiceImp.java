package com.araplac.login_araplac.users.service.imp;

import com.araplac.login_araplac.exceptions.BadRequestException;
import com.araplac.login_araplac.exceptions.NotFoundException;
import com.araplac.login_araplac.response.Response;
import com.araplac.login_araplac.roles.entity.Role;
import com.araplac.login_araplac.security.JwtService;
import com.araplac.login_araplac.users.dto.LoginRequest;
import com.araplac.login_araplac.users.dto.LoginResponse;
import com.araplac.login_araplac.users.dto.RegistrationRequest;
import com.araplac.login_araplac.users.entity.User;
import com.araplac.login_araplac.users.repository.UserRepository;
import com.araplac.login_araplac.users.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImp implements AuthService {

    private final UserRepository userRepo;
//    private final RoleRe roleRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
//    private final NotificationService notificationService;
//
//    private final PatientRepo patientRepo;
//    private final DoctorRepository doctorRepository;
//
//    private final CodeGenerator codeGenerator;
//    private final PasswordResetRepo passwordResetRepo;

    @Override
    public Response<String> register(RegistrationRequest request) {
//        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
//            throw new BadRequestException("User with email already exists.");
//        }
//
//        List<String> requestRoleNames = (request.getRoles() != null && !request.getRoles().isEmpty())
//                ? request.getRoles().stream().map(String::toUpperCase).toList()
//                : List.of("PATIENT");

        return null;
    }

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
}









































