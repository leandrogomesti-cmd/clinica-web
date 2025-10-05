import type { Config } from 'tailwindcss'


const config: Config = {
darkMode: ['class'],
content: [
'./app/**/*.{ts,tsx}',
'./components/**/*.{ts,tsx}',
'./lib/**/*.{ts,tsx}',
'./pages/**/*.{ts,tsx}',
],
theme: {
container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
extend: {},
},
plugins: [require('tailwindcss-animate')],
}
export default config