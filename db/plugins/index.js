const toClient = function(schema, options) {
  schema.set('toJSON', {
    transform: function(doc, obj, options) {
      obj.id = obj._id;
      delete obj._id;
      delete obj.__v;
      return obj;
    }
  });
};

module.exports = {
  toClient
};
