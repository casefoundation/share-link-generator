const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const shareLinkGenerator = require('./shareLinkGenerator')

const app = module.exports = express()
app.use(morgan('tiny'))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('index', {
    links: [],
    metadata: [],
    generatedText: [],
    url: '',
    text: generateTextArray({
      twitter: process.env.DEFAULT_TWITTER_SHARE_TEXT_TEMPLATE || '',
      emailSubject: process.env.DEFAULT_EMAIL_SUBJECT_TEXT_TEMPLATE || '',
      emailBody: process.env.DEFAULT_EMAIL_BODY_TEXT_TEMPLATE || ''
    })
  })
})

app.post('/', function (req, res, next) {
  if (req.body.url) {
    const text = {
      twitter: req.body.twitter || '',
      emailSubject: req.body.emailSubject || '',
      emailBody: req.body.emailBody || ''
    }
    shareLinkGenerator.generateAll(req.body.url, text)
      .then(({ links, metadata, generatedText }) => {
        res.render('index', {
          links,
          metadata,
          generatedText,
          url: req.body.url,
          text: generateTextArray(text)
        })
      })
      .catch(e => next(e))
  } else {
    res.send(400)
  }
})

const generateTextArray = (defaults) => {
  return [
    {
      network: 'Twitter',
      name: 'twitter',
      text: defaults.twitter
    },
    {
      network: 'Email Subject',
      name: 'emailSubject',
      text: defaults.emailSubject
    },
    {
      network: 'Email Body',
      name: 'emailBody',
      text: defaults.emailBody
    }
  ]
}
