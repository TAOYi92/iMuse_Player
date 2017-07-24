<?php
/*
 * @author: yitao <taoy15@mails.tsinghua.edu.com>
 */
//判断文件是否存在
if(!file_exists("data/liked_data.json")){
    echo "文件不存在";
}
$filename = "data/liked_data.json";

//获取文件内容
$js = file_get_contents($filename);
$js = json_decode($js, true);
$data = $_POST["data"];
if($data){
    if($data["act"] == -1){
        array_splice($js, "liked", 1);
    }
    else{
        file_put_contents($js["liked"][$data["song_name"]] = $data["song_list"]);
    }
}
echo $js;
?>