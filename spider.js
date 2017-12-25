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
// 搜索歌曲
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
        success: function(data){
            window.console.log("Request Success! Song: " + data.data.song.list[0].fsong);
            return 0;
        },
        error: function(){
            window.alert("Request Song Failed!");
            window.console.log("Request Song Failed!");
            return 1;
        }
    }).done(function(data){
        song_data_list = data.data.song.list[0];
        song_name = song_data_list.fsong;
        song_id = song_data_list.f.split("|")[0];
        image_id = song_data_list.f.split("|")[4];
        singer = song_data_list.fsinger + " " + song_data_list.fsinger2;
        album = "《" + song_data_list.albumName_hilight.replace(/<\/?span.*>/, "") + "》";
        if(album === "《》" || album === "《空》"){
            album = "*没有找到专辑信息*";
        }
        play_song(song_name, [song_id, image_id, singer, album]);
    });
}

// 播放歌曲
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
         transform: 'translateY(' + (dt*2) + 'px)',
         webkitTransform: 'translateY(' + (dt*2) + 'px)'
    });
    lyricBox.innerHTML = "<div>正在尝试加载歌词...</div>";

    // 这里传数据song_name, song_id给后端，从后端获得json格式数据赋给json_liked
    /*$.get(
        "liked.php",
        function(js){
            json_liked = js;
            window.console.log(js+" 1~");
        }
    );*/
    if (json_liked.liked[song_name]){
        like.innerHTML = liked;
    }
    else{
        like.innerHTML = unliked;
    }
    var txt = `http://music.qq.com/miniportal/static/lyric/${song_id % 100}/${song_id}.xml`;
    $.ajax({
        type: "post",
        url: "./proxy.php",
        data: {txt},
        async : false,
        success: function(data) {
            lyric = data.replace(/<\/?lyric.*>|<\?.*\?>|<!\[CDATA\[|\]\]>|\[\d\d:\d\d\.\d\d\] \]\]>/g, "").split("\n");
            while(lyric[lyric.length - 1] === ""){
                lyric.pop();
            }  // 有的歌词split后的末尾元素为空造成后面正则匹配出错
            //window.console.log(lyric);
            var lyricValue = [],            // 存储歌词文本
                lyricTime = [],             // 存储歌词时间
                lyricSeconds = [],          // 将时间转化为秒数
                lyricHTML = '',             // 填入lyricBox中的全部歌词<div>标签
                startlrc = 5,               // 从这个索引开始是歌词
                empty_lrc_counter = 0;
            for(var j = 0; j < 10 && j < lyric.length; j++){
                if(lyric[j].match(/\[offset:\d+\]/)){
                    startlrc = j+1;
                    break;
                }
            }
            for(var i = startlrc; i < lyric.length; i++){
                var lyricValueTmp = lyric[i].replace(/\[\d\d:\d\d\.\d\d\]/, "");
                if(lyricValueTmp === "" || lyricValueTmp === "\r" || lyricValueTmp === "\n"){
                    empty_lrc_counter++;
                }
                else{
                    var j = i - startlrc - empty_lrc_counter;
                    lyricValue.push(lyricValueTmp);
                    lyricTime.push(lyric[i].match(/\d\d:\d\d\.\d\d/)[0].split(":"));
                    lyricSeconds.push(parseInt(lyricTime[j][0]) * 60 + parseInt(lyricTime[j][1]));
                    lyricHTML += '<div data-time="' + lyricSeconds[j] + '">' + lyricValue[j] + '</div>\n';
                }
            }
            //window.console.log(lyricHTML);
            $("#lyricBox").html(lyricHTML);
            var lrc_items = $("#lyricBox").children();
            $("#lyricBox").css({
                transform: 'translateY(' + (dt*2) + 'px)',
                webkitTransform: 'translateY(' + (dt*2) + 'px)'
            });
            if (lrc_items.size < 1) {
                lyricBox.innerHTML = "<div>** 暂无歌词 **</div>";
                return;
            }
            timer(lrc_items);
        },
        fail: function(){
            $("#lyricBox").css({
                transform: 'translateY(' + (dt*2) + 'px)',
                webkitTransform: 'translateY(' + (dt*2) + 'px)'
            });
            lyricBox.innerHTML = "<div>** 暂无歌词 **</div>";
        }});
    $("#lyricBox").css({
        transform: 'translateY(' + (dt*2) + 'px)',
        webkitTransform: 'translateY(' + (dt*2) + 'px)'
    });
    if(lyricBox.innerHTML === "<div>正在尝试加载歌词...</div>" || lyricBox.innerHTML === ""){
        lyricBox.innerHTML = "<div>** 暂无歌词 **</div>";
    }
}


var interval_id;
var st = -80, dt = 40, item, counter, flag_gender = "male";
// 歌词同步
function timer(lrc_items){
    // 初始化！
    st = -2*dt;
    item = 0;
    flag_gender = "male";
    $("#lyricBox").css({
         transform: 'translateY(' + (-st) + 'px)',
         webkitTransform: 'translateY(' + (-st) + 'px)'
    });
    counter = $("#lyricBox")[0].getBoundingClientRect().top;
    function check(){
        for(var i = 0; i < lrc_items.length; i++){
            item = $(lrc_items[i]);
            if (item.data('time') === Math.ceil(music.currentTime)){
                lrc_items.removeClass('active');
                lrc_items.removeClass('active-fe');
                lrc_items.removeClass('active-both');
                lrc_items.removeClass('inactive');
                if(i > 1) $(lrc_items[i-2]).addClass('inactive');
                if(i < lrc_items.length-2) $(lrc_items[i+2]).addClass('inactive');
                if(item.text()[1] === '：' || item.text()[1] === ':'){
                    if(item.text()[0] === '女') flag_gender = 'female';
                    else if(item.text()[0] === '合') flag_gender = 'both';
                    else flag_gender = 'male';
                }
                if(flag_gender === 'male') item.addClass('active');
                else if(flag_gender === 'female') item.addClass('active-fe');
                else if(flag_gender === 'both') item.addClass('active-both');
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
    iIntervalId_in,
    iIntervalId_out;
// 显示搜索框
function ShowItem(){
    var w = search.offsetWidth,
        maxw = 92;

    function MoveOut(){
        if(w < maxw){
            search.style.width = w + "px";
            w += 2;
        }
        else{
            clearInterval(iIntervalId_out);
            search.style.display = "";
        }
    }

    iIntervalId_out = setInterval(MoveOut, 5);
    flag = true;
}
// 隐藏搜索框
function HideItem(){
    var w = search.offsetWidth;

    function MoveIn(){
        if (w > 0) {
            search.style.width = w + "px";
            w -= 2;
        }
        else {
            clearInterval(iIntervalId_in);
            search.style.display = "none";
        }
    }

    iIntervalId_in = setInterval(MoveIn, 5);
    flag = false;
}

var default_song = "Love Story"; //化身孤岛的鲸
var click_counter = 0;
search_song(default_song);  // 登录个人账户后，default_song设置为上一次离开时的音乐

var last = "";
search_btn.onclick = function(){
    this.disabled = true;
    if(flag){
        if(search.value){
            if(last !== search.value){  // 避免用户手抖
                last = search.value;
                if(search.value === song_name){
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
    }
    else {
        ShowItem();
    }
    click_counter++;
    search_btn.disabled = false;
    return false; // Prevent Default Action
};


// "我喜欢功能"
var like = document.getElementById("like");
var liked = '<i class="fa fa-heart" style="color: red; opacity: 0.8"></i>',
    unliked = '<i class="fa fa-heart-o"></i>';

var json_liked = {
    "user": "ty",
    "liked": {
        "Love Story": [639141, 54362, "Taylor Swift", "《Fearless (Platinum Edition)》"],
        "Zodiac": [5172625, 449763, "银临 Tacke竹桑", "《腐草为萤》"],
        "贝加尔湖畔": [7016921, 89254, "李健", "《依然》"],
        "童话": [101532, 8489, "光良", "《Songs Of Painting》"],
        "木棉": [106716183, 641458, "霍尊", "《天韵·霍尊》"],
        "之子于归 (独唱版)": [102807052, 1034029, "霍尊", "《华胥引 电视剧原声带》"],
        "锦鲤抄": [107812289, 1533138, "银临", "天命风流"],
        "泸沽寻梦": [5172623, 449763, "银临", "腐草为萤"],
        "一次就好": [104783753, 1182135, "杨宗纬", "《夏洛特烦恼 电影原声带》"],
        "车站 (Live)": [102350727, 980035, "李健", "《我是歌手 2015巅峰会》"],
        "假如爱有天意": [105670451, 1061065, "李健", "《李健》"],
        "身骑白马": [4785876, 425350, "徐佳莹", "《K情歌9》"],
        "爱就一个字": [1505470, 121495, "张信哲", "《从开始到现在》"],
        "等待黎明": [103184206, 1067217, "李健", "*没有找到专辑信息*"],
        "化身孤岛的鲸": [101806738, 930150, "周深", "*没有找到专辑信息*"],
        "想你的三百六十五天": [105580320, 1282842, "李玟", "《宝莲灯 电影原声音乐》"],
        "深海之寻": [105670442, 1061065, "李健", "《李健》"],
        "小幸运 (Live)": [200281166, 1799594, "田馥甄", "《浙江卫视领跑2017爱在一起演唱会》"],
        "时间都去哪儿了": [7079766, 110484, "王铮亮", "《听得到的》"],
        "成都": [108963136, 1666157, "赵雷", "《无法长大》"],
        "平凡之路 (Live)": [200281279, 1799594, "朴树", "《浙江卫视领跑2017爱在一起演唱会》"],
        "在水一方 (Live)": [102053189, 951206, "李健", "《我是歌手第三季 第5期》"],
        "The Truth That You Leave (钢琴曲)": [4793649, 426069, "高至豪", "《A best》"],
        "Atlantis love": [200589023, 929886, "V.K克", "《Deemo》"],
        "Pure White": [200589038, 929886, "V.K克", "*没有找到专辑信息*"],
        "等不到的爱": [856889, 73190, "文章", "《裸婚时代 电视剧原声带》"],
        "The Dawn": [876988, 34784, "Dreamtale", "《Beyond Reality》"],
        "Bad Apple!!": [106256359, 8623, "初音ミク", "*没有找到专辑信息*"],
        "Wings Of Piano": [101803994, 929886, "V.K克", "《Deemo》"],
        "倾心相许": [7235331, 14849, "李彩桦 罗嘉良", "《人造雨》"],
        "手掌心": [4988895, 431765, "丁当", "《兰陵王 电视剧原声带》"],
        "again (アニメ Version)": [102214175, 966296, "YUI", "《鋼の錬金術師 FULLMETAL ALCHEMIST Original Soundtrack 1》"],
        "暗香": [108879606, 1644978, "沙宝亮", "*没有找到专辑信息*"],
        "LET IT OUT": [631047, 53637, "福原美穂", "*没有找到专辑信息*"],
        "Butter-Fly": [103178866, 1066602, "和田光司", "《デジモンアドベンチャー·シングルヒットパレード》"],
        "I wish": [103178398, 1066541, "AiM", "《デジモンアドベンチャー キュートビートクラブ》"],
        "Mirror Night": [101803992, 929886, "V.K克", "《Deemo》"],
        "美若黎明": [105670443, 1061065, "李健", "《李健》"],
        "情歌王": [105163519, 34069, "古巨基", "《劲歌金曲2：》"],
        "北京一夜 (Live)": [201020918, 1884793, "信乐团", "《精彩音乐汇》"],
        "南山南": [5057872, 444153, "马頔", "《往复随安》"],
        "向往": [155116, 13722, "李健", "《为你而来》"],
        "风吹麦浪 (Live)": [4748119, 421722, "李健 孙俪", "《2013央视春晚》"],
        "梦一场": [448332, 36511, "李健", "《遥远的天空底下》"],
        "传奇 (2013版)": [8147979, 430428, "李健", "《拾光》"],
        "三生三世十里桃花": [203359526, 2177260, "那英", "*没有找到专辑信息*"],
        "美丽的神话": [97162, 8170, "孙楠 韩红", "《忘不了你》"],
        "只要有你": [4984656, 124433, "那英 孙楠", "《电视剧原声带》"],
        "Lydia": [233555, 20322, "飞儿乐团", "《F.I.R.乐团》"],
        "secret base ~君がくれたもの~ (10 years after Ver.)": [5007162, 436493, "茅野愛衣 戸松遥", "《～君がくれたもの～》"],
        "星の在り処 (Full Ver)": [621323, 52650, "う～み", "《英雄伝説 空の軌跡 オリジナルサウンドトラック》"],
        "残酷な天使のテーゼ (Director's Edit. Version|Instrumental)": [102796190, 1032851, "高橋洋子", "《 / FLY ME TO THE MOON》"],
        "老男孩": [1067128, 90932, "筷子兄弟", "《父亲》"],
        "那些年": [4830481, 96428, "胡夏", "《燃点》"],
        "Evolution Era": [200589028, 929886, "V.K克", "《Deemo》"],
        "Let It Go": [5477052, 502740, "Demi Lovato", "*没有找到专辑信息*"],
        "黑暗森林": [202222172, 8623, "云翼星辰", "*没有找到专辑信息*"],
        "伊人如梦": [104923727, 1197421, "霍尊", "《伊人如梦》"],
        "Opera 2": [4832478, 31315, "Vitas", "《Tancevalniy Marafon》"],
        "九九八十一": [106350845, 1373520, "双笙 易言", "《笙声不息》"],
        "醉赤壁": [105388642, 36160, "林俊杰", "《JJ陆》"],
        "Moves Like Jagger": [1508669, 121472, "Maroon 5 Christina Aguilera", "《Overexposed (Deluxe)》"]
    }
};

like.onclick = function(){
    /*var data = {"act": 1, "song_name": song_name, "song_list": [song_id, image_id, singer, album]};*/
    if(like.innerHTML === unliked){
        like.innerHTML = liked;
        // 将歌曲id写入liked_id.txt，当启用非单曲播放模式时直接载入歌曲。暂时考虑用在flask框架中ajax向后台发请求，完成数据的改写
        /*$.post(
            "liked.php",
            {data},
            function(js){window.console.log(song_name+" 已添加至'我喜欢'歌单中");}
        );*/
        json_liked.liked[song_name] = [song_id, image_id, singer, album];    // 在这里直接加个json文件不就好了
        // 向服务器端发送新的请求用上传的参数覆盖json_like之前的
    }
    else{
        like.innerHTML = unliked;
        /*data["act"] = -1;
        $.post(
            "liked.php",
            {data},
            function(js){window.console.log(song_name+" 已从'我喜欢'歌单中删除");}
        );*/
        delete json_liked.liked[song_name];    // 将歌曲id从liked_id.txt中删除
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
    else if(mode.innerHTML === order){
        mode.innerHTML = random;
    }
    else{
        mode.innerHTML = single;
        music.loop = true;
    }
};


var cut = document.getElementById("cut");
var cut_flag = false;
// 切歌
cut.onclick = function(){
    cut_flag = true;
    $("#lyricBox").css({
         transform: 'translateY(' + (-st) + 'px)',
         webkitTransform: 'translateY(' + (-st) + 'px)'
    });
    Next();
};


var next = '',          // 下一首
    idx = 0,
    flag_song = false;
var iInterval;
// 在顺序播放和随机播放模式下的下一首音乐确定
function Next(){
    if(music.ended || cut_flag){
    /*$.get(
        "liked.php",
        function(js){
            json_liked = js;
            window.console.log(js+" 2~");
        }
    );*/
        last = search.value;
        if(json_liked.liked === {}){  // 避免空的歌单造成bug
            play_song(song_name, [song_id, image_id, singer, album]);
            return;
        }
        if(mode.innerHTML === order){
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
        if(mode.innerHTML === random){
            var arr = [];
            for(var key2 in json_liked.liked){
                arr.push(key2);
            }
            next = arr[Math.floor(arr.length*Math.random())];
            song_name = next;   // 更新song_name的对应歌曲
            play_song(next, json_liked.liked[next]);
        }
        cut_flag = false;
    }
}
iInterval = setInterval(Next, 1000);
