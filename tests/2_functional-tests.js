/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
    chai.request(server)
     .get('/api/books')
     .end(function(err, res){
       assert.equal(res.status, 200);
       assert.isArray(res.body, 'response should be an array');
       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
       assert.property(res.body[0], 'title', 'Books in array should contain title');
       assert.property(res.body[0], '_id', 'Books in array should contain _id');
       done();
     });
 });
 /*
 * ----[END of EXAMPLE TEST]----
 */

 suite('Routing tests', function() {

   suite('POST /api/books with title => create book object/expect book object', function() {

     test('Test POST /api/books with title', function(done) {
       chai.request(server)
         .post('/api/books')
         .send({ title: 'Test Book' })
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, '_id');
           assert.property(res.body, 'title');
           assert.equal(res.body.title, 'Test Book');
           done();
         });
     });

     test('Test POST /api/books with no title given', function(done) {
       chai.request(server)
         .post('/api/books')
         .send({})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, 'missing required field title');
           done();
         });
     });

   });

   suite('GET /api/books => array of books', function(){

     test('Test GET /api/books',  function(done){
       chai.request(server)
         .get('/api/books')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.isArray(res.body, 'response should be an array');
           assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
           assert.property(res.body[0], 'title', 'Books in array should contain title');
           assert.property(res.body[0], '_id', 'Books in array should contain _id');
           done();
         });
     });

   });

   suite('GET /api/books/[id] => book object with [id]', function(){

     test('Test GET /api/books/[id] with id not in db',  function(done){
       chai.request(server)
         .get('/api/books/invalid_id')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.equal(res.text, 'no book exists');
           done();
         });
     });

     test('Test GET /api/books/[id] with valid id in db',  function(done){
       // First, create a book to get a valid ID
       chai.request(server)
         .post('/api/books')
         .send({ title: 'Test Book' })
         .end(function(err, res){
           assert.equal(res.status, 200);
           let bookId = res.body._id;

           // Now, retrieve the book using the valid ID
           chai.request(server)
             .get('/api/books/' + bookId)
             .end(function(err, res){
               assert.equal(res.status, 200);
               assert.property(res.body, '_id');
               assert.property(res.body, 'title');
               assert.property(res.body, 'comments');
                assert.equal(res.body._id, bookId);
                assert.equal(res.body.title, 'Test Book');
                done();
              });
          });
      });

    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        // First, create a book to get a valid ID
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            let bookId = res.body._id;

            // Now, add a comment to the book
            chai.request(server)
              .post('/api/books/' + bookId)
              .send({ comment: 'Test Comment' })
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                assert.property(res.body, 'title');
                assert.property(res.body, 'comments');
                assert.equal(res.body._id, bookId);
                assert.equal(res.body.title, 'Test Book');
                assert.include(res.body.comments, 'Test Comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        // First, create a book to get a valid ID
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            let bookId = res.body._id;

            // Now, try to add a comment without the comment field
            chai.request(server)
              .post('/api/books/' + bookId)
              .send({})
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, 'missing required field comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/invalid_id')
          .send({ comment: 'Test Comment' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        // First, create a book to get a valid ID
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            let bookId = res.body._id;

            // Now, delete the book using the valid ID
            chai.request(server)
              .delete('/api/books/' + bookId)
              .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.text, 'delete successful');

                // Verify the book is deleted
                chai.request(server)
                  .get('/api/books/' + bookId)
                  .end(function(err, res){
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'no book exists');
                    done();
                  });
              });
            });
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .delete('/api/books/invalid_id')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists');
            done();
          });
      });

    });

  });
