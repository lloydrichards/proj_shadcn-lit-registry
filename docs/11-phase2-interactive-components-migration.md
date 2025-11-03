# Phase 2: Interactive Components Migration Plan

**Date**: November 3, 2025  
**Status**: 🔄 PLANNING  
**Phase**: 2 of 3 (Medium Priority - Interactive Components)

---

## Overview

This document provides a detailed migration plan for 5 medium-priority interactive components that require updating to follow the new simplified architecture outlined in `docs/10-refactoring-updates.md`.

All components will be migrated to:
- ✅ Extend `BaseElement` instead of `TW(LitElement)`
- ✅ Use `@queryAssignedElements` for reactive slot detection
- ✅ Remove any legacy patterns
- ✅ Follow host class forwarding pattern
- ✅ Use consistent parent-child communication

---

## Component Analysis Summary

| Component | Sub-components | Context Needed | Slots w/@query | Complexity | Est. Tests |
|-----------|----------------|----------------|----------------|------------|------------|
| Accordion | 4 (Item, Trigger, Content) | ❌ No | ✅ Yes | **MEDIUM** | 12-15 |
| Tabs | 4 (List, Trigger, Content) | ❌ No | ✅ Yes (1 usage) | **MEDIUM** | 10-12 |
| Dropdown Menu | 13 sub-components | ❌ No | ✅ Yes (2 usages) | **HIGH** | 18-22 |
| Menubar | 14 sub-components | ❌ No | ✅ Yes (2 usages) | **HIGH** | 20-25 |
| Context Menu | 11 sub-components | ❌ No | ✅ Yes (1 usage) | **HIGH** | 15-18 |

**Total estimated tests**: 75-92 tests

---

## Detailed Component Analysis

### 1. Accordion (registry/ui/accordion/accordion.ts)

#### Current State
```typescript
// ✅ GOOD: Already extends TW(LitElement) 
const TwLitElement = TW(LitElement);
export class Accordion extends TwLitElement
```

#### Architecture
- **Base class**: `TW(LitElement)` ❌ (should be `BaseElement`)
- **Sub-components**: 4
  - `ui-accordion` (root)
  - `ui-accordion-item`
  - `ui-accordion-trigger`
  - `ui-accordion-content`
- **Context needed**: ❌ No - Uses direct DOM queries and event bubbling
- **Slots with @queryAssignedElements**: ❌ None currently
- **Legacy patterns found**: ❌ None
- **Parent-child communication**: Event bubbling (`accordion-trigger-click`)

#### Issues Found
1. ❌ Not extending `BaseElement` (4 classes)
2. ❌ Not using `this.emit()` helper (using manual `dispatchEvent`)
3. ⚠️ Uses `querySelector` for child updates (could use `@queryAssignedElements`)
4. ✅ Already follows host class forwarding pattern
5. ✅ Uses `@state()` correctly for internal state

#### Migration Steps

**Step 1: Update imports and base class**
```typescript
// Before
import { TW } from "@/registry/lib/tailwindMixin";
const TwLitElement = TW(LitElement);
export class Accordion extends TwLitElement

// After
import { BaseElement } from "@/registry/lib/base-element";
export class Accordion extends BaseElement
```

**Step 2: Replace dispatchEvent with emit()**
```typescript
// Before
this.dispatchEvent(
  new CustomEvent("value-change", {
    detail: { value },
    bubbles: true,
    composed: true,
  })
);

// After
this.emit("value-change", { value });
```

**Step 3: Consider using @queryAssignedElements for items**
```typescript
// Optional improvement
@queryAssignedElements({ selector: "ui-accordion-item" })
private _items!: AccordionItem[];

private updateItems() {
  this._items.forEach((item) => {
    // Update logic
  });
}
```

**Step 4: Update all 4 components**
- `Accordion` (root)
- `AccordionItem`
- `AccordionTrigger`
- `AccordionContent`

**Step 5: Update tests**

#### Migration Complexity: **MEDIUM**
- 4 components to update
- Straightforward event system
- No context needed
- Clear parent-child relationships

#### Estimated Tests: **12-15**
- Basic rendering (4)
- Single mode toggle (2)
- Multiple mode toggle (2)
- Collapsible behavior (2)
- Keyboard navigation (2)
- Animation states (2)
- Edge cases (2-3)

---

### 2. Tabs (registry/ui/tabs/tabs.ts)

#### Current State
```typescript
// ✅ GOOD: Already uses @queryAssignedElements once
export class TabsList extends TW(LitElement) {
  @queryAssignedElements({ selector: "ui-tabs-trigger" })
  private triggers!: Array<TabsTrigger>;
```

#### Architecture
- **Base class**: `TW(LitElement)` ❌ (should be `BaseElement`)
- **Sub-components**: 4
  - `ui-tabs` (root)
  - `ui-tabs-list`
  - `ui-tabs-trigger`
  - `ui-tabs-content`
- **Context needed**: ❌ No - Uses event bubbling and queries
- **Slots with @queryAssignedElements**: ✅ Yes (1 usage in `TabsList`)
- **Legacy patterns found**: ❌ None
- **Parent-child communication**: Event bubbling (`tabs-trigger-click`)

#### Issues Found
1. ❌ Not extending `BaseElement` (4 classes)
2. ❌ Not using `this.emit()` helper
3. ⚠️ Uses `querySelector` for child updates in root (inconsistent)
4. ✅ Already uses `@queryAssignedElements` in TabsList
5. ✅ Already follows host class forwarding pattern
6. ✅ Good keyboard navigation (roving tabindex)

#### Migration Steps

**Step 1: Update imports and base class (4 components)**
```typescript
// Before
import { TW } from "@/registry/lib/tailwindMixin";
export class Tabs extends TW(LitElement)

// After
import { BaseElement } from "@/registry/lib/base-element";
export class Tabs extends BaseElement
```

**Step 2: Replace dispatchEvent with emit()**
```typescript
// Before
this.dispatchEvent(
  new CustomEvent("change", {
    detail: { value: newValue },
    bubbles: true,
    composed: true,
  })
);

// After
this.emit("change", { value: newValue });
```

**Step 3: Consider @queryAssignedElements for consistency**
```typescript
// In Tabs root - optional improvement
@queryAssignedElements({ selector: "ui-tabs-trigger", flatten: true })
private _triggers!: TabsTrigger[];

@queryAssignedElements({ selector: "ui-tabs-content", flatten: true })
private _contents!: TabsContent[];
```

**Step 4: Update all 4 components**

**Step 5: Update tests**

#### Migration Complexity: **MEDIUM**
- 4 components to update
- Already has good patterns (`@queryAssignedElements`)
- Clear state management
- Good keyboard support

#### Estimated Tests: **10-12**
- Basic rendering (4)
- Tab switching (2)
- Keyboard navigation (2)
- Default value (1)
- Roving tabindex (2)
- Edge cases (1-2)

---

### 3. Dropdown Menu (registry/ui/dropdown-menu/dropdown-menu.ts)

#### Current State
```typescript
// ✅ GOOD: Already uses @queryAssignedElements
@queryAssignedElements({ flatten: true })
private items!: HTMLElement[];
```

#### Architecture
- **Base class**: `TW(LitElement)` ❌ (should be `BaseElement`)
- **Sub-components**: 13
  - `ui-dropdown-menu` (root)
  - `ui-dropdown-menu-trigger`
  - `ui-dropdown-menu-content`
  - `ui-dropdown-menu-item`
  - `ui-dropdown-menu-checkbox-item`
  - `ui-dropdown-menu-radio-group`
  - `ui-dropdown-menu-radio-item`
  - `ui-dropdown-menu-sub`
  - `ui-dropdown-menu-sub-trigger`
  - `ui-dropdown-menu-sub-content`
  - `ui-dropdown-menu-separator`
  - `ui-dropdown-menu-label`
  - `ui-dropdown-menu-group`
  - `ui-dropdown-menu-shortcut`
- **Context needed**: ❌ No - Uses event bubbling
- **Slots with @queryAssignedElements**: ✅ Yes (2 usages)
- **Legacy patterns found**: ❌ None
- **Parent-child communication**: Event bubbling (`trigger-click`, `item-select`)

#### Issues Found
1. ❌ Not extending `BaseElement` (13 classes!)
2. ❌ Not using `this.emit()` helper
3. ⚠️ Uses MutationObserver for parent state sync (could be improved)
4. ✅ Already uses `@queryAssignedElements` in content
5. ✅ Good keyboard navigation with typeahead
6. ✅ Already follows host class forwarding pattern

#### Migration Steps

**Step 1: Update imports and base class (13 components!)**
```typescript
// Before
import { TW } from "@/registry/lib/tailwindMixin";
export class DropdownMenu extends TW(LitElement)

// After  
import { BaseElement } from "@/registry/lib/base-element";
export class DropdownMenu extends BaseElement
```

**Step 2: Replace all dispatchEvent with emit()**
```typescript
// Before
this.dispatchEvent(
  new CustomEvent("open-change", {
    detail: { open: this.open },
    bubbles: true,
    composed: true,
  })
);

// After
this.emit("open-change", { open: this.open });
```

**Step 3: Update all 13 components**
- Priority: Core components first (Menu, Trigger, Content, Item)
- Then: Interactive items (Checkbox, Radio)
- Then: Sub-menu components
- Finally: Presentational (Separator, Label, Group, Shortcut)

**Step 4: Update tests**

#### Migration Complexity: **HIGH**
- 13 components to update (most in Phase 2)
- Complex keyboard navigation
- Sub-menu handling
- Multiple item types
- Typeahead search

#### Estimated Tests: **18-22**
- Basic rendering (13)
- Open/close behavior (2)
- Keyboard navigation (3)
- Typeahead (2)
- Checkbox items (2)
- Radio items (2)
- Sub-menu behavior (3)
- Click outside (1)
- Edge cases (2-3)

---

### 4. Menubar (registry/ui/menubar/menubar.ts)

#### Current State
```typescript
// ✅ GOOD: Already uses @queryAssignedElements
@queryAssignedElements({ selector: "ui-menubar-menu" })
private menus!: MenubarMenu[];

@queryAssignedElements({ flatten: true })
protected items!: HTMLElement[];
```

#### Architecture
- **Base class**: `TW(LitElement)` ❌ (should be `BaseElement`)
- **Sub-components**: 14
  - `ui-menubar` (root)
  - `ui-menubar-menu`
  - `ui-menubar-trigger`
  - `ui-menubar-content`
  - `ui-menubar-item`
  - `ui-menubar-checkbox-item`
  - `ui-menubar-radio-group`
  - `ui-menubar-radio-item`
  - `ui-menubar-sub`
  - `ui-menubar-sub-trigger`
  - `ui-menubar-sub-content`
  - `ui-menubar-separator`
  - `ui-menubar-label`
  - `ui-menubar-group`
  - `ui-menubar-shortcut`
- **Context needed**: ❌ No - Uses event bubbling
- **Slots with @queryAssignedElements**: ✅ Yes (2 usages)
- **Legacy patterns found**: ❌ None
- **Parent-child communication**: Event bubbling (`menubar-trigger-click`, `menubar-item-select`)

#### Issues Found
1. ❌ Not extending `BaseElement` (14 classes!)
2. ❌ Not using `this.emit()` helper
3. ⚠️ Uses MutationObserver for state sync
4. ✅ Already uses `@queryAssignedElements` extensively
5. ✅ Complex but well-structured keyboard navigation
6. ✅ Good roving tabindex implementation
7. ✅ Already follows host class forwarding pattern

#### Migration Steps

**Step 1: Update imports and base class (14 components!)**
```typescript
// Before
import { TW } from "@/registry/lib/tailwindMixin";
export class Menubar extends TW(LitElement)

// After
import { BaseElement } from "@/registry/lib/base-element";
export class Menubar extends BaseElement
```

**Step 2: Replace all dispatchEvent with emit()**
```typescript
// Before
this.dispatchEvent(
  new CustomEvent("value-change", {
    detail: { value: this.value },
    bubbles: true,
    composed: true,
  })
);

// After
this.emit("value-change", { value: this.value });
```

**Step 3: Update all 14 components**
- Priority: Core components first (Menubar, Menu, Trigger, Content, Item)
- Then: Interactive items (Checkbox, Radio)
- Then: Sub-menu components
- Finally: Presentational (Separator, Label, Group, Shortcut)

**Step 4: Update tests**

#### Migration Complexity: **HIGH**
- 14 components to update (MOST in entire registry!)
- Very complex keyboard navigation (horizontal + vertical)
- Sub-menu handling
- Roving tabindex across menus
- Multiple item types
- Typeahead search

#### Estimated Tests: **20-25**
- Basic rendering (14)
- Menu opening (2)
- Horizontal keyboard nav (2)
- Vertical keyboard nav (3)
- Roving tabindex (2)
- Typeahead (2)
- Checkbox items (2)
- Radio items (2)
- Sub-menu behavior (3)
- Click outside (1)
- Escape handling (2)
- Edge cases (2-3)

---

### 5. Context Menu (registry/ui/context-menu/context-menu.ts)

#### Current State
```typescript
// ✅ GOOD: Already uses @queryAssignedElements
@queryAssignedElements({ flatten: true })
private items!: HTMLElement[];
```

#### Architecture
- **Base class**: `TW(LitElement)` ❌ (should be `BaseElement`)
- **Sub-components**: 11
  - `ui-context-menu` (root)
  - `ui-context-menu-content`
  - `ui-context-menu-item`
  - `ui-context-menu-checkbox-item`
  - `ui-context-menu-radio-group`
  - `ui-context-menu-radio-item`
  - `ui-context-menu-sub`
  - `ui-context-menu-sub-trigger`
  - `ui-context-menu-sub-content`
  - `ui-context-menu-separator`
  - `ui-context-menu-label`
  - `ui-context-menu-group`
  - `ui-context-menu-shortcut`
- **Context needed**: ❌ No - Uses event bubbling
- **Slots with @queryAssignedElements**: ✅ Yes (1 usage)
- **Legacy patterns found**: ❌ None
- **Parent-child communication**: Event bubbling (`item-select`)

#### Special Features
- 🎯 Virtual anchor positioning (cursor position)
- 🎯 Right-click trigger behavior
- 🎯 Escape and click-outside handling

#### Issues Found
1. ❌ Not extending `BaseElement` (11 classes)
2. ❌ Not using `this.emit()` helper
3. ⚠️ Uses MutationObserver for state sync
4. ✅ Already uses `@queryAssignedElements`
5. ✅ Good keyboard navigation with typeahead
6. ✅ Already follows host class forwarding pattern
7. ✅ Clever virtual anchor pattern

#### Migration Steps

**Step 1: Update imports and base class (11 components)**
```typescript
// Before
import { TW } from "@/registry/lib/tailwindMixin";
export class ContextMenu extends TW(LitElement)

// After
import { BaseElement } from "@/registry/lib/base-element";
export class ContextMenu extends BaseElement
```

**Step 2: Replace all dispatchEvent with emit()**
```typescript
// Before
this.dispatchEvent(
  new CustomEvent("context-menu-open", {
    detail: { x: this.cursorX, y: this.cursorY },
    bubbles: true,
    composed: true,
  })
);

// After
this.emit("context-menu-open", { x: this.cursorX, y: this.cursorY });
```

**Step 3: Update all 11 components**
- Priority: Core components first (ContextMenu, Content, Item)
- Then: Interactive items (Checkbox, Radio)
- Then: Sub-menu components
- Finally: Presentational (Separator, Label, Group, Shortcut)

**Step 4: Update tests**

#### Migration Complexity: **HIGH**
- 11 components to update
- Virtual anchor positioning
- Right-click behavior
- Complex event handling
- Keyboard navigation
- Typeahead search
- Multiple item types

#### Estimated Tests: **15-18**
- Basic rendering (11)
- Right-click trigger (2)
- Virtual anchor positioning (2)
- Keyboard navigation (2)
- Typeahead (2)
- Checkbox items (1)
- Radio items (1)
- Sub-menu behavior (2)
- Click outside (1)
- Escape handling (1)
- Edge cases (2-3)

---

## Migration Priority Order

Based on complexity and dependencies:

### Priority 1: Simple Interactive (Start Here)
1. **Accordion** - 4 components, clear structure, good learning case
2. **Tabs** - 4 components, already uses some new patterns

### Priority 2: Complex Menu Components
3. **Dropdown Menu** - 13 components, builds on patterns from 1-2
4. **Context Menu** - 11 components, similar to Dropdown but with virtual anchor
5. **Menubar** - 14 components, most complex, do last

---

## Common Migration Patterns

### Pattern 1: Base Class Update

```typescript
// ❌ OLD
import { TW } from "@/registry/lib/tailwindMixin";
const TwLitElement = TW(LitElement);
export class MyComponent extends TwLitElement {}

// ✅ NEW
import { BaseElement } from "@/registry/lib/base-element";
export class MyComponent extends BaseElement {}
```

### Pattern 2: Event Emission

```typescript
// ❌ OLD
this.dispatchEvent(
  new CustomEvent("my-event", {
    detail: { value: "data" },
    bubbles: true,
    composed: true,
  })
);

// ✅ NEW
this.emit("my-event", { value: "data" });
```

### Pattern 3: Slot Detection (Already Good)

```typescript
// ✅ CURRENT - Keep using this!
@queryAssignedElements({ selector: "ui-child", flatten: true })
private _children!: ChildElement[];
```

### Pattern 4: Host Class Forwarding (Already Good)

```typescript
// ✅ CURRENT - Keep using this!
render() {
  return html`
    <div class=${cn("base-styles", this.className)}>
      <slot></slot>
    </div>
  `;
}
```

---

## Testing Strategy

### Test Categories (Per Component)

1. **Rendering Tests**
   - Component renders with default props
   - Sub-components render correctly
   - Slots work as expected

2. **Interaction Tests**
   - Click/keyboard interactions
   - State changes work correctly
   - Events are emitted properly

3. **Keyboard Navigation Tests**
   - Arrow keys work
   - Enter/Space work
   - Escape works
   - Tab/Shift+Tab work
   - Typeahead works (if applicable)

4. **Edge Cases**
   - Disabled state
   - Empty state
   - Nested components
   - Multiple instances

### Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import "./my-component";
import type { MyComponent } from "./my-component";

describe("ui-my-component", () => {
  let element: MyComponent;

  beforeEach(async () => {
    element = await fixture<MyComponent>(html`
      <ui-my-component></ui-my-component>
    `);
  });

  afterEach(() => {
    element?.remove();
  });

  it("renders with default props", () => {
    expect(element).toBeDefined();
    expect(element.shadowRoot).toBeDefined();
  });

  it("emits events correctly", async () => {
    const eventSpy = vi.fn();
    element.addEventListener("my-event", eventSpy);
    
    // Trigger event
    element.click();
    
    await element.updateComplete;
    expect(eventSpy).toHaveBeenCalledTimes(1);
  });

  // Add more tests...
});
```

---

## Migration Checklist (Per Component)

### Pre-Migration
- [ ] Read component file thoroughly
- [ ] Identify all sub-components
- [ ] Document current base class
- [ ] Check for @queryAssignedElements usage
- [ ] Check for legacy patterns
- [ ] Review parent-child communication

### Migration
- [ ] Update import from `TW(LitElement)` to `BaseElement`
- [ ] Replace all `TwLitElement` references
- [ ] Replace `dispatchEvent` with `this.emit()`
- [ ] Verify `@queryAssignedElements` still works
- [ ] Verify host class forwarding still works
- [ ] Update all sub-components

### Testing
- [ ] Write/update rendering tests
- [ ] Write/update interaction tests
- [ ] Write/update keyboard tests
- [ ] Write/update edge case tests
- [ ] Run all tests and verify passing
- [ ] Test in Storybook

### Documentation
- [ ] Update component comments if needed
- [ ] Mark component as migrated in this doc
- [ ] Update registry.json if needed

---

## Risk Assessment

### Low Risk ✅
- **Accordion** - Straightforward structure
- **Tabs** - Already uses good patterns

### Medium Risk ⚠️
- **Dropdown Menu** - Many sub-components but clear patterns
- **Context Menu** - Virtual anchor pattern needs testing

### High Risk 🔴
- **Menubar** - 14 components, complex keyboard navigation, many edge cases

---

## Success Criteria

### Per Component
- ✅ All components extend `BaseElement`
- ✅ All events use `this.emit()`
- ✅ All tests pass (old + new)
- ✅ Storybook stories work correctly
- ✅ No console errors or warnings
- ✅ Keyboard navigation works
- ✅ Accessibility attributes correct

### Phase 2 Complete
- ✅ All 5 components migrated
- ✅ 75-92 tests passing
- ✅ All Storybook stories working
- ✅ No regressions in existing functionality
- ✅ Documentation updated

---

## Timeline Estimate

Assuming one developer working full-time:

| Component | Time Estimate | Cumulative |
|-----------|---------------|------------|
| Accordion | 0.5-1 day | 1 day |
| Tabs | 0.5-1 day | 2 days |
| Dropdown Menu | 1-1.5 days | 3.5 days |
| Context Menu | 1-1.5 days | 5 days |
| Menubar | 1.5-2 days | 7 days |
| **Buffer** | 1 day | **8 days** |

**Total: 8 working days (1.5-2 weeks)**

---

## Next Steps

1. **Start with Accordion**
   - Simplest component
   - Good learning case
   - Fast win

2. **Move to Tabs**
   - Similar complexity
   - Build confidence

3. **Tackle Menu Components**
   - Dropdown Menu first
   - Context Menu second
   - Menubar last (most complex)

4. **Document Progress**
   - Update this file with completion status
   - Note any issues or learnings
   - Update master checklist

---

## Open Questions

1. **Should we use @queryAssignedElements more consistently?**
   - Current: Some components use querySelector, some use @queryAssignedElements
   - Recommendation: Use @queryAssignedElements when reactive updates needed
   - Action: Document pattern in AGENTS.md

2. **Should we replace MutationObserver with better patterns?**
   - Current: Used for parent state sync
   - Recommendation: Consider @provide/@consume for complex state
   - Action: Evaluate after Phase 2 complete

3. **Should we add TypeScript strict mode?**
   - Current: Not enabled
   - Recommendation: Enable after all migrations complete
   - Action: Add to Phase 3 or Phase 4

---

## References

- **Architecture Guide**: `docs/10-refactoring-updates.md`
- **Base Infrastructure**: `registry/lib/base-element.ts`
- **Dialog Migration Example**: `docs/07-component-migration-dialog.md`
- **Button Migration Example**: `docs/06-component-migration-button.md`

---

**Last Updated**: November 3, 2025  
**Next Review**: After Accordion migration complete

