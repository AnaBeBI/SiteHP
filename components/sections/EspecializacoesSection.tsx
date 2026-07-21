'use client';

import { useState } from 'react';

const SPECS = [
  { id: 'cirurgia', label: '🔪 Cirurgia Geral' },
  { id: 'clinico', label: '🩺 Clínico Geral' },
  { id: 'patologia', label: '🔬 Patologia' },
  { id: 'psiquiatria-esp', label: '🧠 Psiquiatria & Psicologia' },
  { id: 'ginecologia', label: '👶 Ginecologia' },
  { id: 'neurologia', label: '🧩 Neurologia' },
  { id: 'dermatologia', label: '🩸 Dermatologia' },
  { id: 'radiologia', label: '🔍 Radiologia' },
];

interface EspecItem {
  badge: string;
  subtitle: string;
  docLink: string;
  docLabel: string;
  previewSrc: string;
  extra?: Array<{ badge: string; subtitle: string; docLink: string; docLabel: string; previewSrc?: string }>;
}

const SPEC_DATA: Record<string, EspecItem> = {
  cirurgia: {
    badge: '🔪 Cirurgia Geral',
    subtitle: 'Manual de Cirurgia Geral - Procedimentos e técnicas cirúrgicas.',
    docLink: 'https://docs.google.com/document/d/1gkUpVg0ylDeUx4L7IN4hb9qAhDMynmu59eAg40DMc0g/edit?usp=sharing',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/1gkUpVg0ylDeUx4L7IN4hb9qAhDMynmu59eAg40DMc0g/preview',
  },
  clinico: {
    badge: '🩺 Clínico Geral',
    subtitle: 'Manual de Clínica Geral - Diagnóstico e tratamento clínico.',
    docLink: 'https://docs.google.com/document/d/16ThNuU740V1XLMXqW3sGVdmBJBodfQFWPW6Qn2ru6r4/edit?usp=sharing',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/16ThNuU740V1XLMXqW3sGVdmBJBodfQFWPW6Qn2ru6r4/preview',
  },
  patologia: {
    badge: '🔬 Patologia',
    subtitle: 'Manual de Patologia - Estudo das doenças e alterações teciduais.',
    docLink: 'https://docs.google.com/document/d/1Zf4yu9m9lLFMqyXymI0pRA7yQUF3DhJGkh6RNLs0FKQ/edit',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/1Zf4yu9m9lLFMqyXymI0pRA7yQUF3DhJGkh6RNLs0FKQ/preview',
  },
  neurologia: {
    badge: '📚 Material de Estudo',
    subtitle: 'Material complementar de neurologia.',
    docLink: 'https://docs.google.com/document/d/1XkrosQJn13fztyEQDAvaNHdMEpRRBlI7MRnkQcgPYc8/edit',
    docLabel: '📋 Abrir Material',
    previewSrc: 'https://docs.google.com/document/d/1XkrosQJn13fztyEQDAvaNHdMEpRRBlI7MRnkQcgPYc8/preview',
  },
  dermatologia: {
    badge: '🩸 Dermatologia',
    subtitle: 'Manual de Dermatologia - Doenças da pele.',
    docLink: 'https://docs.google.com/document/d/1i_LRMRa3XQZDNQLvQ1Ek_bqXZVkbbcZ4RzlPeh9xWBU/edit#heading=h.fp9njzd9n18g',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/1i_LRMRa3XQZDNQLvQ1Ek_bqXZVkbbcZ4RzlPeh9xWBU/preview',
  },
  radiologia: {
    badge: '🔍 Radiologia',
    subtitle: 'Manual de Radiologia - Técnicas e interpretação de imagens.',
    docLink: 'https://docs.google.com/document/d/1F3qt2wdeRVMELL_mq0Ng481VTFWOWbYLJWwpEIO10b8/edit',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/1F3qt2wdeRVMELL_mq0Ng481VTFWOWbYLJWwpEIO10b8/preview',
  },
  'psiquiatria-esp': {
    badge: '🧠 Ansiedade',
    subtitle: 'Apresentação sobre Transtorno de Ansiedade.',
    docLink: 'https://docs.google.com/presentation/d/1AyJvIoXm6ANU6GdBxR3l12pP1H6yXnNLorzAGTKs3lE/edit?usp=sharing',
    docLabel: '📊 Abrir Apresentação',
    previewSrc: '',
    extra: [
      {
        badge: '🧠 Psicologia no Geral',
        subtitle: 'Manual de Psicologia - Conceitos e aplicações na prática clínica.',
        docLink: 'https://docs.google.com/document/d/1zvHqBlIIfprBSzfKDgwrJdsEb7EVjEf4UiOjHU61iXc/edit',
        docLabel: '📋 Abrir Manual',
        previewSrc: 'https://docs.google.com/document/d/1zvHqBlIIfprBSzfKDgwrJdsEb7EVjEf4UiOjHU61iXc/preview',
      },
    ],
  },
  ginecologia: {
    badge: '👶 Obstetrícia',
    subtitle: 'Manual de Obstetrícia - Gravidez, parto e puerpério.',
    docLink: 'https://docs.google.com/document/d/14rD85CBKpDjEk4scOHMKEHAtI5qbKwudyMFI0TuekF4/edit',
    docLabel: '📋 Abrir Manual',
    previewSrc: 'https://docs.google.com/document/d/14rD85CBKpDjEk4scOHMKEHAtI5qbKwudyMFI0TuekF4/preview',
    extra: [
      {
        badge: '👩‍⚕️ Roteiro para Consultas',
        subtitle: 'Guia de conduta para consultas ginecológicas.',
        docLink: 'https://docs.google.com/document/d/1jYtE_5cIDrwJXM6vo6NJwzypfL5unmoPr9zNRPLlU04/edit',
        docLabel: '📋 Abrir Roteiro',
        previewSrc: 'https://docs.google.com/document/d/1jYtE_5cIDrwJXM6vo6NJwzypfL5unmoPr9zNRPLlU04/preview',
      },
      {
        badge: '📋 Manual de Conduta',
        subtitle: 'Manual de conduta para ginecologia.',
        docLink: 'https://docs.google.com/document/d/1sZI56ZyaZbgNsMtJGQz4AhGoBFKVXI_hBXIyc7kSxeY/edit',
        docLabel: '📋 Abrir Manual',
        previewSrc: 'https://docs.google.com/document/d/1sZI56ZyaZbgNsMtJGQz4AhGoBFKVXI_hBXIyc7kSxeY/preview',
      },
    ],
  },
};

function SpecCard({ item }: { item: { badge: string; subtitle: string; docLink: string; docLabel: string; previewSrc?: string } }) {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <span className="psiq-badge">{item.badge}</span>
      <p className="psiq-subtitle">{item.subtitle}</p>
      <div className="psiq-links" style={{ marginTop: 14 }}>
        <a href={item.docLink} target="_blank" rel="noopener noreferrer" className="psiq-link-btn primary">
          {item.docLabel}
        </a>
      </div>
      {item.previewSrc && (
        <iframe src={item.previewSrc} className="psiq-frame" allowFullScreen style={{ marginTop: 16 }} />
      )}
    </div>
  );
}

export default function EspecializacoesSection() {
  const [activeSpec, setActiveSpec] = useState('cirurgia');
  const data = SPEC_DATA[activeSpec];

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <h2>Especializações 🩺</h2>
        <p>Manuais e materiais de estudo por especialidade médica</p>
      </div>

      <div className="tab-bar spec-tab-bar">
        {SPECS.map((s) => (
          <button
            key={s.id}
            className={`tab-btn${activeSpec === s.id ? ' active' : ''}`}
            onClick={() => setActiveSpec(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {data && (
        <>
          <SpecCard item={data} />
          {data.extra?.map((e, i) => <SpecCard key={i} item={e} />)}
        </>
      )}
    </div>
  );
}
