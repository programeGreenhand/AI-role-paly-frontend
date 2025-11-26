import { defineStore } from "pinia";
import { ref, watch } from "vue";
export const useThemeStore = defineStore("theme",()=>{
    const whatColor = ref('');
    const isDark = ref(false);

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

    // 初始化主题模式
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light'
        isDark.value = savedTheme === 'dark'
        applyTheme(isDark.value)
    }

    // 应用主题
    const applyTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            document.documentElement.removeAttribute('data-theme')
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }

    // 切换主题
    const toggleTheme = () => {
        isDark.value = !isDark.value
        applyTheme(isDark.value)
    }

    watch(whatColor, (newColor) => {
        document.documentElement.style.setProperty('--theme-color', newColor);
        saveColorToLocalStorage();
    }, { immediate: true });

    watch(isDark, (newVal) => {
        applyTheme(newVal)
    })

    return {
        whatColor,
        setWhatColor,
        saveColorToLocalStorage,
        isDark,
        initTheme,
        toggleTheme,
        applyTheme
    }
});