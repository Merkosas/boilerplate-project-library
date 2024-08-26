'use strict';

const mongoose = require('mongoose');
const Book = require('../models/book');

module.exports = function (app) {
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

  app.route('/api/books')
    .get(async (req, res) => {
      try {
        const books = await Book.find({}, { __v: 0 }).exec();
        res.json(books);
      } catch (err) {
        res.send(err);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;
      if (!title) return res.send('missing required field title');

      try {
        let newBook = new Book({ title: title });
        let book = await newBook.save();
        res.json(book);
      } catch (err) {
        res.send(err);
      }
    })

    .delete(async (req, res) => {
      try {
        await Book.deleteMany({}).exec();
        res.send('complete delete successful');
      } catch (err) {
        res.send(err);
      }
    });

  app.route('/api/books/:id')
    .get(async (req, res) => {
      let bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }

      try {
        let book = await Book.findById(bookid, { __v: 0 }).exec();
        if (!book) return res.send('no book exists');
        res.json(book);
      } catch (err) {
        res.send(err);
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');

      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }

      try {
        let book = await Book.findById(bookid).exec();
        if (!book) return res.send('no book exists');

        book.comments.push(comment);
        book.commentcount = book.comments.length;

        let updatedBook = await book.save();
        res.json(updatedBook);
      } catch (err) {
        res.send(err);
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;
      if (!mongoose.Types.ObjectId.isValid(bookid)) {
        return res.send('no book exists');
      }

      try {
        let book = await Book.findByIdAndDelete(bookid).exec();
        if (!book) return res.send('no book exists');
        res.send('delete successful');
      } catch (err) {
        res.send(err);
      }
    });
};
