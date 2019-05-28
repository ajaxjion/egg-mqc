'use strict';

const mock = require('egg-mock');

describe('test/mqc.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/mqc-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, egg-mqc, true')
      .expect(200);
  });
});
