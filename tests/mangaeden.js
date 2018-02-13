var expect = require('chai').expect;
var mangaeden = require('../apis/mangaeden');

describe('mangaeden', function() {
    const apikey = 'khSXk9tfcGmsh7uRq31L2iDNjP1Tp1EVxOTjsndLieCIv44bfv';
    const genre = 'yuri';
    const badGenre = 'poloplop';
    const manga = '55a6db8e719a162625b32e3a';
    const chapter = '55dba906719a161d349114ab';
    const searchQueryOK = 'slime';
    const searchQueryKO = 'dkowqwq';

    describe('Check package', function() {
        beforeEach(function() {
            mangaeden.apikey = '';
        });
        it('should have apikey empty', function() {
            expect(mangaeden.apikey).to.be.empty;
        });
        it('should set an apikey', function() {
            mangaeden.setAPIKey(apikey);
            expect(mangaeden.apikey).to.equal(apikey);
        });
    });
    describe('Check calls to pseudo-api', function() {
        before(function() {
            if (mangaeden.apikey.length === 0) {
                mangaeden.setAPIKey(apikey);
            }
            return new Promise(function(resolve) {
                    return mangaeden.getMangaList()
                        .then(function(data) {
                            return resolve(data);
                        })
                        .catch(function(err) {
                            resolve(null);
                        });
                })
                .then(function(mangaList) {
                    describe('#getMangaList', function() {
                        it('should be an array not empty', function() {
                            expect(mangaList).to.be.an('array').that.is.not.empty;
                        });
                        describe('Elements in mangaList', function() {
                            mangaList.forEach(function(manga) {
                                describe('Manga [' + (manga.name || 'undefined') + ']', function() {
                                    it('should have mangaId property and be a string not empty', function() {
                                        expect(manga).to.have.property('mangaId').that.is.a('string').that.is.not.empty;
                                    });
                                    it('should have name property and be a string not empty', function() {
                                        expect(manga).to.have.property('name').that.is.a('string').that.is.not.empty;
                                    });
                                    it('should have cover property and be a string not empty', function() {
                                        expect(manga).to.have.property('cover').that.is.a('string').that.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
                                    });
                                });
                            });
                        });
                    });
                });
        });
        it('#getMangaList after', function() {});
        before(function() {
            return new Promise(function(resolve) {
                    return mangaeden.getGenreList()
                        .then(function(data) {
                            return resolve(data);
                        })
                        .catch(function(err) {
                            resolve(null);
                        });
                })
                .then(function(genres) {
                    describe('#getGenreList', function() {
                        it('should be an array not empty', function() {
                            expect(genres).to.be.an('array').that.is.not.empty;
                        });
                        genres.forEach(function(genre) {
                            describe('Genre [' + (genre.genreId || 'undefined') + ']', function() {
                                it('should have a genreId property not null', function() {
                                    expect(genre).to.have.property('genreId').that.is.a('string').that.is.not.empty;
                                });
                            });
                        });
                    })
                });
        });
        it('#getGenreList after', function() {});
        before(function() {
            return new Promise(function(resolve) {
                    return mangaeden.getMangaByGenre(genre)
                        .then(function(data) {
                            return resolve(data);
                        })
                        .catch(function(err) {
                            resolve(null);
                        });
                })
                .then(function(mangaList) {
                    describe('#getMangaByGenre OK', function() {
                        it('should be an array not empty', function() {
                            expect(mangaList).to.be.an('array').that.is.not.empty;
                        });
                        mangaList.forEach(function(manga) {
                            describe('Manga [' + (manga.name || 'undefined') + ']', function() {
                                it('should have mangaId property and be a string not empty', function() {
                                    expect(manga).to.have.property('mangaId').that.is.a('string').that.is.not.empty;
                                });
                                it('should have name property and be a string not empty', function() {
                                    expect(manga).to.have.property('name').that.is.a('string').that.is.not.empty;
                                });
                                it('should have cover property and be a string not empty', function() {
                                    expect(manga).to.have.property('cover').that.is.a('string').that.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
                                });
                            });
                        });
                    });
                });
        });
        it('#getMangaByGenre OK after', function() {});
        describe('#getMangaByGenre KO', function() {
            it('should return [] if a genre is wrong', function(done) {
                mangaeden.getMangaByGenre(badGenre)
                    .then(function(data) {
                        expect(data).to.be.an('array').that.is.deep.equal([]);
                        done();
                    })
                    .catch(done);
            });
        });
        before(function() {
            return new Promise(function(resolve) {
                    return mangaeden.getManga(manga)
                        .then(resolve)
                        .catch(function(err) {
                            resolve(null);
                        });
                })
                .then(function(data) {
                    describe('#getManga OK', function() {
                        it('should be an object not empty', function() {
                            expect(data).to.be.an('object').that.is.not.equal({});
                        });
                        it('should have a name (string not empty)', function() {
                            expect(data).to.have.property('name').that.is.a('string').that.is.not.empty;
                        });
                        it('should have a href (string not empty)', function() {
                            expect(data).to.have.property('href').that.is.a('string').that.is.not.empty;
                        });
                        it('should have a description (string not empty)', function() {
                            expect(data).to.have.property('description').that.is.a('string').that.is.not.empty;
                        });
                        it('should have an author (array not empty)', function() {
                            expect(data).to.have.property('author').that.is.an('array').that.is.not.empty;
                        });
                        it('should have an artist (string not empty)', function() {
                            expect(data).to.have.property('artist').that.is.an('array').that.is.not.empty;
                        });
                        it('should have a status (string not empty)', function() {
                            expect(data).to.have.property('status').that.is.a('string').that.is.not.empty;
                        });
                        it('should have a genres (string not empty)', function() {
                            expect(data).to.have.property('genres').that.is.an('array').that.is.not.empty;
                        });
                        it('should have a cover (string not empty)', function() {
                            expect(data).to.have.property('cover').that.is.a('string').that.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
                        });
                        it('should have a lastUpdate (string not empty)', function() {
                            expect(data).to.have.property('lastUpdate').that.is.a('string').that.is.not.empty;
                        });
                        it('should have a chapter (array not empty)', function() {
                            expect(data).to.have.property('chapters').that.is.an('array').that.is.not.empty;
                        });
                        describe('Chapters in a manga', function() {
                            data.chapters.forEach(function(chapter) {
                                describe('Chapter [' + (chapter.index || 'undefined') + ']', function() {
                                    it('should have a chapterId string not empty', function() {
                                        expect(chapter).to.have.property('chapterId');
                                    });
                                    it('should have a index string not empty', function() {
                                        expect(chapter).to.have.property('index').that.is.a('number');
                                    });
                                    it('should have a name property', function() {
                                        expect(chapter).to.have.property('name');
                                    });
                                });
                            });
                        })
                    });
                });
        });
        it('#getManga OK after', function() {});
        describe('#getManga KO', function() {
            it('should return an error', function(done) {
                mangaeden.getManga(badGenre)
                    .catch(function(err) {
                        expect(err).to.be.an('object').that.has.a.property('message');
                        done();
                    });
            });
        });
        before(function() {
            return new Promise(function(resolve) {
                    return mangaeden.getChapter(manga, chapter)
                        .then(resolve)
                        .catch(function(err) {
                            return resolve(null);
                        });
                })
                .then(function(data) {
                    describe('#getChapter OK', function() {
                        it('should be an array not empty', function() {
                            expect(data).to.be.an('array').that.is.not.empty;
                        });
                        data.forEach(function(page) {
                            describe('Page [' + (page.pageId || 'undefined') + ']', function() {
                                it('should have a pageId property not null', function() {
                                    expect(page).to.have.property('pageId');
                                });
                                it('should have an url property not null', function() {
                                    expect(page).to.have.property('url').that.is.a('string').that.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
                                });
                            })
                        });
                    });
                });
        });
        it('#getChapter OK after', function() {});
        before(function() {
            return new Promise(function(resolve) {
                    return mangaeden.search(searchQueryOK)
                        .then(resolve)
                        .catch(function(err) {
                            return resolve(null);
                        });
                })
                .then(function(data) {
                    describe('#search OK', function() {
                        it('should be an array not empty', function() {
                            expect(data).to.be.an('array').that.is.not.empty;
                        });
                        data.forEach(function(manga) {
                            it('should have mangaId property and be a string not empty', function() {
                                expect(manga).to.have.property('mangaId').that.is.a('string').that.is.not.empty;
                            });
                            it('should have name property and be a string not empty', function() {
                                expect(manga).to.have.property('name').that.is.a('string').that.is.not.empty;
                            });
                            it('should have cover property and be a string not empty', function() {
                                expect(manga).to.have.property('cover').that.is.a('string').that.match(/^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/);
                            });
                        });
                    });
                });
        });
        it('#search OK after', function() {});
        describe('#search KO', function() {
            it('should return an empty array', function(done) {
                mangaeden.search(searchQueryKO)
                    .then(function(data) {
                        expect(data).to.be.an('array').that.is.deep.equal([]);
                        done();
                    })
                    .catch(done);
            });
        });
    });
});