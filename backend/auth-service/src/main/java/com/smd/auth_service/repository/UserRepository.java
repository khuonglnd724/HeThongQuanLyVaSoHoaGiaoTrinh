package com.smd.auth_service.repository;

import com.smd.auth_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles WHERE u.userId = :id")
    Optional<User> findByIdWithRoles(Long id);
    
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    Page<User> findAllWithRoles(Pageable pageable);
}
