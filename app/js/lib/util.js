var $ = window.Zepto;

$.util = {};
$.extend($.util, {
     /**
     * alipayVersion
     * @description 获取客户端版本
     * @example $.util.alipayVersion(version);
     * */
    alipayVersion: function () {
        var vs = navigator.userAgent.match(/AlipayClient\/([0-9.]+)/);
        return vs.length > 1 ? vs[1] : '';
    },
     /**
     * isGreaterThanVer
     * @description 客户端版本大于参数版本10.0.0
     * @example $.util.isGreaterThanVer(version);
     * */
    isGreaterThanVer: function (version) {
        var versionVal, versionUaVal,
            versionUa = this.alipayVersion(),
            versionUaSplit = !!versionUa ? versionUa.split('.') : [],
            versionSplit = !!version ? version.split('.') : [];

        // 判断版本号是否相等
        if (versionUa === version) {
            return true;
        } else {
            for (var i = 0; i < versionUaSplit.length; i++) {
                versionVal = !!versionSplit[i] ? versionSplit[i].replace(/\s+/g, '') : 0;
                versionUaVal = !!versionUaSplit[i] ? versionUaSplit[i].replace(/\s+/g, '') : 0;

                // 最后一位通过逐位判断的去比对大小
                if (i + 1 === versionUaSplit.length && !!versionVal && !!versionUaVal) {
                    var versionUaLastInt, versionLastInt, versionValStr, versionUaValStr,
                        lastUaLength = versionUaVal.length;

                    for (var j = 0; j < lastUaLength; j++) {
                        versionUaValStr = versionUaVal.substring(j, j + 1);
                        versionValStr = versionVal.substring(j, j + 1);

                        // 如果缺位，当前位替换为0
                        versionUaLastInt = !!versionUaValStr ? parseInt(versionUaValStr) : 0;
                        versionLastInt = !!versionValStr ? parseInt(versionValStr) : 0;

                        if (versionUaLastInt > versionLastInt) {
                            return true;
                        } else if (versionUaLastInt < versionLastInt) {
                            return false;
                        }
                    }
                } else {
                    versionUaVal = parseInt(versionUaVal);
                    versionVal = parseInt(versionVal);

                    if (isNaN(versionVal) || isNaN(versionUaVal)) {
                        return false;
                    }

                    // 前面几位数的判断通过转整形的方式去判断
                    if (versionUaVal > versionVal) {
                        return true;
                    } else if ( versionUaVal < versionVal) {
                        return false;
                    }
                }
            }
        }
        // 相等
        return true;
    },
    /**
     * getQueryString
     * @description 获取url参数
     * @example $.util.getQueryString(url, name);
     * */
    getQueryString : function (url, name) {
        // 可以不传递 url
        if( !name ){
            name = url ;
            url = document.location.href ;
        }
        var reg = new RegExp('(^|\\?|&)' + name + '=([^&]*)(\\s|&|$)', 'i'),
            out = '';
        if (reg.test(url)){
            out = RegExp.$2 || ''; // .replace(/\+/g, " ");取消＋号替换为空格
        }
        return decodeURIComponent( out ) || '';
    },
    /**
     * isIOS
     * @description 是否ios
     * @example $.util.isIOS();
     * */
    isIOS: function () {
        return /^.*(iphone|ipod|ipad).*$/gi.test(navigator.userAgent);
    },

     /**
     * openUrl
     * @description 页面跳转
     * @example $.util.openUrl(url);
     * */
    openUrl: function (url,param) {
        if( !url ){
            console.log('URL error ');
            return false;
        }

        if( /^alipays/i.test( url ) ){
            document.location.href = url;
        }else{
            AlipayJSBridge.call('pushWindow', {
                url: url,
                param: param
            });
        }
    },

     /**
     * doLog
     * @description BizLog 手动埋点
     * @example $.util.doLog(ids, param);
     * */
    doLog: function (ids, param) {
        window.BizLog && BizLog.call('info', {
            spmId: ids,
            actionId:'clicked',
            params:param || ''

        });
    },

    /**
     * initLog
     * @description BizLog 初始化埋点
     * @example $.util.initLog(ids);
     * */
    initLog: function (title,ids) {
        window.BizLog && BizLog.call('pageName', title || '');
        window.BizLog && BizLog.call('pageState', AlipayJSBridge.startupParams.sourceId || '');
        window.BizLog && BizLog.call('info', {
            spmId: ids || ''
        });
    },
    /**
     * isAndroid
     * @description 是否安卓
     * @return {Boolean}
     * @example $.util.isAndroid;
     * */
    isAndroid : /android|adr/.test(navigator.userAgent.toLowerCase()) && !(/windows phone/.test(navigator.userAgent.toLowerCase())),
    /**
     * env
     * @description 获取当前H5业务运行环境 (dev || test || online)
     * @return {String}
     * @example $.util.env;
     * */
    env : document.domain.indexOf('h5app.alipay.com') > -1 ? 'online' : document.domain.indexOf('h5app.test.alipay.net') > -1 ? 'test' : 'dev'
});

