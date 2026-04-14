import React from "react";
import { CommonDialog } from "@/src/ui/components/molecules";
import CommonMedicationForm, { type MedicationForm } from "@/src/ui/components/forms/CommonMedicationForm";
export type { MedicationForm };

interface AddDischargeMedicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (medication: MedicationForm) => void;
}

export default function AddDischargeMedicationModal({
    isOpen,
    onClose,
    onSave,
}: AddDischargeMedicationModalProps) {
    const formRef = React.useRef<any>(null);

    const handleSave = () => {
        if (formRef.current) {
            formRef.current.submit();
        }
    };

    return (
        <CommonDialog
            open={isOpen}
            onClose={onClose}
            title="+ Add discharge medication"
            onConfirm={handleSave}
            confirmLabel="Save medication"
            fullWidth
            maxWidth="sm"
            contentDividers
        >
            <CommonMedicationForm
                onSave={(data) => {
                    onSave(data);
                    onClose();
                }}
                onCancel={onClose}
            />
        </CommonDialog>
    );
}

// Note: I will update CommonMedicationForm to support a ref-based submission if needed, 
// but for now, I'll pass handleSave logic inside the component or use an external trigger.
// Actually, let's keep it simple: the Dialog footer's onConfirm should trigger the form save.
// I'll modify CommonMedicationForm to accept a logic for external trigger.