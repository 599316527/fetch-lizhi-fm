#!/usr/bin/env node

let fs = require('fs')
let path = require('path')
let etpl = require('etpl')
let fetchAudios = require('../lib/index').fetchAudios
let argv = require('optimist').argv
let DT = require('duration-time-format')

let bandId = argv.id

if (!bandId) {
    console.log('Options: ')
    console.log('   --id xxxxx')
    console.log('   --count 1')
    console.log('   --xml')
    process.exit(1)
}

let pageCount = argv.count || 1
let isSaveXml = argv.xml

let dt = new DT({})
etpl.addFilter('format-time', function (source, useExtra) {
    return dt.format(parseInt(source, 10) || 0)
})

fetchAudios(bandId, pageCount).then(function (result) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(
            path.resolve(__dirname, '../.audios.json'),
            JSON.stringify(result, null, 4),
            function (err) {
                if (err) {
                    reject()
                    return
                }
                resolve(result)
            }
        )
    })
}).then(function (result) {
    if (isSaveXml) {
        return saveXml(result)
    }

    console.log('DONE')
}).catch(function (err) {
    console.log(err.stack)
    process.exit(2)
})

function saveXml(data) {
    return new Promise(function (resolve, reject) {
        let p = path.join(__dirname, 'feed.etpl')
        fs.readFile(p, {
            encoding: 'utf8'
        }, function (err, content) {
            if (err) {
                reject()
                return
            }
            resolve(content)
        })
    }).then(function (content) {
        let render = etpl.compile(content)
        let html = render(data)
        return new Promise(function (resolve, reject) {
            fs.writeFile(
                path.resolve(__dirname, '../feed.xml'),
                html,
                function (err) {
                    if (err) {
                        reject()
                        return
                    }
                    resolve()
                }
            )
        })
    })
}










