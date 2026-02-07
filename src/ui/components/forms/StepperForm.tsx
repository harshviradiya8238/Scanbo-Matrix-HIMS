'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
  Tabs,
  Tab,
} from '@/src/ui/components/atoms';
import { useTheme, useMediaQuery } from '@mui/material';
import { Formik, Form, FormikProps, FormikHelpers } from 'formik';

interface StepConfig {
  label: string;
  component: React.ComponentType<FormikProps<any>>;
  validationSchema?: any;
}

interface StepperFormProps<T> {
  steps: StepConfig[];
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
}

export default function StepperForm<T extends Record<string, any>>({
  steps,
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  cancelButtonText = 'Back',
}: StepperFormProps<T>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<Record<number, boolean>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  const handleNext = async (formik: FormikProps<T>) => {
    if (currentStep.validationSchema) {
      try {
        await currentStep.validationSchema.validate(formik.values, { abortEarly: false });
        // Clear any previous errors if validation passes
        formik.setErrors({});
      } catch (error: any) {
        if (error.inner) {
          const stepErrors: Record<string, boolean> = {};
          const errorMessages: Record<string, string> = {};
          
          error.inner.forEach((err: any) => {
            if (err.path) {
              stepErrors[err.path] = true;
              errorMessages[err.path] = err.message;
            }
          });
          
          formik.setTouched(stepErrors as any);
          formik.setErrors(errorMessages as any);
          return false;
        }
      }
    }

    setCompleted((prev) => ({ ...prev, [activeStep]: true }));
    setActiveStep((prev) => prev + 1);
    return true;
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveStep(newValue);
  };

  const handleSubmit = async (values: T, formikHelpers: FormikHelpers<T>) => {
    const formik = formikHelpers as any as FormikProps<T>;
    if (isLastStep) {
      await onSubmit(values);
    } else {
      const success = await handleNext(formik);
      if (!success) {
        // Validation failed, don't proceed
        return;
      }
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={currentStep?.validationSchema}
      validateOnChange={false}
      validateOnBlur={true}
      enableReinitialize={false}
    >
      {(formik) => (
        <Form>
          <Box
            sx={{
              width: '100%',
              p: 0,
              backgroundColor: 'transparent',
            }}
          >
            {/* Tabs Navigation */}
            <Box
              sx={{
                mb: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                backgroundColor: 'transparent',
              }}
            >
              <Tabs
                value={activeStep}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  px: 0.5,
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 48,
                    px: 2,
                    py: 1.5,
                    borderRadius: 1.5,
                    my: 0.5,
                    '&.Mui-selected': {
                      color: 'primary.main',
                      fontWeight: 600,
                      backgroundColor: 'rgba(17,114,186,0.08)',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {steps.map((step, index) => (
                  <Tab
                    key={step.label}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              index === activeStep
                                ? 'primary.main'
                                : completed[index]
                                ? 'success.main'
                                : 'grey.200',
                            color:
                              index === activeStep || completed[index]
                                ? 'white'
                                : 'text.secondary',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {completed[index] ? '✓' : index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                          {step.label}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Tabs>
            </Box>

            {/* Step Content */}
            <Box sx={{ mb: 2 }}>
              {currentStep && <currentStep.component {...formik} />}
            </Box>

            {/* Navigation Buttons */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}
            >
              {!isFirstStep && (
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  size="medium"
                  sx={{ minWidth: 100 }}
                >
                  {cancelButtonText}
                </Button>
              )}
              <Stack direction="row" spacing={1.5}>
              {onCancel && (
                <Button
                  onClick={onCancel}
                  variant="outlined"
                  size="medium"
                  color="inherit"
                  sx={{ minWidth: 100 }}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                size="medium"
                disabled={formik.isSubmitting}
                sx={{ minWidth: 120, px: 3 }}
              >
                {isLastStep ? submitButtonText : 'Next'}
              </Button>
              </Stack>
            </Stack>
          </Box>
        </Form>
      )}
    </Formik>
  );
}
