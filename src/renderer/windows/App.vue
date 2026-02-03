<template>
    <n-config-provider
        :theme="isDark ? darkTheme : undefined"
        :theme-overrides="isDark ? darkThemeOverrides : lightThemeOverrides"
    >
        <n-message-provider>
            <n-notification-provider>
                <n-dialog-provider>
                    <n-loading-bar-provider>
                        <MainContent
                            :is-dark="isDark"
                            @toggle-theme="toggleTheme"
                        />
                    </n-loading-bar-provider>
                </n-dialog-provider>
            </n-notification-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
    darkTheme,
    NConfigProvider,
    NMessageProvider,
    NNotificationProvider,
    NDialogProvider,
    NLoadingBarProvider
} from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';
import MainContent from './MainContent.vue';

const isDark = ref(false);

const toggleTheme = () => {
    isDark.value = !isDark.value;
};

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
