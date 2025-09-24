import { defineStore } from "pinia";
import { ref, watch } from "vue";
export const useThemeStore = defineStore("theme",()=>{
    const whatColor = ref('');

    // 设置主题颜色
    //颜色映射表
    const colorMap = {
        //淡蓝色
        'light-blue': '#d0e7ff',
        //淡紫色
        'light-purple': '#e6d0ff',
        //淡绿色
        'light-green': '#d0ffd6',
        //淡粉色
        'light-pink': '#ffd0e6',
    }

    interface ColorMap {
        [key: string]: string;
    }

    const setWhatColor = (color: string) => {
  
  if(colorMap[color]){
    whatColor.value = colorMap[color]

  } 
}

    // 保存主题颜色到localStorage
    const saveColorToLocalStorage = () => {
        localStorage.setItem('themeColor', whatColor.value);
    }

    watch(whatColor, (newColor) => {
        document.documentElement.style.setProperty('--theme-color', newColor);
        saveColorToLocalStorage();
    }, { immediate: true });

    

    

    return {
        whatColor,
        setWhatColor,
        saveColorToLocalStorage,
 
    }
});