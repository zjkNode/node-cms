<template>
    <el-row class="loans">
        <h2>公告管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="5">
                <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
            </el-col>
        </el-row>
        <el-row>
            <el-table :data="dataList" stripe v-loading="isLoading" style="width: 100%;">
                <el-table-column prop="kehuduan" label="标题"></el-table-column>
                <el-table-column prop="banben" label="链接"></el-table-column>
                <el-table-column prop="banben" label="排序"></el-table-column>
                <el-table-column prop="status" label="状态">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createtime" label="开始时间" :formatter="formatterDate"></el-table-column>
                <el-table-column prop="time" label="结束时间" :formatter="formatterDate"></el-table-column>
                <el-table-column prop="user" label="用户端" :formatter="formatterDate"></el-table-column>
                <el-table-column prop="user" label="操作人" :formatter="formatterDate"></el-table-column>
                <el-table-column label="操作" fixed="right" width="90">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.$index, scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit=""></addForm>
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit=""
                  :rowData="rowData"></editForm>
    </el-row>
</template>

<script type="text/ecmascript-6">
    import addForm from './add.vue';
    import editForm from './edit.vue';

    var moment = require('moment');

    export default{
        components: {addForm, editForm},
        data(){
            return {
                addFormVisible: false,
                editFormVisible: false,
                dataList: [{
                    'index': '1',
                    'kehuduan': '简单借款',
                    'banben': '2.0.0',
                    'status': '启用',
                    'createtime': '2018-01-02',
                    'time': '2010-5-5',
                    'user': '管理员'
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
            onEditClick(row){
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            },
            onAddVisibleChange(val){
                this.addFormVisible = val;
            }
        }
    }
</script>
