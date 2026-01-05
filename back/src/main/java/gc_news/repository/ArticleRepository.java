package gc_news.repository;

import gc_news.entity.Article;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    boolean existsByUrlString(String urlString); // url 중복 검사

    Optional<Article> findByUrlString(String urlString);

    @Query("""
            SELECT a
            FROM Article a
            LEFT JOIN FETCH a.mediaList
            ORDER BY a.publishedAt DESC
            """)
    List<Article> findTopLatestArticles(Pageable pageable);

    @Query("""
                SELECT DISTINCT a
                FROM Article a
                LEFT JOIN FETCH a.mediaList
                LEFT JOIN FETCH a.theme
                WHERE a.headline = true
                  AND a.publishedAt >= :fromDate
                ORDER BY a.clusterCount DESC, a.publishedAt DESC
            """)
    List<Article> findHeadlineArticles(
            @Param("fromDate") LocalDateTime fromDate,
            Pageable pageable);

    List<Article> findAllByOrderByViewCountDesc(); // 조회수 높은 순

    @Query("""
                SELECT DISTINCT a
                FROM Article a
                LEFT JOIN FETCH a.mediaList
                LEFT JOIN FETCH a.theme
                WHERE a.publishedAt >= :from
                ORDER BY a.viewCount DESC
            """)

    List<Article> findHotArticles(@Param("from") LocalDateTime from);

    @Query("""
                SELECT DISTINCT a
                FROM Article a
                LEFT JOIN FETCH a.mediaList
                LEFT JOIN FETCH a.theme
            """)
    List<Article> findAllWithMedia(); // mediaList까지 같이 가져오기

    List<Article> findByTheme_ThemeIdOrderByPublishedAtDesc(Long themeId);

    // Page 처리된 카테고리별 기사
    Page<Article> findByTheme_ThemeIdOrderByPublishedAtDesc(Long themeId, Pageable pageable);

    @Query("""
                SELECT DISTINCT a
                FROM Article a
                LEFT JOIN FETCH a.mediaList
                LEFT JOIN FETCH a.theme
                WHERE a.headline = true
                AND a.theme.themeId = :themeId
                AND a.publishedAt >= :fromDate
                ORDER BY a.clusterCount DESC, a.publishedAt DESC
            """)
    List<Article> findHeadlineArticlesByTheme(
            @Param("themeId") Long themeId,
            @Param("fromDate") LocalDateTime fromDate,
            Pageable pageable);

    Page<Article> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String titleKeyword, String contentKeyword, Pageable pageable);

}
