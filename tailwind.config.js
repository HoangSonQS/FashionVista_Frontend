/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map CSS variables để có thể dùng trong Tailwind classes
        // Nhưng khuyến khích dùng var(--...) trực tiếp trong className
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        'primary-hover': 'var(--primary-hover)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        error: 'var(--error)',
        'error-foreground': 'var(--error-foreground)',
        success: 'var(--success)',
        warning: 'var(--warning)',
      },
    },
  },
  plugins: [],
};


