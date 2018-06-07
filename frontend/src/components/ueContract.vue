<template>
    <div id="ueContainer">
        <script style="line-height:20px;" id="editor" type="text/plain"></script>
    </div>
</template>
<script>
    var ueTpl;
    import 'static/UE/ueditor.config.js';
    import 'static/UE/ueditor.parse.min.js';
    import 'static/UE/ueditor.all.js';
    import 'static/UE/lang/zh-cn/zh-cn.js';
    export default {
        name: 'UE',
        props: {
            defaultMsg: {
                type: String
            },
            config: {
                type: Object
            },
            placeholderData: {
                type: Array
            }
        },
        data () {
            return {
                editor: null,
            }
        },
        mounted() {
            ueTpl = $('#ueContainer').html();
            this.createEditor();
        },
        methods: {
            createEditor(){
                const _this = this;
                _this.addVm();
                this.editor = UE.getEditor('editor', this.config); // 初始化UE
                this.editor.addListener("ready", function () {
                    _this.editor.setContent(_this.defaultMsg);
                });
            },
            distroyEditor(){
                this.editor.destroy();
                $("#editor").remove();
                $("#ueContainer").html(ueTpl);
            },
            getUEContent() { // 获取内容方法
                return this.editor.getContent();
            },
            addVm(){
                if(!this.placeholderData || this.placeholderData.length == 0){
                    delete UE._customizeUI.combox;
                    return;
                }
                var _this = this
                 UE.registerUI('combox',function(editor,uiName){
                    //注册按钮执行时的command命令,用uiName作为command名字，使用命令默认就会带有回退操作
                    editor.registerCommand(uiName,{
                        execCommand:function(cmdName,value){
                            this.execCommand('insertHtml', value.value);
                        }
                    });
                    var items = _this.placeholderData;
                    //创建下来框
                    var combox = new UE.ui.Combox({
                        //需要指定当前的编辑器实例
                        editor:editor,
                        //添加条目
                        items:items,
                        //当选中时要做的事情
                        onselect:function (t, index) {
                             editor.execCommand(uiName, this.items[index]);
                        },
                        //提示
                        title:uiName,
                        initValue:'占位符'
                    });
                    return combox;
                })
            }
        },
        destroyed() {
            this.editor.destroy();
        }
    }

</script>

        <style lang="scss">
            .edui-popup-content.edui-default{ height: auto !important; }
        </style>
