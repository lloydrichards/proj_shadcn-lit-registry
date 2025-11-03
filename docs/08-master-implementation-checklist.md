# Master Implementation Checklist for LLM Agents

## Overview

This document provides a complete checklist for implementing the component
pattern upgrades. Each task is designed to be self-contained and executable by
an LLM agent with all necessary context and references.

## Phase 1: Base Infrastructure (Must Complete First)

### 🎯 Task 1.1: Create BaseElement Class

**File**: `registry/lib/base-element.ts`  
**Priority**: CRITICAL  
**Dependencies**: None

**Instructions**:

1. Read the implementation guide:
   [BaseElement Implementation](./05-base-infrastructure-implementation.md#task-1-create-baseelement-class)
2. Create the file with the exact code provided
3. Ensure TypeScript compilation passes
4. Test that emit() creates events with composed: true

**Validation**:

```bash
# Should compile without errors
bun tsc registry/lib/base-element.ts --noEmit

# Test file should exist
test -f registry/lib/base-element.ts && echo "✓ File created"
```

---

### 🎯 Task 1.2: Create FormElement Class

**File**: `registry/lib/form-element.ts`  
**Priority**: CRITICAL  
**Dependencies**: BaseElement must exist first

**Instructions**:

1. Read the implementation guide:
   [FormElement Implementation](./05-base-infrastructure-implementation.md#task-2-create-formelement-class)
2. Create the file with form participation logic
3. Implement ElementInternals support
4. Add validation API methods

**Validation**:

```bash
# Check imports are correct
grep -q "BaseElement" registry/lib/form-element.ts && echo "✓ Extends BaseElement"
grep -q "ElementInternals" registry/lib/form-element.ts && echo "✓ Uses ElementInternals"
```

---

### 🎯 Task 1.3: Create HasSlotController

**File**: `@/controllers/has-slot.ts`  
**Priority**: HIGH  
**Dependencies**: None

**Instructions**:

1. Create the controllers directory: `mkdir -p registry/lib/controllers`
2. Read the implementation guide:
   [HasSlotController Implementation](./05-base-infrastructure-implementation.md#task-3-create-hasslotcontroller)
3. Implement slot detection logic
4. Ensure it triggers re-renders on slot changes

**Key Requirements**:

- Must detect default slot content
- Must detect named slot content
- Must update when slot content changes
- Must handle text nodes correctly

---

### 🎯 Task 1.4: Create FormControlController

**File**: `@/controllers/form-control.ts`  
**Priority**: HIGH  
**Dependencies**: None

**Instructions**:

1. Read the implementation guide:
   [FormControlController Implementation](./05-base-infrastructure-implementation.md#task-4-create-formcontrolcontroller)
2. Implement form submission handling
3. Add reset functionality
4. Create hidden input fallback for browsers without ElementInternals

**Key Requirements**:

- Handle form submit events
- Handle form reset events
- Validate on submission
- Support form attribute for association

---

### 🎯 Task 1.5: Install and Setup Context API

**Command**: `bun add @lit/context`  
**File**: `registry/lib/context.ts`  
**Priority**: HIGH  
**Dependencies**: @lit/context package

**Instructions**:

1. Install the package: `bun add @lit/context`
2. Read the implementation guide:
   [Context Implementation](./05-base-infrastructure-implementation.md#task-5-create-context-utilities)
3. Create context utility wrapper
4. Export typed context creation function

---

### 🎯 Task 1.6: Create Animation Utilities

**File**: `registry/lib/animations.ts`  
**Priority**: MEDIUM  
**Dependencies**: None

**Instructions**:

1. Read the implementation guide:
   [Animation Utilities](./05-base-infrastructure-implementation.md#task-7-create-animation-utilities)
2. Implement Tailwind animation classes
3. Add prefers-reduced-motion support
4. Create waitForAnimation helper

**Key Requirements**:

- Must respect prefers-reduced-motion
- Use Tailwind animation classes
- Provide animation state helpers

---

### 🎯 Task 1.7: Update Utils File

**File**: `registry/lib/utils.ts`  
**Priority**: HIGH  
**Dependencies**: None

**Instructions**:

1. Read the implementation guide:
   [Utils Update](./05-base-infrastructure-implementation.md#task-8-update-utils-file)
2. Add focus management utilities
3. Add unique ID generator
4. Add trapFocus function

**New Functions to Add**:

- `uid()` - Generate unique IDs
- `isFocusable()` - Check if element can be focused
- `getFocusableElements()` - Get all focusable elements
- `trapFocus()` - Trap focus within container
- `debounce()` - Debounce function calls
- `throttle()` - Throttle function calls

---

### 🎯 Task 1.8: Create Type Definitions

**File**: `registry/lib/types.ts`  
**Priority**: MEDIUM  
**Dependencies**: None

**Instructions**:

1. Read the implementation guide:
   [Type Definitions](./05-base-infrastructure-implementation.md#task-6-update-type-definitions)
2. Create shared TypeScript interfaces
3. Export common types
4. Add form and event types

---

## Phase 2: Component Migration

### 🔧 Task 2.1: Migrate Button Component

**File**: `registry/ui/button/button.ts`  
**Priority**: HIGH  
**Complexity**: LOW

**Instructions**:

1. Read the full migration guide:
   [Button Migration Guide](./06-component-migration-button.md)
2. Update imports to use BaseElement
3. Add FormControlController for form integration
4. Add HasSlotController for slots
5. Implement loading state
6. Update events to use emit()
7. Add accessibility attributes
8. Test form submission works

**Checklist**:

- [ ] Extends BaseElement
- [ ] Uses FormControlController
- [ ] Uses HasSlotController
- [ ] Loading state implemented
- [ ] Events use composed: true
- [ ] Form submission works
- [ ] Keyboard events handled
- [ ] ARIA attributes added

---

### 🔧 Task 2.2: Migrate Dialog Component System

**Files**: `registry/ui/dialog/*.ts`  
**Priority**: HIGH  
**Complexity**: HIGH

**Instructions**:

1. Read the full migration guide:
   [Dialog Migration Guide](./07-component-migration-dialog.md)
2. Create dialog context
3. Update all dialog sub-components
4. Implement focus management
5. Add animations
6. Test modal behavior

**Components to Update**:

- `ui-dialog` - Root component with context
- `ui-dialog-trigger` - Trigger button
- `ui-dialog-content` - Content with focus trap
- `ui-dialog-header` - Header container
- `ui-dialog-title` - Title with ID registration
- `ui-dialog-description` - Description with ID
- `ui-dialog-footer` - Footer container
- `ui-dialog-close` - Close button

**Critical Requirements**:

- Focus trap when modal
- Return focus on close
- Escape key handling
- Backdrop click handling
- Animation support
- Prevent body scroll

---

### 🔧 Task 2.3: Migrate Input Component

**File**: Create `registry/ui/input/input.ts` (currently missing)  
**Priority**: HIGH  
**Complexity**: MEDIUM

**Instructions**:

1. Create the input component extending FormElement
2. Add all HTML input types support
3. Implement validation
4. Add prefix/suffix slots
5. Ensure form participation

**Implementation Template**:

```typescript
@customElement("ui-input")
export class Input extends FormElement {
  @property({ type: String }) type: HTMLInputElement["type"] = "text";
  @property({ type: String }) placeholder = "";

  // Implement based on FormElement pattern
  focus() {
    /* ... */
  }
  blur() {
    /* ... */
  }
}
```

---

### 🔧 Task 2.4: Migrate Select Component

**File**: `registry/ui/select/select.ts`  
**Priority**: HIGH  
**Complexity**: HIGH

**Instructions**:

1. Update to extend FormElement
2. Implement keyboard navigation
3. Add option component
4. Handle form value submission
5. Add search/filter capability

---

### 🔧 Task 2.5: Migrate Checkbox Component

**File**: `registry/ui/checkbox/checkbox.ts`  
**Priority**: MEDIUM  
**Complexity**: LOW

**Instructions**:

1. Extend FormElement
2. Handle checked state
3. Support indeterminate state
4. Add form value handling
5. Implement keyboard support

---

### 🔧 Task 2.6: Migrate Card Component System

**Files**: `registry/ui/card/*.ts`  
**Priority**: LOW  
**Complexity**: LOW

**Instructions**:

1. Update all card components to use BaseElement
2. Add proper slot detection
3. Ensure className forwarding
4. Keep composition simple

**Components**:

- `ui-card`
- `ui-card-header`
- `ui-card-title`
- `ui-card-description`
- `ui-card-content`
- `ui-card-footer`

---

### 🔧 Task 2.7: Migrate Accordion Component

**File**: `registry/ui/accordion/accordion.ts`  
**Priority**: MEDIUM  
**Complexity**: HIGH

**Instructions**:

1. Implement accordion context
2. Support single/multiple modes
3. Add keyboard navigation (arrow keys)
4. Implement smooth animations
5. Ensure accessibility

---

### 🔧 Task 2.8: Migrate Tabs Component

**File**: `registry/ui/tabs/tabs.ts`  
**Priority**: MEDIUM  
**Complexity**: MEDIUM

**Instructions**:

1. Implement tabs context
2. Add keyboard navigation
3. Support horizontal/vertical orientation
4. Auto-select first tab
5. Implement ARIA patterns

---

## Phase 3: Testing & Validation

### ✅ Task 3.1: Create Component Tests

**Priority**: HIGH

For each migrated component, create tests for:

1. Basic rendering
2. Property changes
3. Event emission
4. Form participation (if applicable)
5. Keyboard navigation
6. Accessibility attributes

**Test Template**:

```typescript
import { fixture, html, expect } from "@open-wc/testing";
import "../button";

describe("ui-button", () => {
  it("renders with default properties", async () => {
    const el = await fixture(html`<ui-button>Click</ui-button>`);
    expect(el).to.exist;
  });

  it("emits events with composed: true", async () => {
    const el = await fixture(html`<ui-button>Click</ui-button>`);
    let eventFired = false;
    el.addEventListener("button-click", (e) => {
      expect(e.composed).to.be.true;
      eventFired = true;
    });
    el.click();
    expect(eventFired).to.be.true;
  });
});
```

---

### ✅ Task 3.2: Update Storybook Stories

**Priority**: MEDIUM

For each component:

1. Update stories to show new features
2. Add loading states
3. Add form examples
4. Show slot usage
5. Document accessibility features

---

### ✅ Task 3.3: Accessibility Audit

**Priority**: HIGH

Check each component for:

- [ ] Proper ARIA attributes
- [ ] Keyboard navigation works
- [ ] Focus visible styles
- [ ] Screen reader compatibility
- [ ] Color contrast (WCAG AA)
- [ ] Motion respects prefers-reduced-motion

---

## Required Research & References

### Essential Documentation Links

**Lit Documentation**:

- [Lit Overview](https://lit.dev/docs/)
- [Reactive Controllers](https://lit.dev/docs/composition/controllers/)
- [Context API](https://lit.dev/docs/data/context/)
- [Events](https://lit.dev/docs/components/events/)

**Web Standards**:

- [Custom Elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
- [Form Participation](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/attachInternals)
- [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)

**Accessibility**:

- [ARIA Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
- [Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Button Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
- [Form Patterns](https://www.w3.org/WAI/tutorials/forms/)

**Tailwind CSS**:

- [Tailwind v4 Docs](https://tailwindcss.com/docs)
- [Animation Classes](https://tailwindcss.com/docs/animation)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

### Key Concepts to Understand

1. **Shadow DOM Event Bubbling**: Events must have `composed: true` to cross
   shadow boundaries
2. **Form Association**: Components need ElementInternals or hidden inputs to
   participate in forms
3. **Focus Management**: Trap focus in modals, return focus on close
4. **Context API**: Share state between parent and child components
5. **Reactive Controllers**: Reusable logic that hooks into component lifecycle
6. **Accessibility**: ARIA attributes, keyboard navigation, screen reader
   support

### Testing Commands

```bash
# Build all components
bun run build

# Type check
bun tsc --noEmit

# Run tests
bun test

# Start Storybook
bun run storybook

# Lint code
bun run lint

# Format code
bun run format
```

## Success Criteria

The implementation is complete when:

1. **All base infrastructure exists and works**
   - BaseElement, FormElement created
   - All controllers implemented
   - Context API setup
   - Animation utilities working

2. **Priority components migrated**
   - Button works with forms
   - Dialog has proper focus management
   - Input/Select/Checkbox participate in forms
   - All events use composed: true

3. **Tests pass**
   - TypeScript compilation succeeds
   - Unit tests pass
   - Storybook stories work
   - Form submission works

4. **Accessibility validated**
   - Keyboard navigation works
   - ARIA attributes present
   - Screen reader compatible
   - Focus management correct

## Notes for LLM Agents

- **Always complete Phase 1 first** - Components depend on base infrastructure
- **Test after each task** - Run validation commands to ensure correctness
- **Follow patterns exactly** - The patterns are proven and tested
- **Ask if unclear** - Better to clarify than guess
- **Check existing code** - Some components may have partial implementations
- **Preserve existing functionality** - Don't break backward compatibility
  unnecessarily
- **Use TypeScript** - All components should be fully typed
- **Document changes** - Add comments explaining complex logic

## Common Pitfalls to Avoid

1. **Forgetting `composed: true`** - Events won't bubble out of shadow DOM
2. **Not calling `super.connectedCallback()`** - Breaks Lit lifecycle
3. **Using `static styles` with Tailwind** - Tailwind needs to be in render()
4. **Not forwarding `className`** - Host classes won't apply
5. **Missing focus trap in dialogs** - Accessibility violation
6. **Not testing form submission** - Critical functionality
7. **Ignoring reduced motion** - Accessibility requirement

---

This checklist provides everything needed to implement the new component
patterns. Each task is self-contained with clear instructions, validation steps,
and references. Work through them systematically, testing after each step.
