export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const MANUS_API_KEY = process.env.MANUS_API_KEY || 'sk-XX1MREgcCgnZzOduoy96fNHckUBbquN6xWjObtI_ms5GSmPNhz1IxHsY0ZCpbEPqEqhmf1xsYBfNsy7Xz4iV1_VvA_qB';
  const MANUS_API_URL = 'https://api.manus.ai/v1';

  const PROMPT = `Você é um sistema de inteligência e prospecção de dados empresariais. Para o CNPJ informado, pesquise em fontes oficiais (cnpj.biz, casadosdados.com.br, consultacnpj.com, site oficial da empresa, LinkedIn, Instagram, Facebook, Google) e gere um RELATÓRIO COMPLETO no formato abaixo.

IMPORTANTE:
- Busque dados REAIS em fontes oficiais
- Para estimativas (faturamento, funcionários), use metodologia baseada no setor e porte
- Se não encontrar uma informação, deixe "Não informado"
- Mantenha EXATAMENTE o formato abaixo

==========================================================
RELATÓRIO DE INTELIGÊNCIA E PROSPECÇÃO DE DADOS
==========================================================

CNPJ: [CNPJ formatado]
Data da Análise: [data atual]
Empresa: [Razão Social]
Localização: [Cidade, Estado]

----------------------------------------------------------
1. IDENTIFICAÇÃO DA EMPRESA
----------------------------------------------------------

1.1 DADOS CADASTRAIS

Razão Social: [razão social oficial]
Nome Fantasia: [nome fantasia]
CNPJ: [CNPJ formatado]
Data de Fundação: [data] ([X anos, Y meses de operação])
Natureza Jurídica: [natureza jurídica]
Situação Cadastral: [Ativa/Baixada/Suspensa]
Data da Situação: [data]
Tipo: [Matriz/Filial]

1.2 LOCALIZAÇÃO

Endereço: [logradouro completo]
Número: [número]
Complemento: [complemento]
Bairro: [bairro]
CEP: [CEP]
Cidade: [cidade]
Estado: [UF]

1.3 CONTATOS

Telefone Principal: [telefone]
Telefone Secundário: [telefone]
WhatsApp: [whatsapp]
E-mail: [email]

Horário de Funcionamento:
- Segunda a Sexta: [horário]
- Sábado: [horário ou Fechado]
- Domingo: [horário ou Fechado]

----------------------------------------------------------
2. DADOS ECONÔMICOS
----------------------------------------------------------

Capital Social: R$ [valor]
Porte BNDES: [MEI/Microempresa/Pequena Empresa/Média Empresa/Grande Empresa]
Faturamento Estimado: R$ [valor mínimo] a R$ [valor máximo]/ano
Funcionários Estimados: [X a Y colaboradores]
Nível de Atividade Digital: [BAIXO/MODERADO/ALTO]

----------------------------------------------------------
3. SEGMENTO E ATIVIDADE ECONÔMICA
----------------------------------------------------------

3.1 CNAE PRINCIPAL

Código: [código CNAE]
Descrição: [descrição completa]

3.2 CNAEs SECUNDÁRIOS

[Lista de CNAEs secundários com código e descrição]

3.3 SEGMENTO

[Descrição do segmento de atuação]

3.4 MODELO DE NEGÓCIO

[Descrição do modelo de negócio da empresa]

----------------------------------------------------------
4. PRESENÇA DIGITAL E REDES SOCIAIS
----------------------------------------------------------

4.1 WEBSITE

URL: [url do site]
Status: [Ativo/Inativo]
Tipo: [Site institucional/E-commerce/Landing page]
Funcionalidades: [lista de funcionalidades]

4.2 REDES SOCIAIS

Instagram: [@ e link] - Status: [Ativo/Inativo]
Facebook: [nome e link] - Status: [Ativo/Inativo]
LinkedIn: [nome e link] - Status: [Ativo/Inativo]
YouTube: [nome e link] - Status: [Ativo/Inativo]
WhatsApp Business: [número] - Status: [Ativo/Inativo]

4.3 ANÁLISE DE PRESENÇA DIGITAL

[Análise descritiva da presença digital]

Classificação: [BAIXO/MODERADO/ALTO]

----------------------------------------------------------
5. PRODUTOS E SERVIÇOS
----------------------------------------------------------

5.1 PRODUTOS PRINCIPAIS

[Lista numerada dos principais produtos]

5.2 SERVIÇOS

[Lista dos serviços oferecidos]

----------------------------------------------------------
6. ESTRUTURA OPERACIONAL
----------------------------------------------------------

6.1 INSTALAÇÕES

[Descrição das instalações]

6.2 CAPACIDADE OPERACIONAL

[Descrição da capacidade operacional]

----------------------------------------------------------
7. QUADRO SOCIETÁRIO
----------------------------------------------------------

[Lista de sócios com nome e qualificação]

----------------------------------------------------------
8. REPUTAÇÃO E AVALIAÇÕES
----------------------------------------------------------

8.1 PRESENÇA NO MERCADO

Tempo de Operação: [X anos]
Consolidação: [descrição]
Reclamações: [informações sobre reclamações]
Reconhecimento: [prêmios, certificações]

8.2 AVALIAÇÃO GERAL

[Classificação: RUIM/REGULAR/BOA/EXCELENTE]
[Justificativa]

----------------------------------------------------------
9. ANÁLISE DE PORTE BNDES
----------------------------------------------------------

9.1 CLASSIFICAÇÃO ATUAL

[Classificação baseada no capital social]

9.2 ANÁLISE CRÍTICA

[Análise considerando outros fatores além do capital social]

----------------------------------------------------------
10. ESTIMATIVAS DE FATURAMENTO
----------------------------------------------------------

10.1 METODOLOGIA

[Descrição da metodologia utilizada]

10.2 ESTIMATIVA

R$ [valor mínimo] a R$ [valor máximo]/ano

10.3 JUSTIFICATIVA

[Pontos que justificam a estimativa]

Intervalo de Confiança: [Baixo/Médio/Alto]

----------------------------------------------------------
11. ESTIMATIVA DE NÚMERO DE FUNCIONÁRIOS
----------------------------------------------------------

11.1 METODOLOGIA

[Descrição da metodologia]

11.2 ESTIMATIVA

[X a Y colaboradores]

11.3 COMPOSIÇÃO ESTIMADA

[Distribuição por área/departamento]

Intervalo de Confiança: [Baixo/Médio/Alto]

----------------------------------------------------------
12. NÍVEL DE ATIVIDADE DIGITAL
----------------------------------------------------------

12.1 CANAIS IDENTIFICADOS

[Tabela/lista de canais com status]

12.2 ANÁLISE DE ENGAJAMENTO

[Análise do engajamento em cada canal]

12.3 CLASSIFICAÇÃO

[BAIXO/MODERADO/ALTO]

Justificativa: [pontos que justificam]

----------------------------------------------------------
13. HISTÓRICO E CONTEXTO
----------------------------------------------------------

13.1 TRAJETÓRIA

[História da empresa]

13.2 POSICIONAMENTO DE MERCADO

[Análise do posicionamento]

13.3 EVOLUÇÃO

[Timeline de eventos importantes]

----------------------------------------------------------
14. ANÁLISE SWOT
----------------------------------------------------------

FORÇAS (Strengths):
[Lista de pontos fortes]

FRAQUEZAS (Weaknesses):
[Lista de pontos fracos]

OPORTUNIDADES (Opportunities):
[Lista de oportunidades]

AMEAÇAS (Threats):
[Lista de ameaças]

----------------------------------------------------------
15. POTENCIAL COMERCIAL
----------------------------------------------------------

15.1 CLASSIFICAÇÃO GERAL

[BAIXO/MÉDIO/ALTO]

15.2 JUSTIFICATIVA

[Pontos que justificam a classificação]

15.3 RECOMENDAÇÕES PARA ABORDAGEM

[Recomendações para contato comercial]

----------------------------------------------------------
16. METODOLOGIA DE ANÁLISE
----------------------------------------------------------

16.1 FONTES DE DADOS

[Lista de fontes utilizadas]

16.2 CÁLCULOS UTILIZADOS

[Descrição dos métodos de cálculo]

16.3 INTERVALOS DE CONFIANÇA

[Descrição dos intervalos para cada estimativa]

----------------------------------------------------------
17. CONCLUSÃO
----------------------------------------------------------

[Parágrafo conclusivo sobre a empresa, seu potencial e recomendações]

==========================================================
Relatório Preparado em: [data]
Analista: Sistema de Inteligência e Prospecção de Dados
Confidencialidade: Interno
==========================================================`;

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ obrigatório' });
    }

    const prompt = `${PROMPT}\n\nCNPJ para análise: ${cnpj}${nome ? `\nNome da empresa (referência): ${nome}` : ''}\n\nGere o relatório completo seguindo EXATAMENTE o formato acima. Pesquise em todas as fontes disponíveis para obter dados precisos.`;

    const createRes = await fetch(`${MANUS_API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'API_KEY': MANUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return res.status(500).json({ error: `Erro ao criar task: ${err}` });
    }

    const task = await createRes.json();
    return res.status(200).json({ taskId: task.id || task.task_id || task.taskId });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
