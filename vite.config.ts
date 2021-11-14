import { defineConfig } from 'vite'
import { resolve } from 'path'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({


    // root: resolve(__dirname, 'example'),

    // build: {
    //     sourcemap: true,
    //     rollupOptions: {
    //         input: resolve(__dirname, 'example', 'index.html')
    //     }
    // },

    resolve: {
        alias: {
            '@editor': resolve(__dirname, 'src'),
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
                javascriptEnabled: true
            }
        }
    },

    server: {
        hmr: {
            overlay: false,
        }
    }
})