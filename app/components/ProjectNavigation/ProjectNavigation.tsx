"use client";

import { useState } from "react";
import {
  filterProjectsForNavigation,
  getProjectNavigationLabel,
  groupProjectsForNavigation,
} from "@/lib/projects/project-navigation";
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
  const [searchTerm, setSearchTerm] = useState("");
  const activeProject = projects.find((project) => project.id === activeProjectId);
  const activeTitle = activeProject
    ? getProjectNavigationLabel(activeProject)
    : "Nyt projekt";
  const matchingProjects = filterProjectsForNavigation(projects, searchTerm);
  const groupedProjects = groupProjectsForNavigation(projects);
  const isSearching = searchTerm.trim().length > 0;

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
        <label className={styles.searchLabel}>
          <span className="sr-only">Søg projekter</span>
          <input
            className={styles.searchInput}
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Søg projekt, kunde, adresse eller projektnr."
          />
        </label>

        {isSearching && matchingProjects.length > 0 && (
          <ul className={styles.projectList} aria-label="Projekter">
            {matchingProjects.map((project) => {
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
                    <span className={styles.searchResultText}>
                      <span>{getProjectNavigationLabel(project)}</span>
                      <small>
                        {[project.draft.customer.name, project.draft.customer.address]
                          .filter(Boolean)
                          .join(" · ") || "Kunde og adresse ikke angivet"}
                      </small>
                    </span>
                    {isActive && <span aria-hidden="true">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {isSearching && matchingProjects.length === 0 && (
          <p className={styles.emptyResults}>Ingen projekter fundet</p>
        )}

        {!isSearching && projects.length > 0 && (
          <div className={styles.groupedList} aria-label="Projekter">
            {groupedProjects.map((yearGroup) => (
              <section key={yearGroup.year}>
                <h2 className={styles.yearHeading}>{yearGroup.year}</h2>
                {yearGroup.months.map((monthGroup) => (
                  <div key={monthGroup.key} className={styles.monthGroup}>
                    <h3 className={styles.monthHeading}>{monthGroup.label}</h3>
                    <ul className={styles.projectList}>
                      {monthGroup.projects.map((project) => {
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
                              <span>{getProjectNavigationLabel(project)}</span>
                              {isActive && <span aria-hidden="true">✓</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
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
