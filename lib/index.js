let cheerio = require('cheerio')
let fetch = require('node-fetch')

const userAgent = 'Googlebot/2.1'
const baseUrl = 'http://www.lizhi.fm'

exports.fetchAudios = fetchAudios



function fetchAudios(bandId, pageCount) {
    return Promise.all(Array.from(new Array(pageCount)).map(function (pageIndex) {
        let pageUrl = `${baseUrl}/${bandId}/`
        if (pageIndex > 0) {
            pageUrl += `p/${pageIndex + 1}.html`
        }

        return fetchPage(pageUrl)
    })).then(function (lists) {
        let audios = lists.reduce(function (items, item) {
            return items.concat(item)
        }, [])

        if (!audios.length) {
            console.log('Zero audios.')
            return {}
        }

        let item = audios[0]
        return {
            baseUrl,
            band: item.band,
            userName: item.userName,
            radioName: item.radioName,
            cover: item.cover,

            items: audios
        }
    })
}

function fetchPage(pageUrl) {
    return fetch(pageUrl, {
        headers: {
            'User-Agent': userAgent,
            'Referer': baseUrl
        }
    }).then(function (response) {
        return response.text()
    }).then(function (htmlContent) {
        let $ = cheerio.load(htmlContent)
        return $('.js-audio-list li a').map(function (index, element) {
            let el = $(this)
            let time = el.find('.aduioTime').text().split(/\s+/)[0]

            return {
                title: el.data('title'),
                band: el.data('band'),
                rid: el.data('rid'),
                userName: el.data('userName'),
                uid: el.data('uid'),
                id: el.data('id'),
                radioName: el.data('radioName'),
                duration: el.data('duration'),
                url: el.data('url'),
                cover: el.data('cover'),
                time
            }
        }).get()
    })
}

