import { ArrowRight, Database, Layers3, ShieldCheck } from "lucide-react";

const foundations = [
  {
    title: "Architecture isolée",
    description:
      "L’interface est séparée des fournisseurs de données et du format source.",
    icon: Layers3,
  },
  {
    title: "Connexion préparée",
    description:
      "PostgreSQL et Prisma sont configurés sans identifiants de production.",
    icon: Database,
  },
  {
    title: "Configuration validée",
    description:
      "Les paramètres serveur et publics sont contrôlés avant utilisation.",
    icon: ShieldCheck,
  },
] as const;

export default function FoundationPage() {
  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <section className="bg-navy-900 shadow-card relative overflow-hidden rounded-[1.75rem] px-6 py-10 text-white sm:px-9 sm:py-12 lg:px-12">
        <div
          className="bg-brand-400/20 absolute -top-16 right-0 h-64 w-64 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl">
          <p className="text-brand-100 mb-4 inline-flex rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase">
            Étape 2 · Modèle de données
          </p>
          <h1 className="max-w-2xl text-3xl leading-tight font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-5xl">
            Une base claire pour explorer les statistiques de l’ANSADE.
          </h1>
          <p className="text-navy-200 mt-5 max-w-2xl text-base leading-7 sm:text-lg">
            La structure et le modèle statistique interne sont prêts. Le
            catalogue et les données officielles seront ajoutés dans les étapes
            prévues, sans contenu statistique inventé.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="bg-brand-400 text-navy-900 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
              Modèle normalisé
              <ArrowRight aria-hidden="true" size={16} />
            </span>
            <span className="text-navy-300 text-sm">
              Aucune donnée statistique chargée
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="foundation-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-brand-700 text-xs font-semibold tracking-[0.14em] uppercase">
              Socle technique
            </p>
            <h2
              id="foundation-heading"
              className="text-navy-900 mt-1 text-xl font-semibold tracking-[-0.02em] sm:text-2xl"
            >
              Prêt pour les prochaines étapes
            </h2>
          </div>
          <p className="text-navy-500 hidden text-sm sm:block">
            Contenu structurel de démonstration
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {foundations.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-card border-navy-100 shadow-card border bg-white p-5 sm:p-6"
            >
              <span className="bg-brand-50 text-brand-700 flex size-11 items-center justify-center rounded-2xl">
                <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
              </span>
              <h3 className="text-navy-900 mt-5 text-base font-semibold">
                {title}
              </h3>
              <p className="text-navy-500 mt-2 text-sm leading-6">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <aside
        className="rounded-card border-sand-100 bg-sand-50 flex flex-col gap-3 border p-5 sm:flex-row sm:items-center sm:justify-between"
        aria-label="État des données"
      >
        <div>
          <p className="text-navy-900 font-semibold">
            Import en attente de source officielle
          </p>
          <p className="text-navy-600 mt-1 text-sm leading-6">
            Le modèle interne est prêt. L’adaptateur et l’import seront créés à
            l’étape 3.
          </p>
        </div>
        <span className="text-sand-500 w-fit rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-sm">
          Périmètre respecté
        </span>
      </aside>
    </div>
  );
}
