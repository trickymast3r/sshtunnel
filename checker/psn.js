import mongoose from 'mongoose';
import Promise from 'bluebird'
import chalk from 'chalk'
import cluster from 'cluster'
import os from 'os'
import AccountModel from '../models/account'
import fs from 'fs'
import webClient from 'webclient';
var FileCookieStore = require("tough-cookie-filestore");

// import request from 'superagent';
// import superagentProxy from 'superagent-proxy';
// import logger from 'superagent-logger';
var socksInfo = "socks5://162.144.221.185:17747";
var defaultOpts = {
  jar: webClient.jar(new FileCookieStore("./cookie.json")),
  proxy: socksInfo,
  header: {
    'User-Agent' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
    'Accept' : 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language' : 'en-US,en;q=0.9',
  }
}
WebClient.get({
    url: 'http://mail.yahoo.com'
}).then(function(result) {
    let response = result[0], body = result[1];
    response.body = body.length;
    // console.log(response);

    console.log(response);
}).catch(function(err) {
    console.log(err.stack);
});
// superagentProxy(request);
// const agent = request.agent();
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//
// var r = function(type,url) {
//   if(type == 'post')
//     return agent.post(url)
//       .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
//       .set('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
//       .set('Accept-Language','en-US,en;q=0.9')
//       .set('Cache-Control','no-cache')
//       .set('Referer','https://www.sonyrewards.com/en/login')
//       .proxy(socksInfo)
//       .use(logger({ outgoing: true }));
//
//   if(type == 'get')
//     return agent.get(url)
//       .set('User-Agent','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36')
//       .set('Accept','text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
//       .set('Accept-Language','en-US,en;q=0.9')
//       .set('Cache-Control','no-cache')
//       .set('Referer','https://www.sonyrewards.com/en/login')
//       .proxy(socksInfo)
//       .use(logger({ outgoing: true }));
//   return agent;
// }
// r('get','https://www.sonyrewards.com/en/login').end((err, res) => {
//   if (err) {
//     console.log(err);
//   } else {
//     var regexToken = /<input.name="__RequestVerificationToken".*value="(.*)".\/>/ig
//     if(regexToken.test(res.text)) {
//       console.log('Found __RequestVerificationToken');
//       var match = regexToken.exec(res.text);
//       var postParams = {
//         "__RequestVerificationToken": match[1],
//         loginUsername: 'tricky@t4v.net',
//         RememberMe: 'true',
//         loginpassword: 'Kendappa123',
//         PageName: 'Login'
//       }
//       console.log('Do Submit');
//       r('post','https://www.sonyrewards.com/en/login').type('form')
//         .send(postParams)
//         .end((err,res) => {
//           if(err) {
//             console.log('Submit Login Failed');
//             console.log(err);
//           } else {
//             console.log('Did Login Submit');
//             fs.writeFileSync('debug.html',res.text);
//             //console.log(res.text);
//           }
//         });
//     } else {
//       console.log("Can't find __RequestVerificationToken");
//     }
//
//   }
// });
