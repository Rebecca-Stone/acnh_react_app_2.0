import React from "react";
import { useCollection } from "../contexts/CollectionContext";
import LazyImage from "./LazyImage";
import { useFocusTrap } from "../hooks/useKeyboardNavigation";
import {
  useModalBehavior,
  usePersonalityDescription,
  useBirthdayFormatter,
} from "../hooks/useModalBehavior";
import { getVillagerField } from "../utils/villagerDataAccessor";
import {
  ModalHeader,
  CollectionButtons,
  BasicInfoSection,
  EnhancedFeaturesSection,
} from "./shared/ModalComponents";

export default function EnhancedVillagerModal({ villager, isOpen, onClose }) {
  const { isInHaveList, isInWantList, toggleHave, toggleWant } =
    useCollection();

  // Use shared modal behavior
  const { modalRef, handleBackdropClick } = useModalBehavior(
    isOpen,
    onClose,
    villager
  );
  const { getPersonalityDescription } = usePersonalityDescription();
  const { formatBirthday } = useBirthdayFormatter();

  // Manage focus trap in modal
  useFocusTrap(isOpen, modalRef);

  if (!isOpen || !villager) return null;

  const modalId = `enhanced-villager-modal-${getVillagerField(villager, "id")}`;
  const villagerName = getVillagerField(villager, "name");

  return (
    <div
      className="modal-backdrop enhanced-modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${modalId}-title`}
      aria-describedby={`${modalId}-content`}
    >
      <div
        ref={modalRef}
        className="modal-content enhanced-modal-content"
        role="document"
      >
        <ModalHeader
          villager={villager}
          onClose={onClose}
          variant="enhanced"
          modalId={modalId}
        />

        <div id={`${modalId}-content`} className="enhanced-modal-body">
          <div className="enhanced-villager-image-section">
            <LazyImage
              src={getVillagerField(villager, "imageUrl")}
              alt={`${villagerName} - ${getVillagerField(
                villager,
                "species"
              )} villager`}
              className="enhanced-villager-image"
            />
          </div>

          <div className="enhanced-villager-info">
            <BasicInfoSection
              villager={villager}
              variant="enhanced"
              getPersonalityDescription={getPersonalityDescription}
              formatBirthday={formatBirthday}
            />

            <EnhancedFeaturesSection villager={villager} />
          </div>
        </div>

        <footer className="enhanced-modal-footer">
          <CollectionButtons
            villager={villager}
            variant="enhanced"
            isInHaveList={isInHaveList}
            isInWantList={isInWantList}
            toggleHave={toggleHave}
            toggleWant={toggleWant}
          />
        </footer>
      </div>
    </div>
  );
}
