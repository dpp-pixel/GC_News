package gc_news.repository;

import gc_news.entity.Article;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlString(String urlString); // url 중복 검사

    List<Article> findAllByOrderByViewCountDesc(); // 조회수 높은 순
}
