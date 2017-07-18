/**
 * Created by yitao on 2017/7/6.
 */
// 判断是电脑端还是手机端
function platform() {
    //平台、设备和操作系统
    var system = {
        win : false,
        mac : false,
        xll : false
    };
    // 检测平台
    var p = navigator.platform;
    system.win = p.indexOf("Win") === 0;
    system.mac = p.indexOf("Mac") === 0;
    system.x11 = ((p === "X11") || (p.indexOf("Linux"))) === 0;
    // 跳转语句，如果是手机访问则更换为适配大小的背景图片
    if(system.win || system.mac || system.xll){
        //document.body.style.backgroundImage = "url(http://img3.iqilu.com/data/attachment/forum/201308/21/170704bbqga1b5bz5lwt0f.jpg)";
        console.log("platform: pc");
    }
    else{
        document.body.style.backgroundImage = "url(http://www.51mtw.com/UploadFiles/2011-06/admin/2011062221284782995.jpg)";
        console.log("platform: mobile");
    }
}

$(document).ready(function() {
    platform();
});