'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface CertData {
  nome: string; pass: string; curso: string;
  medico: string; crm: string; cargo: string;
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function CertPreview({ data }: { data: CertData }) {
  return (
    <div className="cert-wrap" id="cert-preview-content">
      <div className="cert-head">
        <div className="cert-logo">
          <Image src="/logo.png" alt="Logo" width={80} height={80} style={{ objectFit: 'contain' }} />
        </div>
        <div className="cert-titulo">Certificado de Conclusão</div>
        <div className="cert-hospital">Hospital Memorial Andrea Silva</div>
      </div>

      <div className="cert-body">
        <div className="cert-texto">Certificamos que</div>
        <div className="cert-nome">{data.nome}</div>
        <div className="cert-texto">Passaporte: {data.pass}</div>
        <div className="cert-texto">concluiu com êxito o curso de</div>
        <div className="cert-curso">{data.curso}</div>
        <div className="cert-texto">realizado no Hospital Memorial Andrea Silva.</div>
      </div>

      <div className="cert-assin">
        <div className="cert-assin-card">
          <div className="cert-assin-nome">{data.medico}</div>
          <div className="cert-assin-cargo">{data.cargo}</div>
          <div className="cert-assin-doc">CRM/CRP: {data.crm}</div>
        </div>
      </div>

      <div className="cert-data-emissao">Emitido em {formatDate()} — Hospital Memorial Andrea Silva</div>
    </div>
  );
}

export default function CertificadosSection() {
  const [form, setForm] = useState({ nome: '', pass: '', curso: '', medico: '', crm: '', cargo: '' });
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  function validate() {
    const errs: string[] = [];
    if (!form.nome.trim()) errs.push('Nome do aprovado obrigatório');
    if (!form.pass.trim()) errs.push('Passaporte do aprovado obrigatório');
    if (!form.curso.trim()) errs.push('Nome do curso obrigatório');
    if (!form.medico.trim()) errs.push('Nome do responsável obrigatório');
    if (!form.crm.trim()) errs.push('CRM/CRP obrigatório');
    if (!form.cargo.trim()) errs.push('Cargo obrigatório');
    return errs;
  }

  function handlePreview() {
    const errs = validate();
    setErrors(errs);
    setSuccess('');
    if (errs.length === 0) setPreview(true);
  }

  async function handleCapture() {
    if (!previewRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `Certificado_${form.nome.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSuccess('Certificado exportado com sucesso!');
    } catch {
      setErrors(['Erro ao exportar. Tente novamente.']);
    }
  }

  const field = (id: keyof typeof form, label: string, placeholder?: string) => (
    <div className="gen-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <h2>Certificados 🎓</h2>
        <p>Geração de certificados de conclusão de cursos</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="gen-header">
          <div className="gen-header-logo">
            <Image src="/logo.png" alt="Logo" width={44} height={44} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div className="gen-header-title">Gerador de Certificados</div>
            <div className="gen-header-sub">Hospital Memorial Andrea Silva</div>
          </div>
        </div>
        <div className="gen-body">
          {errors.length > 0 && (
            <div className="gen-msg gen-error">{errors.map((e) => <div key={e}>• {e}</div>)}</div>
          )}
          {success && <div className="gen-msg gen-success">{success}</div>}

          <div className="gen-section">
            <div className="gen-section-title">Dados do Aprovado</div>
            <div className="gen-grid">
              {field('nome', 'Nome Completo', 'Nome completo')}
              {field('pass', 'Passaporte', 'Ex: 123456')}
              {field('curso', 'Nome do Curso', 'Ex: Primeiros Socorros')}
            </div>
          </div>

          <div className="gen-section">
            <div className="gen-section-title">Responsável pela Emissão</div>
            <div className="gen-grid">
              {field('medico', 'Nome do Responsável', 'Nome completo')}
              {field('crm', 'CRM / CRP', 'Número do registro')}
              {field('cargo', 'Cargo', 'Ex: Diretor Médico')}
            </div>
          </div>

          <div className="gen-actions">
            {preview && (
              <button className="gen-btn success" onClick={handleCapture}>📸 Exportar PNG</button>
            )}
            <button className="gen-btn primary" onClick={handlePreview}>👁 Visualizar Certificado</button>
          </div>

          {preview && (
            <div style={{ marginTop: 24 }}>
              <div className="gen-preview-title">Pré-visualização do Certificado</div>
              <div ref={previewRef}>
                <CertPreview data={form} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
