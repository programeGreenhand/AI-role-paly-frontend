<!-- 生成vue组件文件空框架 -->
 <template>
    <div class="user-profile-container">
      <div class="user-profile-content">
        <h2>用户资料</h2>
        <p>这里是用户资料页面的内容。</p>

      </div>
      <div class="tool">
         <div>
            <el-tabs type="demo-tabs" >
              <el-tab-pane label="文件"></el-tab-pane>
              <el-tab-pane label="写作"></el-tab-pane>
            </el-tabs>
         </div>
         <el-input style="width: 20rem;" size="defualt" v-model="searchQuery" placeholder="搜索用户资料..."></el-input>
      </div>
      <div class="content" v-for="value in source">
         <el-card>
            {{ value.name }} - {{ value.email }}
         </el-card>
      </div>
    </div>
 </template>
<script setup lang="ts">
import { ref } from 'vue';

const searchQuery = ref('');

//生成source假数据，为一堆信息对象
const source = ref([
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' },
  { id: 3, name: '王五', email: 'wangwu@example.com' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com' },
  { id: 5, name: '孙七', email: 'sunqi@example.com' },
]);
</script>

<style scoped>
.user-profile-container{
   width: 60vw;
   height: 100vh;
 
   margin-left: 20vw;
   margin-right: 20vw;
}

.tool{
   display: flex;
   justify-content: space-between;
   align-items: center;
   
   }
</style>
