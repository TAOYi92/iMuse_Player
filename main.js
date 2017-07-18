/**
 * Created by yitao on 2017/7/12.
 */
var fs = require('fs');
var http = require('http');
var json = "./data/liked_data.json";
var json_liked = JSON.parse(fs.readFileSync(json));

modify_json(post_json){
    console.log("Request received.");
}

