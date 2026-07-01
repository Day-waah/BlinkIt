package com.blinkitclone.api.service;

import com.blinkitclone.api.dto.AuthRequest;
import com.blinkitclone.api.dto.AuthResponse;
import com.blinkitclone.api.dto.RegisterRequest;
import com.blinkitclone.api.entity.User;
import com.blinkitclone.api.security.UserPrincipal;

public interface UserService {
    User registerUser(RegisterRequest request);
    AuthResponse authenticateUser(AuthRequest request);
    User getCurrentUser(UserPrincipal userPrincipal);
    User getUserById(Long id);
}
