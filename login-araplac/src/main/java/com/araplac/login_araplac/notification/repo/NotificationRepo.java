package com.araplac.login_araplac.notification.repo;

import com.araplac.login_araplac.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepo extends JpaRepository<Notification, Long> {}
