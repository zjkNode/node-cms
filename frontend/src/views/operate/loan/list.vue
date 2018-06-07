<template>
    <el-row class="loans">
        <h2>贷款超市管理</h2>
        <el-row :gutter="20" class="tools">
            <el-col :span="4">
                <el-input v-model="name" placeholder="请输入产品名称"></el-input>
            </el-col>
            <el-select v-model="appCode" placeholder="请选择">
                <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                </el-option>
            </el-select>

            <el-date-picker
                    v-model="timer"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    value-format="yyyy-MM-dd hh:mm:ss"
                    align="right"
                    class="picker"
                    :clearable=false>
            </el-date-picker>

            <el-button type="primary" @click="initList" icon="el-icon-search" class="searchbtn">查询</el-button>
            <el-button type="primary" @click="addFormVisible = true" icon="el-icon-plus"> 新增</el-button>
        </el-row>
        <el-row>
            <el-table :data="dataList" stripe v-loading="isLoading" style="width: 100%;">
                <!--<el-table-column type="index" label="ID" width="60"></el-table-column>-->
                <el-table-column prop="name" label="产品名称" width="200"></el-table-column>
                <el-table-column prop="status" label="状态" width="150">
                    <template scope="scope">
                        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" close-transition>
                            {{scope.row.status | statusFilter}}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="operator" label="操作人" width="150"></el-table-column>
                <el-table-column prop="sort" label="排序" width="100"></el-table-column>
                <el-table-column prop="updateDate" label="更新时间" :formatter="formatterDate"
                                 min-width="180"></el-table-column>
                <el-table-column label="操作" fixed="right" width="180">
                    <template scope="scope">
                        <el-button type="text" size="small" @click="onEditClick(scope.row)">编辑</el-button>
                        <el-button type="text" size="small" @click="updatestatusClick(scope.$index,scope.row)"
                                   style="color: #ff4949;">{{scope.row.status === 1 ? '下架':'上架'}}
                        </el-button>
                        <el-button type="text" size="small" @click="onlookClick(scope.$index, scope.row)">查看</el-button>
                        <el-button type="text" size="small" @click="sortClick(scope.$index, scope.row)">排序</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-dialog
                    title="产品信息"
                    :visible.sync="islookVisible" class="verInfo">
                <div class="vers">
                    <div>
                        <p>产品名称 : </p>
                        <p>{{inforList.name}}</p>
                    </div>
                    <div>
                        <p>产品链接 : </p>
                        <p>{{inforList.url}}</p>
                    </div>
                    <div>
                        <p>限制UV数量 :</p>
                        <p>{{inforList.uvCount}}</p>
                    </div>
                    <div>
                        <p>产品图片 :</p>
                        <p><img :src="inforList.icon"/></p>
                    </div>
                    <div>
                        <p>额度 :</p>
                        <p>{{inforList.amount}}</p>
                    </div>
                    <div>
                        <p>期限 :</p>
                        <p>{{inforList.loan}}</p>
                    </div>
                    <div>
                        <p>简介 :</p>
                        <p>{{inforList.note}}</p>
                    </div>
                    <div>
                        <p>日利率 :</p>
                        <p>{{inforList.rate}}</p>
                    </div>
                    <div>
                        <p>用户端 :</p>
                        <p>{{inforList.uvCount}}</p>
                    </div>
                    <div>
                        <p>appID :</p>
                        <p>{{inforList.appid}}</p>
                    </div>
                    <div>
                        <p>regSuccessKeyword :</p>
                        <p>{{inforList.regSuccessKeyword}}</p>
                    </div>
                    <div>
                        <p>urlscheme :</p>
                        <p>{{inforList.urlScheme}}</p>
                    </div>
                </div>
            </el-dialog>
            <!--修改排序-->
            <el-dialog title="修改排序" :visible.sync="issortVisible">
                <el-form :model="sortData" ref="sortData" :rules="sortRules" label-width="80px">
                    <el-form-item label="排序" prop="sort">
                        <el-col :span="12">
                            <el-input v-model="sortData.sort" auto-complete="off"></el-input>
                        </el-col>
                        <el-col :span="12" :push="1">
                            <i class="el-icon-warning"> 请输入正整数</i>
                        </el-col>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="resetForm('sortData')">取 消</el-button>
                    <el-button type="primary" @click="submitForm('sortData')">确 定</el-button>
                </div>
            </el-dialog>
            <!--产品上下架-->
            <el-dialog title="修改产品状态" :visible.sync="isstatusVisible">
                <el-form :model="statusData" ref="statusData" :rules="statusRules" label-width="80px">
                    <el-form-item label="状态" prop="status">
                        <el-radio-group v-model.number="statusData.status">
                            <el-radio v-bind:label="1">上架</el-radio>
                            <el-radio v-bind:label="2">下架</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="resetFormStatus('statusData')">取 消</el-button>
                    <el-button type="primary" @click="submitFormStatus('statusData')">确 定</el-button>
                </div>
            </el-dialog>
            <div class="block pagbar">
                <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="pageNumber"
                        :page-sizes="[20, 30, 50, 100]"
                        :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="count">
                </el-pagination>
            </div>
        </el-row>
        <addForm :isAddVisible="addFormVisible" @onAddVisibleChange="onAddVisibleChange" @afterSubmit="init"></addForm>
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init"
                  :rowData="rowData"></editForm>
    </el-row>
</template>

<script type="text/ecmascript-6">
    var utility = require('../../../js/common/util');
    import addForm from './add.vue';
    import editForm from './edit.vue';
    var moment = require('moment');

    export default{
        components: {addForm, editForm},
        data(){
            /*请输入正整数*/
            let handleInput = (rule, value, callback) => {
                if (/^[1-9]\d*$/.test(value) == true) {
                    if (value > 32767 || value < 1) {
                        callback(new Error('请输入1-32767之间的数字'));
                    } else {
                        callback();
                    }
                } else {
//                    callback();
                    callback(new Error('请输入正整数!'))
                }
            };
            return {
                addFormVisible: false,
                editFormVisible: false,
                islookVisible: false,//查看弹框;
                issortVisible: false,//修改排序弹框;
                isstatusVisible: false,
                rowData: null,
                pageSize: 20,
                pageNumber: 1,
                count: 0,
                name: '',
                appCode: 100001,
                options: [{
                    value: 100001,
                    label: '简单借款'
                }, {
                    value: 100003,
                    label: '优分期'
                }],
                timer: '',
                inforList: {},
                dataList: null,//页面数据
                sortData: {
                    'sort': ''
                },
                statusData: {
                    status: ''
                },
                lookData: {
                    id: ''
                },
                sortRules: {
                    sort: [
                        {required: false, validator: handleInput, trigger: 'change', type: 'number'}
                    ]
                },
                statusRules: {
                    status: [
                        {required: true, trigger: 'blur', type: 'number'}
                    ]
                }
            }
        },
        filters: {
            statusFilter(val){
                if (val === 1)
                    return '上架';
                if (val === 2)
                    return '下架';
                return '未知';
            }
        },
        mounted(){
            this.init();
        },
        methods: {
            handleSizeChange(val) {
                this.pageSize = val;
                this.init();
            },
            handleCurrentChange(val) {
                this.pageNumber = val;
                this.init();
            },
            formatterDate(row, column, cellValue){
                return moment(cellValue).format("YYYY-MM-DD hh:mm:ss")
            },
            onAddVisibleChange(val){
//                console.log('addaddadd');
                this.addFormVisible = val;
            },
            onEditVisibleChange(val){
//                console.log('editeditedit');
                this.editFormVisible = val;
            },
            init(){
                let url = '/api/operate/lists';
                let params = {
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                    appCode: this.appCode
                };
                this.timer ? params.startDate = this.timer[0] : null;
                this.timer ? params.endDate = this.timer[1] : null;
                this.name ? params.name = this.name : null;
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if (res.body.code === 200) {
                        var resdata = res.body.data;
                        this.count = resdata.count;
                        this.dataList = resdata.pageData;
                    } else {
                        this.$alert(res.body.message, '友情提示', {
                            confirmButtonText: '确定'
                        });
                    }
                }, (err) => {
                    this.isLoading = false;
                });
            },
            initList(){//查询
//                console.log(this.timer);
                this.init();
            },
            onEditClick(row){//编辑
                this.rowData = Object.assign({}, row);
                this.editFormVisible = true;
            },
            onlookClick(index, row){//查看
                this.lookData = Object.assign({}, row);
                let url = '/api/operate/' + this.lookData.id;
                let params = {};
                this.isLoading = true;
                this.$http.get(url, {params: params}).then((res)=> {
                    this.isLoading = false;
                    if (res.body.code === 200) {
                        this.inforList = res.body.data;
                        console.log(this.inforList);
                    }
                }, (err) => {
                    this.isLoading = false;
                });
                this.islookVisible = true;
            },
            updatestatusClick(index, row){//上下架
                this.statusData = Object.assign({}, row);
                this.isstatusVisible = true;
            },
            sortClick(index, row){//排序
                this.sortData = Object.assign({}, row);
                this.issortVisible = true;
            },
            resetForm(formName){
                this.$refs[formName].resetFields();
                this.issortVisible = false;
            },
            submitForm(formName){//排序
                var me = this;
                me.$refs[formName].validate((valid)=> {
                    if (!valid) {
                        return false;
                    }
                    this.isLoading = true;
                    var data = Object.assign({}, me.sortData);
                    data = {id: data.id, sort: data.sort};
                    var apiUrl = "/api/operate/" + this.sortData.id;
                    this.$http.put(apiUrl, data).then((res)=> {
                        this.isLoading = false;
                        if (res.body.code === 200) {
                            this.issortVisible = false;
                            this.init();
                        } else {
                            this.$alert(res.body.message, '友情提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    }, (error)=> {
                        this.isLoading = false;
                        console.log(error);
                    });
                });
            },
            resetFormStatus(formName){
                this.$refs[formName].resetFields();
                this.isstatusVisible = false;
            },
            submitFormStatus(formName){//上下架
                var me = this;
                me.$refs[formName].validate((valid)=> {
                    if (!valid) {
                        return false;
                    }
                    this.isLoading = true;
                    var statusData = Object.assign({}, me.statusData);
                    statusData = {id: statusData.id, status: statusData.status};
                    var apiUrl = "/api/operate/" + this.statusData.id;
                    this.$http.post(apiUrl, statusData).then((res)=> {
                        this.isLoading = false;
                        if (res.body.code === 200) {
                            this.isstatusVisible = false;
                            this.init();
                        } else {
                            this.$alert(res.body.message, '友情提示', {
                                confirmButtonText: '确定'
                            });
                        }
                    }, (error)=> {
                        this.isLoading = false;
                        console.log(error);
                    })

                });
            }
        }
    }
</script>
<style lang="scss">
    .vers {
        padding-left: 40px;
    }

    .vers > div {
        width: 100%;
        display: flex;
        margin-top: 10px;
    }

    .vers > div p:nth-child(1) {
        width: 23%;
        font-size: 14px;
        color: #606266;
        font-weight: bold;
    }

    .vers > div p:nth-child(2) {
        width: 76%;
    }

    .vers img {
        display: inline-block;
        width: 80px;
        height: 80px;
    }

    .popoverbtn {
        margin-left: 10px;
    }

    .btns {
        margin-bottom: -5px !important;
    }

    .searchbtn {
        margin-left: 10px !important;
    }

    .picker {
        margin-left: 5px;
    }
</style>