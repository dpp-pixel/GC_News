package gc_news.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import gc_news.entity.Theme;

public interface ThemeRepository extends JpaRepository<Theme, Long> {
}