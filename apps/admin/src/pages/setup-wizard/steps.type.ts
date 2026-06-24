export type SingleSetupStepProps = {
  setStep: (step: number) => void;
  skip: () => void;
  isPendingSkip: boolean;
  isPendingSave?: boolean;
};
