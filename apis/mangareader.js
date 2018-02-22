var $ = new require('../utils/request.js');
var unirest = require('unirest');
var cheerio = require('cheerio');

var mangareader = {
    apikey: '',
};

var baseURI = 'https://doodle-manga-scraper.p.mashape.com';

function request(method, uri) {
    return new Promise(function(resolve, reject) {
        let requestUri = baseURI + '/mangareader.net' + uri;
        unirest[method](requestUri)
            .headers({
                "X-Mashape-Key": mangareader.apikey,
                "Accept": "text/plain"
            })
            .end(function(result) {
                if (result.status >= 200 && result.status < 300) {
                    return resolve(result.body);
                } else {
                    return reject({ message: result.body });
                }
            });
    });
}

function formatChapter(chapter) {
    return chapter.pages;
}

mangareader.setAPIKey = function(apikey) {
    mangareader.apikey = apikey;
}

mangareader.getChapter = function(manga, chapter) {
    return new Promise(function(resolve, reject) {
        return request('get', '/manga/' + manga + '/' + chapter)
            .then(function(chapter) {
                return resolve(formatChapter(chapter));
            })
            .catch(reject);
    });
}

mangareader.getGenreList = function() {
    return request('get', '/search/genres');
}

mangareader.getManga = function(manga) {
    return new Promise(function(resolve, reject) {
        return request('get', '/manga/' + manga)
            .then(function(manga) {
                if (manga.error != null) { return reject({ message: manga.error }); }
                let chapters = [];
                manga.description = 'Not available';
                manga.chapters.forEach(function(chapter) {
                    chapters.push({ chapterId: chapter.chapterId, index: chapter.chapterId, name: null });
                });
                manga.chapters = chapters.reverse();
                return resolve(manga);
            })
            .catch(reject);
    });
}

mangareader.getMangaByGenre = function(genre) {
    return request('get', '/search/genres/' + genre + '?cover=1');
}

mangareader.getMangaList = function() {
    return request('get', '?cover=1');
}

mangareader.search = function(query = null, genres = null, limit = null) {
    let uri = '/search?cover=1' + (limit != null && parseInt(limit) > 0 ? '&l=' + limit : '');
    if (genres && genres.length > 0) {
        let tmpGenres = '&g=%5B';
        genres.forEach(function(genre) {
            tmpGenres += '%22' + genre + '%22';
        })
        tmpGenres += '%5B';
        uri += tmpGenres;
    }
    if (query) {
        uri += '&q=' + query.replace(' ', '+');
    }
    return request('get', uri);
}

mangareader.latest = function() {
    return new Promise(function(resolve, reject) {
        let url = 'http://www.mangareader.net/latest';
        $.get(url, function(err, d) {
            if (err) {
                return reject(err);
            }
            let mangaList = [];
            d.find('.c2').each(function(i, e) {
                let date = $(e).find('.c1').text();
                if (date === 'Today') {
                    let name = cheerio(e).find('.chapter > strong').text();
                    let mangaId = cheerio(e).find('.chapter').attr('href').split('/')[1];
                    let chapters = [];
                    $(e).find('.chaptersrec').each(function(j, c) {
                        chapters.push($(this).text());
                    });
                    mangaList.push({ mangaId: mangaId, name: name, chapters: chapters, provider: 'mangareader' });
                }
            });
            return resolve(mangaList);
        }, true);
    });
}

module.exports = mangareader;