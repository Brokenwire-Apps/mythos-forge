import { useState } from "react";
import CreateWorldForm from "components/Form.CreateWorld";
import { CreateWorldData, upsertWorld } from "graphql/requests/worlds.graphql";
import Modal from "./Modal";
import {
  addNotification,
  clearGlobalModal,
  updateAsError,
  updateNotification,
  updateWorlds
} from "state";
import { ErrorMessage } from "components/Common/Containers";
import { useGlobalWorld } from "hooks/GlobalWorld";
import { uploadCoverImage } from "api/loadUserData";

/** Modal props */
type ManageWorldModalProps = {
  open: boolean;
  data?: Partial<CreateWorldData> | null;
  onClose?: () => void;
};

// Empty/default form data
const emptyForm = (): Partial<CreateWorldData> => ({
  public: false
});

/** Specialized Modal for creating/editing a `World` */
export default function ManageWorldModal(props: ManageWorldModalProps) {
  const { open, onClose = clearGlobalModal } = props;
  const { focusedWorld: data } = useGlobalWorld(["focusedWorld"]);
  const [formData, setFormData] = useState(emptyForm());
  const [error, setLocalError] = useState("");
  const [imgData, setImgData] = useState<File | undefined | null>(undefined);
  const setError = (e: string, noteId?: number) => {
    setLocalError(e);
    updateAsError(e, noteId);
  };
  const submit = async () => {
    // Validate
    if (!formData.name) return setError("Name is required.");
    if (formData.name.length < 2)
      return setError("Name must be at least 2 characters.");
    if (!formData.type) return setError("Type is required.");

    // Create
    if (!formData.description) formData.description = "No description.";
    formData.public = formData.public || false;
    const d = { ...formData };
    if (imgData) d.image = await uploadCoverImage(imgData);
    setError("");
    updateNotification("Saving world...", 1, true);
    const resp = await upsertWorld(d);
    if (typeof resp === "string") return setError(resp, 1);

    // Notify
    if (resp) {
      updateNotification("World updated!", 1);
      updateWorlds([resp]);
      onClose();
    } else setError("Did not save world: please check your entries.", 1);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={data?.id ? "Edit World" : "Create World"}
      cancelText="Cancel"
      confirmText={data?.id ? "Update" : "Create"}
      onConfirm={submit}
    >
      <CreateWorldForm onChange={setFormData} onImageFile={setImgData} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Modal>
  );
}
