'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { getLaudoTemplate } from '@/lib/queries';

const TABS = [
  { id: 'limpeza', label: '🧹 Limpeza de Ficha' },
  { id: 'arma', label: '🔫 Porte de Arma de Caça' },
  { id: 'gerador', label: '📝 Gerar Laudo' },
];

interface LaudoData {
  nome: string; pass: string; idade: string; tel: string;
  tipo: string; resultado: string;
  medico: string; crm: string; cargo: string;
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function LaudoPreview({ data, texto }: { data: LaudoData; texto: string }) {
  const isApto = data.resultado === 'apto';
  const tipoLabel = data.tipo === 'porte-caca' ? 'Porte de Arma de Caça' : 'Limpeza de Ficha';

  return (
    <div className="lp-wrap" id="laudo-preview-content">
      <div className="lp-head">
        <div className="lp-logo">
          <Image src="/logo.png" alt="Logo" width={64} height={64} style={{ objectFit: 'contain' }} />
        </div>
        <div className="lp-titulo">Laudo Psicológico</div>
        <div className="lp-hospital">Hospital Memorial Andrea Silva</div>
      </div>

      <div className="lp-sec">
        <div className="lp-sec-title">Dados do Paciente</div>
        <div className="lp-grid">
          <div className="lp-data"><b>Nome:</b> {data.nome}</div>
          <div className="lp-data"><b>Passaporte:</b> {data.pass}</div>
          <div className="lp-data"><b>Idade:</b> {data.idade} anos</div>
          <div className="lp-data"><b>Telefone:</b> {data.tel}</div>
        </div>
      </div>

      <div className="lp-sec">
        <div className="lp-sec-title">Tipo de Avaliação</div>
        <div className="lp-data"><b>Finalidade:</b> {tipoLabel}</div>
      </div>

      <div className="lp-sec">
        <div className="lp-sec-title">Parecer Técnico</div>
        <div className="lp-body">
          {texto.split('\n').map((p, i) => p ? <p key={i}>{p}</p> : <br key={i} />)}
        </div>
      </div>

      <div className="lp-result">
        <span className={`lp-badge ${isApto ? 'lp-apto' : 'lp-inapto'}`}>
          {isApto ? 'APTO' : 'INAPTO'}
        </span>
      </div>

      <div className="lp-assin">
        <div className="lp-assin-card">
          <div className="lp-assin-nome">{data.medico}</div>
          <div className="lp-assin-cargo">{data.cargo}</div>
          <div className="lp-assin-doc">CRM: {data.crm}</div>
        </div>
      </div>

      <div className="lp-data-emissao">Emitido em {formatDate()} — Hospital Memorial Andrea Silva</div>
    </div>
  );
}

function GeradorLaudo() {
  const [form, setForm] = useState({ nome: '', pass: '', idade: '', tel: '', medico: '', crm: '', cargo: '' });
  const [tipo, setTipo] = useState('');
  const [resultado, setResultado] = useState('');
  const [preview, setPreview] = useState(false);
  const [textoLaudo, setTextoLaudo] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  function validate() {
    const errs: string[] = [];
    if (!form.nome.trim()) errs.push('Nome do paciente obrigatório');
    if (!form.pass.trim()) errs.push('Passaporte do paciente obrigatório');
    if (!form.idade) errs.push('Idade obrigatória');
    if (!form.tel.trim()) errs.push('Telefone obrigatório');
    if (!tipo) errs.push('Tipo de laudo obrigatório');
    if (!resultado) errs.push('Resultado obrigatório');
    if (!form.medico.trim()) errs.push('Nome do médico obrigatório');
    if (!form.crm.trim()) errs.push('CRM obrigatório');
    if (!form.cargo.trim()) errs.push('Cargo obrigatório');
    return errs;
  }

  async function handlePreview() {
    const errs = validate();
    setErrors(errs);
    setSuccess('');
    if (errs.length === 0) {
      const texto = await getLaudoTemplate(tipo, resultado);
      setTextoLaudo(texto);
      setPreview(true);
    }
  }

  async function handleCapture() {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Laudo_${form.nome.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSuccess('Laudo exportado com sucesso!');
    } catch {
      setErrors(['Erro ao exportar. Tente novamente.']);
    }
  }

  const field = (id: keyof typeof form, label: string, placeholder?: string, type = 'text') => (
    <div className="gen-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="gen-header">
        <div className="gen-header-logo">
          <Image src="/logo.png" alt="Logo" width={44} height={44} style={{ objectFit: 'contain' }} />
        </div>
        <div>
          <div className="gen-header-title">Gerador de Laudos</div>
          <div className="gen-header-sub">Hospital Memorial Andrea Silva</div>
        </div>
      </div>
      <div className="gen-body">
        {errors.length > 0 && (
          <div className="gen-msg gen-error">{errors.map((e) => <div key={e}>• {e}</div>)}</div>
        )}
        {success && <div className="gen-msg gen-success">{success}</div>}

        <div className="gen-section">
          <div className="gen-section-title">Dados do Paciente</div>
          <div className="gen-grid">
            {field('nome', 'Nome Completo', 'Nome do paciente')}
            {field('pass', 'Passaporte', 'Ex: 123456')}
            {field('idade', 'Idade', 'Ex: 28', 'number')}
            {field('tel', 'Telefone', 'Ex: (11) 99999-0000')}
          </div>
        </div>

        <div className="gen-section">
          <div className="gen-section-title">Tipo de Laudo</div>
          <div className="gen-radio-group">
            <label className="gen-radio-label">
              <input type="radio" name="tipo" value="limpeza-ficha" checked={tipo === 'limpeza-ficha'} onChange={() => setTipo('limpeza-ficha')} />
              Limpeza de Ficha
            </label>
            <label className="gen-radio-label">
              <input type="radio" name="tipo" value="porte-caca" checked={tipo === 'porte-caca'} onChange={() => setTipo('porte-caca')} />
              Porte de Arma de Caça
            </label>
          </div>
        </div>

        <div className="gen-section">
          <div className="gen-section-title">Resultado</div>
          <div className="gen-radio-group">
            <label className="gen-radio-label">
              <input type="radio" name="resultado" value="apto" checked={resultado === 'apto'} onChange={() => setResultado('apto')} />
              ✅ Apto
            </label>
            <label className="gen-radio-label">
              <input type="radio" name="resultado" value="inapto" checked={resultado === 'inapto'} onChange={() => setResultado('inapto')} />
              ❌ Inapto
            </label>
          </div>
        </div>

        <div className="gen-section">
          <div className="gen-section-title">Dados do Profissional</div>
          <div className="gen-grid">
            {field('medico', 'Nome do Médico/Psicólogo', 'Nome completo')}
            {field('crm', 'CRM / CRP', 'Número do registro')}
            {field('cargo', 'Cargo', 'Ex: Psiquiatra')}
          </div>
        </div>

        <div className="gen-actions">
          {preview && (
            <button className="gen-btn success" onClick={handleCapture}>📸 Exportar PNG</button>
          )}
          <button className="gen-btn primary" onClick={handlePreview}>👁 Visualizar Laudo</button>
        </div>

        {preview && (
          <div style={{ marginTop: 24 }}>
            <div className="gen-preview-title">Pré-visualização do Laudo</div>
            <div ref={previewRef}>
              <LaudoPreview data={{ ...form, tipo, resultado }} texto={textoLaudo} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PsiquiatriaSection() {
  const [activeTab, setActiveTab] = useState('limpeza');

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      <div className="page-header">
        <h2>Psiquiatria 🧠</h2>
        <p>Consultas, laudos e gerador de documentos</p>
      </div>

      <div className="tab-bar psiq-tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'limpeza' && (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <span className="psiq-badge">🧹 Psicotécnico — Limpeza de Ficha</span>
            <p className="psiq-subtitle">Avaliação psicotécnica para limpeza de ficha criminal/antecedentes.</p>
            <div className="psiq-links" style={{ marginTop: 14 }}>
              <a href="https://docs.google.com/document/d/1MhQUX-X9NLZSWj2d87FPnTU_t78gWJ9D1ZpjCnn59Co/edit?tab=t.0" target="_blank" rel="noopener noreferrer" className="psiq-link-btn primary">📋 Abrir Consulta</a>
              <a href="https://www.canva.com/design/DAGqev80x1c/eWAXh_rSRe3CtqmBbRRoJQ/edit?utm_content=DAGqev80x1c&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank" rel="noopener noreferrer" className="psiq-link-btn secondary">🎨 Modelo de Laudo (Canva)</a>
            </div>
          </div>
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Prévia — Consulta</p>
            <iframe src="https://docs.google.com/document/d/1MhQUX-X9NLZSWj2d87FPnTU_t78gWJ9D1ZpjCnn59Co/preview" className="psiq-frame" allowFullScreen />
          </div>
        </>
      )}

      {activeTab === 'arma' && (
        <>
          <div className="card" style={{ marginBottom: 14 }}>
            <span className="psiq-badge arma">🔫 Psicotécnico — Porte de Arma de Caça</span>
            <p className="psiq-subtitle">Avaliação psicotécnica para licença de porte de arma de caça.</p>
            <div className="psiq-links" style={{ marginTop: 14 }}>
              <a href="https://docs.google.com/document/d/1m96H8Qd8BkTWWIXUrCNVTiOBoTFkE6Pf9izKEmlVZjI/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="psiq-link-btn primary">📋 Abrir Consulta</a>
            </div>
          </div>
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>Prévia — Consulta</p>
            <iframe src="https://docs.google.com/document/d/1m96H8Qd8BkTWWIXUrCNVTiOBoTFkE6Pf9izKEmlVZjI/preview" className="psiq-frame" allowFullScreen />
          </div>
        </>
      )}

      {activeTab === 'gerador' && <GeradorLaudo />}
    </div>
  );
}
