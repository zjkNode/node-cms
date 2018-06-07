<template>
    <div class="acts">
        <h2>活动模板</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入模板名称/代码"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" @click="init" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="handleAdd" icon="el-icon-plus">新增</el-button>
            </el-col>  
        </el-row>
        <el-row type="flex" justify="start" class="tplWrapper">
            <el-col :span="5" v-for="(item, index) in lists" :key="o" class="tpls">
                <el-card :body-style="{ padding: '0px' }">
                    <img :src="item.cover" alt="封面图片" class="tipImg"/>
                    <div class="tplTitle">
                        <el-row style="padding: 14px 0 0 14px;">
                            <span style="font-weight:bold;">{{item.name}}</span>
                            <el-col class="time" :formatter="formatterDate">{{item.create_time | filterFun}}</el-col>
                        </el-row>
                        <el-row type="flex" justify="space-between" align="middle" style="padding:0 14px;">
                            <el-col>
                                <el-button type="text" @click="handleEdit(item.id)">编辑</el-button>
                                <el-button type="text" @click="handleDel(item.id)">删除</el-button>
                            </el-col>
                            <el-col :span="8">
                                <el-button type="primary" size="mini" icon="el-icon-edit" @click="handleCreate(item.id)">创建</el-button>
                            </el-col>
                        </el-row> 
                    </div>
                    
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    var util = require('src/js/common/util');
    var moment = require('moment');

    export default {
        data() {
            return {
                // total:0,
                lists: [],
                currentDate: util.dateFormate()
            };
        },
        mounted() {
            this.init();
        },
        filters: {  
            filterFun: function (value) {  
                return moment(value).format("YYYY-MM-DD hh:mm:ss");  
            }  
        },
        methods:{
            init(){
                let url = "/api/act/tpl/lists";
                let params = {
                    keys: this.keys
                };
                this.isLoading = true;
                this.$http.get(url,{params: params}).then((res)=>{
                    this.isLoading = false;
                    if(res.body.code === 'SUCCESS'){
                        this.lists = res.body.data;
                        // this.total = resData.total;
                        // this.lists = resData.lists;
                    }
                },(err) => {
                    this.isLoading = false;
                });
            },
            handleAdd(){
                this.$router.push({
                    path:'/act/tpl/add'
                });
            },
            handleCreate(id){
                this.$router.push({
                    path:'/act/create?tplid='+id
                });
            },
            handleEdit(id){
                this.$router.push({
                    path:'/act/tpl/edit?id='+id
                });
            },
            handleDel(id){
                this.$confirm('确认删除模板吗?', '友情提示', { type: 'warning'})
                .then(() => {
                    let url = '/api/act/tpl/'+ id;
                    this.$http.delete(url).then((res)=>{
                        this.$message({
                            message: '模板删除成功',
                            type: 'success'
                        });
                        this.init();
                    },(err)=>{
                        console.log(err);
                    });
                }).catch(()=>{
                    this.$message({
                        message:'已取消删除模板'
                    });
                });
            }
        }
    }
</script>
<style lang="scss">
    .acts{
        margin:10px 20px;
    }
    .tplWrapper{
        flex-wrap: wrap;
        padding-bottom:30px;
        &:after{
            content: "";
            flex: auto;
        }
        .tpls{
            margin:20px;
            width:270px; 
            .tipImg{
                display: block;
                width:100%;
                height:300px;
                overflow:hidden;
            }
            .tplTitle{
                height: 90px;
                overflow:hidden;
            }
        }
    }
    .time{
        color: #ccc;
    }
    
</style>

