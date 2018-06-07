<template>
    <el-row class="history">
        <h2>合同历史管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="6">
                <el-input v-model="keys" placeholder="请输入合同类别/标题"></el-input>
            </el-col>
            <el-col :span="18">
                <el-button type="primary" icon="el-icon-search" @click="getHistory">查询</el-button>
            </el-col>
        </el-row>
        <el-table :data="dataList" stripe v-loading="isLoading">
            <el-table-column type="index" width="60"></el-table-column>
            <el-table-column prop="contractsType.name" label="合同类别" align='center' width="160" show-overflow-tooltip></el-table-column>
            <el-table-column prop="title" label="合同标题" width="200" align='center' show-overflow-tooltip></el-table-column>
            <el-table-column prop="content" label="合同内容" min-width="200" align='center' class-name='overflow-ellipsis' :formatter="contentFormat"></el-table-column>
            <el-table-column prop="version" label="合同版本" width="100" align='center' ></el-table-column>
            <el-table-column prop="publish_time" label="发布时间" width="260" align='center' :formatter="dateFormat" show-overflow-tooltip></el-table-column>
            <el-table-column prop="create_time" label="添加时间" width="260" align='center' :formatter="dateFormat" show-overflow-tooltip></el-table-column>
            <el-table-column fixed="right" label="操作" width="100">
                <template scope="scope">
                    <el-button type="text" size="small" @click="preview(scope.$index,scope.row)">预览</el-button>
                    <el-button type="text" size="small" @click="rollback(scope.row)">回滚</el-button>
                    <!--<el-button type="text" size="small" @click="deleteHisData(scope.$index,scope.row)"-->
                               <!--style="color: #ff4949;">删除-->
                    <!--</el-button>-->
                </template>
            </el-table-column>
        </el-table>
        <div class="block pagbar">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pageIndex"
                    :page-sizes="[15, 30, 50, 100]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </el-row>
</template>
<script type="text/ecmascript-6">
    var moment = require('moment');

    export default({
        data(){
            return {
                isLoading: false,
                pageSize: 15,
                pageIndex: 1,
                total: 0,
                keys: '',
                dataList: [],
                ruleForm: {
                    title: '',
                    content: '',
                    name: '',
                    type: ''
                }
            }
        },
        mounted(){
            this.getHistoryData();
        },
        methods: {
            getHistoryData(){
                let url = '/api/contracts/history/lists';
                let params = {
                    keys: this.keys,
                    pageSize: this.pageSize,
                    pageIndex: this.pageIndex
                };
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if (res.body.code === 200) {
                        let resData = res.body.data;
                        this.dataList = resData.lists;
                        this.total = resData.total;
                    }
                }, (err)=> {
                    this.isLoading = false;
                    console.log(err);
                })
            },
            getHistory(){
                this.getHistoryData();
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.getLogs();
            },
            handleCurrentChange(val) {
                this.pageIndex = val;
                this.getLogs();
            },
            dateFormat(row, column, cellvalue){
                var date = row[column.property];
                if (date == undefined) {
                    return "";
                }
                return moment(date).format("YYYY-MM-DD HH:mm:ss");
            },
            contentFormat(row,column,cellValue){
                return row.content.replace(/<[^>]+>/g,"")
            },
//            deleteHisData(index, row){
//                this.$confirm('确认删除吗?', '友情提示', {type: 'warning'}).then(()=> {
//                    let url = '/api/contracts/history/' + row.id;
//                    this.$http.delete(url).then((res)=> {
//                        this.dataList.splice(index, 1);
//                    }, (err)=> {
//                        console.log(err);
//                    })
//                }).catch(()=> {
//                    this.$message({
//                        message: '已取消删除'
//                    })
//                })
//            },
            //预览;
            preview(index, row){
                window.open('/preview/contracts/history/' + row.id);
            },
            //回滚;
            rollback(dataId){
                this.$confirm('确认回滚吗?', '友情提示', {type: 'warning'}).then(()=> {
                    let url = '/api/contracts/history/' + dataId.id;
//                    console.log(dataId.id)
                    this.$http.get(url).then((res)=> {
                        if (res.body.code === 'SUCCESS') {
                            this.$message({
                                message: '回滚成功',
                                type: 'success'
                            });
                        }
                    }, (err)=> {
                        console.log(err);
                    })
                }).catch(()=>{
                    this.$message({
                        message:'已取消回滚'
                    })
                })


            }
        }
    })
</script>
