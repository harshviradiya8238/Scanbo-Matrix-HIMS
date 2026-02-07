# Reusable Form Components

This directory contains reusable form components built with Formik and Material-UI for consistent form handling across the application.

## Components

### FormTextField
A text input field integrated with Formik.

```tsx
import { FormTextField } from '@/src/ui/components/forms';

<FormTextField
  name="patientName"
  label="Patient Name"
  required
/>
```

### FormSelect
A select dropdown with optional "Add" button for creating new options.

```tsx
import { FormSelect } from '@/src/ui/components/forms';

<FormSelect
  name="gender"
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ]}
  required
  showAddButton
  onAddClick={() => console.log('Add new option')}
/>
```

### FormDatePicker
A date picker component using MUI X Date Pickers.

```tsx
import { FormDatePicker } from '@/src/ui/components/forms';

<FormDatePicker
  name="dob"
  label="Date of Birth"
  required
/>
```

### FormCheckbox
A checkbox input integrated with Formik.

```tsx
import { FormCheckbox } from '@/src/ui/components/forms';

<FormCheckbox
  name="mlc"
  label="MLC"
/>
```

### FormRadioGroup
A radio button group for single selection.

```tsx
import { FormRadioGroup } from '@/src/ui/components/forms';

<FormRadioGroup
  name="addressType"
  label="Address Type"
  options={[
    { value: 'urban', label: 'Urban' },
    { value: 'rural', label: 'Rural' },
  ]}
  row
  required
/>
```

### FormPhoneInput
A phone input with country code prefix.

```tsx
import { FormPhoneInput } from '@/src/ui/components/forms';

<FormPhoneInput
  name="mobile"
  label="Mobile"
  countryCode="971"
  required
/>
```

### StepperForm
A multi-step form component with validation per step.

```tsx
import { StepperForm } from '@/src/ui/components/forms';
import * as yup from 'yup';

const steps = [
  {
    label: 'Step 1',
    component: Step1Component,
    validationSchema: yup.object().shape({
      field1: yup.string().required(),
    }),
  },
  {
    label: 'Step 2',
    component: Step2Component,
  },
];

<StepperForm
  steps={steps}
  initialValues={initialValues}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitButtonText="Register"
  cancelButtonText="Back"
/>
```

## Features

- ✅ Automatic error handling and display
- ✅ Required field validation
- ✅ Type-safe with TypeScript
- ✅ Consistent styling with Material-UI theme
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Reusable across the application
- ✅ Step-by-step validation in StepperForm

## Usage Notes

1. All form components must be used within a Formik context (provided by `StepperForm` or manually with `<Formik>`).
2. Use `yup` schemas for validation.
3. Components automatically handle touched state and error display.
4. The `StepperForm` component validates each step before allowing progression.

