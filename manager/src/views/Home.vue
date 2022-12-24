<template>
  <div class="basic-layout">
    
    <div :class="['nav-side',isCollapse? 'fold':'unfold']">
        <!-- 系统logo -->
        <div class="logo">
            <img src="../assets/logo.png" alt="">
            <span>Manager</span>
        </div>
        <!-- 导航菜单 -->
        <div class="menu">
            <el-menu 
                router
                background-color="#001529"
                text-color="#fff"
                :collapse="isCollapse"
                :default-active="activeMenu"
                class="el-menu-vertical-demo menuWidth" 
            >
                <TreeMenu :menuList="menuList"/>
            </el-menu>
        </div>
    </div>
    <div :class="['content-right', isCollapse ? 'fold' : 'unfold']">
        <div class="nav-top">

           <div class="nav-left">
                <div class="menu-fold" @click="toggle">
                    <el-icon>
                        <Fold />
                    </el-icon>
                </div>
                <div class="bread">
                    <BreadCrumb/>
                </div>
           </div>
            <div class="user-info">
                <el-badge 
                :is-dot="(noticeCount>0? true:false)" 
                class="notice"
                @click="$router.push('/audit/approve')"
                >
                    <el-icon>
                        <Bell />
                    </el-icon>
                </el-badge>
                <el-dropdown @command="handleLogout" class="dropdown">
                    <span class="user-link">
                        {{ userInfo.userName }}
                        <el-icon class="el-icon--right"></el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="email">邮箱：{{ userInfo.userEmail }}</el-dropdown-item>
                            <el-dropdown-item command="logout">退出 </el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
        <div class="wrapper">
            <router-view></router-view>
        </div>
    </div>
  </div>
</template>

<script>
import TreeMenu from '../components/TreeMenu.vue'
import BreadCrumb from '../components/BreadCrumb.vue'
export default {
    name:'Home',
    components: { TreeMenu, BreadCrumb },
    data(){
        return{
            isCollapse:false,
            userInfo: this.$store.state.userInfo || {},
            noticeCount:0,
            menuList:[],
            activeMenu:location.hash.slice(1)
        }
        
    },
    computed:{
        noticeCount(){
            return this.$store.state.noticeCount
        }
    },
    mounted(){
        this.getNoticeCount()
        this.getMenuList()
    },
    methods:{
        handleLogout(key){
            if(key==='email') return
            this.$store.commit('saveUserInfo','')
            this.userInfo = {}
            this.$router.push('/login')
        },
        toggle(){
            this.isCollapse = !this.isCollapse
        },
        async getNoticeCount(){
            try {
                const count = await this.$api.noticeCount()
                this.$store.commit('saveNoticeCount',count)
            } catch (error) {
                console.log(error);
            }
            
        },
        async getMenuList() {
            try {
                const menuList = await this.$api.getPermissionList()
                this.menuList = menuList
            } catch (error) {
                console.log(error);
            }

        }
    }
}

</script>

<style lang='scss' scoped>
.basic-layout {
    position: relative;
    .nav-side{
        position: fixed;
        height: 100%;
        background-color: #001529;
        color: #fff;
        overflow-y: auto;
        transition: width 0.5s;
        border-right: none;
        .menu {
            border-right: none;
            .menuWidth {
                width: 200px !important;
            }
        }
        .logo {
            display: flex;
            align-items: center;
            font-size: 18px;
            height: 50px;
            img {
                margin: 0 16px;
                width: 32px;
                height: 32px;
            }
        }
        &.fold {
            width: 64px;
        }
        &.unfold {
            width: 199px;
        }
    }
    .content-right {
        margin-left: 200px;
        transition: margin 0.5s;
        .nav-top {
            height: 50px;
            line-height: 50px;
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid #ddd;
            padding: 0 20px;
            .nav-left {
                display: flex;
                align-items: center;
                .menu-fold {
                    padding-right: 15px;
                    padding-top: 8px;
                    font-size: 18px;
                }
            }
            .user-info {
                .notice {
                    line-height: 30px;
                    cursor: pointer;
                }
                .dropdown {
                    padding: 15px 0 0 15px;
                    .user-link {
                        cursor: pointer;
                        color: #409eff;
                    }
                }
            }
        }
        .wrapper {
            background-color: #eef0f3;
            height:calc(100vh - 50px);
            padding: 20px;
        }
        &.fold {
            
            margin-left: 64px;
        }

        &.unfold {
            margin-left: 199px;
        }
    }
}
</style>
