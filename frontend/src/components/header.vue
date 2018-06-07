<template>
    <header>
        <el-row type="flex" justify="space-between" align="middle" class="header">
            <el-col :span="12" style="font-size:14px; padding-left:30px; color:#324057;">
                您好！ {{ user.deps | formatDep }} -- {{ user.role.name }} -- {{ user.nickname }}
            </el-col>
            <el-col :span="2">
                <el-dropdown trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ user.nickname }}<i class="el-icon-caret-bottom el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="info">修改信息</el-dropdown-item>
                        <el-dropdown-item command="signout">退出</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-col>
        </el-row>
        <editForm :isEditVisible="editFormVisible" @onEditVisibleChange="onEditVisibleChange" @afterSubmit="init" :rowData="rowData" :newsTypeData="newsTypeData"></editForm>  
    </header>
</template>
<script>
    import editForm from './pwd.vue';
    export default{
        components:{editForm},
        name:"topMenu",
        data(){
            return {
                editFormVisible: false,
                user:{
                    role:{}
                }
            }
        },
        mounted(){
            this.init();
        },
        filters:{
            formatDep(deps) {
                if(!deps || deps.length == 0){
                    return '';
                }
                let depName = deps.map((dep)=>{ return dep.name }).join(' -- ');
                return depName;
            }
        },
        methods:{
            init(){
                this.user = JSON.parse(localStorage.getItem('user'));
            },
            handleCommand(command){
                if(command=='signout'){
                    let url = '/api/signout';
                    this.$http.post(url).then((res)=>{
                        if(res.body.code == 'SUCCESS'){
                            localStorage.clear();
                            this.$cookie.delete('cmsnodessid');
                            this.$router.push({ path: '/login'});
                        }
                    },(err)=>{
                        console.log(err);
                    });
                    return;
                }
                if(command == 'info'){
                    this.editFormVisible=true;
                }
            },
            onEditVisibleChange(val){
                this.editFormVisible = val;
            }
        }
    }
</script>
<style>
.header{
    height: 60px;
    min-height: 60px;
    background: #fff;
    border-bottom: solid 1px #fff;
}

.el-dropdown-link{
    cursor: pointer;
}

</style>

