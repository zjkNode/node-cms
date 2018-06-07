<template>
    <div>
        <script style="line-height:20px;" id="editor" type="text/plain"></script>
    </div>
</template>

    <script>
    import 'static/UE/ueditor.config.js';
    import 'static/UE/ueditor.parse.min.js';
    import 'static/UE/ueditor.all.js';
    import 'static/UE/lang/zh-cn/zh-cn.js';

    export default {

        name: 'UE',
        data () {
            return {
                editor: null,
                placeholder: "$"
            }
        },
        props: {
            defaultMsg: {
                type: String
            },
            config: {
                type: Object
            }
        },
        mounted() {
            this.createEditor();
            // this.getPlaceHolder();
        },
        methods: {
            getPlaceHolder(){
                let url = '/api/contracts/vm/lists';
                this.$http.get(url,{credentials: true}).then((rs)=>{
                    if(rs.body.code === 'SUCCESS'){
                        let resData = rs.body.data;
                        this.placeholder = resData.lists[0].placeholder;
                        this.createEditor();

                    }
                },(err) => {
                    this.isLoading = false;
                })
            },
            createEditor(){
                const _this = this;
                var placeholder = this.placeholder;
                this.editor = UE.getEditor('editor', this.config); // 初始化UE
                this.editor.commands['placeholder'] = {
                    execCommand : function() {
                        this.execCommand('insertHtml',placeholder);
                        return true;
                    }
                };
                this.editor.addListener("ready", function () {
                    _this.editor.setContent(_this.defaultMsg); // 确保UE加载完成后，放入内容。
                });
            },
            setUEContent(content){
                this.editor.setContent(content);
            },
            getUEContent() { // 获取内容方法
                return this.editor.getContent()
            }
        },
        destroyed() {
            this.editor.destroy();
        }
    }
</script>
