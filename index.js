require('dotenv').config()

const app = require('./lib/www')
const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
