import { FocusEventHandler, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { MatIcon } from "components/Common/MatIcon";
import { Paths } from "routes";
import { useGlobalModal } from "hooks/GlobalModal";
import { ExplorationSceneTemplate, UserRole } from "utils/types";
import {
  GlobalExploration,
  MODAL,
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
import SceneBuilderHelp from "components/SceneBuilderHelp";
import { PixiCanvas } from "components/PixiCanvas";

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
  const modalActive = useMemo(() => {
    const { SELECT_EXPLORATION_SCENE, EXPLORATION_BUILDER_HELP } = MODAL;
    return [SELECT_EXPLORATION_SCENE, EXPLORATION_BUILDER_HELP].includes(
      active
    );
  }, [active]);
  const [formData, setFormData] = useState<ExplorationSceneTemplate>();
  const [editorAutosave, setEditorAutosave] = useState(true);
  const err = (msg: string, noteId?: number) => updateAsError(msg, noteId);
  const saveExplorationScene = async (sceneData?: ExplorationSceneTemplate) => {
    const { explorationScene } = GlobalExploration.getState();
    if (!sceneData) return err("No data to save!");
    if (!explorationScene) return err("No scene is selected!");

    err("");
    const updatedScene = { ...explorationScene, ...sceneData };
    updateNotification("Saving Scene...", 1, true);
    const forAPI = convertTemplateToAPIScene(updatedScene);
    const resp = await upsertExplorationScene(
      pruneExplorationSceneData(forAPI)
    );
    if (typeof resp === "string") return err(resp as string, 1);
    const e = `Scene not saved: please check your entries.`;
    if (!resp) return err(e, 1);

    // Notify
    updateNotification("Scene saved!", 1);
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
  const updateAndMaybeSave = (data: ExplorationSceneTemplate) => {
    setFormData(data);
    if (editorAutosave) saveExplorationScene(data);
  };
  const loadComponentData = async () => {
    if (explorationId) {
      const res = await loadExploration({ explorationId, userId });
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
          handleSave={() => saveExplorationScene(formData)}
          saveOnBlur={editorAutosave}
          toggleAutoSave={toggleAutoSave}
        />

        {explorationScene && (
          <PixiCanvas editing onChange={updateAndMaybeSave} />
        )}
      </section>

      <ModalDrawer
        title={`Build <b class="accent--text">Exploration</b>`}
        openTowards="right"
        open={modalActive}
        onClose={clearGlobalModal}
      >
        {active === MODAL.SELECT_EXPLORATION_SCENE && (
          <ExplorationScenesList
            exploration={exploration}
            explorationScene={explorationScene}
          />
        )}
        {active === MODAL.EXPLORATION_BUILDER_HELP && <SceneBuilderHelp />}
      </ModalDrawer>
    </PageLayout>
  );
};

export default ExplorationBuilderRoute;
