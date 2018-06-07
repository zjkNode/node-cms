<template>
    <div>
        <template v-for="child in children">
            <el-submenu :index="child.alink" :key="child.alink" v-if="child.children">
                <template slot="title">{{child.name}}</template>
                <Tree :lists = "child.children" v-if="child.children"></Tree>
            </el-submenu>
        </template>
    </div>
</template>
<script>
    import Tree from './tree.vue';
    export default {
        props:['children'],
        components:{Tree}
    }
</script>
