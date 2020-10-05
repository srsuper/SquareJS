# -*- coding: utf-8 -*-
/*

| [ LINE SquareBOT JS by WyvernStudio]
| 
| Special thanks to:
|  - GoogleX https://github.com/GoogleX133/LINE-FreshBot
|
| Copyright (c) 2019


*/
console.info("\n\
----         --------  ----    ---- ------------ \n\
****         ********  *****   **** ************ \n\
----           ----    ------  ---- ----         \n\
****           ****    ************ ************ \n\
----           ----    ------------ ------------ \n\
************   ****    ****  ****** ****         \n\
------------ --------  ----   ----- ------------ \n\
************ ********  ****    **** ************ \n\
                                                 ");
console.info("\nNOTE : This project is made by @WyvernStudio !\n\
***Copyright belongs to the author***\n\n\n\n");

/*Change This*/
var LOGINType = 0; // 0 = Â×¹ÂÑ¹µÑÇµ¹, 1 = ÅÔ§¤ì QR, 2 = Â×¹ÂÑ¹´éÇÂâ·à¤¹ #à»ÅÕèÂ¹»ÃÐàÀ·¡ÒÃà¢éÒÊÙèÃÐººµÃ§¹Õé

/* Const variable */

const unirest = require('unirest');
const qrcode = require('qrcode-terminal');
const util = require("util");
const mime = require("mime");
const path = require('path');
const rp = require('request-promise');
const request = require('request');
const LineService = require('../thrift/TalkService.js');
const jsonfile = require('jsonfile');
const TTypes = require('../thrift/line_types');
const BotLib = require('../pkg/BotLib');
const PinVerifier = require('../pkg/pinVerifier');


/* GLOBAL Var */

var thrift = require('thrift-http');
var xtes = "getAuthQrcode";
var fs = require('fs');
var config = require('../pkg/config');
var reqx = new TTypes.LoginRequest();
var axy = axz = axc = false;
var TauthService, Tclient, connection, Tcustom = {},
    xsess, objsess = {},
    revision, xry, profile = {};
var options = {
    protocol: thrift.TCompactProtocol,
    transport: thrift.TBufferedTransport,
    headers: config.Headers,
    path: config.LINE_HTTP_URL,
    https: true
};
var botlib = new BotLib('', config);

/* Update Check */
console.log('\nµÃÇ¨ÊÍº¡ÒÃÍÑ¾à´·....')
botlib.checkUpdate();

console.log('\nâ»Ã´ÍÍ¡¨Ò¡ËéÍ§áª·¡èÍ¹ äÁè§Ñé¹ÃÐººÍÒ¨¨ÐËÒ MID äÁèà¨Í')

/* Function */

function setTHttpClient(xoptions = {
    protocol: thrift.TCompactProtocol,
    transport: thrift.TBufferedTransport,
    headers: config.Headers,
    path: config.LINE_HTTP_URL,
    https: true
}, callback, xcustom = "none", tpath) {
    xoptions.headers['X-Line-Application'] = 'DESKTOPWIN\t7.18.1\tYukiOS\t11.2.5';
    connection =
        thrift.createHttpConnection(config.LINE_DOMAIN_3RD, 443, xoptions);
    connection.on('error', (err) => {
        console.log('err', err);
        return err;
    });
    if (axy === true) {
        TauthService = thrift.createHttpClient(require('../thrift/AuthService.js'), connection);
        axy = false;
        if (botlib.isFunction(callback)) {
            callback("DONE");
        }
    } else if (axc === true) {
        eval(`Tcustom.${xcustom} = thrift.createHttpClient(require('../thrift/${tpath}.js'), connection);`);
        axc = false;
        if (botlib.isFunction(callback)) {
            callback("DONE");
        }
    } else {
        Tclient = thrift.createHttpClient(LineService, connection);
        if (botlib.isFunction(callback)) {
            callback("DONE");
        }
    }

}

function authConn(callback) {
    axy = true;
    options.path = config.LINE_RS;
    setTHttpClient(options, (xres) => {
        if (xres == "DONE") {
            callback("DONE");
        }
    });
}

function serviceConn(path, xcustom, tpath, callback) {
    axc = true;
    options.path = path;
    setTHttpClient(options, (xres) => {
        if (xres == "DONE") {
            callback("DONE");
        }
    }, xcustom, tpath);
}

function getQrLink(callback) {
	options.path = config.LINE_HTTP_URL;
    setTHttpClient(options,(xres) => {
		if(xres == "DONE"){
   			 Tclient.getAuthQrcode(true, "YukiOS",(err, result) => {
    		  // console.log('here')
			  //console.log(err)
     		 const qrcodeUrl = `line://au/q/${result.verifier}`;
			callback(qrcodeUrl,result.verifier);
    		});
		}
	});
}

function qrLogin(xverifier,callback){
	Object.assign(config.Headers,{ 'X-Line-Access': xverifier });
        unirest.get('https://gd2.line.naver.jp/Q')
          .headers(config.Headers)
          .timeout(120000)
          .end(async (res) => {
            const verifiedQr = res.body.result.verifier;
			authConn((xret) => {
			if(xret == "DONE"){
			reqx.type = 1;
			reqx.verifier = verifiedQr;
			reqx.systemName = "YukiOS";
			reqx.identityProvider = 1;
			reqx.e2eeVersion = 0;
			TauthService.loginZ(reqx,(err,success) => {
				//console.info("err=>"+err);
					//console.info(JSON.stringify(success));
				config.tokenn = success.authToken;
				config.certificate = success.certificate;
				let xdata = {
					authToken: success.authToken,
					certificate: success.certificate
				}
				callback(xdata);
			});}
			});
          });
}

function credLogin(id,password,callback){
	  const pinVerifier = new PinVerifier(id, password);
	  let provider = 1;
	  setTHttpClient(options);
	  botlib = new BotLib(Tclient,config)
	  botlib.getRSAKeyInfo(provider, (key, credentials) => {
		  authConn(()=>{
		  const rsaCrypto = pinVerifier.getRSACrypto(credentials);
		  reqx.type = 0;
	      reqx.identityProvider = provider;
		  reqx.identifier = rsaCrypto.keyname;
		  reqx.password = rsaCrypto.credentials;
		  reqx.keepLoggedIn = true;
		  reqx.accessLocation = config.ip;
		  reqx.systemName = 'YukiOS';
		  reqx.e2eeVersion = 0;
			  try{
			      TauthService.loginZ(reqx,(err,success) => {
				      if (err) {
                          console.log('\n\n');
                          console.error("=> "+err.reason);
                          process.exit();
                      }
				      options.path = config.LINE_COMMAND_PATH;
                      setTHttpClient(options);
				      authConn(()=>{
						  let pinCode = success.pinCode;
                	      console.info("\n\n=============================\nÂ×¹ÂÑ¹ÃËÑÊ¹Õé => "+success.pinCode+"\nº¹Á×Í¶×Í¢Í§¤Ø³ÀÒÂã¹ 2 ¹Ò·Õ\n=============================");
                	      botlib.checkLoginResultType(success.type, success);
						  reqx = new TTypes.LoginRequest();
						  reqx.type = 1;
						  reqx = new TTypes.LoginRequest();
		                  unirest.get('https://'+config.LINE_DOMAIN+config.LINE_CERTIFICATE_URL)
						   .headers(config.Headers)
						   .timeout(120000)
                           .end(async (res) => {
			                 reqx.type = 1;
			                 reqx.verifier = res.body.result.verifier;
	                         TauthService.loginZ(reqx,(err,success) => {
						       options.path = config.LINE_POLL_URL;
                               setTHttpClient(options);
							   config.tokenn = success.authToken;
							   console.info('> â·à¤¹: '+success.authToken);
               		           botlib.checkLoginResultType(success.type, success);
               		           callback(success);
	                         })
                           })
					 });
			      });
			  }catch(error) {
                  console.log('error');
                  console.log(error);
              }
		  })
	  })
}

function lineLogin(type = 1, callback) {
    /*
    »ÃÐàÀ·¡ÒÃà¢éÒÊÙèÃÐºº
    0 = Â×¹ÂÑ¹µÑÇµ¹
    1 = ÅÔ§¤ì QR
    2 = â·à¤¹
    */

    //ãÊè¢éÍÁÙÅ¡ÒÃÂ×¹ÂÑ¹µÃ§¹Õé (ËÒ¡¤Ø³¡ÓÅÑ§ãªé type=0)
    let email = 'aot5310@gmail.com​';
    let password = 'takumi2533';

    //ãÊèâ·à¤¹µÃ§¹Õé (ËÒ¡¤Ø³¡ÓÅÑ§ãªé type=2)
    let authToken = 'o8fD6THE8hJzaW+h7Z1URohpxg435jJNAeNsiQwTxDSsnYcvsMcpA/xQdtlOEI22IYBB8C2fJSZLCBHGRpCvpmwSR7yvuOv4EnRt0ZdtmZbAppycCjHi8QrS56S51QRw8N2GZVnC3BSSglPwCxwHhwdB04t89/1O/w1cDnyilFU=';

    switch (type) {
        case 0:
            credLogin(email, password, (res) => {
                callback(res);
            });
            break;
        case 1:
            getQrLink((qrcodeUrl, verifier) => {
                console.info('> ¡ÃØ³Òà¢éÒÊÙèÃÐºº¼èÒ¹äÅ¹ì');
                console.info('> ÅÔ§¤ì qr: ' + qrcodeUrl);
                qrcode.generate(qrcodeUrl, {
                    small: true
                });
                qrLogin(verifier, (res) => {
                    console.info('> â·à¤¹: ' + res.authToken);
                    console.info('> ÅçÍ¤ÍÔ¹àÃÕÂºÃéÍÂ');
                    options.path = config.LINE_POLL_URL;
                    setTHttpClient(options);
                    callback(res);
                })
            })
            break;
        case 2:
            config.tokenn = authToken;
            options.headers['X-Line-Access'] = authToken;
            options.path = config.LINE_POLL_URL;
            setTHttpClient(options);
            let xdata = {
                authToken: authToken
            }
            callback(xdata);
            break;
        default:
            callback('FAIL');
    }
}

//
function getSqChatList(ddata) {
    let hasiltxt = '#ÃÒÂ¡ÒÃáª·¢Í§¤Ø³\n',
        numb, rex = [];
    for (var ii = 0; ii < ddata.squares.length; ii++) {
        let namex = ddata.squares[ii].name;
        let midx = ddata.squares[ii].mid;
        botlib.getJoinableSquareChats((err, success) => {
            if (err) throw err;
            //rex[rex.length] = JSON.stringify(success);
            for (var ix = 0; ix < success.squareChats.length; ix++) {
                numb = ix + 1;
                hasiltxt += '[' + numb + ']\n';
                hasiltxt += 'ChatMid: ' + success.squareChats[ix].squareChatMid + '\n';
                hasiltxt += 'ChatName: ' + success.squareChats[ix].name + '\n';
                hasiltxt += 'SquareMid: ' + success.squareChats[ix].squareMid + '\n';
                hasiltxt += 'SquareName: ' + namex + '\n\n';
                console.info(namex)
                console.info('\n â»Ã´ÃÍ¡ÒÃºÑ¹·Ö¡¢éÍÁÙÅÊÑ¡¤ÃÙè')
            }
        },midx)
    }
    setTimeout(() => {
        fs.writeFileSync(__dirname + '/../data/squarechatlist.txt', hasiltxt, 'utf-8')
        console.info('àÃÕÂºÃéÍÂáÅéÇ!, ºÑ¹·Ö¡ä»ÂÑ§ ./data/squarechatlist.txt')
    }, 50000)
}

/*---------------------------------------------------------------------------*/

lineLogin(LOGINType, (res) => {
    if (res == 'FAIL') {
        console.info('> »ÃÐàÀ·¡ÒÃà¢éÒÊÙèÃÐººäÁè¶Ù¡µéÍ§');
        return;
    }
    options.headers['X-Line-Access'] = res.authToken;
    serviceConn('/SQS1', 'square', 'SquareService', (res) => {
		botlib = new BotLib(Tcustom.square, config);
        console.info('> à¢éÒÊÙèÃÐººÊá¤ÇÃìàÃÕÂºÃéÍÂ');
        let hasiltxt = '#ÃÒÂ¡ÒÃÊá¤ÇÃì¢Í§¤Ø³\n',
            numb;
        botlib.getJoinedSquares((err, success) => {
            if (err) throw err;
            getSqChatList(success)
            for (var i = 0; i < success.squares.length; i++) {
                numb = i + 1;
                hasiltxt += '[' + numb + ']\n';
                hasiltxt += 'Mid: ' + success.squares[i].mid + '\n';
                hasiltxt += 'Name: ' + success.squares[i].name + '\n';
                hasiltxt += 'OpenChatRoom: ' + success.statuses[success.squares[i].mid].openChatCount + '\n\n';
            }
            fs.writeFileSync(__dirname + '/../data/squarelist.txt', hasiltxt, 'utf-8')
            console.info('â»Ã´ÃÍ¡ÒÃºÑ¹·Ö¡¢éÍÁÙÅÊÑ¡¤ÃÙè.....')
        })
    })
});

process.on('uncaughtException', function(err) {
    console.info("àËÁ×Í¹¨ÐÁÕºÒ§ÊÔè§¼Ô´¾ÅÒ´ \n" + err);

});
