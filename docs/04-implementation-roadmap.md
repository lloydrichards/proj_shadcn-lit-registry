# Implementation Roadmap

## Overview

This roadmap provides a structured approach to implementing the recommended
component patterns while maintaining backward compatibility where possible.

## Phase 1: Foundation (Week 1-2)

### Week 1: Core Infrastructure

#### Day 1-2: Base Classes

**Files to create:**

- `registry/lib/base-element.ts` - Base class with typed events
- `registry/lib/form-element.ts` - Form-participating base class
- `registry/lib/types.ts` - Shared TypeScript interfaces

**Implementation:**

```typescript
// registry/lib/base-element.ts
export class BaseElement extends TW(LitElement) {
  protected emit<T>(...) { }
  static dependencies?: Record<string, typeof BaseElement>;
}
```

#### Day 3-4: Core Controllers

**Files to create:**

- `@/controllers/has-slot.ts`
- `@/controllers/form-control.ts`
- `@/controllers/focus-manager.ts`
- `@/controllers/keyboard.ts`

**Priority order:**

1. HasSlotController (used everywhere)
2. FormControlController (critical for forms)
3. FocusManagerController (for modals)
4. KeyboardController (for navigation)

#### Day 5: Context System

**Files to create:**

- `registry/lib/context.ts` - Context utilities
- `registry/lib/contexts/` - Specific contexts

**Implementation:**

```typescript
export function createComponentContext<T>(name: string) {}
```

### Week 2: Component Migration Preparation

#### Day 6-7: Migration Scripts

**Create tooling to assist migration:**

```bash
# Script to analyze component dependencies
bun run analyze:components

# Script to generate migration checklist
bun run migration:checklist

# Script to validate component patterns
bun run validate:patterns
```

#### Day 8-9: Testing Infrastructure

**Setup comprehensive testing:**

- Unit test templates
- Accessibility test helpers
- Form integration test utilities
- Visual regression tests

#### Day 10: Documentation Templates

**Create templates for:**

- Component documentation
- Migration guides
- API references
- Usage examples

## Phase 2: Component Migration (Week 3-4)

### Week 3: Form Components

Priority order based on usage and complexity:

#### High Priority (Day 11-12)

- [ ] Button - Add form submission support
- [ ] Input - Full form integration
- [ ] Checkbox - Form participation

#### Medium Priority (Day 13-14)

- [ ] Select - Complex form control
- [ ] Radio Group - Group coordination
- [ ] Switch - Toggle with form value

#### Low Priority (Day 15)

- [ ] Textarea - Similar to input
- [ ] Slider - Range input

**Migration checklist per component:**

```markdown
- [ ] Extend from FormElement
- [ ] Add FormControlController
- [ ] Implement validation API
- [ ] Add ElementInternals support
- [ ] Update event handling
- [ ] Add accessibility attributes
- [ ] Write tests
- [ ] Update Storybook stories
```

### Week 4: Complex Components

#### High Priority (Day 16-17)

- [ ] Dialog - Focus management, portal rendering
- [ ] Popover - Positioning, dismiss logic
- [ ] Dropdown Menu - Keyboard navigation

#### Medium Priority (Day 18-19)

- [ ] Accordion - Context sharing
- [ ] Tabs - State coordination
- [ ] Collapsible - Animation support

#### Low Priority (Day 20)

- [ ] Command - Search functionality
- [ ] Context Menu - Right-click handling
- [ ] Menubar - Complex navigation

## Phase 3: Enhancement (Week 5-6)

### Week 5: Styling & Customization

#### Day 21-22: CSS Custom Properties

```css
/* Add design tokens */
:host {
  --ui-radius: var(--radius-md, 0.375rem);
  --ui-spacing: var(--spacing-4, 1rem);
}
```

#### Day 23-24: CSS Parts

```typescript
/* Export parts for customization */
render() {
  return html`
    <div part="base">
      <header part="header">
      <div part="content">
    </div>
  `;
}
```

#### Day 25: Dark Mode Improvements

- Ensure all components support dark mode
- Add dark mode stories
- Test color contrast

### Week 6: Developer Experience

#### Day 26-27: TypeScript Improvements

- Stronger type definitions
- Better generic support
- Event type augmentation

#### Day 28-29: Documentation

- API documentation generation
- Interactive examples
- Common patterns guide

#### Day 30: Performance Optimization

- Bundle size analysis
- Lazy loading strategies
- Render optimization

## Implementation Guidelines

### For Each Component

1. **Backward Compatibility Check**

   ```typescript
   // Keep existing API working
   @property() variant = "default"; // Still works

   // Add new features alongside
   @property({ reflect: true }) variant = "default"; // Enhanced
   ```

2. **Progressive Enhancement**

   ```typescript
   // Start with working component
   class Button extends TW(LitElement) {}

   // Enhance step by step
   class Button extends BaseElement {} // Step 1
   class Button extends FormElement {} // Step 2 (if needed)
   ```

3. **Testing at Each Step**
   ```bash
   # After each change
   bun test ui-button
   bun run storybook
   ```

## Migration Example: Button Component

### Current Implementation

```typescript
@customElement("ui-button")
export class Button extends TW(LitElement) {
  @property() variant = "default";
  @property() type = "button";
  @property({ type: Boolean }) disabled = false;
}
```

### Step 1: Extend BaseElement

```typescript
@customElement("ui-button")
export class Button extends BaseElement {
  // Existing code still works
}
```

### Step 2: Add Form Support

```typescript
export class Button extends FormElement {
  private formController = new FormControlController(this);

  private handleClick = () => {
    if (this.type === "submit") {
      this.formController.submit();
    }
  };
}
```

### Step 3: Add Accessibility

```typescript
export class Button extends FormElement {
  render() {
    return html`
      <button aria-disabled=${this.disabled} aria-busy=${this.loading}></button>
    `;
  }
}
```

### Step 4: Add Parts & Slots

```typescript
export class Button extends FormElement {
  render() {
    return html`
      <button part="base">
        <slot name="prefix" part="prefix"></slot>
        <slot></slot>
        <slot name="suffix" part="suffix"></slot>
      </button>
    `;
  }
}
```

## Validation Checklist

### Component Quality Gates

Before marking a component as complete:

#### Code Quality

- [ ] Extends appropriate base class
- [ ] Uses controllers where applicable
- [ ] Events use `composed: true`
- [ ] TypeScript interfaces exported
- [ ] No console errors/warnings

#### Accessibility

- [ ] Semantic HTML used
- [ ] ARIA attributes present
- [ ] Keyboard navigable
- [ ] Focus visible
- [ ] Screen reader tested

#### Functionality

- [ ] All props working
- [ ] Events firing correctly
- [ ] Form integration (if applicable)
- [ ] Validation working (if applicable)

#### Styling

- [ ] Tailwind classes applied
- [ ] Dark mode supported
- [ ] CSS parts exported
- [ ] Responsive design

#### Testing

- [ ] Unit tests passing
- [ ] Storybook stories complete
- [ ] Visual tests captured
- [ ] Integration tests passing

#### Documentation

- [ ] Props documented
- [ ] Events documented
- [ ] Slots documented
- [ ] Usage examples provided

## Rollback Plan

If issues arise during migration:

### Level 1: Feature Rollback

```typescript
// Disable new feature temporarily
class Button extends BaseElement {
  // Comment out problematic feature
  // private formController = new FormControlController(this);
}
```

### Level 2: Component Rollback

```bash
# Revert specific component
git checkout main -- registry/ui/button/

# Keep other improvements
```

### Level 3: Full Rollback

```bash
# Create backup branch
git branch backup-migration

# Revert to pre-migration
git reset --hard <commit-before-migration>
```

## Success Criteria

### Phase 1 Complete When:

- All base infrastructure created
- Controllers implemented and tested
- Migration tooling ready

### Phase 2 Complete When:

- All form components migrated
- Complex components using context
- Tests passing for all components

### Phase 3 Complete When:

- CSS customization implemented
- Documentation complete
- Performance targets met

## Monitoring & Metrics

Track progress with:

```typescript
// Component health score
interface ComponentHealth {
  accessibility: number; // 0-100
  coverage: number; // 0-100
  documentation: number; // 0-100
  performance: number; // 0-100
}

// Track before/after
const metrics = {
  bundleSize: "before: 50kb, after: 55kb",
  components: "before: 20, after: 20",
  tests: "before: 100, after: 200",
  coverage: "before: 60%, after: 90%",
};
```

## Communication Plan

### Weekly Updates

- Progress against roadmap
- Blockers identified
- Help needed
- Next week's goals

### Component Completion

- Announce in PR
- Update tracking sheet
- Request review
- Merge when approved

## Risk Mitigation

### Identified Risks

1. **Breaking Changes**
   - Mitigation: Careful API design, deprecation warnings
2. **Performance Regression**
   - Mitigation: Benchmark before/after, optimize as needed
3. **Complexity Increase**
   - Mitigation: Hide complexity in base classes/controllers
4. **Documentation Lag**
   - Mitigation: Document as you go, not after

## Conclusion

This roadmap provides a structured path to improving the component registry
while minimizing disruption. By following this plan, we can incrementally
enhance components while maintaining stability and backward compatibility.

The key is consistent progress - even small improvements compound over time to
create a significantly better component library.
