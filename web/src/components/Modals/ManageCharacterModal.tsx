import CreateCharacterForm from "components/Form.CreateCharacter";
import {
  CreateCharacterData,
  upsertCharacter
} from "graphql/requests/characters.graphql";
import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  addNotification,
  clearGlobalModal,
  updateAsError,
  updateCharacters,
  updateNotification
} from "state";
import { ErrorMessage } from "components/Common/Containers";
import { useGlobalCharacter } from "hooks/GlobalCharacter";
import { uploadCoverImage } from "api/loadUserData";

/** Modal props */
type ManageCharacterModalProps = {
  open: boolean;
  data?: Partial<CreateCharacterData> | null;
  onClose?: () => void;
};

/** Specialized Modal for creating/editing a `Character` */
export default function ManageCharacterModal(props: ManageCharacterModalProps) {
  const { open, onClose = clearGlobalModal } = props;
  const { focusedCharacter: data } = useGlobalCharacter(["focusedCharacter"]);
  const [formData, setFormData] = useState<Partial<CreateCharacterData>>({});
  const [error, setError] = useState("");
  const [imgData, setImgData] = useState<File | undefined | null>(undefined);
  const showError = (msg: string, noteId = -1) => {
    setError(msg);
    updateAsError(msg, noteId);
  };
  const submit = async () => {
    // Validate
    if (!formData.name) return showError("Name is required.");
    if (formData.name.length < 2)
      return showError("Name must be at least 2 characters.");

    // Create
    setError("");
    if (!formData.description) formData.description = "No description.";
    const d = { ...formData };
    if (imgData) d.image = await uploadCoverImage(imgData);

    updateNotification("Saving character...", 1, true);
    const resp = await upsertCharacter(d);
    if (typeof resp === "string") return setError(resp);
    else if (resp) {
      // Notify
      updateNotification("Character saved!", 1);
      updateCharacters([resp]);
      onClose();
    } else {
      const e = "Did not create character: please check your entries.";
      showError(e, 1);
    }
  };

  useEffect(() => {
    return () => {
      setFormData({});
      setError("");
    };
  }, [open]);

  return (
    <Modal
      open={open}
      title={`${
        data?.id ? "Edit" : "New"
      } <b class="accent--text">Character</b>`}
      cancelText="Cancel"
      confirmText={data?.id ? "Update" : "Create"}
      onClose={onClose}
      onConfirm={submit}
    >
      {open && (
        <CreateCharacterForm onChange={setFormData} onImageFile={setImgData} />
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Modal>
  );
}
