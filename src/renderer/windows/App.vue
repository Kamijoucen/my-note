<template>
    <n-config-provider
        :theme="isDark ? darkTheme : undefined"
        :theme-overrides="isDark ? darkThemeOverrides : lightThemeOverrides"
    >
        <n-message-provider>
            <n-notification-provider>
                <n-dialog-provider>
                    <n-loading-bar-provider>
                        <!-- 未配置仓库：全屏初始化页 -->
                        <InitConfig v-if="isConfigured === false" @initialized="onInitialized" />
                        <!-- 已配置：正常布局 -->
                        <n-layout v-else-if="isConfigured === true" has-sider class="app-layout">
                            <MainContent />
                        </n-layout>
                        <!-- 加载中 -->
                        <div v-else class="loading-container">
                            <n-spin size="large" />
                        </div>
                    </n-loading-bar-provider>
                </n-dialog-provider>
            </n-notification-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import {
    darkTheme,
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NDialogProvider,
    NLoadingBarProvider,
    NLayout,
    NSpin
} from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';
import MainContent from './MainContent.vue';
import InitConfig from './InitConfig.vue';
import { protocol } from '../protocol';

// null = 加载中, false = 未配置, true = 已配置
const isConfigured = ref<boolean | null>(null);
const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
};

// 通过 provide 向子组件注入主题状态，避免 prop drilling
provide('isDark', isDark);
provide('toggleTheme', toggleTheme);

function onInitialized() {
    isConfigured.value = true;
}

onMounted(async () => {
    const result = await protocol.checkConfig();
    isConfigured.value = result.configured;
});

// Notion 亮色主题配色
const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#37352f',
        primaryColorHover: '#55534e',
        primaryColorPressed: '#2e2d2a',
        primaryColorSuppl: '#37352f',
        textColorBase: '#37352f',
        textColor1: '#37352f',
        textColor2: '#37352f',
        textColor3: '#787774',
        borderColor: '#e3e2de',
        dividerColor: '#e3e2de',
        bodyColor: '#ffffff',
        cardColor: '#ffffff',
        modalColor: '#ffffff',
        popoverColor: '#ffffff',
        tableColor: '#ffffff',
        inputColor: '#ffffff',
        actionColor: '#f7f6f3',
        hoverColor: '#efefef',
        pressedColor: '#e3e2de',
        tagColor: '#f7f6f3',
    },
    Button: {
        textColorPrimary: '#ffffff',
        colorPrimary: '#37352f',
        colorHoverPrimary: '#55534e',
        colorPressedPrimary: '#2e2d2a',
        borderPrimary: '#37352f',
        borderHoverPrimary: '#55534e',
        borderPressedPrimary: '#2e2d2a',
    },
    Input: {
        borderFocus: '#37352f',
        borderHover: '#787774',
        boxShadowFocus: '0 0 0 2px rgba(55, 53, 47, 0.1)',
    },
    Card: {
        borderColor: '#e3e2de',
    },
    Menu: {
        itemTextColorActive: '#37352f',
        itemTextColorActiveHover: '#37352f',
        itemColorActive: '#f7f6f3',
        itemColorActiveHover: '#efefef',
    },
    Tag: {
        borderRadius: '3px',
    },
};

// Notion 暗色主题配色
const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
        primaryColor: '#ffffffcf',
        primaryColorHover: '#ffffff',
        primaryColorPressed: '#ffffffa0',
        primaryColorSuppl: '#ffffffcf',
        textColorBase: '#ffffffcf',
        textColor1: '#ffffffcf',
        textColor2: '#ffffffcf',
        textColor3: '#9b9a97',
        borderColor: '#373737',
        dividerColor: '#373737',
        bodyColor: '#191919',
        cardColor: '#202020',
        modalColor: '#202020',
        popoverColor: '#2f2f2f',
        tableColor: '#202020',
        inputColor: '#202020',
        actionColor: '#2f2f2f',
        hoverColor: '#2f2f2f',
        pressedColor: '#373737',
        tagColor: '#2f2f2f',
    },
    Button: {
        textColorPrimary: '#191919',
        colorPrimary: '#ffffffcf',
        colorHoverPrimary: '#ffffff',
        colorPressedPrimary: '#ffffffa0',
        borderPrimary: '#ffffffcf',
        borderHoverPrimary: '#ffffff',
        borderPressedPrimary: '#ffffffa0',
    },
    Input: {
        borderFocus: '#ffffffcf',
        borderHover: '#9b9a97',
        boxShadowFocus: '0 0 0 2px rgba(255, 255, 255, 0.1)',
    },
    Card: {
        borderColor: '#373737',
    },
    Menu: {
        itemTextColorActive: '#ffffffcf',
        itemTextColorActiveHover: '#ffffffcf',
        itemColorActive: '#2f2f2f',
        itemColorActiveHover: '#373737',
    },
    Tag: {
        borderRadius: '3px',
    },
};
</script>

<style>
body {
    margin: 0;
    padding: 0;
}
</style>

<style scoped>
.app-layout {
    height: 100vh;
}

.content-layout {
    top: 56px;
    bottom: 0;
}

.loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
}
</style>
