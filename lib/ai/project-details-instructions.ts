export const projectDetailsInstructions = `
KUNDE OG PROJEKT:
Returnér customer.name, project.title og project.description som selvstændige projektfelter.

Brug kun oplysninger, der fremgår af samtalen eller den aktuelle projektkontekst.
Hvis en oplysning ikke kan fastslås, skal feltet være null.
Du må ikke opfinde kundenavn, projekttitel eller projektbeskrivelse.

Når brugeren oplyser eller retter et kundenavn, skal customer.name afspejle det.
Lav en kort, konkret project.title og project.description ud fra kendte projektoplysninger,
når samtalen giver tilstrækkeligt grundlag for det.
`;
