const PROJECT_NUMBER_PATTERN = /^(\d{4})-(\d{4})$/;

export function getProjectCreationYear(createdAt: string) {
  const yearPart = new Intl.DateTimeFormat("en", {
    year: "numeric",
    timeZone: "Europe/Copenhagen",
  })
    .formatToParts(new Date(createdAt))
    .find((part) => part.type === "year");

  return Number(yearPart?.value);
}

export function allocateProjectNumber(
  createdAt: string,
  projects: ReadonlyArray<{ projectNumber?: string }>,
) {
  const year = getProjectCreationYear(createdAt);
  const highestSequence = projects.reduce((highest, project) => {
    if (project.projectNumber === undefined) return highest;

    const match = PROJECT_NUMBER_PATTERN.exec(project.projectNumber);

    if (match === null || Number(match[1]) !== year) {
      return highest;
    }

    return Math.max(highest, Number(match[2]));
  }, 0);

  return `${year}-${String(highestSequence + 1).padStart(4, "0")}`;
}
