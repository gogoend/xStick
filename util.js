"use strict";
//范围内随机数产生器
var util = {
    //字符串乱序（类似php同名函数）
    strShuffle: function(str){
        var strArray=str.split('');//拆分字符串到数组
        var strResultArray=[];//保存乱序结果
        var length=strArray.length;
        for(var i=0;i<length;i++){
            //index为原数组索引，根据该随机生成的索引从原数组中访问元素
            var index=util.rand(0,strArray.length-1,true);
            //访问到的元素压入保存乱序结果的数组中
            strResultArray[i]=strArray[index];
            //位于索引index处的数组元素已被压入结果数组中，将其删除，并继续循环
            strArray.splice(index,1)
        }
        return strResultArray.join('');
    },
    //范围内取随机数
    rand: function (min, max, ifInt) {
        if (ifInt == true) {
            return Math.floor(Math.random() * (max - min) + min);
        } else {
            return Math.random() * (max - min) + min;
        }
    },
    //UUID生成器
    uuid: function () {
        var charPool = '0123456789abcdef';
        var finalUuid = '';
        var pointer;
        for (var i = 0; i < 32; i++) {
            //pointer为字符池的索引，即从字符第pointer个元素取一个字符串
            pointer = util.rand(0, charPool.length, true);
            finalUuid += charPool.charAt(pointer);
            if(finalUuid.length==8||finalUuid.length==13||finalUuid.length==18||finalUuid.length==23){
                finalUuid+='-';
            }
        }
        return finalUuid;
    },

    //获得节点已算出的样式
    getStyle: function (node) {
        return window.getComputedStyle(node, false);
    },

    //勾股定理
    gougu: function (a, b) {
        return Math.sqrt(a * a + b * b);
    },

    //矩阵相乘
    matrixMuitply: function (m1, m2) {
        // console.log(m1);
        // console.log(m2);
        if (m1.length !== m2.length) {
            return NaN;
        }
        if (m1.length === 9 && m2.length === 9) {
            /*
                0,1,2,      
            m = 3,4,5,      
                6,7,8       
            */
            var m = [];
            m[0] = m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6]; m[1] = m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7]; m[2] = m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8];
            m[3] = m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6]; m[4] = m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7]; m[5] = m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8];
            m[6] = m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6]; m[7] = m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7]; m[8] = m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8];
            return m;
        } else if (m1.length === 16 && m2.length === 16) {
            /*
                0 , 1 , 2 , 3 ,
            m = 4 , 5 , 6 , 7 ,
                8 , 9 , 10, 11,
                12, 13, 14, 15 
            */
            var m = [];
            m[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12]; m[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13]; m[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14]; m[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];
            m[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12]; m[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13]; m[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14]; m[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];
            m[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12]; m[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13]; m[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14]; m[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];
            m[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12]; m[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13]; m[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14]; m[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

            return m;
        }
    },

    //初始矩阵
    originMatrix3: Object.freeze([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]),

    originMatrix4: Object.freeze([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]),

    //解析从computedStyle获得transform matrix
    parseTransformMatrix: function (cssTransformText) {
        //matrix(0,1,3,4,6,7)
        //cssTransformText = 'matrix(0,1,3,4,6,7)';
        if (cssTransformText.match('matrix') && !cssTransformText.match('matrix3d')) {
            //console.log('2D变换');
            var arr = cssTransformText.replace('matrix', '').replace('(', '').replace(')', '').replace(' ', '').split(',');
            var res = util.originMatrix3.concat();//初始化无变换矩阵，深拷贝数组，而非引用原数组
            res[0] = parseFloat(arr[0]);
            res[1] = parseFloat(arr[1]);
            res[3] = parseFloat(arr[2]);
            res[4] = parseFloat(arr[3]);
            res[6] = parseFloat(arr[4]);
            res[7] = parseFloat(arr[5]);
            return res;
        } else if (cssTransformText.match('matrix') && cssTransformText.match('matrix3d')) {
            //console.log('3D变换');
            var arr = cssTransformText.replace('matrix3d', '').replace('(', '').replace(')', '').replace(' ', '').split(',');
            var res = arr;
            return res;
        } else if (cssTransformText.match('none')) {
            // console.log('没有变换');
            return util.originMatrix4;
        } else {
            //console.log('CSS Transform matrix不合法')
            return false;
        }
    },
    //用于计算当拖动超出范围时手柄的锁定坐标（来自nipplejs）
    findLockedCoord: function (position, distance, radius) {
        var b = [];
        b.x = /*position.x - */distance * Math.cos(radius);
        b.y =/*position.y - */distance * Math.sin(radius);
        //console.log(position.x+' '+position.y+'  '+distance * Math.cos(radius)+' '+distance * Math.sin(radius));
        return b;
    },
    //

    //角度转弧度
    degToRad: function (deg) {
        var rad = (Math.PI / 180) * deg;
        return rad;
    },
    //弧度转角度
    radToDeg: function (rad) {
        var deg = rad * (180 / Math.PI);
        return deg;
    },

    //数值范围限制，参考自THREEJS
    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max,value));
    },

    //序列化查询参数
    /*
        支持以 ? 或 # 进行分割的参数，
        若URL没有传入则默认为当前的页面地址栏URL
        URL形如https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=0&rsv_idx=1&tn=baidu&wd=%E9%9F%A9%E9%94%B4%E6%8D%B7，
        返回：
        result={
            f: "8"
            ie: "utf-8"
            rsv_bp: "0"
            rsv_idx: "1"
            tn: "baidu"
            wd: "%E9%9F%A9%E9%94%B4%E6%8D%B7"
        }
    */
    serializeURLQuery: function (url, type) {
        //确定是以?还是以#来分割URL
        switch (type) {
            case "hash":
            case "#": {
                var firstChar = /^#/;
                var spliter = "#";
                break;
            }

            case "search":
            case "?":
            case undefined:
            default:
                {
                    var firstChar = /^\?/;
                    var spliter = "?";
                    break;
                }
        }

        //判断URL是否被定义，如果没有定义则为当前页面URL
        switch (url) {
            case undefined:
            case 0: {
                url = location.href;
                break;
            }
            default:
                {
                    url = url;
                    break;
                }
        }

        // var foreURL=location.origin+location.pathname;
        //URL前面部分
        var foreURL = url.split(spliter)[0];

        //URL中的查询语句：从URL中去掉URL前面部分和分隔符（#或?）
        var queryString = url.replace(foreURL, "").replace(firstChar, "");

        //使用&分隔参数
        var queryArray = queryString.split('&');

        var keys = [], values = [];
        var paramObjs = {}, paramArray = [];
        var paramObj = {};

        for (var i = 0; i <= queryArray.length - 1; i++) {

            //尝试用key-value数组生成一一对应的对象
            keys[i] = queryArray[i].split("=")[0];
            values[i] = queryArray[i].split("=")[1];

            //为对象分配key-value对
            //没法重复定义同一个key
            Object.defineProperty(paramObj, keys[i], {
                value: values[i]
            })

            //索引数组
            // paramObj[keys[i]]=values[i];
            //数组push
            paramArray.push(paramObj);

            paramObjs = paramArray[i];

            //失败了。。。
            //console.log(Object.assign(paramObjs , paramArray[i] ));

        }

        // console.log(paramArray);

        return paramObjs;

    },
    //计算两个地理坐标（经纬度）间的距离
    geoLength:function(origin,target){
        var earthRadius=6371393;//地球半径，单位：米

        var oLatRad=util.degToRad(origin.lat),
            tLatRad=util.degToRad(target.lat);

        var lngMinus=Math.abs(target.lng-origin.lng)>180 ? 360-Math.abs(target.lng-origin.lng) : Math.abs(target.lng-origin.lng)
        
        var lngMinusRad=util.degToRad(lngMinus);
        //Question：angle指的是什么。。。
        var angle=Math.sin(oLatRad)*Math.sin(tLatRad)+Math.cos(oLatRad)*Math.cos(tLatRad)*Math.cos(lngMinusRad);
        var length=Math.acos(angle)*earthRadius;
        //精确到两位小数
        return parseFloat(length.toFixed(2));
    },
    //计算经纬度之间的偏转角（大致计算，相对于将地球看成平面；仅用于计算中国大陆范围内的经纬度：East、North为正）
    geoAngle:function(origin,target){

        //来自https://stackoverflow.com/questions/3932502/calculate-angle-between-two-latitude-longitude-points/53063704#53063704
        var p1 = {
            x: origin.lat,
            y: origin.lng
        };
    
        var p2 = {
            x: target.lat,
            y: target.lng
        };
        // angle in radians
        var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // angle in degrees
        var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        // console.log(angleDeg);
        return angleDeg;

        /*2--------------------------------------
        var oLat=origin.lat,
            tLat=target.lat,
            oLng=origin.lng,
            tLng=target.lng;
        //什么鬼？
        var cosAngleC=Math.cos(90-tLat)*Math.cos(90-oLat)+Math.sin(90-tLat)*Math.sin(90-oLat)*Math.cos(tLng-oLng);
        Math.asin(
            Math.sin(90-tLat)*Math.sin(tLng-oLng)/cosAngleC
        )
        ----------------------------------------*/
       
        /*1--------------------------------------
        var minusLat=util.geoLength({
            lat:target.lat,
            lng:0
        },{
            lat:origin.lat,
            lng:0
        });

        //没用用到经度差。
        // var minusLng=util.geoLength({
        //     lat:0,
        //     lng:target.lat
        // },{
        //     lat:0,
        //     lng:origin.lat
        // });

        var length=util.geoLength(origin,target);

        return util.radToDeg(Math.asin(minusLat/length));

        ----------------------------------------*/


    }
}
// export {util};