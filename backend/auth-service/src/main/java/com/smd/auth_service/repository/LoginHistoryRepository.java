package com.smd.auth_service.repository;

import com.smd.auth_service.entity.LoginHistory;
import com.smd.auth_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    
    Page<LoginHistory> findByUser(User user, Pageable pageable);
    
    List<LoginHistory> findByUserAndLoginTimeAfter(User user, LocalDateTime loginTime);
    
    Page<LoginHistory> findByLoginStatus(String loginStatus, Pageable pageable);
}
