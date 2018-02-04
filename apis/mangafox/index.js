var $ = new require('./request.js');
var unirest = require('unirest');
var cheerio = require('cheerio');
var async = require('async');

var mangafox = {
    apikey: ''
};

var baseURI = 'http://fanfox.net';
var baseURIDoodle = 'https://doodle-manga-scraper.p.mashape.com';

function request(method, uri, isDoodle=true) {
    return new Promise(function(resolve, reject) {
        let requestUri = baseURI + uri;
        if (isDoodle) {
            requestUri = baseURIDoodle + '/mangafox.me' + uri;
        }
        unirest[method](requestUri)
            .headers({
                "X-Mashape-Key": mangafox.apikey,
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
    if (manga.cover == null) { return false; }
    let tmp = manga.cover.substr(0, manga.cover.lastIndexOf('/'));
    return {
        mangaId: tmp.substr(tmp.lastIndexOf('/') + 1),
        name: manga.name,
        cover: manga.cover
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
        author: [manga.author],
        artist: [manga.artist],
        status: status,
        genres: manga.categories,
        cover: imgURI + '/' + manga.image,
        lastUpdate: new Date(manga.last_chapter_date * 1000).toDateString(),
        chapters: chapters
    };
}

mangafox.setAPIKey = function(apikey) {
    mangafox.apikey = apikey;
}

mangafox.getPages = function(manga, chapter){
    return new Promise(function(resolve, reject) {
        $.get(baseURI + '/manga/' + manga + '/' + chapter + '/1.html', function(err, d){
            if (err) {
                return reject(err);
            }
            return resolve((d.find('.l option').length-2)/2);
        }, true);
    });
};

mangafox.getChapter = function(manga, chapter){
    return new Promise(function(resolve, reject) {
        mangafox.getPages(manga, chapter)
            .then(function(num) {
                var data = [];
                let n = 1;
                console.log("debug here..");
                async.whilst(
                    function() { return n <= num },
                    function(done) {
                        let uri = '/manga/' + manga + '/' + chapter + '/' + n + '.html';
                        setTimeout(function() {
                            request('get', uri, false)
                            .then(function(manga) {
                                let d = cheerio(manga);
                                data.push({pageId: n, url: d.find('#viewer img').attr('src')});
                                n++;
                                done(null, n);
                            })
                            .catch(done);
                        }, 100);
                    },
                    function(err) {
                        if (err) {
                            err.data = data;
                            reject(err);
                        }
                        resolve(data);
                    }
             );
            })
            .catch(function(err) {
                console.log('error => ', err);
            })
    });
};

mangafox.getGenreList = function() {
    return request('get', '/search/genres');
}

function _mangaDetails(manga) {
    return new Promise(function(resolve, reject) {
        $.get(baseURI + '/manga/' + manga, function(err, data) {
            if (err) {
                return reject(err);
            }
            let json = {
                name : undefined,
                description: undefined,
                cover: undefined,
                status: undefined,
                lastUpdate: undefined,
                mangaId: undefined,
                chapters: []
            }
            let $ = cheerio.load(data);
            $('#series_info').filter(function() {
                json.cover = $('.cover img').attr('src');
                json.mangaId = json.cover.split('/')[json.cover.split('/').length - 2];
                json.status = $('.data span').text().split(',')[0].trim().toLowerCase();
            });
    
            $('#title').filter(function() {
                json.name = $('h1').text();
                json.description = $('.summary').text();
            });
    
            $('#chapters').filter(function() {
                var volume_elms = $('.volume');
                var chapter_elms = $('.chlist');
                for (var i = 0, l = volume_elms.length; i < l; ++i) {
                    var celm = $(chapter_elms[i]);
                    for (var j = 0, ll = celm.children().length; j < ll; ++j) {
                        var chapter = $(celm.children()[j]);
                        var chapter_link = chapter.find('a.tips').attr('href');
                        var chapter_index = chapter.find('a.tips').text();
                        if (json.lastUpdate === undefined) { json.lastUpdate = chapter.find('span.date').text(); }
                        chapter_index = chapter_index.substr(chapter_index.lastIndexOf(' ') + 1);
                        var chapter_id = chapter.find('a.tips').attr('href').split('/')[chapter.find('a.tips').attr('href').split('/').length - 2];
                        json.chapters.push({
                            chapterId: chapter_id,
                            index: chapter_index,
                            name: null
                        });
                    }
                }
            });
            return resolve(json);
        });
    });
}

mangafox.getManga = function(id) {
    return new Promise(function(resolve, reject) {
        return _mangaDetails(id)
            .then(function(tmp) {
                if (tmp.mangaId == undefined) {
                    return reject({message: 'Unable to find your manga'});
                }
                return $.post(baseURI + '/ajax/series.php', {sid: tmp.mangaId}, function(err, data) {
                    if (err) { return reject(err); }
                    try {
                        if (data == false) { return reject({message: 'Unable to find your manga'}); }
                        data = JSON.parse(data);
                        let manga = {
                            name: data[0],
                            href: id,
                            description: data[9],
                            author: data[3].split(', '),
                            artist: data[4].split(', '),
                            status: tmp.status,
                            genres: data[2].split(', '),
                            cover: data[10],
                            lastUpdate: tmp.lastUpdate,
                            chapters: tmp.chapters
                        };
                        return resolve(manga);
                    } catch(e) {
                        return reject(e);
                    }
                })
            })
            .catch(err => {
                reject(err);
            });
    });
}

mangafox.getMangaByGenre = function(genre) {
    return request('get', '/search/genres/' + genre + '?cover=1');
}

mangafox.getMangaList = function() {
    return new Promise(function(resolve, reject) {
        return request('get', '?cover=1')
            .then(function(data) {
                let mangaList = [];
                return async.each(data, function(manga, cb) {
                    let tmp = formatMangaBase(manga)
                    if (tmp !== false) {
                        mangaList.push(tmp);
                    }
                    cb();
                }, function(err) {
                    if (err) { return reject(err); }
                    return resolve(mangaList);
                })
            })
            .catch(reject);
    })
}

mangafox.search = function(query = null, genres = null, limit = null) {
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


module.exports = mangafox;