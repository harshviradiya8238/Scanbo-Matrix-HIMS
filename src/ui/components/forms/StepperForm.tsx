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
  isOptional?: boolean;
  onSkip?: (formik: FormikProps<any>) => void | Promise<void>;
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
  stickyNavigation?: boolean;
  stickyNavigationTop?: number | string;
  fillHeight?: boolean;
  contentScrollable?: boolean;
  stickyFooter?: boolean;
  compactNavigation?: boolean;
  showHeaderDivider?: boolean;
  navigationBottomContent?:
    | React.ReactNode
    | ((formik: FormikProps<T>, context: { activeStep: number; isLastStep: boolean; steps: StepConfig[] }) => React.ReactNode);
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
  stickyNavigation = false,
  stickyNavigationTop = 0,
  fillHeight = false,
  contentScrollable = false,
  stickyFooter = false,
  compactNavigation = false,
  showHeaderDivider = true,
  navigationBottomContent,
}: StepperFormProps<T>) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<Record<number, boolean>>({});
  const [lastStepSubmitArmed, setLastStepSubmitArmed] = React.useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isModern = navigationVariant === 'modern';
  const isCompactModernNavigation = isModern && compactNavigation;
  const formLayoutStyle = fillHeight
    ? {
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: 0,
      }
    : undefined;
  const stepNavigationBackgroundColor = isModern
    ? (stickyNavigation ? alpha(theme.palette.primary.main, 0.065) : alpha(theme.palette.primary.main, 0.05))
    : (stickyNavigation ? theme.palette.background.paper : 'transparent');
  const stepNavigationShadow = 'none';

  const currentStep = steps[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;
  const isCurrentOptional = Boolean(currentStep?.isOptional);

  React.useEffect(() => {
    if (!isLastStep || typeof window === 'undefined') {
      setLastStepSubmitArmed(true);
      return;
    }
    setLastStepSubmitArmed(false);
    const timer = window.setTimeout(() => {
      setLastStepSubmitArmed(true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [activeStep, isLastStep]);

  const handleNext = async (formik: FormikProps<T>) => {
    if (currentStep.validationSchema) {
      try {
        await currentStep.validationSchema.validate(formik.values, { abortEarly: false, stripUnknown: false });
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
      if (!lastStepSubmitArmed) {
        return;
      }
      await onSubmit(values);
    } else {
      const success = await handleNext(formik);
      if (!success) {
        // Validation failed, don't proceed
        return;
      }
    }
  };

  const handleSkipAndSubmit = async (formik: FormikProps<T>) => {
    if (!isLastStep || !isCurrentOptional || !lastStepSubmitArmed) return;
    if (currentStep?.onSkip) {
      await currentStep.onSkip(formik);
    }
    await formik.submitForm();
  };

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;
    if (!isLastStep || !lastStepSubmitArmed) {
      event.preventDefault();
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize={false}
    >
      {(formik) => (
        <Form onKeyDown={handleFormKeyDown} style={formLayoutStyle}>
          <Box
            sx={{
              width: '100%',
              p: 0,
              backgroundColor: 'transparent',
              ...(fillHeight
                ? {
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                  }
                : {}),
            }}
          >
            {/* Step Navigation */}
            <Box
              sx={{
                mb: isCompactModernNavigation ? 1.15 : 2.25,
                ...(stickyNavigation
                  ? {
                      position: 'sticky',
                      top: stickyNavigationTop,
                      zIndex: theme.zIndex.appBar - 1,
                      pt: 0.2,
                    }
                  : {}),
                border: '1px solid',
                borderColor: isModern
                  ? alpha(theme.palette.primary.main, stickyNavigation ? 0.3 : 0.2)
                  : 'divider',
                borderRadius: isModern ? 2.5 : 2,
                backgroundColor: stepNavigationBackgroundColor,
                p: isModern
                  ? (isCompactModernNavigation ? { xs: 0.6, sm: 0.72 } : { xs: 0.95, sm: 1.1 })
                  : 0,
                boxShadow: stepNavigationShadow,
              }}
            >
              {headerContent ? (
                <Box
                  sx={{
                    px: isModern
                      ? (isCompactModernNavigation ? { xs: 0.2, sm: 0.42 } : { xs: 0.35, sm: 0.65 })
                      : { xs: 1.5, sm: 2 },
                    pb: isCompactModernNavigation ? 0.62 : 1,
                    mb: isCompactModernNavigation ? 0.58 : 0.85,
                    borderBottom: showHeaderDivider ? '1px solid' : 'none',
                    borderColor: showHeaderDivider
                      ? (isModern ? alpha(theme.palette.primary.main, 0.14) : 'divider')
                      : 'transparent',
                  }}
                >
                  {headerContent}
                </Box>
              ) : null}

              {isModern ? (
                <Box
                  sx={{
                    px: isCompactModernNavigation ? { xs: 0.2, sm: 0.42 } : { xs: 0.35, sm: 0.65 },
                    py: isCompactModernNavigation ? 0.02 : 0.15,
                  }}
                >
                  <Stack direction="row" spacing={isCompactModernNavigation ? 0.28 : 0.35} alignItems="flex-start">
                    {steps.map((step, index) => {
                      const isDone = index < activeStep || completed[index];
                      const isCurrent = index === activeStep;
                      const activeConnectorColor = alpha(theme.palette.primary.main, 0.55);
                      const inactiveConnectorColor = alpha(theme.palette.primary.main, 0.2);
                      const edgeConnectorFlex = isCompactModernNavigation ? 0.34 : 0.4;
                      const leftConnectorColor = index > 0
                        ? (index - 1 < activeStep ? activeConnectorColor : inactiveConnectorColor)
                        : 'transparent';
                      const rightConnectorColor = index < steps.length - 1
                        ? (index < activeStep ? activeConnectorColor : inactiveConnectorColor)
                        : 'transparent';
                      const leftConnectorFlex = index === 0 ? edgeConnectorFlex : 1;
                      const rightConnectorFlex = index === steps.length - 1 ? edgeConnectorFlex : 1;
                      const showStrongCircle = isCurrent || isDone;

                      return (
                        <Box key={`track-${step.label}`} sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" alignItems="center">
                            <Box
                              sx={{
                                flex: leftConnectorFlex,
                                height: isCompactModernNavigation ? 1.5 : 2,
                                mr: isCompactModernNavigation ? 0.3 : 0.45,
                                backgroundColor: leftConnectorColor,
                              }}
                            />
                            <Box
                              sx={{
                                width: isCompactModernNavigation ? 24 : 28,
                                height: isCompactModernNavigation ? 24 : 28,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: isCompactModernNavigation ? 11 : 12,
                                fontWeight: 700,
                                lineHeight: 1,
                                border: '2px solid',
                                borderColor: showStrongCircle
                                  ? theme.palette.primary.main
                                  : alpha(theme.palette.primary.main, 0.22),
                                backgroundColor: showStrongCircle
                                  ? theme.palette.primary.main
                                  : theme.palette.background.paper,
                                color: showStrongCircle ? theme.palette.common.white : theme.palette.text.disabled,
                                flexShrink: 0,
                              }}
                            >
                              {isDone ? '✓' : index + 1}
                            </Box>
                            <Box
                              sx={{
                                flex: rightConnectorFlex,
                                height: isCompactModernNavigation ? 1.5 : 2,
                                ml: isCompactModernNavigation ? 0.3 : 0.45,
                                backgroundColor: rightConnectorColor,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="caption"
                            sx={{
                              mt: isCompactModernNavigation ? 0.32 : 0.55,
                              display: 'block',
                              textAlign: 'center',
                              fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? 'primary.main' : isDone ? 'text.secondary' : 'text.disabled',
                              fontSize: isCompactModernNavigation ? 11 : undefined,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {step.label}
                          </Typography>
                          {!isCompactModernNavigation ? (
                            <Box
                              sx={{
                                mt: 0.65,
                                mx: 0.55,
                                height: 3,
                                borderRadius: '3px 3px 0 0',
                                backgroundColor: isCurrent ? 'primary.main' : 'transparent',
                              }}
                            />
                          ) : null}
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

              {navigationBottomContent ? (
                <Box
                  sx={{
                    mt: isCompactModernNavigation ? 0.42 : 0.72,
                    px: isCompactModernNavigation ? { xs: 0.2, sm: 0.42 } : { xs: 0.35, sm: 0.65 },
                    pb: isCompactModernNavigation ? 0.08 : 0.12,
                  }}
                >
                  {typeof navigationBottomContent === 'function'
                    ? navigationBottomContent(formik, { activeStep, isLastStep, steps })
                    : navigationBottomContent}
                </Box>
              ) : null}
            </Box>

            {/* Step Content */}
            <Box
              sx={{
                ...(contentScrollable
                  ? {
                      flex: 1,
                      minHeight: 0,
                      overflowY: 'auto',
                      pr: 0.25,
                      mb: 0.8,
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} transparent`,
                      '&::-webkit-scrollbar': {
                        width: 6,
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        borderRadius: 999,
                        backgroundColor: alpha(theme.palette.primary.main, 0.26),
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.38),
                      },
                      ...(stickyFooter ? { mb: 0.35 } : {}),
                    }
                  : {
                      mb: 2,
                    }),
              }}
            >
              {currentStep && <currentStep.component {...formik} />}
            </Box>

            {/* Navigation Buttons */}
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={stickyFooter ? 0.8 : 1.4}
              justifyContent="flex-end"
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{
                pt: isModern ? (stickyFooter ? 0.55 : 1.2) : stickyFooter ? 0.75 : 2,
                ...(stickyFooter
                  ? {
                      position: 'sticky',
                      bottom: 0,
                      zIndex: theme.zIndex.appBar - 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: theme.palette.background.paper,
                      px: { xs: 0.2, sm: 0.35 },
                      pb: { xs: 0.35, sm: 0.45 },
                    }
                  : {}),
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={stickyFooter ? 0.85 : 1.2}>
                {!isFirstStep && (
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    size={stickyFooter ? 'small' : 'medium'}
                    sx={{ minWidth: stickyFooter ? 92 : 108 }}
                  >
                    {cancelButtonText}
                  </Button>
                )}
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="outlined"
                    size={stickyFooter ? 'small' : 'medium'}
                    color="primary"
                    sx={{ minWidth: stickyFooter ? 92 : 108 }}
                  >
                    Cancel
                  </Button>
                )}
                {isLastStep && isCurrentOptional && (
                  <Button
                    type="button"
                    onClick={() => void handleSkipAndSubmit(formik)}
                    variant="outlined"
                    size={stickyFooter ? 'small' : 'medium'}
                    disabled={formik.isSubmitting || !lastStepSubmitArmed}
                    sx={{ minWidth: stickyFooter ? 122 : 150 }}
                  >
                    Skip & Register
                  </Button>
                )}
                <Button
                  type={isLastStep ? 'submit' : 'button'}
                  onClick={isLastStep ? undefined : () => void handleNext(formik)}
                  variant="contained"
                  size={stickyFooter ? 'small' : 'medium'}
                  disabled={formik.isSubmitting || (isLastStep && !lastStepSubmitArmed)}
                  sx={{
                    minWidth: stickyFooter ? 102 : 126,
                    px: stickyFooter ? 2.2 : 3,
                    ...(isModern
                      ? {
                          boxShadow: stickyFooter
                            ? `0 4px 10px ${alpha(theme.palette.primary.main, 0.24)}`
                            : `0 8px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
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
