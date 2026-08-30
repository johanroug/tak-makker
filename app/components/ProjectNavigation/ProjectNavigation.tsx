import { getProjectNavigationTitle } from "@/lib/projects/project-navigation";
import type { ProjectWorkspace } from "@/schemas/project-store";
import styles from "./ProjectNavigation.module.scss";

type ProjectNavigationProps = {
  activeProjectId: string | null;
  projects: ProjectWorkspace[];
  disabled?: boolean;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
};

export default function ProjectNavigation({
  activeProjectId,
  projects,
  disabled = false,
  onSelectProject,
  onNewProject,
}: ProjectNavigationProps) {
  const activeProject = projects.find((project) => project.id === activeProjectId);
  const activeTitle = activeProject
    ? getProjectNavigationTitle(activeProject)
    : "Nyt projekt";

  function closeMenu(button: HTMLButtonElement) {
    button.closest("details")?.removeAttribute("open");
  }

  return (
    <details className={styles.navigation}>
      <summary className={styles.trigger} aria-label="Vælg projekt">
        <span className={styles.activeTitle}>{activeTitle}</span>
        <span aria-hidden="true" className={styles.chevron}>
          ⌄
        </span>
      </summary>

      <div className={styles.menu}>
        {projects.length > 0 && (
          <ul className={styles.projectList} aria-label="Projekter">
            {projects.map((project) => {
              const isActive = project.id === activeProjectId;

              return (
                <li key={project.id}>
                  <button
                    className={`${styles.projectButton} ${isActive ? styles.activeProject : ""}`}
                    type="button"
                    disabled={disabled}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(event) => {
                      onSelectProject(project.id);
                      closeMenu(event.currentTarget);
                    }}
                  >
                    <span>{getProjectNavigationTitle(project)}</span>
                    {isActive && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          className={styles.newProjectButton}
          type="button"
          disabled={disabled || activeProjectId === null}
          onClick={(event) => {
            onNewProject();
            closeMenu(event.currentTarget);
          }}
        >
          + Nyt projekt
        </button>
      </div>
    </details>
  );
}
