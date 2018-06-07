(function(){
    var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
    var utility = Global.utility;
    var Toast = Global.utility.toast;
    var channelCode = $.trim(utility.getQueryParams('channelCode'));
    Global.channelCode = channelCode;
    init();
    function init(){
        var $container = $('.regFormWrap');
        $container.find('.btn').on(clickEvent, function(e){
            e.stopPropagation();
            var handle = new Global.Handle($(this));
            if(handle){
                handle(_formSubmit);
                return;
            }
        });

        $container.find('.btnCode').on(clickEvent, function(e){
            e.stopPropagation();
            var $sender = $(this);
            if($sender.attr('disabled')){
                return;
            }
            var phone = $.trim($container.find('input.tel').val());
            if(!phone){
                Toast('请输入手机号码');
                return;
            }
            if(!utility.isMobile(phone)){
                Toast('请输入正确的手机号码');
                return;
            }
            _hmt.push(['_trackEvent', Global.code +'_smscode', 'click', Global.code +'_获取短信验证码']);
            Global.phone = phone;
            var handle = new Global.Handle($sender);
            if(handle){
                handle(function(sender, config){
                    var wrapId = config.option.value;
                    Global.alerts[wrapId].show(wrapId,function(){
                        _startClock($sender);
                    });
                });
                return;
            }
        });
    }

    function _formSubmit($sender, config){
        var $wrap = $($sender.parents('.regFormWrap')[0]);
        var params = {
            mobile: $.trim($wrap.find('input.tel').val()),
            verificationCode: $.trim($wrap.find('input.code').val()),
            passWord: $.trim($wrap.find('input.pwd').val())
        };
        if (!params.mobile) {
            Toast('手机号不能为空');
            return;
        }
        if(!utility.isMobile(params.mobile)) {
            Toast('请输入正确的手机号');
            return;
        }
        if(!params.verificationCode) {
            Toast('验证码不能为空');
            return;
        }

        _hmt.push(['_trackEvent', Global.code +'_submit', 'click', Global.code +'_提交注册']);
        var url = '/v1/apis/activityx/pullcoupon/loginByVaildCode';
        params.secondPwd = params.password;
        params.channelCode = channelCode;
        
        utility.post(url, params, function(res){
            var code = res.code;
            if(!config[code]){
                Toast(res.message);
                return;
            }
            // 1010 show failed dialog
            // 200 show success dialog
            var resHandle = new Global.Handle($sender,config[code]);
            if(resHandle){
                resHandle(_showAlert);
                return;
            }
            
            if(code != 200){
                Toast(res.message);
                return;
            }
        }, function(error){
            console.log(error);
        });
    }

    function _startClock($sender){
        var $wrap = $($sender.parents('.regFormWrap')[0]);
        utility.startClock($wrap.find('.btnCode'), 60);
    }

    function _showAlert($sender, config){
        var wrapId = config.option.value;
        Global.alerts[wrapId].show(wrapId);
    }
})();
