var mangareader = require('./apis/mangareader');
var mangaeden = require('./apis/mangaeden');
var mangafox = require('./apis/mangafox/index');

var mangascraper = {
    currentAPI: {
        name: 'mangareader',
        package: mangareader
    },
    apis: [{
        name: 'mangareader',
        package: mangareader
    }, {
        name: 'mangafox',
        package: mangafox
    }, {
        name: 'mangaeden',
        package: mangaeden
    }],
};

mangascraper.setAPI = function(name) {
    return new Promise(function(resolve) {
        mangascraper.apis.forEach(function(api) {
            if (api.name === name) {
                mangascraper.currentAPI = api;
                return resolve(true);
            }
        });
        return resolve(false);
    });
}

mangascraper.initAPI = function(apikey) {
    if (mangascraper.currentAPI === null) { return false; }
    else {
        mangascraper.currentAPI.package.setAPIKey(apikey);
        return true;
    }
}

mangascraper.getAPI = function() {
    return mangascraper.currentAPI;
}

mangascraper.getChapter = function(manga, chapter) {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.getChapter(manga, chapter)
            .then(pages => {
                if (pages == false || pages == null || pages == {} || pages == []) {
                    return reject({message: 'Unable to find your chapter', status: 404});
                }
                return resolve(pages);
            })
            .catch(error => {
                return reject({message: 'Unable to find your chapter', status: 404});
            });
    });
}

mangascraper.getManga = function(manga) {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.getManga(manga)
        .then(manga => {
            if (manga == false || manga == null || manga == {}) {
                return reject({message: 'Unable to find your manga', status: 404});
            }
            return resolve(manga);
        })
        .catch(error => {
            return reject({message: 'Unable to find your manga', status: 404});
        });
    });
}

mangascraper.getGenreList = function(genre) {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.getGenreList()
        .then((genres) => {
            if (genres == {} || genres == false || genres == null) {
                genres = [];
            }
            return resolve(genres);
        })
        .catch(err => {
            return resolve([]);
        });
    });
}

mangascraper.getMangaByGenre = function(genre) {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.getMangaByGenre(genre)
        .then(mangaList => {
            if (mangaList == {} || mangaList == false || mangaList == null) {
                mangaList = [];
            }
            return resolve(mangaList);
        })
        .catch(err => {
            return resolve([]);
        });
    });
}

mangascraper.getMangaList = function() {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.getMangaList()
        .then(mangaList => {
            if (mangaList == {} || mangaList == false || mangaList == null) {
                mangaList = [];
            }
            return resolve(mangaList);
        })
        .catch(err => {
            return resolve([]);
        });
    });
}

mangascraper.search = function(query, genres) {
    return new Promise((resolve, reject) => {
        return mangascraper.currentAPI.package.search(query)
        .then(mangaList => {
            if (mangaList == {} || mangaList == false || mangaList == null) {
                mangaList = [];
            }
            return resolve(mangaList);
        })
        .catch(err => {
            return resolve([]);
        });
    });
}

module.exports = mangascraper;