package gc_news.repository;

import gc_news.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlString(String urlString);   //url 중복 검사
}
