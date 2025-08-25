# Landing Page Critic - Design System

## Overview

This design system provides a cohesive, accessible, and modern UI framework for the Landing Page Critic application. It includes comprehensive color palettes, typography scales, spacing systems, and component patterns.

## Color Palette

### Primary Colors
- **Primary**: `hsl(221 83% 53%)` - Main brand color for buttons, links, and highlights
- **Primary Hover**: `hsl(221 83% 48%)` - Darker shade for hover states
- **Primary Light**: `hsl(221 83% 95%)` - Light background for primary elements

### Status Colors
- **Success**: `hsl(142 76% 36%)` - Green for positive states and good performance
- **Warning**: `hsl(38 92% 50%)` - Orange for warnings and needs improvement
- **Error**: `hsl(0 84% 60%)` - Red for errors and poor performance
- **Info**: `hsl(221 83% 53%)` - Blue for informational content

### Neutral Colors
- **Background**: `hsl(0 0% 100%)` (light) / `hsl(222.2 84% 4.9%)` (dark)
- **Foreground**: `hsl(222.2 84% 4.9%)` (light) / `hsl(210 40% 98%)` (dark)
- **Muted**: `hsl(210 40% 96.1%)` (light) / `hsl(217.2 32.6% 17.5%)` (dark)
- **Border**: `hsl(214.3 31.8% 91.4%)` (light) / `hsl(217.2 32.6% 17.5%)` (dark)

## Typography

### Font Stack
- **Primary**: Geist Sans (system fallback)
- **Monospace**: Geist Mono (system fallback)

### Type Scale
```css
/* Headings */
h1, .h1 { @apply text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl; }
h2, .h2 { @apply text-3xl font-bold tracking-tight lg:text-4xl; }
h3, .h3 { @apply text-2xl font-semibold tracking-tight lg:text-3xl; }
h4, .h4 { @apply text-xl font-semibold tracking-tight; }
h5, .h5 { @apply text-lg font-medium tracking-tight; }
h6, .h6 { @apply text-base font-medium tracking-tight; }

/* Body Text */
.text-balance { text-wrap: balance; }
.text-pretty { text-wrap: pretty; }
```

## Spacing System

### Spacing Scale
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)
- **2xl**: `3rem` (48px)

### Container Classes
- `.container-responsive`: Responsive max-width container with padding
- `.grid-responsive`: Responsive grid layout

## Border Radius

- **sm**: `0.5rem` (8px)
- **md**: `0.75rem` (12px)
- **lg**: `1rem` (16px)
- **xl**: `1.5rem` (24px)

## Shadows

- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`

## Component Patterns

### Buttons

#### Variants
- **default**: Primary action button
- **secondary**: Secondary action button
- **outline**: Bordered button for less prominent actions
- **ghost**: Minimal button for subtle interactions
- **destructive**: For dangerous actions
- **success/warning/error/info**: Status-specific buttons

#### Sizes
- **sm**: Small button (32px height)
- **default**: Standard button (36px height)
- **lg**: Large button (44px height)
- **xl**: Extra large button (48px height)
- **icon**: Square button for icons

#### Usage
```tsx
<Button variant="default" size="lg" className="btn-primary">
  <Sparkles className="mr-2 h-4 w-4" />
  Primary Action
</Button>
```

### Cards

#### Base Card
```tsx
<Card className="card-hover">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

#### Card Enhancements
- `.card-hover`: Adds hover effects and shadow transitions
- `.card-interactive`: Makes card clickable with scale effects

### Status Indicators

#### Status Classes
- `.status-success`: Green background with success styling
- `.status-warning`: Orange background with warning styling
- `.status-error`: Red background with error styling
- `.status-info`: Blue background with info styling

### Loading States

#### Spinner
```tsx
<div className="loading-spinner h-8 w-8 border-primary"></div>
```

#### Dots
```tsx
<div className="loading-dots">
  <div style={{'--i': 0}}></div>
  <div style={{'--i': 1}}></div>
  <div style={{'--i': 2}}></div>
</div>
```

## Utility Classes

### Layout
- `.container-responsive`: Responsive container with max-width and padding
- `.grid-responsive`: Responsive grid layout
- `.glass`: Glass morphism effect

### Animations
- `.fade-in`: Fade in animation
- `.slide-in-up`: Slide up animation
- `.scale-in`: Scale in animation

### Focus & Accessibility
- Focus rings are automatically applied to interactive elements
- High contrast ratios for accessibility
- Proper ARIA labels and semantic HTML

## Dark Mode Support

The design system includes comprehensive dark mode support with:
- Automatic theme switching based on system preference
- Manual theme toggle with light/dark/system options
- Proper color contrasts in both modes
- Smooth transitions between themes

## Responsive Design

### Breakpoints
- **sm**: 640px and up
- **md**: 768px and up
- **lg**: 1024px and up
- **xl**: 1280px and up
- **2xl**: 1536px and up

### Mobile-First Approach
- All components are designed mobile-first
- Progressive enhancement for larger screens
- Touch-friendly interaction targets (minimum 44px)

## Micro-interactions

### Hover Effects
- Subtle scale transforms on interactive elements
- Color transitions for buttons and cards
- Shadow depth changes for depth perception

### Focus States
- Visible focus rings for keyboard navigation
- Color changes for focus indicators
- Proper contrast ratios for accessibility

### Loading States
- Smooth spinners and skeleton screens
- Progressive loading with placeholder content
- Clear feedback for user actions

## Best Practices

### Color Usage
- Use primary colors sparingly for emphasis
- Reserve status colors for their intended purposes
- Maintain sufficient contrast ratios (WCAG AA compliant)

### Typography
- Use heading hierarchy properly (h1 → h2 → h3)
- Keep line lengths readable (45-75 characters)
- Use appropriate font weights for hierarchy

### Spacing
- Use consistent spacing scale throughout
- Group related elements with similar spacing
- Use larger spacing for section separation

### Accessibility
- Always include proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

## Implementation Notes

### CSS Custom Properties
All design tokens are defined as CSS custom properties for easy theming and modification.

### Tailwind Integration
The design system is built on Tailwind CSS with custom extensions for:
- Color palette
- Typography scale
- Spacing system
- Component variants

### Component Library
Components are built using:
- Radix UI primitives for accessibility
- Class Variance Authority for variant management
- Lucide React for consistent iconography

## Future Enhancements

- Component playground for testing
- Design token export for other platforms
- Automated accessibility testing
- Performance monitoring for design system usage
