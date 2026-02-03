package com.araplac.login_araplac.users.service;

import com.araplac.login_araplac.response.Response;
import com.araplac.login_araplac.users.dto.LoginRequest;
import com.araplac.login_araplac.users.dto.LoginResponse;
import com.araplac.login_araplac.users.dto.RegistrationRequest;

public interface AuthService {

    Response<String> register(RegistrationRequest request);

    Response<LoginResponse> login(LoginRequest loginRequest);

//    Response<?> forgetPassword(String email);
//
//    Response<?> updatePasswordViaResetCode(ResetPasswordRequest resetPasswordRequest);
}
