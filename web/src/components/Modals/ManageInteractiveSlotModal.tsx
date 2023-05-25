import { Suspense, lazy, useMemo, useState } from "react";
import {
  MODAL,
  GlobalModal,
  GlobalUser,
  addNotification,
  clearGlobalModal,
  convertTemplateToAPIScene,
  setGlobalExploration,
  updateAsError,
  updateNotification
} from "state";
import { ErrorMessage } from "components/Common/Containers";
import useGlobalExploration from "hooks/GlobalExploration";
import { InteractiveSlot } from "utils/types";
import ModalDrawer from "./ModalDrawer";
import { uploadFileToServer } from "api/loadUserData";
import {
  pruneExplorationSceneData,
  upsertExplorationScene
} from "graphql/requests/explorations.graphql";
import { ButtonWithIcon } from "components/Forms/Button";
import { Form } from "components/Forms/Form";
import { suppressEvent } from "utils";

/** Modal props */
type ManageInteractiveSlotModalProps = {
  open: boolean;
  onClose?: () => void;
};

const CreateInteractiveSlotForm = lazy(
  () => import("components/Form.CreateInteractiveSlot")
);
/** @modal Create/edit an `Interactive Slot` in a scene */
export default function ManageInteractiveSlotModal(
  props: ManageInteractiveSlotModalProps
) {
  const { open, onClose = clearGlobalModal } = props;
  const { active } = GlobalModal.getState();
  const editing = active === MODAL.MANAGE_INTERACTIVE_SLOT;
  const action = editing ? "Manage" : "Create";
  const {
    activeLayer: layer = "all",
    explorationScene,
    activeSlotIndex = -1
  } = useGlobalExploration([
    "activeLayer",
    "explorationScene",
    "activeSlotIndex"
  ]);
  const activeSlots = useMemo<InteractiveSlot[]>(() => {
    if (!explorationScene) return [];
    return layer === "all" ? [] : explorationScene[layer];
  }, [layer]);
  const activeSlot = useMemo(() => {
    if (!activeSlots.length) return undefined;
    return activeSlots[activeSlotIndex] || undefined;
  }, [activeSlotIndex, activeSlots]);
  const name = useMemo(() => activeSlot?.name || `${layer} slot`, [activeSlot]);
  const [slotImage, setSlotImage] = useState<File>();
  const [formData, setFormData] = useState<InteractiveSlot>();
  const [error, setError] = useState("");
  const err = (msg: string, noteId?: number) => {
    setError(msg);
    if (noteId) updateAsError(msg, noteId);
  };
  // Upload sprite image
  const uploadSprite = async (noteId: number) => {
    const { id: userId } = GlobalUser.getState();
    if (!userId || userId === -1 || !slotImage) return "";
    const imageRes = await uploadFileToServer(slotImage, "worlds");
    if (typeof imageRes === "string") {
      updateAsError(imageRes, noteId);
    } else if (imageRes?.fileURL) {
      updateNotification("Slot image uploaded!", noteId);
      return imageRes.fileURL;
    }

    updateAsError("Image upload failed", noteId);
    return "";
  };
  // Remove a slot from the scene
  const deleteSlot = async () => {
    if (!editing || !activeSlot || activeSlotIndex < -1) return;
    const newSlots = activeSlots.filter((_, i) => i !== activeSlotIndex);
    return sendToAPI(newSlots);
  };

  // Save the entire `Exploration Scene`
  const submit = async () => {
    if (!explorationScene) return err("No scene is selected!");
    if (layer === "all") return err("No layer is selected!");
    if (!formData) return err("No data to submit.");
    const slotIndex = editing ? activeSlotIndex : formData.index!;

    err("");
    const newSlots = [...activeSlots];
    let noteId = 0;
    const slot = { ...activeSlot?.interaction, ...formData };
    if (slotImage) {
      noteId = addNotification("Uploading Slot image...", true);
      slot.url = await uploadSprite(noteId);
    }
    newSlots[slotIndex] = slot;
    return sendToAPI(newSlots);
  };

  const sendToAPI = async (slots: InteractiveSlot[]) => {
    if (!explorationScene) return err("No scene is selected!");
    const newScene = { ...explorationScene, [layer]: slots };
    updateNotification("Saving Scene...", 1);
    const forAPI = convertTemplateToAPIScene(newScene);
    const resp = await upsertExplorationScene(
      pruneExplorationSceneData(forAPI)
    );
    if (typeof resp === "string") return err(resp as any, 1);
    const e = `Scene not saved: please check your entries.`;
    if (!resp) return err(e, 1);

    // Notify
    updateNotification("Scene saved!", 1);
    setGlobalExploration(resp);
    onClose();
  };

  return (
    <ModalDrawer
      open={open}
      openTowards="right"
      onClose={onClose}
      title={`${action} <b class="accent--text">${name}</b>`}
      cancelText="Cancel"
      confirmText={"Confirm"}
      onConfirm={submit}
    >
      <Suspense fallback={<p>Loading form...</p>}>
        <CreateInteractiveSlotForm
          onChange={setFormData}
          onSlotImageFile={setSlotImage}
        />
      </Suspense>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {editing && (
        <Form onSubmit={suppressEvent}>
          <ButtonWithIcon
            type="button"
            text="Delete Slot"
            variant="outlined"
            size="lg"
            icon="delete"
            onClick={deleteSlot}
            className="error--text"
          />
        </Form>
      )}
    </ModalDrawer>
  );
}
