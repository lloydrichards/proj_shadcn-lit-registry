# Phase 2 Migration - Quick Reference

**Date**: November 3, 2025  
**Full Details**: See `docs/11-phase2-interactive-components-migration.md`

---

## 📊 At a Glance

| Component | Components | Complexity | Tests | Priority |
|-----------|-----------|------------|-------|----------|
| **Accordion** | 4 | MEDIUM | 12-15 | 🟢 1st |
| **Tabs** | 4 | MEDIUM | 10-12 | 🟢 2nd |
| **Dropdown Menu** | 13 | HIGH | 18-22 | 🟡 3rd |
| **Context Menu** | 11 | HIGH | 15-18 | 🟡 4th |
| **Menubar** | 14 | HIGH | 20-25 | 🔴 5th |
| **TOTAL** | **46** | - | **75-92** | **8 days** |

---

## ✅ What Needs to Change

### For ALL 46 Components:

1. **Update Base Class**
   ```typescript
   // ❌ OLD
   import { TW } from "@/registry/lib/tailwindMixin";
   const TwLitElement = TW(LitElement);
   export class MyComponent extends TwLitElement {}
   
   // ✅ NEW
   import { BaseElement } from "@/registry/lib/base-element";
   export class MyComponent extends BaseElement {}
   ```

2. **Update Event Emission**
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

3. **Keep What's Good** ✅
   - `@queryAssignedElements` usage (don't change)
   - Host class forwarding pattern (don't change)
   - Keyboard navigation (don't change)
   - Event bubbling architecture (don't change)

---

## 🎯 Migration Order

### Week 1 (Days 1-2): Simple Components
1. ✅ **Accordion** (4 components)
   - Good learning case
   - Clear structure
   - Medium complexity
   
2. ✅ **Tabs** (4 components)
   - Similar to Accordion
   - Already uses new patterns
   - Build confidence

### Week 2 (Days 3-7): Complex Menu Components
3. ✅ **Dropdown Menu** (13 components)
   - Most components
   - Standard menu pattern
   - Builds on 1-2

4. ✅ **Context Menu** (11 components)
   - Similar to Dropdown
   - Virtual anchor positioning
   - Right-click behavior

5. ✅ **Menubar** (14 components)
   - MOST complex
   - Horizontal + vertical navigation
   - Save for last

---

## 📋 Quick Checklist (Per Component)

```markdown
### Component: [Name]

**Pre-Migration**
- [ ] Read component file
- [ ] Count sub-components
- [ ] Check for legacy patterns
- [ ] Plan test cases

**Migration**
- [ ] Update base class
- [ ] Replace dispatchEvent with emit()
- [ ] Verify @queryAssignedElements works
- [ ] Update all sub-components

**Testing**
- [ ] Write/update tests
- [ ] Run test suite
- [ ] Test in Storybook
- [ ] Manual keyboard testing

**Complete**
- [ ] All tests pass
- [ ] No console errors
- [ ] Update this checklist
```

---

## 🧪 Test Coverage Goals

### Per Component Type:
- **Rendering**: 1 test per sub-component
- **Interactions**: 2-3 tests per interactive feature
- **Keyboard Nav**: 2-3 tests for arrow/enter/escape
- **Edge Cases**: 2-3 tests for disabled/empty/nested

### Overall Target: **75-92 tests**

---

## 🚨 Risk Areas

### 🟢 Low Risk
- Accordion
- Tabs

### 🟡 Medium Risk  
- Dropdown Menu (many components)
- Context Menu (virtual anchor)

### 🔴 High Risk
- Menubar (most complex, 14 components)

---

## 💡 Key Learnings from Phase 1

1. **BaseElement is Simple** ✅
   - Just extend it
   - Automatic Tailwind
   - Built-in emit() helper

2. **emit() is Better** ✅
   - Less boilerplate
   - Type-safe
   - Always composed

3. **@queryAssignedElements Works Great** ✅
   - Reactive slot detection
   - Built into Lit
   - No custom code needed

4. **Host Class Forwarding Works** ✅
   - Use `this.className`
   - No changes needed
   - Already implemented correctly

---

## 📚 References

- **Full Migration Plan**: `docs/11-phase2-interactive-components-migration.md`
- **Refactoring Guide**: `docs/10-refactoring-updates.md`
- **Base Element**: `registry/lib/base-element.ts`
- **Dialog Example**: `docs/07-component-migration-dialog.md`

---

## ✨ Success Criteria

- ✅ All 46 components extend `BaseElement`
- ✅ All events use `this.emit()`
- ✅ 75-92 tests passing
- ✅ All Storybook stories working
- ✅ Zero regressions
- ✅ No console errors

---

**Start Date**: TBD  
**Target Completion**: TBD + 8 working days  
**Status**: 🔄 PLANNING

