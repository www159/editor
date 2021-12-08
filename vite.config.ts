import { defineConfig } from 'vite'
import { resolve } from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({

    mode: 'development',

    resolve: {
        alias: {
            '@editor': resolve(__dirname, 'src'),
            '@public': resolve(__dirname, 'public'),
            'chalk': resolve(__dirname, 'chalk')
        },
        // extensions: [
        //     '.less'
        // ]
    },

    plugins: [
        reactRefresh(),
    ],

    css: {
        preprocessorOptions: {
            less: {
                additionalData: `@import '${resolve(__dirname, 'src/index.share.less')}';`,
                javascriptEnabled: true
            }
        }
    },

    server: {
        host: '0.0.0.0',
        port: 3000,
        https: false,
    }
})