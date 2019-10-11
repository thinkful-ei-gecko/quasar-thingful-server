const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Protected endpoints', function () {
  let db;

  const {
    testUsers,
    testThings,
    testReviews,
  } = helpers.makeThingsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  beforeEach('insert things', () => {
    helpers.seedThingsTables(
      db,
      testUsers,
      testThings,
      testReviews
    );
  });

  const protectedEndpoints = [
    {
      name: 'GET /api/things/:thing_id',
      path: '/api/things/1',
      method: supertest(app).get
    },
    {
      name: 'GET /api/things/:thing_id/reviews',
      path: '/api/things/1/reviews',
      method: supertest(app).get
    },
    {
      name: 'POST /api/reviews',
      path: '/api/reviews',
      method: supertest(app).post
    }
  ]

  describe('GET /api/things/:thing_id', () => {
    it('responds with 401 \'Missing basic token\' when no basic token', () => {
      return supertest(app)
        .get('/api/things/123')
        .expect(401, { error: 'Missing basic token' });
    });
  });

  

});