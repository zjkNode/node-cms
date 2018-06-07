/**
 * Created by ufq on 17/6/21.
 * This is the function for downloading App.
 */
module.exports = {
    downLoad:function(){
        var userAgent = window.navigator.userAgent;
        var browser = null,platform = null,
            iosUrl = 'https://itunes.apple.com/us/app/su-dai-xiong/id1102390726?l=zh&ls=1&mt=8',
            androidUrl = 'http://dl.jiandanjiekuan.com/app/download/offical_jdjk.apk',
            androidWeChatUrl = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ufenqi.bajieloan&hmsr=%E9%80%9F%E8%B4%B7%E7%86%8A&hmpl=%E5%BA%94%E7%94%A8%E5%AE%9D%E5%BE%AE%E4%BF%A1%E4%B8%8B%E8%BD%BD&hmcu=&hmkw=&hmci=';

        if(userAgent.match(/MicroMessenger/i)=="MicroMessenger"){
            browser = 'MicroMessenger';
            /*_hmt.push(['_trackEvent', 'yingyongbao-download', 'click', 'download']);*/
            $(this).attr('disabled',"true");
            try{
                window.location.href = androidWeChatUrl;
            }catch(e){
                $(this).removeAttr("disabled");
            }
        }else{
            if(userAgent.match(/Android/i)=="Android"){
                location.href = "sudaibear://open_android_app";
                setTimeout(function(){
                    location.href = androidUrl;
                },200);
            }else if(userAgent.match(/iPhone/i)=="iPhone"){
                location.href = "sudaibear://open_ios_app";
                setTimeout(function(){
                    window.location.href= iosUrl;//iosUrl;
                },200);
               
            }
        }
    }
}