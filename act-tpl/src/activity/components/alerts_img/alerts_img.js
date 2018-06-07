(function(){
    Global.alerts = Global.alerts || {};
    var Indicator = Global.utility.indicator;
    var clickEvent = ((document.ontouchstart !== null) ?'click' : 'touchstart');
    var $container = $('.alerts_img');
    var callback_hide;

    init();
    function init(){
        // bind object to global
        var $wrappers = $container.parents('.mask');
        for (var i = 0; i < $wrappers.length; i++) {
            var wrapId = $wrappers[i].id;
            Global.alerts[wrapId] = {};
            Global.alerts[wrapId].show = show;
        }


        $container.find('.close').on(clickEvent, function(){
            var $sender = $(this),
                $mask = $sender.parents('.mask');
            
            $mask.hide();
        });

        $container.find('.btn').on(clickEvent, function(){
            var btnKey = $(this).data('key');
            _hmt.push(['_trackEvent', Global.code +'_按钮点击', 'click', Global.code +'_'+ btnKey]);
            var handle = new Global.Handle($(this));
            if(handle){
                handle(test);
                return;
            }

            var $mask = $sender.parents('.mask');
            $mask.hide();

        });

        $wrappers.on(clickEvent, function(){
            $(this).hide();
        });

        $wrappers.children('div').on(clickEvent,function(e){
            e.stopPropagation();
        });
    }

    function show(wrapId, callback){
        callback_hide = callback;
        var $wrap = $('#'+ wrapId);
        // $wrap.css({ display:'flex'});
        var $wrap = $('#'+ wrapId);
        $wrap.show();
        var $dialog = $wrap.find('.alertWrap');
        var w = $dialog.width()/2;
        var h = $dialog.height()/2 || 100;
        $dialog.css({'margin-left':-w+'px','margin-top': -h+'px'});
    }

    function test($sender, resConf){
        console.log('alert button clicked');
        console.log($sender);
        console.log(resConf);
    }


})();