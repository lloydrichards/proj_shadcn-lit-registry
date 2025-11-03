import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FormElement } from "./form-element";

@customElement("test-form-element")
class TestFormElement extends FormElement {
  focus() {
    // Implementation for testing
  }

  blur() {
    // Implementation for testing
  }

  render() {
    return html`<input .value=${String(this.value)} />`;
  }
}

describe("FormElement", () => {
  let form: HTMLFormElement;
  let element: TestFormElement;

  beforeEach(() => {
    form = document.createElement("form");
    element = document.createElement("test-form-element") as TestFormElement;
    element.name = "test-field";
    form.appendChild(element);
    document.body.appendChild(form);
  });

  afterEach(() => {
    document.body.removeChild(form);
  });

  it("should extend BaseElement", () => {
    expect(element).toBeInstanceOf(FormElement);
  });

  it("should have formAssociated static property", () => {
    expect(TestFormElement.formAssociated).toBe(true);
  });

  it("should validate required fields", async () => {
    element.required = true;
    element.value = "";
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
  });

  it("should pass validation when required field has value", async () => {
    element.required = true;
    element.value = "test value";
    await element.updateComplete;

    expect(element.checkValidity()).toBe(true);
  });

  it("should reset to default value", async () => {
    element.defaultValue = "default";
    element.value = "changed";
    await element.updateComplete;

    element.reset();

    expect(element.value).toBe("default");
  });

  it("should set custom validity message", async () => {
    element.setCustomValidity("Custom error");
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);
    expect(element.validity.customError).toBe(true);
  });

  it("should clear custom validity when message is empty", async () => {
    element.setCustomValidity("Custom error");
    element.setCustomValidity("");
    await element.updateComplete;

    expect(element.checkValidity()).toBe(true);
    expect(element.validity.customError).toBe(false);
  });

  it("should find form element", async () => {
    await element.updateComplete;

    expect(element.formElement).toBe(form);
  });

  it("should ignore validation when disabled", async () => {
    element.required = true;
    element.value = "";
    element.disabled = true;
    await element.updateComplete;

    expect(element.checkValidity()).toBe(true);
  });

  it("should emit invalid event on reportValidity failure", async () => {
    element.required = true;
    element.value = "";
    await element.updateComplete;

    let eventFired = false;
    element.addEventListener("invalid", () => {
      eventFired = true;
    });

    element.reportValidity();

    expect(eventFired).toBe(true);
  });
});
