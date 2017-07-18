/**
 * Created by yitao on 2017/7/3.
 */
// HTML tag variables  标签元素变量
var music = document.getElementById("music"),
    ctrl = document.getElementById("audioControl"),
    cd = document.getElementById("cd");
// HTML string constants  标签常量字符串
var play_i = '<i class="fa fa-play"></i>',
    pause_i = '<i class="fa fa-pause"></i>';
// Other JS variables  其他变量
var click_counter = 0;  // counter user have clicked on play-icon  点击"播放/暂停"的次数

music.volume = 0.3;  // set volume  设置播放音量  0~1

// Control the play/pause state due to click  控制点击图标而导致的播放/暂停操作
ctrl.onclick = function(){
    if(++click_counter < 2){
        ctrl.innerHTML = pause_i;
    }

    if(ctrl.innerHTML === pause_i){
        music.pause();                          // Update the Audio
        ctrl.innerHTML = play_i;                // Update the Icon (Button)
        cd.style.animationPlayState = "paused"; // Update the CD-Image
        ;                                       // Update the Lyrics
    }
    else{
        music.play();
        ctrl.innerHTML = pause_i;
        cd.style.animationPlayState = "running";
        ;
    }

    return false; // Prevent Default Action
};
