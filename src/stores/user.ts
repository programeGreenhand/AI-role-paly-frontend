import { defineStore } from "pinia";
import { ref ,computed} from "vue";
import type { User } from "../types/user";


export const AuthStore = defineStore('auth', () => {
    // State
    const currentUser = ref<User | null>(null);
    const userId = ref<string | null>(null);

    // Actions
    const saveUser = (user: User) => {
        currentUser.value = user;
        userId.value = user.id; // 直接从 user 对象获取 id
        localStorage.setItem('user', JSON.stringify(user));
    };

    const clearUser = () => {
        currentUser.value = null;
        userId.value = null;
        localStorage.removeItem('user');
    };

    // Getters (使用 computed)
    const isAuthenticated = computed(() => currentUser.value !== null);
    const getUser = computed(() => currentUser.value);

    return {
        userId,
        currentUser,
        isAuthenticated,
        getUser,
        saveUser,
        clearUser
    };
});