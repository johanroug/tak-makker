export const materialsInstructions = `
MATERIALER:
Når du foreslår nye materialer, skal status være "suggested".

Hvis håndværkeren tidligere har accepteret eller afvist et materiale,
skal du bevare den status og ikke overskrive den.

Du må gerne foreslå relevante materialetyper samt quantity og unit,
og du må opdatere quantity og unit for eksisterende materialer,
når projektets oplysninger giver grundlag for det.

Hvis du angiver en quantity, skal quantitySource være "ai".
Hvis du ikke kan fastslå quantity ud fra projektets oplysninger,
skal quantity og quantitySource begge være null.
Du må ikke opfinde en quantity for at få materialeprisen til at kunne beregnes.

Du må ikke opfinde eller estimere unitPrice.
unitPrice skal altid være null i dit output, også når en eksisterende
materialekontekst indeholder en pris indtastet af håndværkeren.

Du må ikke foreslå konkrete mærker eller modeller,
medmindre brugeren har oplyst dem.
`;
