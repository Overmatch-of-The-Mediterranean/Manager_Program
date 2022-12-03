<template>
    <template v-for="menu in menuList"  :key="menu._id">
        <el-sub-menu v-if="menu.children && menu.children.length>0 && menu.children[0].menuType==1"  :index="menu.path">
            <template #title>
                <el-icon>
                    <Setting/>
                    <!-- <el-icon>
                        <component :is="menu.icon" />
                    </el-icon> -->
                </el-icon>
                <span>{{menu.menuName}}</span>
            </template>
            <TreeMenu :menuList="menu.children"/>
        </el-sub-menu>
        <el-menu-item v-else-if="menu.menuType==1"  :index="menu.path">{{menu.menuName}}</el-menu-item>
    </template>
</template>

<script>
import { Setting,Promotion} from '@element-plus/icons-vue'
export default {
    name:'TreeMenu',
    mounted(){
        console.log(this.menuList,'hhh');
    },
    components: { Setting, Promotion },
    props:{
        menuList:{
            type:Array,
            default(){
                return []
            }
        }
    }
}

</script>

<style lang='scss' scoped>

</style>
