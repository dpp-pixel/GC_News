package gc_news.repository;

import gc_news.entity.Reporter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReporterRepository extends JpaRepository<Reporter, Long> {

    Optional<Reporter> findByExternalJournalistId(String externalJournalistId);
}