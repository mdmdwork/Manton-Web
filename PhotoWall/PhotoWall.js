var radius = 240
var imgWidth = 120
var imgHeight = 170
var autoRotate = true
var rotateSpeed = -60
//通过doucument获取到html的盒子，图片
var oDarg = document.getElementById('darg-container')
var oSpin = document.getElementById('spin-container')
var ground = document.getElementById('ground')
var aImg = oSpin.getElementsByTagName('img')
var aVid = oSpin.getElementsByTagName('video')
var aEle = [...aImg, ...aVid]//js6的一种连接数组的方式

oSpin.style.width = imgWidth + 'px'
oSpin.style.height = imgHeight + 'px'

ground.style.width = radius * 3 + 'px'
ground.style.height = radius * 3 + 'px'

function init(delayTime) {
  // 给所有的图片加入场动画
  for (var i = 0; i < aEle.length; i++) {
    aEle[i].style.transform = "rotateY(" + (i * (360 / aEle.length)) + "deg) translateZ(" + radius + "px)"
    aEle[i].style.transition = "transform 1s"
    aEle[i].style.transitionDelay = delayTime || (aEle.length - i) / 4 + 's'
  }
}
//(init初始化)创建一个定时器1s后执行动画
setTimeout(init, 1000)

// 让所有的图片转起来
if (autoRotate) {
  var animationName = (rotateSpeed > 0 ? 'spin' : 'spinRevert')
  oSpin.style.animation = `${animationName} ${Math.abs(rotateSpeed)}s infinite linear`
}

// 滚轮滚动实现相册放大缩小
document.onmousewheel = function(e) {
  e = e || window.event  //防止出错
  var d = e.wheelDelta / 20 || -e.detail
  radius += d
  init(1)
}


var sX, sY, nX, nY, desX = 0, desY = 0, tX = 0, tY = 0;


// 鼠标拖动页面
document.onpointerdown = function(e) {
  e = e || window.event
  //获取鼠标移动前的坐标
  var sX = e.clientX,
      sY = e.clientY
  
  this.onpointermove = function(e) {
    e = e || window.event
    //获取鼠标移动后的坐标计算出鼠标垂直和水平方向上移动的距离
    var nX = e.clientX,
        nY = e.clientY;
    desX = nX - sX;
    desY = nY - sY;
    tX += desX * 0.1//让页面更具鼠标坐标变化进行动起来
    tY += desY * 0.1
    // 让页面跟着鼠标动起来
    applyTransform(oDarg)
  }
  //鼠标松开后界面不再随着鼠标拖动而移动
  this.onpointerup = function(e) {
    oDarg.timer = setTimeout(function() {
      playSpin(true)
    }, 17)
    this.onpointermove = this.onpointerup = null
  }
  return false
}

//做一个图形移动的上限和下限
function applyTransform(obj) {
  if (tY > 180) tY = 180
  if (tY < 0) tY = 0

  obj.style.transform = `rotateX(${-tY}deg) rotateY(${tX}deg)`
}
//控制页面的旋转和暂停
function playSpin(yes) {
  oSpin.style.animationPlayState = (yes ? 'running' : 'paused')
}
