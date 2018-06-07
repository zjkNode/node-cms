<template>
    <el-row class="infor">
        <h2>基本信息</h2>
        <el-row>
            <ul>
                <li v-for="item in lists">
                    <p>
                        <span>渠道名称 :</span>
                        <span>{{item.qudaoname}}</span>
                    </p>
                    <p>
                        <span>渠道名称 :</span>
                        <span>{{item.status}}</span>
                    </p>
                    <p>
                        <span>渠道名称 :</span>
                        <span>{{item.user}}</span>
                    </p>
                    <p>
                        <span>渠道名称 :</span>
                        <span>{{item.createtime}}</span>
                    </p>
                </li>
            </ul>
        </el-row>
    </el-row>
</template>

<script>

    export default{
        data(){
            return {
                lists: [{
                    'qudaoname': '简单借款',
                    'status':'上架',
                    'user':'操作人',
                    'createtime': '2018-01-02'
                }]
            }
        },
        components: {}
    }
</script>
<style>
    .infor ul{
        margin-left: 50px;
    }
    .infor ul li p {
        font-size: 14px;
        color: #606266;
        margin-top: 10px;
    }
    .infor ul p span{
        margin-left: 10px;
    }
</style>