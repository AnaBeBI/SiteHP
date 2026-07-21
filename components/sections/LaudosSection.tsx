'use client';

const LAUDOS = [
  { name: 'Atestado Médico',              icon: '📋', desc: 'Modelo de atestado médico',                        filename: 'Atestado_Medico.docx' },
  { name: 'Laudo de Dengue e Chikungunya', icon: '🦟', desc: 'Laudo para diagnóstico de Dengue e Chikungunya',  filename: 'Laudo_Dengue_e_Chilkungunya.docx' },
  { name: 'Laudo de Exame de Rotina',     icon: '🩺', desc: 'Modelo de laudo para exames de rotina',            filename: 'Laudo_Exame_de_Rotina__1_.docx' },
  { name: 'Laudo de Gravidez',            icon: '🤰', desc: 'Laudo de confirmação de gravidez',                 filename: 'Laudo_Gravidez.docx' },
  { name: 'Laudo de Hemograma Completo',  icon: '🩸', desc: 'Modelo de laudo para hemograma completo',          filename: 'Laudo_Hemograma_Completo.docx' },
  { name: 'Laudo de Teste de DNA',        icon: '🧬', desc: 'Laudo de resultado de teste de DNA',               filename: 'Laudo_Teste_de_DNA__1_.docx' },
  { name: 'Laudo Toxicológico',           icon: '🧪', desc: 'Laudo de exame toxicológico',                      filename: 'Laudo_Toxicologico.docx' },
  { name: 'Laudo de Urina',              icon: '🔬', desc: 'Modelo de laudo de urinálise',                      filename: 'Laudo_Urina.docx' },
];

export default function LaudosSection() {
  return (
    <div className="page">
      <div className="page-header">
        <h2>Modelos de Laudos 📄</h2>
        <p>Clique em baixar para obter o modelo em Word (.docx)</p>
      </div>
      <div className="card">
        <div className="laudos-grid">
          {LAUDOS.map((l) => (
            <div key={l.name} className="laudo-card">
              <div className="laudo-icon">{l.icon}</div>
              <div className="laudo-name">{l.name}</div>
              <div className="laudo-desc">{l.desc}</div>
              <a
                className="laudo-btn"
                href={`/laudos/${l.filename}`}
                download={l.filename}
              >
                ⬇️ Baixar .docx
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
