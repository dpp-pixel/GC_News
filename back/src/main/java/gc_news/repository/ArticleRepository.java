package gc_news.repository;

import gc_news.entity.Article;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlString(String urlString); // url 중복 검사

    List<Article> findAllByOrderByViewCountDesc(); // 조회수 높은 순

    @Query("""
                SELECT DISTINCT a
                FROM Article a
                LEFT JOIN FETCH a.mediaList
                ORDER BY a.viewCount DESC
            """)
    List<Article> findAllWithMedia(); // mediaList까지 같이 가져오기

    List<Article> findByThemeIdOrderByPublishedAtDesc(Long themeId);
}
