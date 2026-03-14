package it.espressamente.api.auth.repository;

import it.espressamente.api.auth.entity.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    @Query("SELECT u FROM AdminUser u LEFT JOIN FETCH u.store WHERE u.username = :username")
    Optional<AdminUser> findByUsername(@Param("username") String username);

    Optional<AdminUser> findByEmail(String email);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM AdminUser u LEFT JOIN FETCH u.store")
    List<AdminUser> findAllWithStore();

    @Query("SELECT u FROM AdminUser u LEFT JOIN FETCH u.store WHERE u.passwordResetToken = :token")
    Optional<AdminUser> findByPasswordResetToken(@Param("token") String token);
}
