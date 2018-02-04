var unirest = require('unirest');
var async = require('async');

var mangaeden = {
    apikey: ''
};

var baseURI = 'https://www.mangaeden.com/api';
var imgURI = 'https://cdn.mangaeden.com/mangasimg';

function requestGenre(method, uri) {
    return new Promise(function(resolve, reject) {
        let requestUri = 'https://doodle-manga-scraper.p.mashape.com/mangareader.net' + uri;
        unirest[method](requestUri)
            .headers({
                "X-Mashape-Key": mangaeden.apikey,
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

function formatMangaBase(manga) {
    return {
        mangaId: manga.i,
        name: manga.t,
        //        genres: manga.c,
        cover: imgURI + '/' + manga.im,
    }
}

function formatMangaDetail(manga) {
    let status = ['started', 'ongoing', 'completed']
    status = manga.status > 2 ? status[1] : status[manga.status];
    let chapters = [];
    manga.chapters.forEach(function(chapter) {
        chapters.push({ chapterId: chapter[3], index: chapter[0], name: chapter[2] });
    });
    manga.chapters = chapters;
    return {
        name: manga.title,
        href: manga.alias,
        description: manga.description,
        author: [manga.author],
        artist: [manga.artist],
        status: status,
        genres: manga.categories,
        cover: imgURI + '/' + manga.image,
        lastUpdate: new Date(manga.last_chapter_date * 1000).toDateString(),
        chapters: chapters
    };
}

function formatChapter(chapter) {
    chapter.images.reverse();
    let pages = [];
    chapter.images.forEach(function(image) {
        pages.push({ pageId: image[0], url: imgURI + '/' + image[1] });
    });
    return pages;
}

function request(method, uri) {
    return new Promise(function(resolve, reject) {
        let requestUri = baseURI + uri;
        unirest[method](requestUri)
            .headers({
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

mangaeden.getChapter = function(manga, chapter) {
    return new Promise(function(resolve, reject) {
        return request('get', '/chapter/' + chapter)
            .then(function(chapter) {
                return resolve(formatChapter(chapter));
            })
            .catch(reject);
    });
}

mangaeden.setAPIKey = function(apikey) {
    mangaeden.apikey = apikey;
}

mangaeden.getGenreList = function() {
    return requestGenre('get', '/search/genres');
}

mangaeden.getManga = function(manga) {
    return new Promise(function(resolve, reject) {
        return request('get', '/manga/' + manga)
            .then(function(manga) {
                return resolve(formatMangaDetail(manga));
            })
            .catch(err => {
                return reject({message: 'Unable to find your manga'})
            });
    });
}

mangaeden.getMangaByGenre = function(genre) {
    return new Promise(function(resolve, reject) {
        return request('get', '/list/0')
            .then(function(data) {
                let list = [];
                genre = genre.charAt(0).toUpperCase() + genre.slice(1);
                return async.each(data.manga, function(manga, cb) {
                    if (manga.c.indexOf(genre) !== -1) {
                        let tmp = formatMangaBase(manga);
                        tmp.genres = manga.categories;
                        list.push(tmp);
                    }
                    cb();
                }, function(err) {
                    if (err) { return reject(err); }
                    return resolve(list);
                });
            })
            .catch(reject);
    });
}

mangaeden.getMangaList = function() {
    return new Promise(function(resolve, reject) {
        return request('get', '/list/0')
            .then(function(data) {
                let mangaList = [];
                return async.each(data.manga, function(manga, cb) {
                    mangaList.push(formatMangaBase(manga));
                    cb();
                }, function(err) {
                    if (err) { return reject(err); } else {
                        return resolve(mangaList);
                    }
                });
            })
            .catch(reject);
    })
}

mangaeden.search = function(query = null, genres = null, limit = null) {
    return new Promise(function(resolve, reject) {
        return request('get', '/list/0')
            .then(function(data) {
                let list = [];
                query = query.toLowerCase();
                return async.each(data.manga, function(manga, cb) {
                    if (manga.a.indexOf(query) !== -1 || manga.t.toLowerCase().indexOf(query) !== -1) {
                        list.push(formatMangaBase(manga));
                    }
                    cb();
                }, function(err) {
                    if (err) { return reject(err); }
                    return resolve(list);
                });
            })
            .catch(reject);
    });
}

module.exports = mangaeden;