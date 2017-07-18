/**
 * Created by yitao on 2017/7/5.
 */
var url = "http://s.music.qq.com/fcgi-bin/music_search_new_platform";
var params = {
    "t": 0,
    "n": 1,  // 每页多少个结果
    "aggr": 1,
    "cr": 1,
    "loginUin": 0,
    "format": "jsonp",
    "inCharset": "GB2312",
    "outCharset": "utf-8",
    "notice": 0,
    "platform": "jqminiframe.json",
    "needNewCode": 0,
    "p": 1,
    "catZhida": 0,
    "remoteplace": "sizer.newclient.next_song",
    "w": "红豆" // 歌曲或歌手
};

var song_data_list = "",
    song_name = "歌曲名称",
    song_id = -1,
    image_id = -1,
    image_width = 300,
    image_width2 = 500,
    singer = "演唱",
    album = "所属专辑",
    lyric = "";

var songUrl = "",
    imgUrl = "",
    imgUrlbg = "";

var music = document.getElementById("music"),
    ctrl = document.getElementById("audioControl"),  // 每次切歌时要变回暂停
    bg = document.getElementById("bg"),
    cd = document.getElementById("cd"),
    info = document.getElementById("info"),
    search = document.getElementById("search-input"),
    search_btn = document.getElementById("search-btn"),
    lyricBox = document.getElementById("lyricBox");

var pause_i = '<i class="fa fa-pause"></i>';

function search_song(song){
    if(song){
        params.w = song;  // Update the song name parameter
    }

    $.ajax({
        url: url,
        type: "GET",
        data: params,
        dataType: "jsonp",
        cache: true,
        jsonp: false,
        jsonpCallback: "callback",
        success: function (data) {
            window.console.log("Request Success! Song: " + data.data.song.list[0].fsong);
            return 0;
        },
        error: function () {
            window.alert("Request Song Failed!");
            window.console.log("Request Song Failed!");
            return 1;
        }
    }).done(function (data) {
        song_data_list = data.data.song.list[0];
        song_name = song_data_list.fsong;
        song_id = song_data_list.f.split("|")[0];
        image_id = song_data_list.f.split("|")[4];
        singer = song_data_list.fsinger + " " + song_data_list.fsinger2;
        album = "《" + song_data_list.albumName_hilight.replace(/<\/?span.*>/, "") + "》";
        if(album === "《》"){
            album = "*没有找到专辑信息*";
        }
        play_song(song_name, [song_id, image_id, singer, album]);
    });
}


function play_song(song_name, [song_id, image_id, singer, album]){
    clearInterval(interval_id);  // 在新歌词载入前停止歌词动画
    window.console.log(song_name + " " + song_id + " " + image_id + " " + singer + " " + album);
    songUrl = `http://ws.stream.qqmusic.qq.com/${song_id}.m4a?fromtag=46`;
    imgUrl = `http://imgcache.qq.com/music/photo/album_${image_width}/${image_id % 100}/${image_width}_albumpic_${image_id}_0.jpg`;
    //imgUrlbg = `http://imgcache.qq.com/music/photo/album_${image_width2}/${image_id%100}/${image_width2}_albumpic_${image_id}_0.jpg`;

    music.src = songUrl;                                    // 播放新地址下的音乐
    ctrl.innerHTML = pause_i;                               // 初始化播放/暂停图标：暂停标志
    bg.style.backgroundImage = `url(${imgUrl})`;            // 更新界面背景图片
    cd.style.backgroundImage = `url(${imgUrl})`;            // 更新cd背景图片
    cd.style.animationPlayState = "running";                // 初始化转盘动画：转动
    info.innerText = `\n${song_name} - ${singer}\n${album}`;// 更新音乐信息文本
    search.value = song_name;                               // 将用户的搜索文本换成搜索到的音乐名称

    $("#lyricBox").css({
         transform: 'translateY(0px)',
         webkitTransform: 'translateY(0px)'
    });
    lyricBox.innerHTML = "<div>正在尝试加载歌词...</div>";

    // 这里传数据song_name, song_id给后端，从后端获得json格式数据赋给json_liked
    if (json_liked.liked[song_name]){
        like.innerHTML = liked;
    }
    else{
        like.innerHTML = unliked;
    }
    var txt = `http://music.qq.com/miniportal/static/lyric/${song_id % 100}/${song_id}.xml`;
    $.ajax({
        type: "post",
        url: "./proxy.php",   // 这一块考虑直接改用$.ajax做同步请求
        data: {txt},
        async : false,
        success: function(data) {
            lyric = data.replace(/<\/?lyric.*>|<\?.*\?>|<!\[CDATA\[|\]\]>|\[\d\d:\d\d\.\d\d\] \]\]>/g, "").split("\n");
            if (lyric[lyric.length - 1] === "") lyric.pop();  // 有的歌词split后的末尾元素为空造成后面正则匹配出错
            var lyricValue = [],            // 存储歌词文本
                lyricTime = [],             // 存储歌词时间
                lyricSeconds = [],          // 将时间转化为秒数
                lyricHTML = '';             // 填入lyricBox中的全部歌词<div>标签
            for (var i = 5; i < lyric.length; i++) {
                lyricValue.push(lyric[i].replace(/\[\d\d:\d\d\.\d\d\]/, ""));
                if (lyricValue[i - 5] === "") {
                    lyric[i] += "- -";
                    lyricValue[i - 5] = "- -";  // 应该改为依赖时间间隔插入分界符
                }
                lyricTime.push(lyric[i].match(/\d\d:\d\d\.\d\d/)[0].split(":"));
                lyricSeconds.push(parseInt(lyricTime[i - 5][0]) * 60 + parseInt(lyricTime[i - 5][1]));
                lyricHTML += '<div data-time="' + lyricSeconds[i - 5] + '">' + lyricValue[i - 5] + '</div>';
            }
            $("#lyricBox").html(lyricHTML);
            var lrc_items = $("#lyricBox").children();
            if (lrc_items.size < 1) {
                return;
            }
            timer(lrc_items);
        },
        fail: function () {
            $("#lyricBox").css({
                transform: 'translateY(0px)',
                webkitTransform: 'translateY(0px)'
            });
            lyricBox.innerHTML = "<div>** 暂无歌词 **</div>";
        }});
    if(lyricBox.innerHTML === "<div>正在尝试加载歌词...</div>"){
        $("#lyricBox").css({
            transform: 'translateY(0px)',
            webkitTransform: 'translateY(0px)'
        });
        lyricBox.innerHTML = "<div>** 暂无歌词 **</div>";
    }
}


var interval_id;
var st = 0, dt = 40, item, counter;
// 歌词同步
function timer(lrc_items){
    // 初始化！
    st = -2*dt;
    item = 0;
    $("#lyricBox").css({
         transform: 'translateY(' + (-st) + 'px)',
         webkitTransform: 'translateY(' + (-st) + 'px)'
    });
    counter = $("#lyricBox")[0].getBoundingClientRect().top;
    function check(){
        for(var i = 0; i < lrc_items.length; i++){
            item = $(lrc_items[i]);
            if (item.data('time') === Math.floor(music.currentTime)){
                lrc_items.removeClass('active');
                lrc_items.removeClass('inactive');
                if(i > 1) $(lrc_items[i-2]).addClass('inactive');
                if(i < lrc_items.length-2) $(lrc_items[i+2]).addClass('inactive');
                window.console.log(i);
                item.addClass('active');
                dt = item[0].getBoundingClientRect().top - counter; // 右边 = 40；
                st += dt;
                $("#lyricBox").css({
                    transform: 'translateY(' + (-st) + 'px)',
                    webkitTransform: 'translateY(' + (-st) + 'px)'
                });
            }
        }
    }
    interval_id = setInterval(check, 1000);
}


var flag = true,
    iIntervalId;
// 显示搜索框
function ShowItem() {
    var w = search.offsetWidth,
        maxw = 92;

    function MoveOut() {
        if (w < maxw) {
            search.style.width = w + "px";
            w += 2;
        }
        else {
            clearInterval(iIntervalId);
            search.style.display = "";
        }
    }

    iIntervalId = setInterval(MoveOut, 5);
    flag = true;
}
// 隐藏搜索框
function HideItem() {
    var w = search.offsetWidth;

    function MoveIn() {
        if (w > 0) {
            search.style.width = w + "px";
            w -= 2;
        }
        else {
            clearInterval(iIntervalId);
            search.style.display = "none";
        }
    }

    iIntervalId = setInterval(MoveIn, 5);
    flag = false;
}

var default_song = "Love Story"; //化身孤岛的鲸
var click_counter = 0;
search_song(default_song);

var last = "";
search_btn.onclick = function () {
    this.disabled = true;
    if (flag) {
        if (search.value) {
            if (last !== search.value) {  // 避免用户手抖
                last = search.value;
                if (++click_counter < 2 && search.value === default_song) {
                    HideItem();
                    search_btn.disabled = false;
                    return;
                }
                else{
                    search_song(search.value);
                }
            }
        }
        HideItem();
        //search.style.display = "none";  // 隐藏搜索栏（无动画已弃用）
    }
    else {
        ShowItem();
        //search.style.display = "";      // 显示搜索栏（无动画已弃用）
    }
    click_counter++;
    search_btn.disabled = false;
};


// "我喜欢功能"
var like = document.getElementById("like");
var liked = '<i class="fa fa-heart" style="color: red; opacity: 0.8"></i>',
    unliked = '<i class="fa fa-heart-o"></i>';

var json_liked = {"user": "ty", "liked": {}};
var like_num = 0;

like.onclick = function(){
    if(like.innerHTML === unliked){
        like.innerHTML = liked;
        // 将歌曲id写入liked_id.txt，当启用非单曲播放模式时直接载入歌曲。暂时考虑用在flask框架中ajax向后台发请求，完成数据的改写
        json_liked.liked[song_name] = [song_id, image_id, singer, album];    // 在这里直接加个json文件不就好了
        // 向服务器端发送新的请求用上传的参数覆盖json_like之前的
        //$.post("/liked", json_liked);
        //fs.writeFile("./data/", JSON.stringify(json, json_liked, 4));
        like_num++;
    }
    else{
        like.innerHTML = unliked;
        delete json_liked.liked[song_name];    // 将歌曲id从liked_id.txt中删除
        //fs.writeFile("./data/", JSON.stringify(json, json_liked, 4));
        like_num--;
    }
};

var mode = document.getElementById("mode");
var single = '<i class="fa fa-retweet"></i>',
    order = '<i class="fa fa-long-arrow-right"></i>',
    random = '<i class="fa fa-random"></i>';

mode.onclick = function(){
    if(mode.innerHTML === single){
        mode.innerHTML = order;
        music.loop = false;
    }
    else if(mode.innerHTML === order) {
        mode.innerHTML = random;
    }
    else{
        mode.innerHTML = single;
        music.loop = true;
    }
};


var next = '',          // 下一首
    idx = 0,
    flag_song = false;
var iInterval;
// 在顺序播放和随机播放模式下的下一首音乐确定
function Next(){
    if(json_liked.liked === {}){  // 避免空的歌单造成bug
        play_song(song_name, [song_id, image_id, singer, album]);
        return;
    }
    if(mode.innerHTML === order){
        if(music.ended){
            idx = 0;
            flag_song = false;
            for(var key in json_liked.liked){
                if(idx === 0){
                    next = key;
                }
                if(flag_song){
                    next = key;
                    flag_song = false;
                }
                if(key === song_name){
                    flag_song = true;
                }
                idx++;
            }
            song_name = next;   // 更新song_name的对应歌曲
            play_song(next, json_liked.liked[next]);
        }
    }
    if(mode.innerHTML === random){
        if(music.ended){
            var arr = [];
            for(var key2 in json_liked.liked){
                arr.push(key2);
            }
            next = arr[Math.floor(arr.length*Math.random())];
            play_song(next, json_liked.liked[next]);
        }
    }
}
iInterval = setInterval(Next, 2000);