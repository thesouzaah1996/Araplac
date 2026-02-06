package com.araplac.login_araplac.notification.service;

import com.araplac.login_araplac.notification.dto.NotificationDTO;
import com.araplac.login_araplac.users.entity.User;

public interface NotificationService {
    void sendEmail(NotificationDTO notificationDTO, User user);
}
