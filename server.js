const fetch = require('node-fetch');
const util = require('util');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const DataLoader = require('dataloader');
const parseXML = util.promisify(require('xml2js').parseString);

const schema = require('./schema');
const app = express();
const GOOD_READS_API = process.env.GOOD_READS_API;

const fetchAuthor = id =>
  fetch(
    `https://www.goodreads.com/author/show.xml?id=${id}&key=${GOOD_READS_API}`
  )
    .then(response => response.text())
    .then(parseXML)
    .then(xml => xml.GoodreadsResponse.author[0]);

const fetchBook = id =>
  fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${GOOD_READS_API}`)
    .then(response => response.text())
    .then(parseXML)
    .then(xml => xml.GoodreadsResponse.book[0]);

app.use(
  '/graphql',
  graphqlHTTP(req => {
    const authorLoader = new DataLoader(keys =>
      Promise.all(keys.map(fetchAuthor))
    );
    const bookLoader = new DataLoader(keys => Promise.all(keys.map(fetchBook)));

    return {
      schema,
      context: {
        authorLoader,
        bookLoader
      },
      graphiql: true
    };
  })
);

app.listen(4000);
console.log('Listenning....');
