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
  headerContent?: React.ReactNode | ((context: { activeStep: number; steps: StepConfig[] }) => React.ReactNode);
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
            {isCompactModernNavigation ? (
              /* ── Compact: single horizontal row matching reference design ── */
              <Box
                sx={{
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  px: 2.5,
                  py: 1.5,
                  border: '1px solid #DDE8F0',
                  borderRadius: '22px',
                  backgroundColor: '#FFFFFF',
                  flexShrink: 0,
                  ...(stickyNavigation
                    ? { position: 'sticky', top: stickyNavigationTop, zIndex: theme.zIndex.appBar - 1 }
                    : {}),
                }}
              >
                {/* Left: title block */}
                {headerContent && (
                  <Box sx={{ flexShrink: 0 }}>
                    {typeof headerContent === 'function'
                      ? headerContent({ activeStep, steps })
                      : headerContent}
                  </Box>
                )}

                {headerContent && (
                  <Box sx={{ width: '1px', height: 36, backgroundColor: '#DDE8F0', flexShrink: 0 }} />
                )}

                {/* Center: inline stepper — bubble + label side-by-side, line between steps */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {steps.map((step, index) => {
                    const isDone = index < activeStep || completed[index];
                    const isCurrent = index === activeStep;
                    const isActive = isCurrent || isDone;
                    const stepLabel = isCurrent ? 'Current' : isDone ? 'Completed' : 'Next';
                    return (
                      <React.Fragment key={step.label}>
                        {index > 0 && (
                          <Box sx={{ width: 60, height: 2, backgroundColor: '#DDE8F0', borderRadius: 1, flexShrink: 0 }} />
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexShrink: 0 }}>
                          <Box
                            sx={{
                              width: 26, height: 26, borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '11px', fontWeight: 700, lineHeight: 1,
                              backgroundColor: isActive ? theme.palette.primary.main : '#F5F8FB',
                              border: '1.5px solid',
                              borderColor: isActive ? theme.palette.primary.main : '#DDE8F0',
                              color: isActive ? '#fff' : '#9AAFBF',
                              flexShrink: 0,
                            }}
                          >
                            {isDone ? '✓' : index + 1}
                          </Box>
                          <Box>
                            <Box component="span" sx={{ fontSize: '9.5px', color: '#9AAFBF', fontWeight: 500, display: 'block', lineHeight: 1, mb: '3px' }}>
                              {stepLabel}
                            </Box>
                            <Box component="span" sx={{ fontSize: '12px', fontWeight: 700, display: 'block', lineHeight: 1, color: isCurrent ? '#0D1B2A' : '#9AAFBF' }}>
                              {step.label}
                            </Box>
                          </Box>
                        </Box>
                      </React.Fragment>
                    );
                  })}
                </Box>

                {navigationBottomContent && (
                  <Box sx={{ width: '1px', height: 36, backgroundColor: '#DDE8F0', flexShrink: 0 }} />
                )}

                {/* Right: country toggle pushed to far right */}
                {navigationBottomContent && (
                  <Box sx={{ marginLeft: 'auto', flexShrink: 0 }}>
                    {typeof navigationBottomContent === 'function'
                      ? navigationBottomContent(formik, { activeStep, isLastStep, steps })
                      : navigationBottomContent}
                  </Box>
                )}
              </Box>
            ) : (
              /* ── Standard layout ── */
              <Box
                sx={{
                  mb: 2.25,
                  ...(stickyNavigation
                    ? { position: 'sticky', top: stickyNavigationTop, zIndex: theme.zIndex.appBar - 1, pt: 0.2 }
                    : {}),
                  border: '1px solid',
                  borderColor: isModern ? alpha(theme.palette.primary.main, stickyNavigation ? 0.3 : 0.2) : 'divider',
                  borderRadius: isModern ? 2.5 : 2,
                  backgroundColor: stepNavigationBackgroundColor,
                  p: isModern ? { xs: 0.95, sm: 1.1 } : 0,
                  boxShadow: stepNavigationShadow,
                }}
              >
                {headerContent ? (
                  <Box
                    sx={{
                      px: isModern ? { xs: 0.35, sm: 0.65 } : { xs: 1.5, sm: 2 },
                      pb: 1, mb: 0.85,
                      borderBottom: showHeaderDivider ? '1px solid' : 'none',
                      borderColor: showHeaderDivider
                        ? (isModern ? alpha(theme.palette.primary.main, 0.14) : 'divider')
                        : 'transparent',
                    }}
                  >
                    {typeof headerContent === 'function' ? headerContent({ activeStep, steps }) : headerContent}
                  </Box>
                ) : null}

                {isModern ? (
                  <Box sx={{ px: { xs: 0.35, sm: 0.65 }, py: 0.15 }}>
                    <Stack direction="row" spacing={0.35} alignItems="flex-start">
                      {steps.map((step, index) => {
                        const isDone = index < activeStep || completed[index];
                        const isCurrent = index === activeStep;
                        const activeConnectorColor = alpha(theme.palette.primary.main, 0.55);
                        const inactiveConnectorColor = alpha(theme.palette.primary.main, 0.2);
                        const leftConnectorColor = index > 0 ? (index - 1 < activeStep ? activeConnectorColor : inactiveConnectorColor) : 'transparent';
                        const rightConnectorColor = index < steps.length - 1 ? (index < activeStep ? activeConnectorColor : inactiveConnectorColor) : 'transparent';
                        const showStrongCircle = isCurrent || isDone;
                        return (
                          <Box key={`track-${step.label}`} sx={{ flex: 1, minWidth: 0 }}>
                            <Stack direction="row" alignItems="center">
                              <Box sx={{ flex: index === 0 ? 0.4 : 1, height: 2, mr: 0.45, backgroundColor: leftConnectorColor }} />
                              <Box
                                sx={{
                                  width: 28, height: 28, borderRadius: '50%',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: 12, fontWeight: 700, lineHeight: 1, border: '2px solid',
                                  borderColor: showStrongCircle ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.22),
                                  backgroundColor: showStrongCircle ? theme.palette.primary.main : theme.palette.background.paper,
                                  color: showStrongCircle ? theme.palette.common.white : theme.palette.text.disabled,
                                  flexShrink: 0,
                                }}
                              >
                                {isDone ? '✓' : index + 1}
                              </Box>
                              <Box sx={{ flex: index === steps.length - 1 ? 0.4 : 1, height: 2, ml: 0.45, backgroundColor: rightConnectorColor }} />
                            </Stack>
                            <Typography
                              variant="caption"
                              sx={{
                                mt: 0.55, display: 'block', textAlign: 'center', fontWeight: isCurrent ? 700 : 500,
                                color: isCurrent ? 'primary.main' : isDone ? 'text.secondary' : 'text.disabled',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}
                            >
                              {step.label}
                            </Typography>
                            <Box sx={{ mt: 0.65, mx: 0.55, height: 3, borderRadius: '3px 3px 0 0', backgroundColor: isCurrent ? 'primary.main' : 'transparent' }} />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                ) : (
                  <Tabs value={activeStep} onChange={handleTabChange} variant="scrollable" scrollButtons="auto"
                    sx={{
                      minHeight: 48, px: 0.5,
                      '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48, px: 2, py: 1.5, borderRadius: 1.5, my: 0.5, '&.Mui-selected': { color: 'primary.main', fontWeight: 600, background: 'rgba(17,114,186,0.08)' } },
                      '& .MuiTabs-indicator': { display: 'none' },
                    }}
                  >
                    {steps.map((step, index) => (
                      <Tab key={step.label} label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: index === activeStep ? 'primary.main' : completed[index] ? 'success.main' : 'grey.200', color: index === activeStep || completed[index] ? 'white' : 'text.secondary', fontSize: '0.75rem', fontWeight: 700 }}>
                            {completed[index] ? '✓' : index + 1}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'inherit', maxWidth: isMobile ? 140 : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {step.label}
                          </Typography>
                        </Box>
                      } />
                    ))}
                  </Tabs>
                )}

                {navigationBottomContent ? (
                  <Box sx={{ mt: 0.72, px: { xs: 0.35, sm: 0.65 }, pb: 0.12 }}>
                    {typeof navigationBottomContent === 'function'
                      ? navigationBottomContent(formik, { activeStep, isLastStep, steps })
                      : navigationBottomContent}
                  </Box>
                ) : null}
              </Box>
            )}

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
            {stickyFooter ? (
              /* ── Sticky pill footer matching reference design ── */
              <Box
                sx={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: theme.zIndex.appBar - 1,
                  pt: 1,
                  pb: 0.5,
                  backgroundColor: 'transparent',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 1,
                    border: '1px solid #DDE8F0',
                    borderRadius: '22px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 12px rgba(10,68,114,0.08)',
                  }}
                >
                  {/* Left: step info */}
                  <Typography
                    sx={{ fontSize: '13px', fontWeight: 500, color: '#5A7184', whiteSpace: 'nowrap' }}
                  >
                    Step {activeStep + 1} of {steps.length}
                    <Box component="span" sx={{ mx: 0.75, color: '#C8D8E4' }}>·</Box>
                    <Box component="span" sx={{ color: '#0D1B2A', fontWeight: 600 }}>
                      {currentStep?.label}
                    </Box>
                  </Typography>

                  {/* Right: action buttons */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {!isFirstStep && (
                      <Button
                        onClick={handleBack}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 80, borderRadius: '10px', borderColor: '#DDE8F0', color: '#5A7184', '&:hover': { borderColor: '#C8D8E4', backgroundColor: '#F5F8FB' } }}
                      >
                        {cancelButtonText}
                      </Button>
                    )}
                    {onCancel && (
                      <Button
                        onClick={onCancel}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 80, borderRadius: '10px', borderColor: '#DDE8F0', color: '#5A7184', '&:hover': { borderColor: '#C8D8E4', backgroundColor: '#F5F8FB' } }}
                      >
                        Cancel
                      </Button>
                    )}
                    {isLastStep && isCurrentOptional && (
                      <Button
                        type="button"
                        onClick={() => void handleSkipAndSubmit(formik)}
                        variant="outlined"
                        size="small"
                        disabled={formik.isSubmitting || !lastStepSubmitArmed}
                        sx={{ minWidth: 110, borderRadius: '10px' }}
                      >
                        Skip & Register
                      </Button>
                    )}
                    <Button
                      type={isLastStep ? 'submit' : 'button'}
                      onClick={isLastStep ? undefined : () => void handleNext(formik)}
                      variant="contained"
                      size="small"
                      disabled={formik.isSubmitting || (isLastStep && !lastStepSubmitArmed)}
                      sx={{
                        minWidth: 110,
                        borderRadius: '10px',
                        fontWeight: 600,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
                        '&:hover': { boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.36)}` },
                      }}
                    >
                      {isLastStep ? submitButtonText : `Next Step →`}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ) : (
              /* ── Non-sticky footer ── */
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={1.4}
                justifyContent="flex-end"
                alignItems={{ xs: 'stretch', md: 'center' }}
                sx={{ pt: isModern ? 1.2 : 2 }}
              >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                  {!isFirstStep && (
                    <Button onClick={handleBack} variant="outlined" size="medium" sx={{ minWidth: 108 }}>
                      {cancelButtonText}
                    </Button>
                  )}
                  {onCancel && (
                    <Button onClick={onCancel} variant="outlined" size="medium" color="primary" sx={{ minWidth: 108 }}>
                      Cancel
                    </Button>
                  )}
                  {isLastStep && isCurrentOptional && (
                    <Button
                      type="button"
                      onClick={() => void handleSkipAndSubmit(formik)}
                      variant="outlined"
                      size="medium"
                      disabled={formik.isSubmitting || !lastStepSubmitArmed}
                      sx={{ minWidth: 150 }}
                    >
                      Skip & Register
                    </Button>
                  )}
                  <Button
                    type={isLastStep ? 'submit' : 'button'}
                    onClick={isLastStep ? undefined : () => void handleNext(formik)}
                    variant="contained"
                    size="medium"
                    disabled={formik.isSubmitting || (isLastStep && !lastStepSubmitArmed)}
                    sx={{
                      minWidth: 126,
                      px: 3,
                      ...(isModern ? { boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.3)}` } : {}),
                    }}
                  >
                    {isLastStep ? submitButtonText : 'Next'}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Box>
        </Form>
      )}
    </Formik>
  );
}
