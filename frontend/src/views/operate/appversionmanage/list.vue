<template>
    <el-row class="loans">
        <h2>APP版本管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="4">
                <template>
                    <el-select v-model="chooseApp" placeholder="请选择客户端">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </template>
            </el-col>
            <el-col :span="4">
                <el-input v-model="keys" placeholder="请输入版本号"></el-input>
            </el-col>
            <el-col :span="9">
                <template>
                    <el-date-picker
                            v-model="timevalue"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            align="right">
                    </el-date-picker>
                </template>
            </el-col>
            <el-col :span="5">
                <el-button type="primary" @click="" icon="el-icon-search">查询</el-button>
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="dataList" stripe v-loading="isLoading" style="width: 100%;">
                <el-table-column type="index" label="序号" width="60"></el-table-column>
                <el-table-column prop="kehuduan" label="端" width="120"></el-table-column>
                <el-table-column prop="banben" label="当前版本" width="120"></el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createtime" label="生效时间" min-width="180"
                                 :formatter="formatterDate"></el-table-column>
                <el-table-column prop="time" label="创建时间" min-width="180" :formatter="formatterDate"></el-table-column>
                <el-table-column prop="user" label="操作人" :formatter="formatterDate" width="120"></el-table-column>
                <el-table-column label="操作" fixed="right" width="120">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onlookClick(scope.$index, scope.row)">查看
                        </el-button>
                        <el-button type="text" size="small" @click="onuseClick(scope.$index, scope.row)">启用</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog
                    title="版本详情"
                    :visible.sync="isverVisible" class="verInfo" :before-close="handleClose">
                <div class="vers" v-for="item in versionList">

                </div>
            </el-dialog>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit=""></addForm>
    </el-row>
</template>

<script type="text/ecmascript-6">
    import addForm from './add.vue';
    var moment = require('moment');

    export default{
        components: {addForm},
        data(){
            return {
                addFormVisible: false,
                isverVisible: false,
                versionList: [{
                    'kehuduan': '简单借款',
                    'banben': '2.0.0',
                    'status': '启用',
                    'createtime': '2018-01-02',
                    'time': '2010-5-5',
                    'user': '管理员'
                }],
                dataList: [{
                    'index': '1',
                    'kehuduan': '简单借款',
                    'banben': '2.0.0',
                    'status': '启用',
                    'createtime': '2018-01-02',
                    'time': '2010-5-5',
                    'user': '管理员'
                }, {
                    'index': '1',
                    'kehuduan': '简单借款',
                    'banben': '2.0.0',
                    'status': '启用',
                    'createtime': '2018-01-02',
                    'time': '2010-5-5',
                    'user': '操作人'
                }, {
                    'index': '1',
                    'kehuduan': '简单借款',
                    'banben': '2.0.0',
                    'status': '停用',
                    'createtime': '2018-01-02',
                    'time': '2010-5-5',
                    'user': '操作人'
                }]
            }
        },
        filters: {
            statusFilter(val){
                if (val === '启用')
                    return '启用';
                if (val === '停用')
                    return '停用';
                return '未知';
            }
        },
        mounted(){

        },
        methods: {
            onAddVisibleChange(val){
                this.addFormVisible = val;
            },
            onlookClick(index, row){
                this.isverVisible = true;
            },
            onuseClick(index, row){
                this.$confirm('确认启用吗?', '友情提示', {type: 'warning'}).then(() => {
                    let url = '/api/menu/' + row.id;
                    this.$http.delete(url).then((res)=> {
                        this.$parent.$parent.$children[0].onMenuReload()
                        this.menuList.splice(index, 1);
                        this.init();
                    }, (err)=> {
                        console.log(err);
                    });
                }).catch(()=> {
                    this.$message({
                        message: '已取消启用'
                    });
                });
            }
        }
    }
</script>
