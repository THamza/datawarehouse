require('dotenv').config();

const api = require('./api');

const PORT = "9090";

api.listen(PORT, function() {
  console.log(`Server is starting on port ${PORT}`);
});
