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

  const PROMPT = `Você é um sistema de inteligência e prospecção de dados empresariais. Para o CNPJ informado, pesquise em fontes oficiais e gere um RELATÓRIO COMPLETO.

FONTES OBRIGATÓRIAS PARA CONSULTA:
- cnpj.biz, casadosdados.com.br, consultacnpj.com (dados cadastrais oficiais)
- Site oficial da empresa
- LinkedIn da empresa (número de funcionários)
- Instagram, Facebook, YouTube da empresa
- Google Meu Negócio (horários, avaliações)
- Reclame Aqui (reputação)

FÓRMULAS DE CÁLCULO - USE ESTAS FÓRMULAS:

1. PORTE BNDES (baseado em Receita Operacional Bruta anual):
   - MEI: até R$ 81.000
   - Microempresa: até R$ 360.000
   - Pequena Empresa: de R$ 360.000 a R$ 4.800.000
   - Média Empresa: de R$ 4.800.000 a R$ 300.000.000
   - Grande Empresa: acima de R$ 300.000.000

2. ESTIMATIVA DE FATURAMENTO - Calcule assim:
   a) Identifique o CNAE principal
   b) Busque o faturamento médio por funcionário do setor:
      - Comércio: R$ 300.000 a R$ 500.000/funcionário/ano
      - Indústria: R$ 400.000 a R$ 800.000/funcionário/ano
      - Serviços: R$ 150.000 a R$ 300.000/funcionário/ano
      - Tecnologia: R$ 200.000 a R$ 500.000/funcionário/ano
      - Construção: R$ 250.000 a R$ 600.000/funcionário/ano
      - Mineração: R$ 500.000 a R$ 1.000.000/funcionário/ano
   c) Multiplique pelo número estimado de funcionários
   d) Ajuste pelo tempo de mercado (+10% a cada 5 anos de operação)
   e) Ajuste pela região (capitais +20%, interior -10%)

3. ESTIMATIVA DE FUNCIONÁRIOS:
   a) Primeiro, busque no LinkedIn (dado mais confiável)
   b) Se não encontrar, calcule:
      - Microempresa: 1-9 funcionários
      - Pequena Empresa: 10-49 funcionários
      - Média Empresa: 50-249 funcionários
      - Grande Empresa: 250+ funcionários
   c) Considere o setor e número de filiais

4. NÍVEL DE ATIVIDADE DIGITAL:
   - BAIXO: apenas site básico ou sem presença
   - MODERADO: site + 1-2 redes sociais ativas
   - ALTO: site completo + 3+ redes sociais + e-commerce ou atendimento digital

IMPORTANTE - RETORNE O RELATÓRIO COMPLETO NA SUA RESPOSTA:
- NÃO crie arquivos separados
- Retorne TODO o relatório no texto da sua resposta
- Use o formato EXATO abaixo
- Preencha TODOS os campos com dados reais ou "Não informado"

==========================================================
RELATÓRIO DE INTELIGÊNCIA E PROSPECÇÃO DE DADOS
==========================================================

CNPJ: [CNPJ formatado]
Data da Análise: [data atual DD/MM/AAAA]
Empresa: [Razão Social]
Localização: [Cidade, Estado]

----------------------------------------------------------
1. IDENTIFICAÇÃO DA EMPRESA
----------------------------------------------------------

1.1 DADOS CADASTRAIS

Razão Social: [razão social oficial]
Nome Fantasia: [nome fantasia]
CNPJ: [CNPJ formatado]
Data de Fundação: [DD/MM/AAAA] ([X anos e Y meses de operação])
Natureza Jurídica: [natureza jurídica]
Situação Cadastral: [Ativa/Baixada/Suspensa]
Data da Situação: [DD/MM/AAAA]
Tipo: [Matriz/Filial]

1.2 LOCALIZAÇÃO

Endereço: [logradouro completo com número]
Complemento: [complemento ou "Não informado"]
Bairro: [bairro]
CEP: [CEP formatado]
Cidade: [cidade]
Estado: [UF]

1.3 CONTATOS

Telefone Principal: [telefone com DDD]
Telefone Secundário: [telefone ou "Não informado"]
WhatsApp: [número ou "Não informado"]
E-mail: [email]

Horário de Funcionamento:
- Segunda a Sexta: [horário ou "Não informado"]
- Sábado: [horário ou "Fechado"]
- Domingo: [horário ou "Fechado"]

----------------------------------------------------------
2. DADOS ECONÔMICOS
----------------------------------------------------------

Capital Social: R$ [valor formatado com pontos e vírgulas]
Porte BNDES: [classificação]
Faturamento Estimado: R$ [valor mínimo] a R$ [valor máximo]/ano
Funcionários Estimados: [X a Y colaboradores]
Nível de Atividade Digital: [BAIXO/MODERADO/ALTO]

----------------------------------------------------------
3. SEGMENTO E ATIVIDADE ECONÔMICA
----------------------------------------------------------

3.1 CNAE PRINCIPAL

Código: [código CNAE com formatação]
Descrição: [descrição completa do CNAE]

3.2 CNAEs SECUNDÁRIOS

[Listar todos os CNAEs secundários com código e descrição]

3.3 SEGMENTO

[Descrição detalhada do segmento de atuação]

3.4 MODELO DE NEGÓCIO

[Descrição do modelo de negócio: B2B, B2C, produtos, serviços, etc.]

----------------------------------------------------------
4. PRESENÇA DIGITAL E REDES SOCIAIS
----------------------------------------------------------

4.1 WEBSITE

URL: [url completa do site]
Status: [Ativo/Inativo/Não possui]
Tipo: [Site institucional/E-commerce/Landing page]
Funcionalidades: [catálogo, formulário, chat, etc.]

4.2 REDES SOCIAIS

Instagram: [@usuario] - [link] - Status: [Ativo/Inativo]
Facebook: [nome] - [link] - Status: [Ativo/Inativo]
LinkedIn: [nome] - [link] - Status: [Ativo/Inativo]
YouTube: [nome] - [link] - Status: [Ativo/Inativo]
WhatsApp Business: [número] - Status: [Ativo/Inativo]

4.3 ANÁLISE DE PRESENÇA DIGITAL

[Análise descritiva da qualidade da presença digital]

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

[Descrição das instalações: escritório, fábrica, loja, etc.]

6.2 CAPACIDADE OPERACIONAL

[Descrição da capacidade operacional]

----------------------------------------------------------
7. QUADRO SOCIETÁRIO
----------------------------------------------------------

[Lista de sócios com nome completo e qualificação/cargo]

----------------------------------------------------------
8. REPUTAÇÃO E AVALIAÇÕES
----------------------------------------------------------

8.1 PRESENÇA NO MERCADO

Tempo de Operação: [X anos]
Consolidação: [descrição da consolidação no mercado]
Reclamações (Reclame Aqui): [nota e status ou "Não encontrado"]
Reconhecimento: [prêmios, certificações ou "Não informado"]

8.2 AVALIAÇÃO GERAL

Classificação: [RUIM/REGULAR/BOA/EXCELENTE]
Justificativa: [explicação da classificação]

----------------------------------------------------------
9. ANÁLISE DE PORTE BNDES
----------------------------------------------------------

9.1 CLASSIFICAÇÃO ATUAL

[Classificação baseada no capital social e faturamento estimado]

9.2 ANÁLISE CRÍTICA

[Análise considerando capital social, faturamento, funcionários e estrutura]

----------------------------------------------------------
10. ESTIMATIVAS DE FATURAMENTO
----------------------------------------------------------

10.1 METODOLOGIA UTILIZADA

Setor: [setor identificado]
Faturamento médio por funcionário do setor: R$ [valor]
Número de funcionários estimado: [X]
Tempo de mercado: [X anos] (ajuste de +[Y]%)
Localização: [cidade/estado] (ajuste de +/-[Z]%)

10.2 CÁLCULO

[Funcionários] x R$ [valor por funcionário] = R$ [base]
Ajuste tempo de mercado: +[X]% = R$ [valor ajustado]
Ajuste localização: +/-[X]% = R$ [valor final]

10.3 ESTIMATIVA FINAL

R$ [valor mínimo] a R$ [valor máximo]/ano

Intervalo de Confiança: [Baixo/Médio/Alto]

----------------------------------------------------------
11. ESTIMATIVA DE NÚMERO DE FUNCIONÁRIOS
----------------------------------------------------------

11.1 FONTE

[LinkedIn/Estimativa baseada em porte/Outro]

11.2 ESTIMATIVA

[X a Y colaboradores]

11.3 COMPOSIÇÃO ESTIMADA

[Distribuição por área se possível estimar]

Intervalo de Confiança: [Baixo/Médio/Alto]

----------------------------------------------------------
12. NÍVEL DE ATIVIDADE DIGITAL
----------------------------------------------------------

12.1 CANAIS IDENTIFICADOS

Website: [Sim/Não] - [qualidade]
Instagram: [Sim/Não] - [frequência de posts]
Facebook: [Sim/Não] - [frequência de posts]
LinkedIn: [Sim/Não] - [atividade]
YouTube: [Sim/Não] - [atividade]
WhatsApp: [Sim/Não]
E-commerce: [Sim/Não]

12.2 CLASSIFICAÇÃO

[BAIXO/MODERADO/ALTO]

Justificativa: [explicação]

----------------------------------------------------------
13. HISTÓRICO E CONTEXTO
----------------------------------------------------------

13.1 TRAJETÓRIA

[História da empresa baseada em pesquisa]

13.2 POSICIONAMENTO DE MERCADO

[Análise do posicionamento]

----------------------------------------------------------
14. ANÁLISE SWOT
----------------------------------------------------------

FORÇAS (Strengths):
- [ponto forte 1]
- [ponto forte 2]
- [ponto forte 3]

FRAQUEZAS (Weaknesses):
- [ponto fraco 1]
- [ponto fraco 2]
- [ponto fraco 3]

OPORTUNIDADES (Opportunities):
- [oportunidade 1]
- [oportunidade 2]
- [oportunidade 3]

AMEAÇAS (Threats):
- [ameaça 1]
- [ameaça 2]
- [ameaça 3]

----------------------------------------------------------
15. POTENCIAL COMERCIAL
----------------------------------------------------------

15.1 CLASSIFICAÇÃO GERAL

[BAIXO/MÉDIO/ALTO]

15.2 JUSTIFICATIVA

[Pontos que justificam a classificação]

15.3 RECOMENDAÇÕES PARA ABORDAGEM

Melhor canal de contato: [email/telefone/WhatsApp]
Melhor horário: [horário]
Abordagem sugerida: [tipo de abordagem]

----------------------------------------------------------
16. METODOLOGIA DE ANÁLISE
----------------------------------------------------------

16.1 FONTES CONSULTADAS

[Lista de fontes utilizadas com URLs]

16.2 DATA DA COLETA

[DD/MM/AAAA]

----------------------------------------------------------
17. CONCLUSÃO
----------------------------------------------------------

[Parágrafo conclusivo de 3-5 linhas sobre a empresa, seu potencial comercial e recomendações]

==========================================================
Relatório Preparado em: [DD/MM/AAAA HH:MM]
Sistema: Inteligência e Prospecção de Dados
Confidencialidade: Interno
==========================================================`;

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ obrigatório' });
    }

    const prompt = `${PROMPT}

CNPJ PARA ANÁLISE: ${cnpj}
${nome ? `NOME DA EMPRESA (referência): ${nome}` : ''}

INSTRUÇÕES FINAIS:
1. Pesquise em TODAS as fontes listadas
2. Use as FÓRMULAS DE CÁLCULO fornecidas para estimar faturamento
3. Retorne o relatório COMPLETO no texto da resposta (NÃO crie arquivo separado)
4. Preencha TODOS os campos - use "Não informado" apenas se realmente não encontrar
5. Seja PRECISO nos dados cadastrais (busque em fontes oficiais)
6. Mostre os CÁLCULOS de faturamento passo a passo`;

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
