import { FocusEventHandler, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { MatIcon } from "components/Common/MatIcon";
import { Paths } from "routes";
import { useGlobalModal } from "hooks/GlobalModal";
import { ExplorationSceneTemplate, UserRole } from "utils/types";
import {
  GlobalExploration,
  MODAL,
  addNotification,
  clearGlobalModal,
  convertTemplateToAPIScene,
  setGlobalExploration,
  setGlobalModal,
  updateAsError,
  updateNotification
} from "state";
import PageLayout from "components/Common/PageLayout";
import { useParams } from "react-router";
import { loadExploration, saveAndUpdateExploration } from "api/loadUserData";
import ModalDrawer from "components/Modals/ModalDrawer";
import { useGlobalUser } from "hooks/GlobalUser";
import useGlobalExploration from "hooks/GlobalExploration";
import {
  pruneExplorationSceneData,
  upsertExplorationScene
} from "graphql/requests/explorations.graphql";
import { RoundButton } from "components/Forms/Button";
import ExplorationScenesList from "components/List.ExplorationScenes";
import BuilderToolbar from "components/BuilderToolbar";
import BuilderCanvas from "components/BuilderCanvas";

const { Library } = Paths;
const SpanGrid = styled.span`
  align-items: center;
  display: grid;
  grid-column-gap: ${({ theme }) => theme.sizes.xs};
  grid-template-columns: 32px max-content 32px;
`;

/** ROUTE: List of worlds */
const ExplorationBuilderRoute = () => {
  const { active } = useGlobalModal();
  const { id: userId } = useGlobalUser(["id", "authenticated"]);
  const { exploration, explorationScene } = useGlobalExploration([
    "exploration",
    "explorationScene"
  ]);
  const { explorationId: urlId } = useParams<{ explorationId: string }>();
  const explorationId = urlId ? Number(urlId) : undefined;
  const [pageTitle, role, pageDescription] = useMemo(() => {
    const { title: scTitle, order: scOrder } = explorationScene || {};
    const desc = !explorationScene
      ? exploration?.description ||
        "Manage your <b>Exploration contents</b> here."
      : `${scOrder}. <b class="accent--text">${scTitle}</b>`.trim();
    return [
      exploration?.title || Paths.Explorations.Build.text,
      (exploration?.authorId === userId ? "Author" : "Reader") as UserRole,
      desc
    ];
  }, [exploration, explorationScene]);
  const [formData, setFormData] = useState<ExplorationSceneTemplate>();
  const [editorAutosave, setEditorAutosave] = useState(true);
  const err = (msg: string, noteId?: number) => {
    updateAsError(msg, noteId);
  };
  const saveExplorationScene = async () => {
    const { explorationScene, activeLayer: layer } =
      GlobalExploration.getState();
    if (!formData) return err("No data to save!");
    if (!explorationScene) return err("No scene is selected!");
    if (layer === "all") return err("No layer is selected!");

    err("");
    const updatedScene = { ...explorationScene, ...formData };
    const noteId = addNotification("Saving Scene...");
    const forAPI = convertTemplateToAPIScene(updatedScene);
    const resp = await upsertExplorationScene(
      pruneExplorationSceneData(forAPI)
    );
    if (typeof resp === "string") return err(resp as any, noteId);
    const e = `Scene not saved: please check your entries.`;
    if (!resp) return err(e, noteId);

    // Notify
    updateNotification("Scene saved!", noteId);
    setGlobalExploration(resp);
  };
  const onEditTitle: FocusEventHandler<HTMLSpanElement> = async (e) => {
    if (!exploration) return;
    const newTitle = e.target.innerText;
    if (newTitle === exploration.title) return;
    const update = { ...exploration, title: newTitle };
    await saveAndUpdateExploration(update);
  };
  const toggleAutoSave = () => setEditorAutosave(!editorAutosave);
  const loadComponentData = async () => {
    if (explorationId) {
      const res = await loadExploration({ explorationId });
      const { explorationScene: nsc } = res;
      if (!nsc) setGlobalModal(MODAL.SELECT_EXPLORATION_SCENE);
    } else setGlobalModal(MODAL.SELECT_EXPLORATION_SCENE);
  };
  const clearComponentData = () => {
    clearGlobalModal();
    GlobalExploration.multiple({
      activeSlotIndex: -1,
      exploration: null,
      explorationScene: null,
      activeLayer: "all"
    });
  };

  useEffect(() => {
    loadComponentData();
    return clearComponentData;
  }, []);

  return (
    <PageLayout
      title={
        <SpanGrid>
          <RoundButton
            variant="transparent"
            size="md"
            onClick={() => setGlobalModal(MODAL.MANAGE_EXPLORATION)}
          >
            <MatIcon className="success--text" icon="settings" />
          </RoundButton>

          <span
            // Editable title
            onBlur={onEditTitle}
            contentEditable
            suppressContentEditableWarning
          >
            {pageTitle}
          </span>
        </SpanGrid>
      }
      breadcrumbs={[Library.Index, Library.BookEditor]}
      id="books-list"
      description={pageDescription}
    >
      <section className="fill">
        <BuilderToolbar
          explorationId={explorationId}
          role={role}
          handleSave={saveExplorationScene}
          saveOnBlur={editorAutosave}
          toggleAutoSave={toggleAutoSave}
        />

        <BuilderCanvas onChange={setFormData} />
      </section>

      <ModalDrawer
        title={`Build <b class="accent--text">Exploration</b>`}
        openTowards="right"
        open={active === MODAL.SELECT_EXPLORATION_SCENE}
        onClose={clearGlobalModal}
      >
        <ExplorationScenesList
          exploration={exploration}
          explorationScene={explorationScene}
        />
      </ModalDrawer>
    </PageLayout>
  );
};

export default ExplorationBuilderRoute;