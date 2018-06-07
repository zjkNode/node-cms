var sharesObj={
    activityCode: $('#activityCode').val(),
    shareConfig :{
        title: $('.shareTit').val(),
        desc:  $('.shareDesc').val(),
        url: $('.shareHref').val(),
        imgUrl: $('.shareImg').val()
    },
    wxShareFn: function(){
        wxShare.getWeChatConfig('/apis/act/wx/getSignature_ajax',sharesObj.activityCode);
        wxShare.configWechat(sharesObj.shareConfig.title, sharesObj.shareConfig.desc,sharesObj.shareConfig.url,sharesObj.shareConfig.imgUrl);
    },
    isAPP: function(url){//判断是否APP环境,如果不是去下载
        !!commonFn.isAppEmbed() ? window.location.href=url : commonFn.downLoad()
    }
};
sharesObj.wxShareFn();