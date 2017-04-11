/**
 * 简易模版引擎
 */

    window.tpl = {};

    // 过滤特殊字符，来自handlebars，插入dom前必须使用
    tpl.escape = function (string) {
        var escapeObj = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        };

        var badChars = /[&<>"'`]/g;
        var possible = /[&<>"'`]/;

        function escapeChar(chr) {
            return escapeObj[chr] || "&amp;";
        }

        if (!string && string !== 0) {
            return "";
        }

        // Force a string conversion as this will be done by the append regardless and
        // the regex test will do this transparently behind the scenes, causing issues if
        // an object's to string has escaped characters in it.
        string = "" + string;

        if (!possible.test(string)) {
            return string;
        }
        return string.replace(badChars, escapeChar);
    }

    // 依赖escape，修改自underscore。建议使用{{}}进行占位替换，会自动escape转义；{{{}}}不转义，可能会被xss；{{@}}可插入js代码片段
    tpl.template = function (text)  {
        var regInterpolate = /{{{([\s\S]+?)}}}/g,
            regEvaluate = /<%([\s\S]+?)%>/g,
            regEscape = /{{([\s\S]+?)}}/g;

        var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };

        var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

        var escapeChar = function (match) {
            return '\\' + escapes[match];
        };

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
            (regInterpolate).source,
            (regEvaluate).source,
            (regEscape).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, interpolate, evaluate, escape, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':tpl.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // place data values in local scope.
        source = 'with(obj){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        try {
            var render = new Function('obj', 'tpl', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function (data) {
            return render.call(this, data, tpl);
        };

        // Provide the compiled source as a convenience for precompilation.
        template.source = 'function(obj){\n' + source + '}';

        return template;
    }

    /**
     * 渲染模板通用方法
     * @param target
     * @param tplDom
     * @param data
     * @param type  渲染方式是否追加
     */
    tpl.render = function (target, tplDom, data, isAppend) {
        var compiled = tpl.template(tplDom);

        data = data ? data : {};

        if(isAppend === true ) {
            target.append(compiled(data));
        } else {
            target.html(compiled(data));
        }
    };

    module.export = tpl;