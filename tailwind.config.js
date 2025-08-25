/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'var(--radius-xl)',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))',
  				light: 'hsl(var(--primary-light))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))',
  				hover: 'hsl(var(--secondary-hover))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))',
  				hover: 'hsl(var(--muted-hover))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))',
  				hover: 'hsl(var(--accent-hover))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  				light: 'hsl(var(--success-light))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  				light: 'hsl(var(--warning-light))'
  			},
  			error: {
  				DEFAULT: 'hsl(var(--error))',
  				foreground: 'hsl(var(--error-foreground))',
  				light: 'hsl(var(--error-light))'
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))',
  				light: 'hsl(var(--info-light))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		spacing: {
  			xs: 'var(--spacing-xs)',
  			sm: 'var(--spacing-sm)',
  			md: 'var(--spacing-md)',
  			lg: 'var(--spacing-lg)',
  			xl: 'var(--spacing-xl)',
  			'2xl': 'var(--spacing-2xl)',
  		},
  		boxShadow: {
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-in-up': 'slideInUp 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			slideInUp: {
  				'0%': { transform: 'translateY(1rem)', opacity: '0' },
  				'100%': { transform: 'translateY(0)', opacity: '1' },
  			},
  			scaleIn: {
  				'0%': { transform: 'scale(0.95)', opacity: '0' },
  				'100%': { transform: 'scale(1)', opacity: '1' },
  			},
  		},
  		fontFamily: {
  			sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  			mono: ['var(--font-geist-mono)', 'monospace'],
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					color: 'hsl(var(--foreground))',
  					'[class~="lead"]': {
  						color: 'hsl(var(--muted-foreground))',
  					},
  					a: {
  						color: 'hsl(var(--primary))',
  						textDecoration: 'underline',
  						fontWeight: '500',
  					},
  					strong: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  					},
  					'ol[type="A"]': {
  						'--list-counter-style': 'upper-alpha',
  					},
  					'ol[type="a"]': {
  						'--list-counter-style': 'lower-alpha',
  					},
  					'ol[type="A" s]': {
  						'--list-counter-style': 'upper-alpha',
  					},
  					'ol[type="a" s]': {
  						'--list-counter-style': 'lower-alpha',
  					},
  					'ol[type="I"]': {
  						'--list-counter-style': 'upper-roman',
  					},
  					'ol[type="i"]': {
  						'--list-counter-style': 'lower-roman',
  					},
  					'ol[type="I" s]': {
  						'--list-counter-style': 'upper-roman',
  					},
  					'ol[type="i" s]': {
  						'--list-counter-style': 'lower-roman',
  					},
  					'ol[type="1"]': {
  						'--list-counter-style': 'decimal',
  					},
  					'ol > li': {
  						position: 'relative',
  					},
  					'ol > li::marker': {
  						fontWeight: '400',
  						color: 'hsl(var(--muted-foreground))',
  					},
  					'ul > li': {
  						position: 'relative',
  					},
  					'ul > li::marker': {
  						color: 'hsl(var(--muted-foreground))',
  					},
  					hr: {
  						borderColor: 'hsl(var(--border))',
  						borderTopWidth: 1,
  					},
  					blockquote: {
  						fontWeight: '500',
  						fontStyle: 'italic',
  						color: 'hsl(var(--foreground))',
  						borderLeftWidth: '0.25rem',
  						borderLeftColor: 'hsl(var(--border))',
  						quotes: '"\\201C""\\201D""\\2018""\\2019"',
  					},
  					h1: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '800',
  					},
  					h2: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '700',
  					},
  					h3: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  					},
  					h4: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  					},
  					'figure figcaption': {
  						color: 'hsl(var(--muted-foreground))',
  					},
  					code: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  					},
  					'code::before': {
  						content: '"`"',
  					},
  					'code::after': {
  						content: '"`"',
  					},
  					'a code': {
  						color: 'hsl(var(--primary))',
  					},
  					pre: {
  						color: 'hsl(var(--foreground))',
  						backgroundColor: 'hsl(var(--muted))',
  						overflowX: 'auto',
  						fontWeight: '400',
  					},
  					'pre code': {
  						backgroundColor: 'transparent',
  						borderWidth: '0',
  						borderRadius: '0',
  						padding: '0',
  						fontWeight: 'inherit',
  						color: 'inherit',
  						fontSize: 'inherit',
  						fontFamily: 'inherit',
  						lineHeight: 'inherit',
  					},
  					'pre code::before': {
  						content: 'none',
  					},
  					'pre code::after': {
  						content: 'none',
  					},
  					table: {
  						width: '100%',
  						tableLayout: 'auto',
  						textAlign: 'left',
  						marginTop: '2em',
  						marginBottom: '2em',
  						fontSize: '0.875em',
  						lineHeight: '1.7142857',
  					},
  					thead: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))',
  					},
  					'thead th': {
  						verticalAlign: 'bottom',
  						paddingRight: '0.5714286em',
  						paddingBottom: '0.5714286em',
  						paddingLeft: '0.5714286em',
  					},
  					'tbody tr': {
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))',
  					},
  					'tbody tr:last-child': {
  						borderBottomWidth: '0',
  					},
  					'tbody td': {
  						verticalAlign: 'baseline',
  					},
  					tfoot: {
  						borderTopWidth: '1px',
  						borderTopColor: 'hsl(var(--border))',
  					},
  					'tfoot td': {
  						verticalAlign: 'top',
  					},
  				},
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
