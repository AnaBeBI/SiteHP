-- ============================================================
-- Hospital Andrea Silva — Supabase Migration + Seed
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- ============================================================
-- TYPES
-- ============================================================
CREATE TYPE cargo_tipo AS ENUM ('Externo','Interno','Geral');
CREATE TYPE hierarquia_tipo AS ENUM ('Chefe');
CREATE TYPE especialidade_tipo AS ENUM (
  'Clínico Geral','Cirurgia Geral','Patologia','Psiquiatra','Radiologia'
);

-- ============================================================
-- PROFILES (1:1 com auth.users)
-- ============================================================
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nome          text NOT NULL,
  cargo         text NOT NULL DEFAULT 'Estagiário',
  especialidade especialidade_tipo,
  tipo_cargo    cargo_tipo NOT NULL DEFAULT 'Geral',
  hierarquia    hierarquia_tipo,
  is_admin      boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuário lê o próprio perfil
CREATE POLICY "own profile" ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin lê todos os perfis
CREATE POLICY "admin read all" ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Admin gerencia perfis
CREATE POLICY "admin manage" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
  ));

-- Trigger: cria profile automaticamente ao criar auth user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, nome, cargo, tipo_cargo, is_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', ''),
    COALESCE(new.raw_user_meta_data->>'cargo', 'Estagiário'),
    COALESCE((new.raw_user_meta_data->>'tipo_cargo')::cargo_tipo, 'Geral'),
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PRODUTOS (farmácia - vendas)
-- ============================================================
CREATE TABLE produtos (
  id    text PRIMARY KEY,
  nome  text NOT NULL,
  preco integer NOT NULL
);
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON produtos FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON produtos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- MATERIAIS (farmácia - produção)
-- ============================================================
CREATE TABLE materiais (
  id    text PRIMARY KEY,
  label text NOT NULL
);
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON materiais FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON materiais FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- RECEITAS
-- ============================================================
CREATE TABLE receitas (
  id    serial PRIMARY KEY,
  nome  text NOT NULL,
  emoji text NOT NULL DEFAULT '💊'
);
CREATE TABLE receita_ingredientes (
  receita_id  integer REFERENCES receitas ON DELETE CASCADE,
  material_id text REFERENCES materiais,
  quantidade  integer NOT NULL,
  PRIMARY KEY (receita_id, material_id)
);
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE receita_ingredientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON receitas FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read" ON receita_ingredientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON receitas FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin write" ON receita_ingredientes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- UNIFORMES
-- ============================================================
CREATE TABLE uniformes (
  id          serial PRIMARY KEY,
  nome        text NOT NULL,
  cat         text NOT NULL,
  bg          text NOT NULL,
  badge       text NOT NULL,
  badge_label text NOT NULL
);
CREATE TABLE uniforme_itens (
  id          serial PRIMARY KEY,
  uniforme_id integer REFERENCES uniformes ON DELETE CASCADE,
  label       text NOT NULL,
  fem         text NOT NULL,
  masc        text NOT NULL,
  muted       boolean NOT NULL DEFAULT false,
  ordem       integer NOT NULL DEFAULT 0
);
ALTER TABLE uniformes ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniforme_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON uniformes FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read" ON uniforme_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON uniformes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin write" ON uniforme_itens FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- LAUDO TEMPLATES (psiquiatria)
-- ============================================================
CREATE TABLE laudo_templates (
  tipo      text NOT NULL,
  resultado text NOT NULL,
  texto     text NOT NULL,
  PRIMARY KEY (tipo, resultado)
);
ALTER TABLE laudo_templates ENABLE ROW LEVEL SECURITY;
-- Admins ou especialidade Psiquiatra
CREATE POLICY "psiquiatra or admin" ON laudo_templates FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (especialidade = 'Psiquiatra' OR is_admin = true)
  ));
CREATE POLICY "admin write" ON laudo_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- MAPA DE CARREIRA
-- ============================================================
CREATE TABLE cargos_mapa (
  id            text PRIMARY KEY,
  titulo        text NOT NULL,
  subtitulo     text NOT NULL,
  badge_classe  text NOT NULL,
  badge_label   text NOT NULL,
  salario       text NOT NULL,
  descricao     text NOT NULL,
  proximo_passo text NOT NULL
);
CREATE TABLE cargo_progressao (
  cargo_id          text REFERENCES cargos_mapa,
  cargo_anterior_id text REFERENCES cargos_mapa,
  PRIMARY KEY (cargo_id, cargo_anterior_id)
);
CREATE TABLE cursos (
  id       serial PRIMARY KEY,
  cargo_id text REFERENCES cargos_mapa,
  nome     text NOT NULL,
  link     text
);
ALTER TABLE cargos_mapa ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_progressao ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read" ON cargos_mapa FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read" ON cargo_progressao FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth read" ON cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write" ON cargos_mapa FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin write" ON cargo_progressao FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin write" ON cursos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================
-- SEED: PRODUTOS
-- ============================================================
INSERT INTO produtos (id, nome, preco) VALUES
  ('analgesico',  'Analgésico',  200),
  ('bandagem',    'Bandagem',    500),
  ('gaze',        'Gaze',        250),
  ('kit-medico',  'Kit Médico',  1350),
  ('ritmoneury',  'Ritmoneury',  925),
  ('sinkalmy',    'Sinkalmy',    750),
  ('tratamento',  'Tratamento',  700),
  ('bolsa-medica','Bolsa Médica',25000);

-- ============================================================
-- SEED: MATERIAIS
-- ============================================================
INSERT INTO materiais (id, label) VALUES
  ('opio',      'Ópio'),
  ('embalagem', 'Embalagem'),
  ('pano',      'Pano'),
  ('algodao',   'Algodão'),
  ('morfina',   'Morfina'),
  ('camomila',  'Camomila'),
  ('hortela',   'Hortelã');

-- ============================================================
-- SEED: RECEITAS + INGREDIENTES
-- ============================================================
INSERT INTO receitas (nome, emoji) VALUES
  ('Analgésico',  '💊'),
  ('Bandagem',    '🩹'),
  ('Gaze',        '🧻'),
  ('Kit Médico',  '🏥'),
  ('Ritmoneury',  '💉'),
  ('Sinkalmy',    '🌿');

INSERT INTO receita_ingredientes (receita_id, material_id, quantidade)
SELECT r.id, m.material_id, m.quantidade FROM receitas r
JOIN (VALUES
  ('Analgésico',  'opio',      3),
  ('Analgésico',  'embalagem', 1),
  ('Bandagem',    'embalagem', 2),
  ('Bandagem',    'pano',      5),
  ('Gaze',        'algodao',   15),
  ('Gaze',        'embalagem', 1),
  ('Kit Médico',  'morfina',   45),
  ('Kit Médico',  'embalagem', 10),
  ('Kit Médico',  'pano',      3),
  ('Ritmoneury',  'camomila',  20),
  ('Ritmoneury',  'hortela',   15),
  ('Ritmoneury',  'embalagem', 5),
  ('Sinkalmy',    'hortela',   10),
  ('Sinkalmy',    'embalagem', 3)
) AS m(receita_nome, material_id, quantidade) ON r.nome = m.receita_nome;

-- ============================================================
-- SEED: LAUDO TEMPLATES
-- ============================================================
INSERT INTO laudo_templates (tipo, resultado, texto) VALUES
  ('porte-caca', 'apto',
   'Define-se, por meio deste documento, o grau de aptidão do paciente no que tange ao manuseio de arma de fogo.' || chr(10) || chr(10) ||
   'Este laudo é emitido de acordo com a minha avaliação profissional mediado pela ética médica e por protocolos do CMH.' || chr(10) || chr(10) ||
   'Ressalto que, como profissional da área de saúde mental, estou comprometido com a ética e a responsabilidade profissional, bem como com a segurança pública.'),
  ('porte-caca', 'inapto',
   'Define-se, por meio deste documento, o grau de inaptidão do paciente no que tange ao manuseio de arma de fogo.' || chr(10) || chr(10) ||
   'Este laudo é emitido de acordo com a minha avaliação profissional mediado pela ética médica e por protocolos do CMH.' || chr(10) || chr(10) ||
   'Ressalto que, como profissional da área de saúde mental, estou comprometido com a ética e a responsabilidade profissional, bem como com a segurança pública.'),
  ('limpeza-ficha', 'apto',
   'Com base nos resultados da avaliação psicológica, é minha conclusão que cidadão mencionado encontra-se apto para retornar à comunidade como cidadão renovado, sem vínculos a meios ilegais.' || chr(10) || chr(10) ||
   'Este laudo é emitido conforme a minha avaliação profissional, mediado pela ética médica e por protocolos do CMH. Ressalto que estou comprometido com a segurança do policial e da comunidade que ele serve.'),
  ('limpeza-ficha', 'inapto',
   'Com base nos resultados da avaliação psicológica, é minha conclusão que o cidadão mencionado NÃO se encontra apto para retornar à comunidade neste momento, necessitando de acompanhamento continuado.' || chr(10) || chr(10) ||
   'Este laudo é emitido conforme a minha avaliação profissional, mediado pela ética médica e por protocolos do CMH. Ressalto que estou comprometido com a segurança do policial e da comunidade que ele serve.');

-- ============================================================
-- SEED: MAPA DE CARREIRA
-- ============================================================
INSERT INTO cargos_mapa (id, titulo, subtitulo, badge_classe, badge_label, salario, descricao, proximo_passo) VALUES
  ('estagiario', 'Estagiário',                'Cargo inicial · Obrigatório',            'map-b-req', 'Obrigatório', 'R$ 1.500',
   'Cargo de entrada no Hospital Memorial Andrea Silva. O estagiário atua sob supervisão direta aprendendo rotinas e protocolos hospitalares.',
   '➜ Próximo passo: <span>Técnico de Enfermagem</span>'),
  ('tec',        'Técnico de Enfermagem',      'Base obrigatória · Todos os caminhos',   'map-b-req', 'Obrigatório', 'R$ 2.000',
   'O Técnico de Enfermagem é a base de toda a progressão. A partir daqui, o profissional escolhe entre o caminho interno (hospitalar) ou externo (pré-hospitalar).',
   '➜ Próximo: <span>Decidir Caminho</span>'),
  ('decisao',    'Decidir Caminho Profissional','Ponto de escolha · Obrigatório',         'map-b-req', 'Obrigatório', '-',
   'Após concluir Técnico de Enfermagem, o profissional escolhe entre o caminho interno (hospitalar) ou externo (pré-hospitalar).',
   '➜ Escolha: <span>Interno</span> ou <span>🚑 Externo</span>'),
  ('enfermeiro', 'Enfermeiro',                 'Caminho interno · Graduação',             'map-b-int', 'Interno',     'R$ 2.500',
   'O Enfermeiro lidera a equipe de técnicos, elabora planos de cuidado e realiza procedimentos complexos. Tem autonomia técnica sobre as condutas de enfermagem.',
   '➜ Próximo: <span>Residente</span>'),
  ('residente',  'Residente',                  'Caminho interno · Especialização',        'map-b-int', 'Interno',     'R$ 3.000',
   'O Residente desenvolve competências avançadas em área clínica específica sob supervisão de especialistas.',
   '➜ Próximo: <span>Médico</span>'),
  ('medico',     'Médico',                     'Caminho interno · CRM ativo',             'map-b-int', 'Interno',     'R$ 3.500',
   'O Médico é responsável por diagnóstico, tratamento e acompanhamento dos pacientes. Obrigatório MotoMed e pelo menos 2 especialidades.',
   '➜ Topo do caminho interno'),
  ('socorrista', 'Socorrista',                 'Caminho externo · Emergência',            'map-b-ext', 'Externo',     'R$ 2.000',
   'O Socorrista presta os primeiros cuidados em emergências dentro e fora do hospital, atuando em ambulâncias e campo.',
   '➜ Próximo: <span>Paramédico</span>'),
  ('paramedico', 'Paramédico',                 'Caminho externo · Suporte avançado',      'map-b-ext', 'Externo',     'R$ 2.500',
   'O Paramédico realiza atendimentos mais complexos, podendo administrar medicamentos e conduzir suporte avançado à vida.',
   '➜ Próximo: <span>Resgatista</span>'),
  ('resgatista', 'Resgatista',                 'Caminho externo · Campo e urgências',     'map-b-ext', 'Externo',     'R$ 3.000',
   'O Resgatista atua em operações de risco: desastres, acidentes graves, múltiplas vítimas.',
   '➜ Próximo: <span>Médico SAMU</span>'),
  ('samu',       'Médico SAMU',                'Caminho externo · Regulação médica',      'map-b-ext', 'Externo',     'R$ 3.500',
   'O Médico do SAMU atua na regulação de chamadas de emergência, orienta equipes em campo e acompanha casos em UTI móvel.',
   '➜ Topo do caminho externo');

-- ============================================================
-- SEED: PROGRESSÃO (ROLE_CHAIN)
-- ============================================================
INSERT INTO cargo_progressao (cargo_id, cargo_anterior_id) VALUES
  ('tec',        'estagiario'),
  ('decisao',    'estagiario'),
  ('decisao',    'tec'),
  ('enfermeiro', 'estagiario'),
  ('enfermeiro', 'tec'),
  ('residente',  'estagiario'),
  ('residente',  'tec'),
  ('residente',  'enfermeiro'),
  ('medico',     'estagiario'),
  ('medico',     'tec'),
  ('medico',     'enfermeiro'),
  ('medico',     'residente'),
  ('socorrista', 'estagiario'),
  ('socorrista', 'tec'),
  ('paramedico', 'estagiario'),
  ('paramedico', 'tec'),
  ('paramedico', 'socorrista'),
  ('resgatista', 'estagiario'),
  ('resgatista', 'tec'),
  ('resgatista', 'socorrista'),
  ('resgatista', 'paramedico'),
  ('samu',       'estagiario'),
  ('samu',       'tec'),
  ('samu',       'socorrista'),
  ('samu',       'paramedico'),
  ('samu',       'resgatista');

-- ============================================================
-- SEED: CURSOS (COURSES_NEW)
-- ============================================================
INSERT INTO cursos (cargo_id, nome, link) VALUES
  ('estagiario', 'Raio-X',            'https://docs.google.com/document/d/1klOOmlOi-52YCJVDYidk-DN1TfoLkHX3e9XE053PtvY/edit?usp=sharing'),
  ('estagiario', 'Atendimento Interno', NULL),
  ('estagiario', 'Modulação',          'https://docs.google.com/document/d/1pu4gV-gndubSQWZNQK5lNCyydVYIjV20GobYTqBmyKc/edit?usp=sharing'),
  ('tec',        'Primeiros Socorros', 'https://docs.google.com/document/d/1-UQTlKQRnaV0DS0OnFhjt5QWg-giOoMb-FkryagM0M8/edit?usp=sharing'),
  ('tec',        'Resgate Outlaw',     NULL),
  ('enfermeiro', 'Resgate Aéreo e Marítimo', 'https://docs.google.com/document/d/1dJbMf_ljOhZtRq189Fxo03gH97o8cOyg_2i1HQSzG4w/edit?usp=sharing'),
  ('medico',     'MotoMed',            NULL),
  ('socorrista', 'Resgate Aéreo e Marítimo', 'https://docs.google.com/document/d/1dJbMf_ljOhZtRq189Fxo03gH97o8cOyg_2i1HQSzG4w/edit?usp=sharing'),
  ('samu',       'MotoMed',            NULL);

-- ============================================================
-- SEED: UNIFORMES
-- ============================================================
WITH u AS (
  INSERT INTO uniformes (nome, cat, bg, badge, badge_label) VALUES
    ('Estagiário',       'int', '#0EA5E9', 'badge-int', '🏥 Interno'),
    ('Téc. Enfermagem',  'int', '#2563EB', 'badge-int', '🏥 Interno'),
    ('Enfermeiro',       'int', '#64748B', 'badge-int', '🏥 Interno'),
    ('Residente',        'int', '#DC2626', 'badge-int', '🏥 Interno'),
    ('Médico',           'int', '#d5a5e4', 'badge-int', '🏥 Interno'),
    ('Médico Chefe',     'int', '#1C1917', 'badge-int', '🏥 Interno'),
    ('Est. Psiquiatria', 'esp', '#EAB308', 'badge-esp', '🎓 Especialização'),
    ('Est. Patologia',   'esp', '#EC4899', 'badge-esp', '🎓 Especialização'),
    ('Est. Cirurgia',    'esp', '#F97316', 'badge-esp', '🎓 Especialização'),
    ('Est. Ortopedia',   'esp', '#EC4899', 'badge-esp', '🎓 Especialização'),
    ('Socorrista',       'ext', '#8cb1d6', 'badge-ext', '🚑 Externo'),
    ('Paramédico',       'ext', '#DC2626', 'badge-ext', '🚑 Externo'),
    ('Resgatista',       'ext', '#DC2626', 'badge-ext', '🚑 Externo'),
    ('Médico SAMU',      'ext', '#1C1917', 'badge-ext', '🚑 Externo')
  RETURNING id, nome
)
INSERT INTO uniforme_itens (uniforme_id, label, fem, masc, muted, ordem)
SELECT u.id, v.label, v.fem, v.masc, v.muted, v.ordem FROM u
JOIN (VALUES
  ('Estagiário',      'Mãos',      '109 | 1', '85 | 1',  false, 1),
  ('Estagiário',      'Camisa',    '255',      '15',       false, 2),
  ('Estagiário',      'Jaqueta',   '543 | 2',  '511 | 2', false, 3),
  ('Estagiário',      'Calça',     '196 | 2',  '183 | 2', false, 4),
  ('Estagiário',      'Acessório', '154 | 2',  '181 | 2', false, 5),
  ('Estagiário',      'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Téc. Enfermagem', 'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Téc. Enfermagem', 'Camisa',    '255',       '15',      false, 2),
  ('Téc. Enfermagem', 'Jaqueta',   '543 | 4',  '511 | 4', false, 3),
  ('Téc. Enfermagem', 'Calça',     '196 | 4',  '183 | 4', false, 4),
  ('Téc. Enfermagem', 'Acessório', '154 | 4',  '181 | 4', false, 5),
  ('Téc. Enfermagem', 'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Enfermeiro',      'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Enfermeiro',      'Camisa',    '255',       '15',      false, 2),
  ('Enfermeiro',      'Jaqueta',   '543 | 1',  '511 | 1', false, 3),
  ('Enfermeiro',      'Calça',     '196 | 1',  '183 | 1', false, 4),
  ('Enfermeiro',      'Acessório', '154 | 1',  '181 | 1', false, 5),
  ('Enfermeiro',      'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Residente',       'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Residente',       'Camisa',    '255',       '15',      false, 2),
  ('Residente',       'Jaqueta',   '543 | 3',  '511 | 3', false, 3),
  ('Residente',       'Calça',     '196 | 3',  '183 | 3', false, 4),
  ('Residente',       'Acessório', '154 | 3',  '181 | 3', false, 5),
  ('Residente',       'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Médico',          'Mãos',      '104 | 1',  '88 | 1',  false, 1),
  ('Médico',          'Camisa',    '—',         '—',       true,  2),
  ('Médico',          'Jaqueta',   '544 | 7',  '512 | 7', false, 3),
  ('Médico',          'Calça',     '—',         '—',       true,  4),
  ('Médico',          'Acessório', '154 | —',  '181 | —', false, 5),
  ('Médico',          'Sapato',    '—',         '—',       true,  6),

  ('Médico Chefe',    'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Médico Chefe',    'Camisa',    '—',         '—',       true,  2),
  ('Médico Chefe',    'Jaqueta',   '543 | 5',  '511 | 5', false, 3),
  ('Médico Chefe',    'Calça',     '196 | 5',  '183 | 5', false, 4),
  ('Médico Chefe',    'Acessório', '154 | —',  '181 | —', false, 5),
  ('Médico Chefe',    'Sapato',    '—',         '—',       true,  6),

  ('Est. Psiquiatria','Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Est. Psiquiatria','Camisa',    '255',       '15',      false, 2),
  ('Est. Psiquiatria','Jaqueta',   '543 | 7',  '511 | 7', false, 3),
  ('Est. Psiquiatria','Calça',     '196 | 7',  '183 | 7', false, 4),
  ('Est. Psiquiatria','Acessório', '154 | 6',  '181 | 6', false, 5),
  ('Est. Psiquiatria','Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Est. Patologia',  'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Est. Patologia',  'Camisa',    '255',       '15',      false, 2),
  ('Est. Patologia',  'Jaqueta',   '543 | 6',  '511 | 6', false, 3),
  ('Est. Patologia',  'Calça',     '196 | 6',  '183 | 6', false, 4),
  ('Est. Patologia',  'Acessório', '154 | 6',  '181 | 6', false, 5),
  ('Est. Patologia',  'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Est. Cirurgia',   'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Est. Cirurgia',   'Camisa',    '255',       '15',      false, 2),
  ('Est. Cirurgia',   'Jaqueta',   '543 | 8',  '511 | 8', false, 3),
  ('Est. Cirurgia',   'Calça',     '196 | 8',  '183 | 8', false, 4),
  ('Est. Cirurgia',   'Acessório', '154 | 6',  '181 | 6', false, 5),
  ('Est. Cirurgia',   'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Est. Ortopedia',  'Mãos',      '109 | 1',  '85 | 1',  false, 1),
  ('Est. Ortopedia',  'Camisa',    '255',       '15',      false, 2),
  ('Est. Ortopedia',  'Jaqueta',   '543 | 0',  '511 | 0', false, 3),
  ('Est. Ortopedia',  'Calça',     '196 | 0',  '183 | 0', false, 4),
  ('Est. Ortopedia',  'Acessório', '154 | 6',  '181 | 6', false, 5),
  ('Est. Ortopedia',  'Sapato',    '222 | 6',  '113 | 3', false, 6),

  ('Socorrista',      'Mãos',      '101 | 1',  '88 | 1',  false, 1),
  ('Socorrista',      'Camisa',    '159',       '129',     false, 2),
  ('Socorrista',      'Jaqueta',   '835 | 0',  '668 | 0', false, 3),
  ('Socorrista',      'Calça',     '191 | 3',  '177 | 0', false, 4),
  ('Socorrista',      'Acessório', '154 | 5',  '181 | 5', false, 5),
  ('Socorrista',      'Sapato',    '25',        '25',      false, 6),

  ('Paramédico',      'Mãos',      '101 | 1',  '88 | 1',  false, 1),
  ('Paramédico',      'Camisa',    '159',       '129',     false, 2),
  ('Paramédico',      'Jaqueta',   '835 | 1',  '668 | 1', false, 3),
  ('Paramédico',      'Calça',     '191 | 3',  '177 | 0', false, 4),
  ('Paramédico',      'Acessório', '154 | 5',  '181 | 5', false, 5),
  ('Paramédico',      'Sapato',    '25',        '25',      false, 6),

  ('Resgatista',      'Mãos',      '101 | 1',  '88 | 1',  false, 1),
  ('Resgatista',      'Camisa',    '248',       '207',     false, 2),
  ('Resgatista',      'Jaqueta',   '835 | 1',  '668 | 1', false, 3),
  ('Resgatista',      'Calça',     '191 | 3',  '177 | 0', false, 4),
  ('Resgatista',      'Acessório', '154 | 5',  '181 | 5', false, 5),
  ('Resgatista',      'Sapato',    '25',        '25',      false, 6),

  ('Médico SAMU',     'Mãos',      '101 | 1',  '88 | 1',  false, 1),
  ('Médico SAMU',     'Camisa',    '248',       '207',     false, 2),
  ('Médico SAMU',     'Jaqueta',   '835 | 2',  '668 | 2', false, 3),
  ('Médico SAMU',     'Calça',     '191 | 3',  '177 | 0', false, 4),
  ('Médico SAMU',     'Acessório', '154 | 5',  '181 | 5', false, 5),
  ('Médico SAMU',     'Sapato',    '25',        '25',      false, 6)
) AS v(uniforme_nome, label, fem, masc, muted, ordem) ON u.nome = v.uniforme_nome;

-- ============================================================
-- PRIMEIRO USUÁRIO: Ana Beatriz
-- Senha aleatória — usar "Esqueci minha senha" para definir
-- ============================================================
DO $$
DECLARE
  v_uid uuid := gen_random_uuid();
  v_pwd text := 'Tmp#' || substr(md5(random()::text || clock_timestamp()::text), 1,12);
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    is_super_admin, is_sso_user, is_anonymous,
    confirmation_token, recovery_token,
    email_change, email_change_token_new
  ) VALUES (
    v_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'zirtaeb.nobre@gmail.com',
    crypt(v_pwd, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"nome":"Ana Beatriz","cargo":"Diretor","tipo_cargo":"Geral","is_admin":true}',
    now(), now(),
    false, false, false,
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_uid,
    jsonb_build_object('sub', v_uid::text, 'email', 'zirtaeb.nobre@gmail.com'),
    'email', 'zirtaeb.nobre@gmail.com',
    now(), now(), now()
  );

  -- Atualiza profile (criado pelo trigger) com hierarquia
  UPDATE profiles SET hierarquia = 'Chefe' WHERE id = v_uid;
END $$;

-- ============================================================
-- MIGRATION: Laudo de Psiquiatria por permissão (gerar_laudo_psi)
-- Substitui a regra "admin OU especialidade = Psiquiatra" por
-- "admin OU gerar_laudo_psi = true", configurável por usuário.
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================
ALTER TABLE profiles ADD COLUMN gerar_laudo_psi boolean NOT NULL DEFAULT false;

DROP POLICY IF EXISTS "psiquiatra or admin" ON laudo_templates;
CREATE POLICY "psiquiatra or admin" ON laudo_templates FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND (gerar_laudo_psi = true OR is_admin = true)
  ));

-- ============================================================
-- MIGRATION: Ponto Eletrônico
-- Execute no SQL Editor do Supabase Dashboard.
-- ============================================================
CREATE TABLE pontos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  inicio      timestamptz NOT NULL,
  fim         timestamptz,
  criado_por  uuid REFERENCES profiles(id) ON DELETE SET NULL,  -- admin que lançou manualmente
  editado_por uuid REFERENCES profiles(id) ON DELETE SET NULL,  -- admin que corrigiu o registro
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pontos_user_id_idx ON pontos(user_id);
CREATE INDEX pontos_inicio_idx ON pontos(inicio);

ALTER TABLE pontos ENABLE ROW LEVEL SECURITY;

-- Usuário lê os próprios pontos
CREATE POLICY "own read" ON pontos FOR SELECT
  USING (auth.uid() = user_id);

-- Admin lê todos os pontos
CREATE POLICY "admin read all" ON pontos FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Usuário abre/fecha o próprio ponto
CREATE POLICY "own insert" ON pontos FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON pontos FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin gerencia todos os pontos (lançamento manual, correção, exclusão)
CREATE POLICY "admin manage" ON pontos FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
