export default defineNuxtConfig({
    css: ['@/assets/styles/base.scss', '@/assets/styles/main.scss'],
    build: {
        transpile: ['pinia']
    },
    modules: [
        ['@pinia/nuxt', { autoImports: ['defineStore', 'acceptHMRUpdate'] }]
    ]
})
