(function(){
	Global.alerts = Global.alerts || {};
	
	var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
	var Toast = Global.utility.toast;
	var utility = Global.utility;
	var $container = $('.alerts_vcode');
	var callback_hide;


    _init();
    function _init(){

    	// bind object to global
    	var $wrappers = $container.parents('.mask');
    	for (var i = 0; i < $wrappers.length; i++) {
    		var wrapId = $wrappers[i].id;
    		Global.alerts[wrapId] = {};
    		Global.alerts[wrapId].show = show;
    	}

    	// close 
	    $container.find('.close').on(clickEvent, function(e){
            e.stopPropagation();
	        var $sender = $(this),
	            $mask = $sender.parents('.mask');
	        
	        $mask.hide();
	    });

	    // refresh vcode
	    $container.find('img.code').on(clickEvent, function(e){
            e.stopPropagation();
            _hmt.push(['_trackEvent', Global.code +'_refresh_vcode', 'click', Global.code +'_刷新图片验证码']);
	    	_refreshCode($(this));
	    });

	    // send vcode
	    $container.find('.btn').on(clickEvent, function(e){
            e.stopPropagation();
            _hmt.push(['_trackEvent', Global.code +'_valid_vcode', 'click', Global.code +'_检验图片验证码']);
	        var handle = new Global.Handle($(this));
	        if(handle){
	            handle(_validVCode);
	            return;
	        }
	        var $mask = $sender.parents('.mask');
	        $mask.hide();
	    });

	    $wrappers.on(clickEvent, function(e){
            e.stopPropagation();
            $(this).hide();
        });

        $wrappers.children('div').on(clickEvent,function(e){
            e.stopPropagation();
        });
	}

	function _validVCode($sender, config){
		var vcode = $.trim($container.find('input.vcode').val());
		if(!vcode){
			Toast('验证码不能为空');
			return;
		}

		var $wrap = $($sender.parents('.mask')[0]);
		var url = "/v1/apis/activityx/pullcoupon/loginByVaildCodeGetVaildCode";
        var param = {
            mobile:Global.phone,
            imgCode: vcode
        };
        utility.post(url, param, function(res){
        	var code = res.code,
        		msg = res.message;

        	if(config[code]){
        		var resHandle = new Global.Handle($sender,config[code]);
	            if(resHandle){
	            	$wrap.hide();
	                resHandle(_showAlert);
	            }
        	}

        	if(code === 624 || code === 623){//图片验证码过期
        		Toast(msg);
                _refreshCode($wrap.find('img.code'));
                return;
            };
            if( code === 1010){//手机号已被注册
                // show fail alerts
                return;
            };
            if(code !== 200){
            	Toast(msg);
                $wrap.hide();
                return;
            };
            
            Toast(msg);
            $wrap.hide();
            if(callback_hide){
            	callback_hide();
            }
        });
	}

	function _refreshCode($img){
		var time = new Date().getTime();
		$img.attr('src', '/v1/apis/activityx/pullcoupon/getIdentifCode?mobile='+ Global.phone +'&s='+ time);
	}
	function _showAlert($sender, config){
        var wrapId = config.option.value;
        Global.alerts[wrapId].show(wrapId);
    }

	// public method
	function show(wrapId, callback){
		callback_hide = callback;
        // $wrap.css({ display:'flex'});
    	var $wrap = $('#'+ wrapId);
        $wrap.show();
        var $dialog = $wrap.find('.alertWrap');
        var w = $dialog.width()/2;
        var h = $dialog.height()/2 || 100;
        $dialog.css({'margin-left':-w+'px','margin-top': -h+'px'});
        setTimeout(function(){
        	$wrap.find('.vcode').val('').focus();
    		_refreshCode($wrap.find('img.code'));
        }, 100);
	}
})();