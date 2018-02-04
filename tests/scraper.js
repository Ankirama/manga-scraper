var expect = require('chai').expect;
var scraper = require('../index');

describe('Scraper', function() {
  describe('Class', function() {
    it('should have setAPI function', function() {
      expect(scraper).to.have.property('setAPI');
    });
    it('should have getAPI function', function() {
      expect(scraper).to.have.property('getAPI');
    })
    it('should have 3 APIs', function() {
      expect(scraper.apis).to.have.lengthOf(3);
    });
    it('should not have a currentAPI', function() {
      expect(scraper.currentAPI).to.be.null;
    });
    scraper.apis.forEach(function(api) {
      describe('API [' + (api.name || 'undefined') + ']', function() {
        it('should have a name', function() {
          expect(api).to.have.property('name').that.is.not.null;
        });
        it('should have a package', function() {
          expect(api).to.have.property('package').that.is.not.null;
        });
        describe('currentAPI', function() {
          let answer = false;
          before(function(done) {
            scraper.setAPI(api.name)
              .then(function(result) {
                answer = result;
                done();
              })
              .catch(done);
          });
          it('setAPI should return true', function() {
            expect(answer).to.equal(true);
          });
          it('currentAPI should not be null', function() {
            expect(scraper.currentAPI).to.not.be.null;
          });
          it('currentAPI should be set', function() {
            expect(scraper.currentAPI.name).to.equal(api.name);
          });
        })
      });
    });
  });
});