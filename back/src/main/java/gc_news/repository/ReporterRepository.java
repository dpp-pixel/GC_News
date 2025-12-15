package gc_news.repository;

import gc_news.entity.Reporter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReporterRepository extends JpaRepository<Reporter, Long> {
}
