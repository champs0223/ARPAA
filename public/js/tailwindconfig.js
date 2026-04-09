tailwind.config = {
    theme: {
        extend: {
            colors: {
                teal: {
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                },
                yellow: {
                    300: '#fde68a',
                    400: '#fbbf24',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        }
    }
}