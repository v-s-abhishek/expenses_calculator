/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-red-50',
    'bg-orange-50',
    'bg-purple-50',
    'bg-indigo-50',
    'bg-pink-50',
    'bg-cyan-50',
    'bg-gray-50',
    
    'text-blue-600',
    'text-green-600',
    'text-yellow-600',
    'text-red-600',
    'text-orange-600',
    'text-purple-600',
    'text-indigo-600',
    'text-pink-600',
    'text-cyan-600',
    'text-gray-600',
    
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-red-100',
    'bg-orange-100',
    'bg-purple-100',
    'bg-indigo-100',
    'bg-pink-100',
    'bg-cyan-100',
    'bg-gray-100',
    
    'text-blue-800',
    'text-green-800',
    'text-yellow-800',
    'text-red-800',
    'text-orange-800',
    'text-purple-800',
    'text-indigo-800',
    'text-pink-800',
    'text-cyan-800',
    'text-gray-800',
  ]
};