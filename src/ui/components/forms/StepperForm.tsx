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
import { alpha, useTheme, useMediaQuery } from '@mui/material';
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
  navigationVariant?: 'default' | 'modern';
  headerContent?: React.ReactNode;
}

export default function StepperForm<T extends Record<string, any>>({
  steps,
  initialValues,
  onSubmit,
  onCancel,
  submitButtonText = 'Submit',
  cancelButtonText = 'Back',
  navigationVariant = 'default',
  headerContent,
}: StepperFormProps<T>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<Record<number, boolean>>({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isModern = navigationVariant === 'modern';

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
            {/* Step Navigation */}
            <Box
              sx={{
                mb: 2.25,
                border: '1px solid',
                borderColor: isModern ? alpha(theme.palette.primary.main, 0.2) : 'divider',
                borderRadius: isModern ? 2.5 : 2,
                backgroundColor: isModern ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                p: isModern ? { xs: 0.95, sm: 1.1 } : 0,
                boxShadow: 'none',
              }}
            >
              {headerContent ? (
                <Box
                  sx={{
                    px: isModern ? { xs: 0.35, sm: 0.65 } : { xs: 1.5, sm: 2 },
                    pb: 1,
                    mb: 0.85,
                    borderBottom: '1px solid',
                    borderColor: isModern ? alpha(theme.palette.primary.main, 0.14) : 'divider',
                  }}
                >
                  {headerContent}
                </Box>
              ) : null}

              {isModern ? (
                <Box sx={{ px: { xs: 0.35, sm: 0.65 }, py: 0.15 }}>
                  <Stack direction="row" spacing={0.35} alignItems="flex-start">
                    {steps.map((step, index) => {
                      const isDone = index < activeStep || completed[index];
                      const isCurrent = index === activeStep;
                      const connectorColor = index < activeStep
                        ? alpha(theme.palette.primary.main, 0.55)
                        : alpha(theme.palette.primary.main, 0.2);

                      return (
                        <Box key={`track-${step.label}`} sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center">
                            <Box
                              sx={{
                                flex: 1,
                                height: 2,
                                mr: 0.45,
                                backgroundColor: index > 0 ? connectorColor : 'transparent',
                              }}
                            />
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                border: '2px solid',
                                borderColor: isDone || isCurrent
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.primary.main, 0.22),
                                backgroundColor: isDone
                                  ? theme.palette.primary.main
                                  : isCurrent
                                  ? alpha(theme.palette.primary.main, 0.12)
                                  : theme.palette.background.paper,
                                color: isDone
                                  ? theme.palette.common.white
                                  : isCurrent
                                  ? theme.palette.primary.main
                                  : theme.palette.text.disabled,
                                flexShrink: 0,
                              }}
                            >
                              {isDone ? '✓' : index + 1}
                            </Box>
                            <Box
                              sx={{
                                flex: 1,
                                height: 2,
                                ml: 0.45,
                                backgroundColor: index < steps.length - 1 ? connectorColor : 'transparent',
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 0.55,
                              display: 'block',
                              textAlign: 'center',
                              fontWeight: isDone || isCurrent ? 700 : 500,
                              color: isDone || isCurrent ? 'primary.main' : 'text.disabled',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {step.label}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              ) : (
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
                        background: 'rgba(17,114,186,0.08)',
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
                              color: index === activeStep || completed[index] ? 'white' : 'text.secondary',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {completed[index] ? '✓' : index + 1}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'inherit',
                              maxWidth: isMobile ? 140 : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {step.label}
                          </Typography>
                        </Box>
                      }
                    />
                  ))}
                </Tabs>
              )}
            </Box>

            {/* Step Content */}
            <Box sx={{ mb: 2 }}>
              {currentStep && <currentStep.component {...formik} />}
            </Box>

            {/* Navigation Buttons */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.4}
              justifyContent="flex-end"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ pt: isModern ? 1.2 : 2 }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                {!isFirstStep && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size="medium"
                    sx={{ minWidth: 108 }}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outlined"
                    size="medium"
                    color="primary"
                    sx={{ minWidth: 108 }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type={isLastStep ? 'submit' : 'button'}
                  onClick={isLastStep ? undefined : () => void handleNext(formik)}
                  variant="contained"
                  size="medium"
                  disabled={formik.isSubmitting}
                  sx={{
                    minWidth: 126,
                    px: 3,
                    ...(isModern
                      ? {
                          boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      : {}),
                  }}
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
