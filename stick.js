"use strict";
// import util from 'util';

//stick初始化、构造函数
var Stick = function (conf) {
    var _this = this;

    //保存配置
    if (conf) { _this.conf = conf; } else { console.error('配置错误'); return false }

    //变换目标

    if (!conf.target || !conf.target instanceof Element || !THREE || !conf.target instanceof THREE.Object3D) {
        console.error('没有对象被选中，或该对象不受支持');
        return false;
    } else {
        _this.target = conf.target;
    }
    _this.type = conf.type;

    //手柄大小
    _this.zoneSize = conf.zoneSize;
    _this.stickSize = conf.stickSize;


    var theStick = _this.buildEl(conf);
    _this.zone = theStick.zone;
    _this.stick = theStick.stick;

    //动态算出手柄起始位置
    _this.originX = parseInt(_this.stick.style.left);
    _this.originY = parseInt(_this.stick.style.top);

    //ES6模板字符串
    console.log(`起始x：${_this.originX}，起始y：${_this.originY}`)

    _this.eventTodo();


    //处理相机

    if (conf.cameraObject && this.conf.type === "droneRCRight") {
        _this.cameraRawVector=new THREE.Vector3();
        conf.cameraObject.getWorldDirection(_this.cameraRawVector);
    }

    //记录各项配置
    _this.result = {
        stickLeft: null,
        stickTop: null,                               //用于计算stick样式
        stickOffsetLeft: 0,
        stickOffsetTop: 0,                            //获得stick相对于zone中心的x,y偏移量
        distance: 0,                                  //获得stick相对于zone中心的距离
        force: 0,                                     //当stick移动超出zone时，移出以后stick
        rad: 0,
        deg: 0,                                       //获得stick相对于zone中心的旋转度数
        lockedPos: [],                                //当stick移动超出zone时，获得stick在边缘锁定的位置
        matrices: {
            rawPositionMatrix: null,                   //移到原点矩阵
            rawPositionMatrix0: null,                  //移回原位矩阵
            rawMatrix: null,                           //原始矩阵
            translateMatrix: util.originMatrix4.concat(),                     //位移矩阵
            rotateMatrix: util.originMatrix4.concat(),                        //旋转矩阵
            transformMatrix: null,                    //变换矩阵
        }
    };

    console.log(_this.result.matrices)
    console.log(_this);

    return _this;
}

//计算方向
Stick.prototype.getDirection = function (e) {
    var result = this.result;

    //判断是否为触摸事件
    if (e.type.match('touch') !== null) { console.log('触摸事件'); e = e.touches[e.touches.length - 1] }

    /*
    touchstart  
    touches[].target
    */

    // console.log(this);
    result.stickLeft = e.clientX - parseInt(util.getStyle(this.zone).left) - 0.5 * parseInt(util.getStyle(this.stick).width);// inner.style.left
    result.stickTop = e.clientY - parseInt(util.getStyle(this.zone).top) - 0.5 * parseInt(util.getStyle(this.stick).height);// inner.style.top

    result.stickOffsetLeft = result.stickLeft - this.originX;
    result.stickOffsetTop = result.stickTop - this.originY;

    //手柄的偏移量、偏移角度
    result.distance = util.gougu(result.stickOffsetLeft, result.stickOffsetTop);
    result.force = result.distance;
    result.rad = Math.atan2(result.stickOffsetTop, result.stickOffsetLeft);
    result.deg = result.rad * (180 / Math.PI);
    var lockedDistanceOffset = (parseInt(util.getStyle(this.zone).height) / 2 - parseInt(util.getStyle(this.stick).height) / 2);

    //处理偏移量超过外容器边界的情况，超出时锁定内部手柄到定界框边沿
    if (result.distance > lockedDistanceOffset) {
        console.log('已移出限界');
        //锁定偏移距离
        //result.distance = (parseInt(util.getStyle(outter).height) / 2 - parseInt(util.getStyle(inner).height) / 2);
        result.lockedPos = util.findLockedCoord({
            x: parseInt(result.stickLeft),
            y: parseInt(result.stickTop)
        }, lockedDistanceOffset, result.rad);
        result.force = result.distance;
        result.distance = lockedDistanceOffset;
        result.stickLeft = result.lockedPos.x + this.originX;
        result.stickTop = result.lockedPos.y + this.originY;
    }
    return result;
}

//获得目标原始矩阵
Stick.prototype.getRawMatrix = function () {
    var target = this.target;
    if (target instanceof Element || target instanceof THREE.Object3D) {
        //原始矩阵
        var rawMatrix = target instanceof Element ? util.parseTransformMatrix(util.getStyle(target).transform) : target.matrixWorld.elements.slice(0);
        if (rawMatrix.length == 9) {
            //console.log('2D变换模式');
        } else if (rawMatrix.length == 16) {
            //console.log('3D变换模式');
            //初始化原矩阵
            var rawPositionMatrix = util.originMatrix4.slice(0); //原始位置移动到原点矩阵
            var rawPositionMatrix0 = util.originMatrix4.slice(0);//原点移动到原始位置矩阵

            if (!(target instanceof Element)) {
                //获得THREE.Object3D的位置
                var rawPosition = target.position;
            } else {
                //获得Element中CSS Transform矩阵中与位置相关的元素
                var rawPosition = {
                    x: rawMatrix[12],
                    y: rawMatrix[13],
                    z: rawMatrix[14]
                };
            }

            //变换前位移到原点矩阵
            rawPositionMatrix[12] = -rawPosition.x;
            rawPositionMatrix[13] = -rawPosition.y;
            rawPositionMatrix[14] = -rawPosition.z;

            //变换后移到原位矩阵
            rawPositionMatrix0[12] = rawPosition.x;
            rawPositionMatrix0[13] = rawPosition.y;
            rawPositionMatrix0[14] = rawPosition.z;

            this.result.matrices.rawPositionMatrix = rawPositionMatrix;
            this.result.matrices.rawPositionMatrix0 = rawPositionMatrix0;
        }
    } else {
        console.error('对象不受到支持。')
        return false;
    }

}

//获得变换矩阵
Stick.prototype.getTransformMatrix = function (target) {
    var conf = this.conf
    var mmp = util.matrixMuitply;
    var result = this.result;
    if (target instanceof Element || target instanceof THREE.Object3D) {

        //原始矩阵
        var rawMatrix = target instanceof Element ? util.parseTransformMatrix(util.getStyle(target).transform) : target.matrixWorld.elements.slice(0);
        result.matrices.rawMatrix = rawMatrix;

        if (rawMatrix.length == 9) {
            console.log('2D变换模式');
        } else if (rawMatrix.length == 16) {

            // console.log('3D变换模式');
            //初始化原矩阵
            var translateMatrix4 = util.originMatrix4.slice(0);//位移矩阵
            var rotateMatrix4 = util.originMatrix4.slice(0);//旋转矩阵
            var rotateMatrix4x = util.originMatrix4.slice(0),
                rotateMatrix4y = util.originMatrix4.slice(0),
                rotateMatrix4z = util.originMatrix4.slice(0);

            //四阶矩阵
            /*
                0 , 1 , 2 , 3 ,
            m = 4 , 5 , 6 , 7 ,
                8 , 9 , 10, 11,
                12, 13, 14, 15
            */

            //右手坐标系
            /*

                         y               
                         |         /     
                         |       /      
                         |     /       
                         |   /        
                         | /         
            -------------|-------------x
                       / |                
                     /   |                
                   /     |                
                 /       |                
               /         |                
             z
            
            */

            /*无人机飞控 美国手
            左：x轴偏移控制机身自旋，y轴偏移控制上升下降
            右：偏移控制平面内各个方向移动
            */

            /*

                 ||            ||
                 ||            ||
             ____||____________||____   
            /                        \        
            |   +---+        +---+    |       
            |   | o |  [--]  | o |    |       
            |   +---+        +---+    |       
            |         _______         |       
            +--------/       \--------+

            */

            //平移矩阵
            if (
                conf.type == 'translateX'
                || conf.type == 'translateXY'
                || conf.type == 'translateXZ' || conf.type == 'droneRCRight'
            ) {
                translateMatrix4[12] = result.stickOffsetLeft * conf.moveFactor;
            }
            if (
                conf.type == 'translateY' || conf.type == 'droneRCLeft'
                || conf.type == 'translateXY'
            ) {
                translateMatrix4[13] = -result.stickOffsetTop * conf.moveFactor;
            }
            if (
                conf.type == 'translateZ'
                || conf.type == 'translateXZ' || conf.type == 'droneRCRight'
            ) {
                translateMatrix4[14] = result.stickOffsetTop * conf.moveFactor;
            }


            //尝试修复在物体旋转后物体位移方向不再正确 
            //https://blog.csdn.net/jia18337935154/article/details/83539546
            //https://www.azimiao.com/2570.html


            //相机问题 //要使得相机朝向运动方向移动，来自misc_fps.html
            // console.log((target instanceof THREE.Camera || target.name==="cameraGroup") + '  ' + this.conf.type)
            if (this.conf.cameraObject && this.conf.type === "droneRCRight") {
                var periousDirection=this.cameraRawVector;
                console.log(periousDirection);

                var cameraDirection=new THREE.Vector3();
                conf.cameraObject.getWorldDirection(cameraDirection);
                console.log(cameraDirection);


                var vectorAngle=periousDirection.angleTo(cameraDirection);
                console.log(Math.sin(vectorAngle)+'   '+Math.cos(vectorAngle))
                // if(util.radToDeg(vectorAngle)<=90){
                //     var mX=conf.moveFactor*Math.sin(vectorAngle);
                //     var mY=conf.moveFactor*Math.cos(vectorAngle);
                // }
                // else if(util.radToDeg(vectorAngle)>90&&util.radToDeg(vectorAngle)<=180){
                //     var mX=conf.moveFactor*Math.sin(vectorAngle);
                //     var mY=conf.moveFactor*Math.cos(vectorAngle);
                // }else if(util.radToDeg(vectorAngle)>180&&util.radToDeg(vectorAngle)<=270){
                //     var mX=conf.moveFactor*Math.sin(vectorAngle);
                //     var mY=conf.moveFactor*Math.cos(vectorAngle);
                // }else if(util.radToDeg(vectorAngle)>270&&util.radToDeg(vectorAngle)<360){
                //     var mX=conf.moveFactor*Math.sin(vectorAngle);
                //     var mY=conf.moveFactor*Math.cos(vectorAngle);
                // }
                
                var mX=conf.moveFactor;
                var mY=conf.moveFactor;

                translateMatrix4[12] = result.stickOffsetLeft*mX;
                translateMatrix4[14] = result.stickOffsetTop*mY;

                console.log(util.radToDeg(vectorAngle))

                var __c = new THREE.BoxGeometry(0.2, 0.2, 0.2)

                var _cube = new THREE.Mesh(__c)

                _cube.position.x = cameraDirection.x + 1
                _cube.position.y = cameraDirection.y + 1
                _cube.position.z = cameraDirection.z + 1

                scene.add(_cube)



                // var offsetX=-this.result.stickOffsetTop //DOM与THREE中Y轴坐标相反
                // var offsetY=this.result.stickOffsetLeft;
                // var rotateY=0;

                // if (offsetY > 0) {
                //     //第一二象限
                //     //一二象限角度值的正负及大小和我们需要的一致，正常求解即可
                //     //Mathf.Atan计算并返回参数 f 中指定的数字的反正切值。返回值介于负二分之 pi 与正二分之 pi 之间。
                //     rotateY = Math.atan(offsetX / offsetY) * 180 / Math.PI;
                // } else if (offsetY < 0 && offsetX < 0) {
                //     //第三象限
                //     //用-180°加上摇杆轴线与与y轴负方向间的夹角
                //     rotateY = -180 + Math.atan(offsetX / offsetY) * 180 / Math.PI;
                // } else if (offsetY < 0 && offsetX > 0) {
                //     //第四象限
                //     //用180°加上摇杆轴线与y轴负方向的夹角
                //     rotateY = 180 + Math.atan(offsetX / offsetY) * 180 / Math.PI;
                // }
        
                // // Convert velocity to world coordinates
                // euler.x = pitchObject.rotation.x;
                // euler.y = yawObject.rotation.y;
                // euler.order = "XYZ";
                // quat.setFromEuler(euler);
                // inputVelocity.applyQuaternion(quat);
                // //quat.multiplyVector3(inputVelocity);
        
                // // Add to the object
                // velocity.x += inputVelocity.x;
                // velocity.z += inputVelocity.z;
        
                // yawObject.position.copy(cannonBody.position);



            }

            // console.log(translateMatrix4);

            //旋转矩阵
            //X-俯仰，Y-环视，Z-翻滚


            // 沿着x轴旋转矩阵
            if (
                conf.type === 'rotateX' ||conf.type === 'rotateXY') {
                // rotateMatrix4x[5] = Math.cos(result.rad);
                // rotateMatrix4x[6] = Math.sin(result.rad);
                // rotateMatrix4x[9] = -Math.sin(result.rad);
                // rotateMatrix4x[10] = Math.cos(result.rad);
                rotateMatrix4y[5] = Math.cos(util.degToRad(-result.stickOffsetTop * 20 * conf.moveFactor));
                rotateMatrix4y[6] = Math.sin(util.degToRad(-result.stickOffsetTop * 20 * conf.moveFactor));
                rotateMatrix4y[9] =-Math.sin(util.degToRad(-result.stickOffsetTop * 20 * conf.moveFactor));
                rotateMatrix4y[10]= Math.cos(util.degToRad(-result.stickOffsetTop * 20 * conf.moveFactor));
            }

            // console.log(rotateMatrix4x)

            //！！！修复无人机左摇杆左右移动
            // 沿着y轴旋转矩阵
            if (conf.type === 'droneRCLeft'
                || conf.type === 'rotateY'|| conf.type==="rotateXY") {
                rotateMatrix4y[0] = Math.cos(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[2] =-Math.sin(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[8] = Math.sin(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[10]= Math.cos(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                console.log(rotateMatrix4y)
            }

            // console.log(rotateMatrix4y)

            // 沿着z轴的旋转矩阵
            if (
                conf.type === 'rotateZ') {
                // rotateMatrix4z[0] = Math.cos(result.rad);
                // rotateMatrix4z[1] = Math.sin(result.rad);
                // rotateMatrix4z[4] = -Math.sin(result.rad);
                // rotateMatrix4z[5] = Math.cos(result.rad);
                rotateMatrix4y[0] = Math.cos(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[1] = Math.sin(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[4] =-Math.sin(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
                rotateMatrix4y[5]= Math.cos(util.degToRad(-result.stickOffsetLeft * 20 * conf.moveFactor));
            }

            // console.log(rotateMatrix4z)


            //旋转顺序以及方式
            switch (conf.type) {
                case 'rotateX': rotateMatrix4 = rotateMatrix4x; break;
                case 'rotateY':
                case 'droneRCLeft': rotateMatrix4 = rotateMatrix4y; break;
                case 'rotateZ': rotateMatrix4 = rotateMatrix4z; break;
                case 'rotateXY':rotateMatrix4=util.matrixMuitply(rotateMatrix4x,rotateMatrix4y);break;
            }
            // console.log(rotateMatrix4);

            result.matrices.rawMatrix = rawMatrix;

            result.matrices.translateMatrix = translateMatrix4;

            result.matrices.rotateMatrix = rotateMatrix4;


            //console.log('位置矩阵：' + rawPositionMatrix);

            var transformMatrix4 = mmp(rotateMatrix4, translateMatrix4);

            // console.log(this.type+'原始矩阵：' + rawMatrix);
            // console.log(this.type+'平移矩阵：' + translateMatrix4);
            // console.log(this.type+'旋转矩阵：' + rotateMatrix4);
            // console.log(this.type+'变换复合矩阵：' + transformMatrix4);


            //返回变换矩阵
            // return mmp(mmp(rawPositionMatrix, matrix), rawPositionMatrix0);
            // console.log(transformMatrix4);
            result.matrices.transformMatrix = transformMatrix4;
            return transformMatrix4;
        }
        // return result;
    }
}

//对目标设置矩阵
Stick.prototype.setMatrix = function () {
    var target = this.conf.target;//目标
    var mmp = util.matrixMuitply.bind(util);
    var result = this.result;//结果
    var rawMatrix = result.matrices.rawMatrix;
    var transformMatrix = this.getTransformMatrix(target);//获得的变换矩阵
    this.getRawMatrix();//获得的原始矩阵
    // console.log(rawMatrix3d);
    var rawPositionMatrix = result.matrices.rawPositionMatrix;//位置平移到原点矩阵
    var rawPositionMatrix0 = result.matrices.rawPositionMatrix0;//位置平移回原位矩阵

    //应用矩阵
    if (target instanceof Element) {
        //矩阵相乘
        var finalMatrix = mmp(mmp(mmp(rawMatrix, rawPositionMatrix), transformMatrix), rawPositionMatrix0);
        var cssTransformText = 'matrix3d(' + finalMatrix[0] + ',' + finalMatrix[1] + ',' + finalMatrix[2] + ',' + finalMatrix[3] + ',' + finalMatrix[4] + ',' + finalMatrix[5] + ',' + finalMatrix[6] + ',' + finalMatrix[7] + ',' + finalMatrix[8] + ',' + finalMatrix[9] + ',' + finalMatrix[10] + ',' + finalMatrix[11] + ',' + finalMatrix[12] + ',' + finalMatrix[13] + ',' + finalMatrix[14] + ',' + finalMatrix[15] + ')';
        target.style.transform = cssTransformText;
    } else if (target instanceof THREE.Object3D) {
        //矩阵相乘
        var finalMatrix = mmp(mmp(rawPositionMatrix, transformMatrix), rawPositionMatrix0);
        var finalMatrixList = new THREE.Matrix4();
        finalMatrixList.fromArray(finalMatrix);
        target.applyMatrix(finalMatrixList);
        if (this.conf.cameraObject && this.conf.type === "rotateXY") {
            target.scale.x=1;
            target.scale.y=1;
            target.scale.z=1;
        }
    } else {
        console.error('目标元素不支持，必须为Element或THREE.Object3D。');
    }
}

//创建DOM
Stick.prototype.buildEl = function (conf) {
    var zone = document.createElement('div');
    zone.setAttribute('data-role', 'zone');
    zone.setAttribute('data-conf-type', conf.type);
    zone.style.cssText = 'position: absolute;background-image:url("./stick_bg.svg");border-radius:50%;background-color: rgba(0,0,0,0.5);';
    zone.style.width = conf.zoneSize + 'px';//'500px';
    zone.style.height = conf.zoneSize + 'px';//'500px';
    //设置zone在视口中的位置
    if (conf.position[0] !== null) zone.style.top = conf.position[0] + 'px';
    if (conf.position[1] !== null) zone.style.right = conf.position[1] + 'px';
    if (conf.position[2] !== null) zone.style.bottom = conf.position[2] + 'px';
    if (conf.position[3] !== null) zone.style.left = conf.position[3] + 'px';

    var stick = document.createElement('div');
    stick.setAttribute('data-role', 'stick');
    stick.style.cssText = 'background-color: rgba(255,255,255,0.5);position: absolute;box-shadow: 2px 2px 10px rgba(0,0,0,0.5);border-radius: 50%;';
    stick.style.width = conf.stickSize + 'px';//'200px';
    stick.style.height = conf.stickSize + 'px';//'200px';
    stick.style.top = (conf.zoneSize - conf.stickSize) / 2 + 'px';//'150px';
    stick.style.left = (conf.zoneSize - conf.stickSize) / 2 + 'px';
    zone.appendChild(stick);
    document.body.appendChild(zone);
    return { zone, stick };
}

//处理鼠标事件
Stick.prototype.eventTodo = function () {

    var zone = this.zone, stick = this.stick, target = this.target;

    var _this = this;
    //处理鼠标移动
    function mouseHandler(e) {

        switch (e.type) {
            case 'mousedown': {
                // console.log('mousedown');
                e.preventDefault();

                document.body.addEventListener('mousemove', mouseHandler, false);
                document.body.addEventListener('mouseup', mouseHandler, false);
                break;
            };
            case 'touchmove':
            case 'mousemove': {
                //e.movementX和e.movementY是两次移动之间距离的差
                // console.log(e.movementX + ' ' + e.movementY);
                var result = _this.getDirection(e);
                // console.log(result);
                e.preventDefault();

                stick.style.left = result.stickLeft + 'px';
                stick.style.top = result.stickTop + 'px';

                //...
                // console.log(_this)
                _this.getTransformMatrix(_this.target);
                _this.setMatrix(target);

                //return result;
                break;
            };
            case 'mouseup': {
                // console.log('mouseup')
                stick.style.left = _this.originX + 'px';
                stick.style.top = _this.originY + 'px';
                document.body.removeEventListener('mouseup', mouseHandler, false);
                document.body.removeEventListener('mousemove', mouseHandler, false);
                break;
            };
            case 'touchstart': {
                e.preventDefault();

                // console.log('mousedown');
                document.body.addEventListener('touchmove', mouseHandler, false);
                document.body.addEventListener('touchend', mouseHandler, false);
                break;
            };
            case 'touchend': {
                console.log('mouseup')
                stick.style.left = _this.originX + 'px';
                stick.style.top = _this.originY + 'px';
                document.body.removeEventListener('touchup', mouseHandler, false);
                document.body.removeEventListener('touchmove', mouseHandler, false);
                break;
            };
        }
    }

    zone.addEventListener('mousedown', mouseHandler, false);
    //inner.addEventListener('mousedown', mouseHandler, false);

    zone.addEventListener('touchstart', mouseHandler, false);
    //inner.addEventListener('mousedown', mouseHandler, false);

    //阻止默认事件
    zone.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
    zone.addEventListener('drag', function (e) {
        e.preventDefault();
    }, false);
}