package gc_news.service;

import gc_news.entity.Article;
import gc_news.repository.ArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    // 전체 기사 가져오기
    public List<Article> getAllArticles() {
        // return articleRepository.findAll(); //전체 기사 가져오기
        return articleRepository.findAllByOrderByViewCountDesc(); // 조회수순
    }

    // 조회수 높은 순으로 가져오기
    public List<Article> getTopArticles(int limit) {
        return articleRepository.findAllByOrderByViewCountDesc()
                .stream()
                .limit(limit)
                .toList();
    }
}
