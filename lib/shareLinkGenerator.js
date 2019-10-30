const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])
const got = require('got')
const Mustache = require('mustache')
const querystring = require('querystring')
const Entities = require('html-entities').AllHtmlEntities

exports.generateFromURL = (url, text) => {
  return got(url)
    .then(({ body }) => {
      return metascraper({ html: body, url })
    })
    .then(metadata => exports.generateFromMetadata(url, metadata, text))
}

exports.generateFromMetadata = (url, metadata, text) => {
  const metadataArray = []
  for (const key in metadata) {
    metadataArray.push({
      key,
      value: metadata[key]
    })
  }
  const entities = new Entities()
  const twitter = entities.decode(Mustache.render(text.twitter, metadata))
  const emailSuject = entities.decode(Mustache.render(text.emailSubject, metadata))
  const emailBody = entities.decode(Mustache.render(text.emailBody, metadata))
  return {
    metadata: metadataArray,
    generatedText: [
      {
        network: 'Twitter',
        text: twitter
      },
      {
        network: 'Email Subject',
        text: emailSuject
      },
      {
        network: 'Email Body',
        text: emailBody
      }
    ],
    links: [
      {
        network: 'Twitter',
        link: 'https://twitter.com/intent/tweet?' + querystring.stringify({ text: twitter })
      },
      {
        network: 'LinkedIn',
        link: 'https://www.linkedin.com/shareArticle?' + querystring.stringify({ mini: true, url })
      },
      {
        network: 'Facebook',
        link: 'https://www.facebook.com/sharer/sharer.php?' + querystring.stringify({ u: url })
      },
      {
        network: 'Email',
        link: 'mailto:?' + querystring.stringify({ subject: emailSuject, body: emailBody })
      }
    ]
  }
}
