var $ = window.Zepto;
var ant = window.ant;

$.extend($, {
    /**
     * 实现元素上的点击效果
     * @param els 元素（$选择器）
     * @param option activeClass: 点击时的效果class，exceptClass：要排除的元素class， lockTime:点击效果最长显示时间
     */
    bindBtnActive: function (els, option) {
        option = option || {};
        var endTime,
            moving = false,
            ac = option.activeClass || 'active',
            ec = option.exceptClass || '',
            lockT = option.lockTime || 1000;

        var isExcept = function (el) {
            return (ec && (el.hasClass(ec) || el.parents('.'+ec).length > 0));
        };

        var startFun = function (e) {
            var el = $(e.target),
                btn = $(this);

            if(!moving && !isExcept(el)){
                btn.addClass(ac);
                endTime = setTimeout(function () {
                    btn.removeClass(ac);
                }, lockT);
            }
        };

        var movingFun = function (e) {
            moving = true;
            endFun(e);
        };

        var endFun = function (e) {
            $(e.currentTarget).removeClass(ac);
            clearTimeout(endTime);
            moving = false;
        };

        els = $.isArray(els) ? els : [els];
        els.forEach(function (el) {
            $(document).on('touchstart', el, startFun);
            $(document).on('touchmove', el, movingFun);
            $(document).on('touchend', el, endFun);
            $(document).on('touchcancel', el, endFun);
        });
    },
    /**
     * RPC接口封装
     * @param param 入参
     * @param callback 回调
     * @param hideLoading 是否显示titleLoading
     * @param hideErrorToast 是否显示封装toast
     */
    rpc: function (options, callback) {
        var isTimeup = false;
        if(!ant || !AlipayJSBridge || !options || !options.operationType) return;
        // default options
        options.requestData = options.requestData || [];
        options.showLoading = typeof(options.showLoading) === 'boolean' ? options.showLoading : false;
        options.showTitleLoading = typeof(options.showTitleLoading) === 'boolean' ? options.showTitleLoading : true;
        options.showErrorToast = typeof(options.showErrorToast) === 'boolean' ? options.showErrorToast : true;
        options.showSysToast = typeof(options.showSysToast) === 'boolean' ? options.showSysToast : true;

        // set loading
        options.showLoading && ant.showLoading();
        options.showTitleLoading && ant.showTitleLoading();

        var timeout, loadingTime,
            isTimeup = false,
            start = (new Date()).getTime();

        console.log('乐花配置 options: ', options, ' 乐花参数params : ', options.requestData);

        var t = { delay: '0' },
        params = {
            operationType: options.operationType,
            requestData: options.requestData
        };
        if (!!options.tips) {
            t.text = options.tips;
        }
        loadingTime = setTimeout(function () {
            options.showLoading && ant.showLoading(t);
        }, 500);

        if (!!options.timeoutTip) {
            // 超时提醒
            timeout = setTimeout(function () {
                ant.hideLoading();
                ant.toast(AlipayLang.get('weekNet'), function () {
                    reject({ errCode: '4001', errMsg: AlipayLang.get('4001') });
                });
                isTimeup = true;
            }, 5000);
        }
        
        if($.util.isGreaterThanVer('9.5')){ // 9.5版本禁用限流弹窗
            params.disableLimitView = true;
        }

        // send rpc
        ant.rpc(params, function (res) {
            console.log(((new Date()).getTime() - start) + 'RPC: ', options, '返回result: ', res);
            options.showLoading && ant.hideLoading();//隐藏loading
            options.showTitleLoading && ant.hideTitleLoading();//隐藏title loading
            loadingTime && clearTimeout(loadingTime);//清除加载
            timeout && clearTimeout(timeout);//清除超时处理
            if (isTimeup === true){ // 超时后的返回直接丢弃
                return;
            }
             // 安卓下不会自动解析出result, 需多一步处理
            if (typeof res === 'string') {
                res = JSON.parse(res);
            }
            if(res.error) {
                window.BizLog && BizLog.call('error', {
                    seedId: 'rpc-error',
                    params: {
                        operationType: options.operationType,
                        errorCode: res.error || ''
                    }
                });
            }

            // 特殊异常 限流
            if(res.error && res.error === '1002') {
                ant.hideOptionMenu();
                location.replace('https://os.alipayobjects.com/others/rpcLimit.html?title='+ encodeURIComponent(document.title) +'&reloadUrl='+encodeURIComponent(location.href) + '&__webview_options__=so%3DNO');
                return;
            }

            // 特殊异常 超时
            if(res.error && res.error === '2000') {
                // 登录超时, 跳登录页面
                ant.alert('页面停留时间过长, 请重新登录', function () {
                    ant.call('startApp', {
                        appId: '20000008',
                        param: {},
                        closeCurrentApp: true
                    });
                });
                return;
            }

            // 是否展示 系统级 toast
            if(options.showSysToast) {
                // 系统异常
                if(res.error) {
                    ant.toast({
                        text:  res.error === '10' ? '网络不给力，请稍后再试' : '系统开小差了，请稍后重试'
                    });
                }
            }
            // 是否展示 业务级 toast
            else if(options.showErrorToast) {
                // 业务异常
                if (res.resultStatus !== 100 && res.memo) {
                    ant.toast({
                        text: res.errorMessage || res.memo || res.resultView || '系统开小差了，请稍后重试'
                    });
                    window.BizLog && BizLog.call('error', {
                        seedId: 'rpc-error',
                        params: {
                            operationType: options.operationType,
                            errorCode: res.resultStatus || '',
                            errorMsg: res.errorMessage || res.memo || res.resultView || '系统开小差了，请稍后重试'
                        }
                    });
                }
            }
            callback && callback(res);
        });
    }
});
module.export = $;