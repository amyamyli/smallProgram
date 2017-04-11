document.addEventListener('AlipayJSBridgeReady', function(){
    init();
});

function alertResult(result) {
    AlipayJSBridge.call('alert', {
        title: '结果',
        message: JSON.stringify(result)
    });
}

function init() {
    // toast
    var toastItem = document.getElementById('toastItem');
    toastItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('toast', {
            content: 'Toast测试',
            type: 'success',
            duration: 3000
        }, function(){
            console.log('toast消失后执行');
        });
    });
    // 弹框
    var alertItem = document.getElementById('alertItem');
    alertItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('alert', {
            title: '亲',
            message: '你好',
            button: '确定'
        }, function () {
            console.log('alert点击button后执行');
        });
    });
    // push window
    var pushWindowItem = document.getElementById('pushWindowItem');
    pushWindowItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('pushWindow', {
            url: './detail.html',
            param: {
                readTitle: true,
                defaultTitle: true,
                showOptionMenu: false
            }
        });
    });
    // 城市选择
    var citySelectItem = document.getElementById('citySelectItem');
    citySelectItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('getCities', {
            currentCity: '杭州市',
            adcode:'310100'
        }, function (result) {
            alertResult(JSON.stringify(result));
        });
    });
    // 从相册选择照片
    var albumItem = document.getElementById('albumItem');
    albumItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('photo', {
            dataType: 'dataURL',
            imageFormat: 'jpg',
            quality: 75,
            maxWidth: 500,
            maxHeight: 500,
            allowEdit: true,
        }, function (result) {
            alertResult('base64: ' + result.dataURL.slice(0, 50) + '...');
        });
    });
    // 震动
    var vibrateItem = document.getElementById('vibrateItem');
    vibrateItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('vibrate');
    });
    // 扫码
    var scanItem = document.getElementById('scanItem');
    scanItem.addEventListener('click', function(e){
        e.preventDefault();
        AlipayJSBridge.call('scan', {
            type: 'qr'
        }, function (result) {
            alertResult(result);
        });
    });
}
