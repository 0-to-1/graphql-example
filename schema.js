const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} = require('graphql');

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',

  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.isbn[0]
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve: (xml, args, context) => {
        const authorElements = xml.authors[0].author;
        const ids = authorElements.map(elem => elem.id[0]);
        return context.authorLoader.loadMany(ids);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',

  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.name[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (xml, args, context) => {
        const ids = xml.books[0].book.map(elem => elem.id[0]._);
        return context.bookLoader.loadMany(ids);
      }
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',

    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args, context) => context.authorLoader.load(args.id)
      }
    })
  })
});
