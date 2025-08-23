import React from "react";
import { useCollection } from "../contexts/CollectionContext";
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
  ModalTipsSection,
  ModalQuoteSection,
} from "./shared/ModalComponents";

export default function VillagerModal({ villager, isOpen, onClose }) {
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

  const modalId = `villager-modal-${getVillagerField(villager, "id")}`;
  const villagerName = getVillagerField(villager, "name");

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className="modal-content"
        id={modalId}
        role="document"
        aria-labelledby={`${modalId}-title`}
        aria-describedby={`${modalId}-description`}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={`Close ${villagerName} details modal. Press Escape key to close.`}
          title="Close (ESC)"
        >
          <i className="fas fa-times" aria-hidden="true"></i>
        </button>

        <ModalHeader
          villager={villager}
          onClose={onClose}
          variant="basic"
          modalId={modalId}
        />

        <main
          className="modal-body"
          id={`${modalId}-description`}
          aria-label={`Detailed information about ${villagerName}`}
        >
          <BasicInfoSection
            villager={villager}
            variant="basic"
            getPersonalityDescription={getPersonalityDescription}
            formatBirthday={formatBirthday}
          />

          <ModalQuoteSection villager={villager} />

          <ModalTipsSection villager={villager} />

          <CollectionButtons
            villager={villager}
            variant="basic"
            isInHaveList={isInHaveList}
            isInWantList={isInWantList}
            toggleHave={toggleHave}
            toggleWant={toggleWant}
          />
        </main>
      </div>
    </div>
  );
}
