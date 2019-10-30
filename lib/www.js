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

app.get('/', (req, res) => {
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

app.post('/', async (req, res, next) => {
  try {
    const url = req.body.url
    const text = {
      twitter: req.body.twitter || '',
      emailSubject: req.body.emailSubject || '',
      emailBody: req.body.emailBody || ''
    }
    const sendResponse = (links, metadata, generatedText) => {
      res.render('index', {
        links,
        metadata,
        generatedText,
        url,
        text: generateTextArray(text)
      })
    }
    if (req.body.custom_metadata === 'yes') {
      const { links, metadata, generatedText } = shareLinkGenerator.generateFromMetadata(url, {
        author: req.body.meta_author,
        date: req.body.meta_date,
        description: req.body.meta_description,
        publisher: req.body.meta_publisher,
        title: req.body.meta_title,
        url: req.body.meta_url
      }, text)
      sendResponse(links, metadata, generatedText)
    } else {
      const { links, metadata, generatedText } = await shareLinkGenerator.generateFromURL(url, text)
      sendResponse(links, metadata, generatedText)
    }
  } catch (e) {
    next(e)
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
