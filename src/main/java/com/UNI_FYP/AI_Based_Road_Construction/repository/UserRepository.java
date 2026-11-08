package com.UNI_FYP.AI_Based_Road_Construction.repository;

import com.UNI_FYP.AI_Based_Road_Construction.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.UNI_FYP.AI_Based_Road_Construction.entity.enums.UserRole;
import java.util.List;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    // user by AuthService to check if email already Registered or not
    boolean  existsByEmail(String email);

    // used by AuthService.loadUserNameByUserName() called by spring security
    Optional<User> findByEmail(String email);

    List<User> findByRole(UserRole role);
}
