export interface Scene {
    id: string;
    name: string;
    description: string;
    background_prompt: string;  // 修正拼写错误
    image_url: string;
    category: string;           // 新增：场景分类
    is_public: boolean;         // 修正命名
    created_by: string;         // 修正命名
    created_at: string;
    updated_at: string;
}