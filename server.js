var http = require('http'),
    fs = require('fs'),
    url = require('url'),
    superagent=require("superagent"),
    cheerio=require("cheerio"),
    async=require("async"),
    eventproxy=require("eventproxy");

var ep = new eventproxy();
var websiteUrl="http://qq.yh31.com";
var pageUrl="http://qq.yh31.com/zjbq/0551964.html";

//获取图片id
var number=1;
function getNumber(){
    return ++number;
}

// Create a server
http.createServer( function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});

    ep.after('KingImages',20,function(imgUrls){
        async.mapLimit(imgUrls,100,function(url,callback){
            http.get(url,function(res1){
                var imgData="";
                res1.setEncoding("binary");
                res1.on("data",function(chunk){
                    imgData+=chunk;
                });
                res1.on("end",function(){
                    var date=new Date().getTime();
                    var format=['.jpg','.png','.PNG','gif'];
                    fs.writeFile("./images/image"+getNumber()+(url.indexOf(".gif")==-1?".jpg":".gif"),imgData,"binary",function(err){
                        if(err){
                            console.log("failed:img:"+err);
                        }
                        console.log("success:img<"+getNumber()+">"+url);
                    });
                });
            })
        },function(err,result){
            console.log("all is fetched");
        });
    });
    superagent.get(pageUrl)
        .end(function(err,pres){
            console.log('fetch:'+pageUrl+'successful');
            res.write('fetch:'+pageUrl+' successful<br/>');
            if(err){
                console.log(err);
            }
            var $=cheerio.load(pres.text);
            var images=$(".c_content_overflow img");
            var imgUrl;
            for(var i=0;i<images.length;i++){
                res.write('img'+(i+1)+':'+images.eq(i).attr("src")+"<br/>");
                imgUrl=websiteUrl + images.eq(i).attr("src");
                ep.emit('KingImages',imgUrl);
            }
            console.log("fetch done!");
            res.write('fetch done!');
        })
}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');