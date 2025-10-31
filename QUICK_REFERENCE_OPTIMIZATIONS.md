# Quick Reference - Optimized Components Usage

## 🚀 For Instant Responsiveness, Always Use:

### 1. OptimizedButton (instead of Button for actions)

```tsx
import { OptimizedButton } from '@/components/ui/optimized-button';

// Basic usage
<OptimizedButton onClick={handleClick}>
  Click Me
</OptimizedButton>

// With custom debounce
<OptimizedButton 
  onClick={handleSubmit}
  debounceDelay={500}  // Prevent clicks for 500ms
>
  Submit Form
</OptimizedButton>

// Disable feedback
<OptimizedButton 
  onClick={handleClick}
  showFeedback={false}
>
  No Animation
</OptimizedButton>
```

### 2. OptimizedLink (instead of Link for navigation)

```tsx
import { OptimizedLink } from '@/components/ui/optimized-link';

// Basic usage with prefetch
<OptimizedLink href="/products" prefetch={true}>
  View Products
</OptimizedLink>

// In a button
<Button asChild>
  <OptimizedLink href="/cart" prefetch={true}>
    Go to Cart
  </OptimizedLink>
</Button>

// In dropdown menu
<DropdownMenuItem asChild>
  <OptimizedLink href="/profile" prefetch={true} className="w-full">
    Profile
  </OptimizedLink>
</DropdownMenuItem>
```

### 3. useInstantNavigation (for programmatic navigation)

```tsx
import { useInstantNavigation } from '@/hooks/use-instant-navigation';

function MyComponent() {
  const { navigate, isNavigating } = useInstantNavigation();

  const handleCheckout = () => {
    // Simple navigation
    navigate('/checkout');
  };

  const handleWithAnimation = () => {
    // With delay for animation
    navigate('/success', {
      delay: 150,
      onBeforeNavigate: () => console.log('Starting...'),
      onAfterNavigate: () => console.log('Done!'),
    });
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={isNavigating}
    >
      Checkout
    </button>
  );
}
```

## ⚡ Performance Best Practices

### DO ✅

```tsx
// Use OptimizedLink for all navigation
<OptimizedLink href="/page" prefetch={true}>Link</OptimizedLink>

// Use OptimizedButton for actions
<OptimizedButton onClick={handleClick}>Action</OptimizedButton>

// Add active states to custom interactive elements
<div className="transition-all duration-100 active:scale-[0.98]">
  Custom Element
</div>

// Use hardware acceleration for animations
<div className="transform-gpu transition-transform duration-100">
  Animated Element
</div>
```

### DON'T ❌

```tsx
// Don't use slow transitions
<div className="transition-all duration-500"> // Too slow!

// Don't forget prefetch on links
<Link href="/page">Link</Link> // Missing prefetch!

// Don't use multiple rapid navigations without debouncing
onClick={() => {
  router.push('/page1');
  router.push('/page2'); // Will cause issues!
}}

// Don't use inline styles for transitions
<div style={{ transition: 'all 0.3s' }}> // Use Tailwind classes!
```

## 🎨 Transition Timing Standards

Use these consistent timings across the app:

- **Instant feedback**: `duration-0` (0ms) - for active states
- **Fast interactions**: `duration-100` (100ms) - buttons, links, dropdowns
- **Medium animations**: `duration-150` (150ms) - cards, sheets
- **Slow animations**: `duration-200` (200ms) - page transitions

```tsx
// Examples
<button className="transition-all duration-100 active:scale-[0.97]">
  Fast Button
</button>

<div className="transition-all duration-150 hover:shadow-xl">
  Card with Medium Animation
</div>

<Sheet className="data-[state=open]:duration-200">
  Slow Sheet Opening
</Sheet>
```

## 🔧 Common Patterns

### Pattern 1: Clickable Card

```tsx
<Card className="transition-all duration-150 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]">
  <OptimizedLink href="/details" prefetch={true} className="block">
    <CardContent>
      Card Content
    </CardContent>
  </OptimizedLink>
</Card>
```

### Pattern 2: Action Button with Loading

```tsx
const [loading, setLoading] = useState(false);

<OptimizedButton 
  onClick={async () => {
    setLoading(true);
    await handleAction();
    setLoading(false);
  }}
  disabled={loading}
  debounceDelay={300}
>
  {loading ? 'Processing...' : 'Submit'}
</OptimizedButton>
```

### Pattern 3: Dropdown Menu with Navigation

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Menu</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem asChild>
      <OptimizedLink href="/page1" prefetch={true} className="w-full">
        Page 1
      </OptimizedLink>
    </DropdownMenuItem>
    <DropdownMenuItem onClick={handleAction}>
      Action
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Pattern 4: Table Row with Actions

```tsx
<TableRow className="transition-all duration-100 hover:bg-muted/50">
  <TableCell>{data.name}</TableCell>
  <TableCell>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <OptimizedLink href={`/edit/${data.id}`} prefetch={true} className="w-full">
            Edit
          </OptimizedLink>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDelete(data.id)}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </TableCell>
</TableRow>
```

## 📱 Mobile Optimization

```tsx
// Add touch-action for better mobile performance
<button className="touch-action-manipulation transition-all duration-100">
  Mobile Button
</button>

// Use active states for touch feedback
<div className="active:scale-[0.98] active:opacity-90">
  Touch Target
</div>

// Larger touch targets on mobile
<button className="h-12 w-12 md:h-10 md:w-10">
  Icon Button
</button>
```

## 🐛 Debugging Tips

### Check if component is responding slowly:

1. Open DevTools → Performance tab
2. Record interaction
3. Look for long tasks (>50ms)
4. Check transition durations in Elements tab

### Common issues:

- **Slow animations**: Check for `duration-300` or higher
- **No feedback**: Missing `active:` states
- **Double clicks**: Not using OptimizedButton/Link
- **Laggy navigation**: Missing `prefetch={true}`

## 📊 Performance Targets

- **First Click Response**: < 100ms
- **Navigation Start**: < 200ms
- **Dropdown Open**: < 100ms
- **Form Submit**: < 300ms (with debounce)

---

**Remember**: Consistency is key! Use the same timing and patterns throughout the app for a cohesive user experience.
