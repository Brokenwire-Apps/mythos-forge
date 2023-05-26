import { useEffect, useMemo, useState } from "react";
import { UpsertExplorationInput } from "graphql/requests/explorations.graphql";
import { saveAndUpdateExploration, uploadCoverImage } from "api/loadUserData";
import {
  GlobalExploration,
  GlobalLibrary,
  GlobalModal,
  GlobalUser,
  GlobalWorld,
  GlobalWorldInstanceKey,
  MODAL,
  clearGlobalModal,
  updateAsError
} from "state";
import { useGlobalWorld } from "hooks/GlobalWorld";
import { ErrorMessage } from "components/Common/Containers";
import { createExplorationTemplate } from "routes/ExplorationBuilder.Helpers";
import CreateExplorationForm from "components/Form.CreateExploration";
import Modal from "./Modal";
import { useGlobalModal } from "hooks/GlobalModal";

/** Modal props */
type ModalProps = {
  open: boolean;
  onClose?: () => void;
};

// Empty/default form data
const initialFormData = (): Partial<UpsertExplorationInput> => {
  const { exploration } = GlobalExploration.getState();
  const { id: authorId } = GlobalUser.getState();
  const { active } = GlobalModal.getState();
  const { focusedLocation, focusedWorld } = GlobalWorld.getState();
  const worldId = focusedWorld?.id;
  const locationId = focusedLocation?.id;
  const $form = {
    ...createExplorationTemplate(),
    authorId,
    locationId,
    worldId
  };

  if (active === MODAL.MANAGE_EXPLORATION && exploration) {
    $form.id = exploration.id;
    $form.config = exploration.config;
    $form.title = exploration.title;
    $form.description = exploration.description;
    $form.public = exploration.public;
    $form.worldId = exploration.worldId;
    $form.locationId = exploration.locationId || undefined;
    $form.image = exploration.image;
    $form.price = exploration.price;
    $form.usesAttributes = exploration.usesAttributes;
  }

  return $form;
};

const wKeys: GlobalWorldInstanceKey[] = ["focusedWorld", "focusedLocation"];

/** Specialized Modal for creating/editing a `Book` */
export default function ManageExplorationModal(props: ModalProps) {
  const { open, onClose = clearGlobalModal } = props;
  const [formData, setFormData] = useState(initialFormData());
  const { active } = useGlobalModal();
  const { focusedWorld, focusedLocation } = useGlobalWorld(wKeys);
  const editing = active === MODAL.MANAGE_EXPLORATION;
  const action = editing ? "Edit" : "Create";
  const locationName = useMemo(
    () => (focusedLocation || focusedWorld)?.name || "a mystery location",
    [focusedWorld, focusedLocation]
  );
  const [error, setError] = useState("");
  const [imgData, setImgData] = useState<File | undefined>(undefined);
  const err = (msg: string, noteId?: number) => {
    setError(msg);
    if (msg) updateAsError(msg, noteId);
  };
  const close = () => {
    GlobalLibrary.focusedBook(null);
    onClose();
  };
  const submit = async () => {
    // Validate
    if ((formData.title || "").length < 2)
      return err("Title must be at least 2 characters.");

    // Create
    if (!formData.description) {
      formData.description = `Explore ${locationName}.`;
    }
    err("");

    const d = { ...formData };
    if (imgData) d.image = await uploadCoverImage(imgData);
    const resp = await saveAndUpdateExploration(d);
    if (!resp) return err("Error saving data: please check your entries.");
    // exit
    close();
  };

  useEffect(() => {
    return () => {
      setFormData(initialFormData());
      setError("");
    };
  }, []);

  return (
    <Modal
      open={open}
      onClose={close}
      title={`${action} <b class="accent--text">Exploration</b>`}
      cancelText="Cancel"
      confirmText={editing ? "Update" : "Create"}
      onConfirm={submit}
    >
      <CreateExplorationForm
        data={formData}
        onChange={setFormData}
        onCoverImage={setImgData}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Modal>
  );
}
