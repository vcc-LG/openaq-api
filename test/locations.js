import { orderBy } from 'lodash';
import { expect } from 'chai';
import request from 'request';

/* global apiUrl */

describe('/locations', function () {
  it('should return properly', function (done) {
    request(apiUrl + 'locations', function (err, response, body) {
      if (err) {
        console.error(err);
      }

      var res = JSON.parse(body);
      expect(res.results.length).to.equal(57);
      expect(res.results).to.be.instanceof(Array);
      done();
    });
  });

  it('has a meta block', function (done) {
    request(apiUrl + 'locations', function (err, response, body) {
      if (err) {
        console.error(err);
      }

      var res = JSON.parse(body);
      var testMeta = {
        name: 'openaq-api',
        license: 'CC BY 4.0',
        website: 'https://docs.openaq.org/',
        found: 57,
        page: 1,
        limit: 100
      };
      expect(res.meta).to.deep.equal(testMeta);
      done();
    });
  });

  it('has pages', function (done) {
    request(apiUrl + 'locations?limit=1', function (err, response, body) {
      if (err) {
        console.error(err);
      }

      var res = JSON.parse(body);
      expect(res.meta.limit).to.deep.equal(1);
      expect(res.results.length).to.equal(1);
      done();
    });
  });

  it('handles multiple countries', function (done) {
    request(apiUrl + 'locations?country[]=NL&country[]=PL', function (
      err,
      response,
      body
    ) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.meta.found).to.equal(12);
      done();
    });
  });

  it('handles multiple sources', function (done) {
    request(apiUrl + 'locations?location=Tochtermana', function (
      err,
      response,
      body
    ) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.results[0].sourceNames.length).to.equal(2);
      done();
    });
  });

  it('handles multiple parameters', function (done) {
    request(
      apiUrl + 'locations?parameter[]=co&parameter[]=pm25',
      function (err, response, body) {
        if (err) {
          console.error(err);
        }

        body = JSON.parse(body);
        expect(body.meta.found).to.equal(49);
        done();
      }
    );
  });

  it('handles multiple cities', function (done) {
    request(apiUrl + 'locations?city[]=Siedlce&city[]=Kolkata', function (
      err,
      response,
      body
    ) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.meta.found).to.equal(2);
      done();
    });
  });

  it('handles multiple locations', function (done) {
    request(
      apiUrl + 'locations?location[]=Reja&location[]=Tochtermana',
      function (err, response, body) {
        if (err) {
          console.error(err);
        }

        body = JSON.parse(body);
        expect(body.meta.found).to.equal(2);
        done();
      }
    );
  });

  it('handles a coordinates search', function (done) {
    request(
      apiUrl + 'locations?coordinates=51.83,20.78&radius=1000',
      function (err, response, body) {
        if (err) {
          console.error(err);
        }

        body = JSON.parse(body);
        expect(body.meta.found).to.equal(1);
        done();
      }
    );
  });

  it('handles a coordinates search with no radius', function (done) {
    request(apiUrl + 'locations?coordinates=51.83,20.78', function (
      err,
      response,
      body
    ) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.meta.found).to.equal(1);
      done();
    });
  });

  it('handles a coordinates search with nearest', function (done) {
    request(
      apiUrl + 'locations?coordinates=51.83,20.78&nearest=10',
      function (err, response, body) {
        if (err) {
          console.error(err);
        }

        body = JSON.parse(body);
        expect(body.meta.found).to.equal(10);
        done();
      }
    );
  });

  it('handles a coordinates search with bad nearest', function (done) {
    request(
      apiUrl + 'locations?coordinates=51.83,20.78&nearest=foo',
      function (err, response, body) {
        if (err) {
          console.error(err);
        }

        body = JSON.parse(body);
        expect(body.meta.found).to.equal(57);
        done();
      }
    );
  });

  // https://github.com/openaq/openaq-api/issues/232
  it('handles has_geo searches', function (done) {
    request(apiUrl + 'locations?has_geo', function (err, response, body) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.meta.found).to.equal(56);
      done();
    });
  });

  // https://github.com/openaq/openaq-api/issues/278
  it('returns correct number for similar locations', function (done) {
    request(apiUrl + 'locations?location=Coyhaique%20II', function (
      err,
      response,
      body
    ) {
      if (err) {
        console.error(err);
      }

      body = JSON.parse(body);
      expect(body.meta.found).to.equal(1);
      done();
    });
  });

  it('can be ordered', done => {
    request(
      `${apiUrl}locations?order_by=count&sort=desc`,
      (err, response, body) => {
        if (err) {
          console.error(err);
        }

        const res = JSON.parse(body);
        expect(res.results).to.deep.equal(
          orderBy(res.results, 'count', 'desc')
        );
        done();
      }
    );
  });

  it('can be ordered by multiple fields and directions', done => {
    request(
      `${
        apiUrl
      }parameters?order_by[]=lastUpdated&order_by[]=country&sort[]=desc&sort[]=asc]`,
      (err, response, body) => {
        if (err) {
          console.error(err);
        }

        const res = JSON.parse(body);
        expect(res.results).to.deep.equal(
          orderBy(res.results, ['lastUpdated', 'country'], ['desc', 'asc'])
        );
        done();
      }
    );
  });
});