import {
  QuestionSection,
  Question,
  User,
  PreCouncilReport,
  SchoolClass,
  SchoolSubject,
  Student,
  ClassDimension,
} from '../types';

export const SCHOOL_NAME = 'COLÉGIO ESTADUAL UNIDADE POLO';
export const SCHOOL_SUBTITLE = 'ENSINO FUNDAMENTAL, MÉDIO E PROFISSIONAL';
export const REPORT_TITLE = 'FICHA INDIVIDUAL DE PRÉ-CONSELHO DE CLASSE';

// Informações Oficiais de Desenvolvimento e Instituição
export const DEVELOPER_NAME = 'Andrey Salgueiro';
export const DEVELOPER_MENTOR = 'Professor Robson Lincon Serpe Garcia';
export const DEVELOPER_CLASS = '3º A Técnico em Desenvolvimento de Sistemas';
export const DEVELOPER_EMAIL = 'andreysalgueiro95@gmail.com';
export const DEVELOPER_WHATSAPP = '5543996025004'; // Número com DDI e DDD para wa.me
export const DEVELOPER_WHATSAPP_DISPLAY = '(43) 99602-5004'; // Formato amigável de exibição
export const SYSTEM_VERSION = '1.0.0 Oficial';
export const SYSTEM_YEAR = '2026';
// Logo Oficial do Colégio Estadual Unidade Polo
export const DEFAULT_SCHOOL_LOGO_URL = '/assets/aistudio/WhatsApp_Image_2026-11-17_at_11.16.20_12be1f50.jpeg';

export const EVALUATION_DIMENSIONS: ClassDimension[] = [
  {
    id: 'aprendizagem',
    name: 'Desenvolvimento e Rendimento da Aprendizagem',
    description: 'Compreensão dos conteúdos, consolidação das habilidades e ritmo de assimilação.',
  },
  {
    id: 'participacao',
    name: 'Participação, Envolvimento e Protagonismo',
    description: 'Engajamento oral, interação em aulas e colaboração com a turma.',
  },
  {
    id: 'disciplina',
    name: 'Postura, Disciplina e Respeito',
    description: 'Convivência em sala de aula, escuta atenta e respeito às regras escolares.',
  },
  {
    id: 'tarefas',
    name: 'Realização e Entrega de Tarefas/Trabalhos',
    description: 'Compromisso com lições de casa, pontualidade e dedicação aos projetos.',
  },
  {
    id: 'frequencia',
    name: 'Frequência, Pontualidade e Assiduidade',
    description: 'Presença regular nas aulas e pontualidade no início dos períodos.',
  },
  {
    id: 'convivencia',
    name: 'Convivência e Relacionamento Interpessoal',
    description: 'Empatia, trabalho em equipe e mediação respeitosa de conflitos.',
  },
];

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'cls-6a', name: '6º Ano A', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-6b', name: '6º Ano B', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-7a', name: '7º Ano A', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-7b', name: '7º Ano B', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-8a', name: '8º Ano A', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-8b', name: '8º Ano B', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-9a', name: '9º Ano A', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-9b', name: '9º Ano B', shift: 'Manhã', year: '2026', description: 'Ensino Fundamental II' },
  { id: 'cls-1em', name: '1º Ano EM', shift: 'Manhã', year: '2026', description: 'Ensino Médio' },
  { id: 'cls-2em', name: '2º Ano EM', shift: 'Manhã', year: '2026', description: 'Ensino Médio' },
  { id: 'cls-3em', name: '3º Ano EM', shift: 'Manhã', year: '2026', description: 'Ensino Médio (Terceirão)' },
];

export const INITIAL_STUDENTS: Student[] = [
  // 6º Ano A
  { id: 'std-6a-01', name: 'Beatriz Silva Lima', rollNumber: '01', classGroup: '6º Ano A', status: 'ativo', notes: 'Destaque em participação e colaboração.' },
  { id: 'std-6a-02', name: 'Carlos Miguel Albuquerque', rollNumber: '02', classGroup: '6º Ano A', status: 'ativo' },
  { id: 'std-6a-03', name: 'Daniela Santos Ferreira', rollNumber: '03', classGroup: '6º Ano A', status: 'ativo' },
  { id: 'std-6a-04', name: 'Eduardo Henrique Dias', rollNumber: '04', classGroup: '6º Ano A', status: 'ativo' },
  { id: 'std-6a-05', name: 'Guilherme Henrique Ribeiro', rollNumber: '05', classGroup: '6º Ano A', status: 'atencao', notes: 'Necessita reforço contínuo em cálculo e leitura.' },
  { id: 'std-6a-06', name: 'Júlia Cristina Pires', rollNumber: '06', classGroup: '6º Ano A', status: 'ativo' },
  { id: 'std-6a-07', name: 'Larissa Manoela Martins', rollNumber: '07', classGroup: '6º Ano A', status: 'atencao', notes: 'Acompanhamento na sala de recursos.' },
  { id: 'std-6a-08', name: 'Lucas Gabriel Duarte', rollNumber: '08', classGroup: '6º Ano A', status: 'ativo', notes: 'Líder de turma exemplar.' },
  { id: 'std-6a-09', name: 'Marcos Vinicius Souza', rollNumber: '09', classGroup: '6º Ano A', status: 'atencao', notes: 'Faltas recorrentes às terças-feiras.' },
  { id: 'std-6a-10', name: 'Rafaela Antunes Vieira', rollNumber: '10', classGroup: '6º Ano A', status: 'ativo' },
  // 7º Ano B
  { id: 'std-7b-01', name: 'Ana Clara Mendes', rollNumber: '01', classGroup: '7º Ano B', status: 'ativo' },
  { id: 'std-7b-02', name: 'Felipe Martins Prado', rollNumber: '02', classGroup: '7º Ano B', status: 'atencao', notes: 'Bloqueio na escrita argumentativa.' },
  { id: 'std-7b-03', name: 'Gabriel Alves Barreto', rollNumber: '03', classGroup: '7º Ano B', status: 'atencao', notes: 'Frequência oscilante.' },
  { id: 'std-7b-04', name: 'Isabela Fontes Rocha', rollNumber: '04', classGroup: '7º Ano B', status: 'ativo', notes: 'Destaque no sarau cultural.' },
  { id: 'std-7b-05', name: 'Kauã Barbosa Nogueira', rollNumber: '05', classGroup: '7º Ano B', status: 'ativo', notes: 'Excelente participação oral.' },
  { id: 'std-7b-06', name: 'Matheus Lima Carvalho', rollNumber: '06', classGroup: '7º Ano B', status: 'ativo' },
];

export const INITIAL_SECTIONS: QuestionSection[] = [
  { id: 'sec-1', title: '1. PANORAMA DA TURMA', order: 1 },
  { id: 'sec-2', title: '2. APRENDIZAGEM E FREQUÊNCIA', order: 2 },
  { id: 'sec-3', title: '3. DESTAQUES E SITUAÇÕES QUE MERECEM ATENÇÃO', order: 3 },
  { id: 'sec-4', title: '4. ENCAMINHAMENTOS', order: 4 },
  { id: 'sec-5', title: '5. SÍNTESE DO PROFESSOR', order: 5 },
];

export const INITIAL_QUESTIONS: Question[] = [
  // 1. PANORAMA DA TURMA
  {
    id: 'q-1',
    sectionId: 'sec-1',
    prompt: 'Como você avalia o desenvolvimento geral da turma em relação à aprendizagem?',
    placeholder: 'Ex: A turma demonstra bom ritmo nas explicações iniciais, porém apresenta heterogeneidade na consolidação dos conceitos...',
    required: true,
    order: 1,
  },
  {
    id: 'q-2',
    sectionId: 'sec-1',
    prompt: 'Como está a participação, o envolvimento e a postura dos estudantes nas aulas?',
    placeholder: 'Ex: Boa participação oral nos debates coletivos, com momentos de dispersão no final do período vespertino...',
    required: true,
    order: 2,
  },
  // 2. APRENDIZAGEM E FREQUÊNCIA
  {
    id: 'q-3',
    sectionId: 'sec-2',
    prompt: 'Quais habilidades/conteúdos apresentam maior dificuldade para a turma?',
    placeholder: 'Ex: Interpretação de problemas contextualizados e operações com frações/geometria plana...',
    required: true,
    order: 1,
  },
  {
    id: 'q-4',
    sectionId: 'sec-2',
    prompt: 'Há estudantes com baixa frequência ou que necessitam de acompanhamento mais próximo? Quais e por quê?',
    placeholder: 'Ex: Aluno Marcos Vinicius (faltas frequentes às terças-feiras); Aluna Júlia (dificuldade motora/leitura)...',
    required: true,
    order: 2,
  },
  // 3. DESTAQUES E SITUAÇÕES QUE MERECEM ATENÇÃO
  {
    id: 'q-5',
    sectionId: 'sec-3',
    prompt: 'Estudantes que se destacaram positivamente (aprendizagem, participação e responsabilidade ou protagonismo):',
    placeholder: 'Ex: Lucas Gabriel (liderança nos trabalhos em grupo), Beatriz Silva (compromisso exemplar com as entregas de tarefas)...',
    required: true,
    order: 1,
  },
  {
    id: 'q-6',
    sectionId: 'sec-3',
    prompt: 'Estudantes que apresentam dificuldades significativas ou necessitam de intervenção/encaminhamento:',
    placeholder: 'Ex: Rafael Costa (necessita reforço pedagógico urgente em leitura/interpretação), Matheus Lima (questão de convivência em equipe)...',
    required: true,
    order: 2,
  },
  // 4. ENCAMINHAMENTOS
  {
    id: 'q-7',
    sectionId: 'sec-4',
    prompt: 'Quais estratégias já foram realizadas e quais ações você sugere para o próximo período?',
    placeholder: 'Ex: Realizada monitoria entre pares e listas graduadas de exercícios. Sugiro oficinas práticas no contraturno...',
    required: true,
    order: 1,
  },
  {
    id: 'q-8',
    sectionId: 'sec-4',
    prompt: 'Há alguma observação importante que deve ser registrada no Pré-Conselho?',
    placeholder: 'Ex: Solicitar conversa com os responsáveis da turma sobre a assiduidade no contraturno...',
    required: false,
    order: 2,
  },
  // 5. SÍNTESE DO PROFESSOR
  {
    id: 'q-9',
    sectionId: 'sec-5',
    prompt: 'Deixe aqui uma observação geral sobre a turma e/ou sobre algum estudante que considere relevante para o Conselho de Classe:',
    placeholder: 'Ex: Turma com alto potencial cognitivo que responde muito bem a projetos práticos. Se mantido o alinhamento com a equipe pedagógica, teremos avanços significativos...',
    required: true,
    order: 1,
  },
];

export const INITIAL_ADMIN_TEAM: User[] = [
  {
    id: 'user-diretora',
    name: 'Ana Paula Machado',
    email: 'anapaula.direcao@escola.pr.gov.br',
    username: 'admin',
    password: '123',
    role: 'diretora',
    position: 'Direção Geral',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-valdirene',
    name: 'Valdirene de Moraes Sperandio',
    email: 'valdirene.direcao@escola.pr.gov.br',
    username: 'valdirene.sperandio',
    password: '123',
    role: 'diretora',
    position: 'Direção Auxiliar',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-carlos',
    name: 'Carlos César Trislchtz',
    email: 'carlos.secretaria@escola.pr.gov.br',
    username: 'carlos.cesar',
    password: '123',
    role: 'diretora',
    position: 'Secretário',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-sergio',
    name: 'Sérgio Rodrigo dos Santos',
    email: 'sergio.coordenacao@escola.pr.gov.br',
    username: 'sergio.santos',
    password: '123',
    role: 'diretora',
    position: 'Coordenador Técnico',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-lucas',
    name: 'Lucas Matheus Rodrigues dos Santos',
    email: 'lucas.pedagogia@escola.pr.gov.br',
    username: 'lucas.matheus',
    password: '123',
    role: 'diretora',
    position: 'Pedagogo',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-maria-luiza',
    name: 'Maria Luiza Marchi Gouvea',
    email: 'marialuiza.pedagogia@escola.pr.gov.br',
    username: 'maria.luiza',
    password: '123',
    role: 'diretora',
    position: 'Pedagoga',
    createdAt: '2026-02-01',
  },
  {
    id: 'admin-cleidi',
    name: 'Cleidi Aparecida Deo',
    email: 'cleidi.pedagogia@escola.pr.gov.br',
    username: 'cleidi.deo',
    password: '123',
    role: 'diretora',
    position: 'Pedagoga',
    createdAt: '2026-02-01',
  },
];

export const INITIAL_USERS: User[] = [
  ...INITIAL_ADMIN_TEAM,
  {
    id: 'prof-carlos',
    name: 'Carlos Eduardo Souza',
    email: 'carlos.matematica@escola.pr.gov.br',
    username: 'Carlos Eduardo Souza',
    password: '123',
    role: 'professor',
    subject: 'Matemática',
    classes: ['6º Ano A', '7º Ano B', '8º Ano A', '9º Ano A'],
    createdAt: '2026-02-05',
  },
  {
    id: 'prof-ana',
    name: 'Ana Paula Oliveira',
    email: 'ana.portugues@escola.pr.gov.br',
    username: 'Ana Paula Oliveira',
    password: '123',
    role: 'professor',
    subject: 'Língua Portuguesa',
    classes: ['6º Ano A', '7º Ano B', '8º Ano A'],
    createdAt: '2026-02-05',
  },
  {
    id: 'prof-roberto',
    name: 'Roberto Silva Lima',
    email: 'roberto.ciencias@escola.pr.gov.br',
    username: 'Roberto Silva Lima',
    password: '123',
    role: 'professor',
    subject: 'Ciências da Natureza',
    classes: ['6º Ano A', '7º Ano B'],
    createdAt: '2026-02-10',
  },
];

export const AVAILABLE_CLASSES = [
  '6º Ano A',
  '6º Ano B',
  '7º Ano A',
  '7º Ano B',
  '8º Ano A',
  '8º Ano B',
  '9º Ano A',
  '9º Ano B',
  '1º Ano EM',
  '2º Ano EM',
  '3º Ano EM',
];

export const AVAILABLE_TRIMESTERS = [
  '1º Trimestre',
  '2º Trimestre',
  '3º Trimestre',
];

export const AVAILABLE_SUBJECTS = [
  'Língua Portuguesa',
  'Matemática',
  'Ciências da Natureza',
  'História',
  'Geografia',
  'Arte',
  'Educação Física',
  'Língua Inglesa',
  'Ensino Religioso',
  'Projeto de Vida',
  'Tecnologia e Inovação',
];

export const INITIAL_SUBJECTS: SchoolSubject[] = AVAILABLE_SUBJECTS.map(
  (name, idx) => ({
    id: `sub-${idx + 1}`,
    name,
    createdAt: '2026-02-01',
  })
);

export const INITIAL_REPORTS: PreCouncilReport[] = [];
