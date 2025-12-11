package gc_news.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import gc_news.entity.ArticleMedia;

public interface ArticleMediaRepository extends JpaRepository<ArticleMedia, Long> {
}