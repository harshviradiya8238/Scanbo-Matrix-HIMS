export const formatPatientLabel = (name?: string, mrn?: string) => {
  if (name && mrn) return `${name} · ${mrn}`;
  if (name) return name;
  if (mrn) return mrn;
  return undefined;
};
