# Accordion Migration Guide - Step by Step

**Component**: Accordion  
**Sub-components**: 4 (Accordion, AccordionItem, AccordionTrigger, AccordionContent)  
**Complexity**: MEDIUM  
**Est. Time**: 0.5-1 day  
**Status**: 🔄 READY TO START

---

## 📋 Pre-Migration Checklist

- [x] Component analyzed
- [x] Current patterns documented
- [x] Migration steps defined
- [x] Test plan created
- [ ] Branch created
- [ ] Migration started

---

## 🎯 Migration Goals

1. Update all 4 components to extend `BaseElement`
2. Replace all `dispatchEvent` calls with `this.emit()`
3. Ensure all tests pass
4. Verify Storybook stories work
5. Document any issues or learnings

---

## 📂 Files to Modify

```
registry/ui/accordion/
├── accordion.ts          # ⚠️ MODIFY - All 4 components
├── accordion.stories.ts  # ✅ REVIEW - May need updates
└── (tests TBD)          # 🆕 CREATE - New test file
```

---

## 🔄 Step-by-Step Migration

### Step 1: Update Imports (Line 5-6)

**Current** (`accordion.ts:5-8`):
```typescript
import { TW } from "@/registry/lib/tailwindMixin";
import { cn } from "@/registry/lib/utils";

const TwLitElement = TW(LitElement);
```

**Updated**:
```typescript
import { BaseElement } from "@/registry/lib/base-element";
import { cn } from "@/registry/lib/utils";

// Remove TwLitElement - not needed anymore
```

---

### Step 2: Update Accordion Component (Line 42)

**Current** (`accordion.ts:42`):
```typescript
@customElement("ui-accordion")
export class Accordion extends TwLitElement implements AccordionProperties {
```

**Updated**:
```typescript
@customElement("ui-accordion")
export class Accordion extends BaseElement implements AccordionProperties {
```

---

### Step 3: Update dispatchValueChangeEvent Method (Line 109-120)

**Current** (`accordion.ts:109-120`):
```typescript
private dispatchValueChangeEvent() {
  const value =
    this.type === "single" ? this.value : Array.from(this._openValues);

  this.dispatchEvent(
    new CustomEvent("value-change", {
      detail: { value },
      bubbles: true,
      composed: true,
    }),
  );
}
```

**Updated**:
```typescript
private dispatchValueChangeEvent() {
  const value =
    this.type === "single" ? this.value : Array.from(this._openValues);

  this.emit("value-change", { value });
}
```

✅ **5 lines → 3 lines** (40% reduction)

---

### Step 4: Update AccordionItem Component (Line 152-154)

**Current** (`accordion.ts:152-154`):
```typescript
@customElement("ui-accordion-item")
export class AccordionItem
  extends TwLitElement
  implements AccordionItemProperties
```

**Updated**:
```typescript
@customElement("ui-accordion-item")
export class AccordionItem
  extends BaseElement
  implements AccordionItemProperties
```

---

### Step 5: Update AccordionTrigger Component (Line 216-218)

**Current** (`accordion.ts:216-218`):
```typescript
@customElement("ui-accordion-trigger")
export class AccordionTrigger
  extends TwLitElement
  implements AccordionTriggerProperties
```

**Updated**:
```typescript
@customElement("ui-accordion-trigger")
export class AccordionTrigger
  extends BaseElement
  implements AccordionTriggerProperties
```

---

### Step 6: Update Trigger Click Event (Line 250-256)

**Current** (`accordion.ts:250-256`):
```typescript
this.dispatchEvent(
  new CustomEvent("accordion-trigger-click", {
    detail: { value: item.value },
    bubbles: true,
    composed: true,
  }),
);
```

**Updated**:
```typescript
this.emit("accordion-trigger-click", { value: item.value });
```

✅ **6 lines → 1 line** (83% reduction)

---

### Step 7: Update AccordionContent Component (Line 299-302)

**Current** (`accordion.ts:299-302`):
```typescript
@customElement("ui-accordion-content")
export class AccordionContent
  extends TwLitElement
  implements AccordionContentProperties
```

**Updated**:
```typescript
@customElement("ui-accordion-content")
export class AccordionContent
  extends BaseElement
  implements AccordionContentProperties
```

---

### Step 8: Verify No Other Changes Needed

✅ Check list:
- [x] All 4 components updated
- [x] All `dispatchEvent` calls replaced
- [x] No `TwLitElement` references remain
- [x] Host class forwarding still uses `this.className`
- [x] No legacy patterns found

---

## 🧪 Testing Plan

### Test File: `accordion.test.ts` (CREATE)

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { fixture, html } from "@open-wc/testing";
import "./accordion";
import type { Accordion } from "./accordion";

describe("ui-accordion", () => {
  describe("Rendering", () => {
    it("renders accordion root", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion></ui-accordion>
      `);
      expect(el).toBeDefined();
      expect(el.shadowRoot).toBeDefined();
    });

    it("renders with items", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion>
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);
      
      const item = el.querySelector("ui-accordion-item");
      expect(item).toBeDefined();
    });
  });

  describe("Single Mode", () => {
    it("opens single item on click", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      const button = trigger?.shadowRoot?.querySelector("button");
      
      button?.click();
      await el.updateComplete;
      
      expect(el.value).toBe("item1");
    });

    it("closes item when collapsible", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single" collapsible value="item1">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      const button = trigger?.shadowRoot?.querySelector("button");
      
      button?.click();
      await el.updateComplete;
      
      expect(el.value).toBe("");
    });

    it("switches between items when non-collapsible", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single" value="item1">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="item2">
            <ui-accordion-trigger>Item 2</ui-accordion-trigger>
            <ui-accordion-content>Content 2</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const triggers = el.querySelectorAll("ui-accordion-trigger");
      const button2 = triggers[1]?.shadowRoot?.querySelector("button");
      
      button2?.click();
      await el.updateComplete;
      
      expect(el.value).toBe("item2");
    });
  });

  describe("Multiple Mode", () => {
    it("opens multiple items", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="multiple">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
          <ui-accordion-item value="item2">
            <ui-accordion-trigger>Item 2</ui-accordion-trigger>
            <ui-accordion-content>Content 2</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const triggers = el.querySelectorAll("ui-accordion-trigger");
      
      triggers[0]?.shadowRoot?.querySelector("button")?.click();
      await el.updateComplete;
      
      triggers[1]?.shadowRoot?.querySelector("button")?.click();
      await el.updateComplete;
      
      expect(el._openValues.has("item1")).toBe(true);
      expect(el._openValues.has("item2")).toBe(true);
    });

    it("toggles individual items", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="multiple">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      const button = trigger?.shadowRoot?.querySelector("button");
      
      button?.click();
      await el.updateComplete;
      expect(el._openValues.has("item1")).toBe(true);
      
      button?.click();
      await el.updateComplete;
      expect(el._openValues.has("item1")).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits value-change event on toggle", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const eventSpy = vi.fn();
      el.addEventListener("value-change", eventSpy);

      const trigger = el.querySelector("ui-accordion-trigger");
      trigger?.shadowRoot?.querySelector("button")?.click();
      
      await el.updateComplete;
      
      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy.mock.calls[0][0].detail.value).toBe("item1");
    });
  });

  describe("Disabled State", () => {
    it("does not toggle when disabled", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single" disabled>
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      trigger?.shadowRoot?.querySelector("button")?.click();
      
      await el.updateComplete;
      
      expect(el.value).toBe("");
    });
  });

  describe("Default Value", () => {
    it("initializes with default value", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single" default-value="item1">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      expect(el.value).toBe("item1");
    });
  });

  describe("Animation", () => {
    it("sets animation state on content", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const content = el.querySelector("ui-accordion-content");
      const trigger = el.querySelector("ui-accordion-trigger");
      
      trigger?.shadowRoot?.querySelector("button")?.click();
      await el.updateComplete;
      
      // Should start opening animation
      expect(content?._open).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("sets aria-expanded on trigger", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single" value="item1">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      const button = trigger?.shadowRoot?.querySelector("button");
      
      expect(button?.getAttribute("aria-expanded")).toBe("true");
    });

    it("links trigger to content via aria-controls", async () => {
      const el = await fixture<Accordion>(html`
        <ui-accordion type="single">
          <ui-accordion-item value="item1">
            <ui-accordion-trigger>Item 1</ui-accordion-trigger>
            <ui-accordion-content>Content 1</ui-accordion-content>
          </ui-accordion-item>
        </ui-accordion>
      `);

      const trigger = el.querySelector("ui-accordion-trigger");
      const content = el.querySelector("ui-accordion-content");
      const button = trigger?.shadowRoot?.querySelector("button");
      
      const ariaControls = button?.getAttribute("aria-controls");
      expect(ariaControls).toBeDefined();
      expect(content?.id).toBe(ariaControls);
    });
  });
});
```

**Test Count**: 13 tests ✅ (within 12-15 estimate)

---

## 🎨 Storybook Verification

### Check: `accordion.stories.ts`

1. Run Storybook: `bun run storybook`
2. Navigate to `ui/Accordion`
3. Test all stories:
   - [ ] Default story works
   - [ ] Single mode works
   - [ ] Multiple mode works
   - [ ] Collapsible works
   - [ ] Disabled state works

---

## 🚀 Migration Steps Execution

### Before Starting
```bash
# Create feature branch
git checkout -b feat/accordion-base-element-migration

# Verify current state
bun run test  # Should pass (or skip if no tests)
bun run storybook  # Should work
```

### During Migration
```bash
# 1. Make changes to accordion.ts
# 2. Create accordion.test.ts
# 3. Run tests after each change
bun run test accordion

# 4. Verify Storybook after all changes
bun run storybook
```

### After Migration
```bash
# Run full test suite
bun run test

# Build registry
bun run registry:build

# Commit changes
git add registry/ui/accordion/
git commit -m "refactor(accordion): migrate to BaseElement

- Update all 4 components to extend BaseElement
- Replace dispatchEvent with emit() helper
- Add comprehensive test suite (13 tests)
- Verify Storybook stories still work

BREAKING CHANGE: None (internal refactoring only)
"
```

---

## ✅ Completion Checklist

### Code Changes
- [ ] Imports updated (remove TW, add BaseElement)
- [ ] Accordion class extends BaseElement
- [ ] AccordionItem class extends BaseElement
- [ ] AccordionTrigger class extends BaseElement
- [ ] AccordionContent class extends BaseElement
- [ ] dispatchValueChangeEvent uses emit()
- [ ] Trigger click event uses emit()
- [ ] No TwLitElement references remain

### Tests
- [ ] Test file created
- [ ] 13+ tests written
- [ ] All tests pass
- [ ] No console errors

### Storybook
- [ ] All stories render
- [ ] Interactions work
- [ ] No visual regressions
- [ ] No console errors

### Documentation
- [ ] This guide updated with completion date
- [ ] Any issues documented
- [ ] Phase 2 summary updated
- [ ] Commit pushed

---

## 📝 Notes & Learnings

### Issues Found
- (Document any issues discovered during migration)

### Improvements Made
- (Document any additional improvements)

### Time Taken
- **Estimated**: 0.5-1 day
- **Actual**: ___ hours
- **Variance**: ___

---

## 🎓 Key Takeaways

This migration demonstrates:
1. ✅ How simple BaseElement migration is
2. ✅ How emit() reduces boilerplate
3. ✅ How to test composite components
4. ✅ How to verify Storybook integration

**Use this as a template for remaining components!**

---

**Status**: 🔄 READY TO START  
**Started**: ___  
**Completed**: ___  
**Next Component**: Tabs

