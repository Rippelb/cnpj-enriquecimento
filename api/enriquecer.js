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

  const PROMPT = `# SISTEMA DE INTELIGÊNCIA E PROSPECÇÃO DE DADOS EMPRESARIAIS

## INSTRUÇÕES OBRIGATÓRIAS

Você é uma plataforma de inteligência comercial especializada em enriquecimento de dados empresariais. Para cada CNPJ fornecido, você DEVE seguir rigorosamente este protocolo:

---

### FASE 1: COLETA DE DADOS OFICIAIS (FONTES PRIMÁRIAS)
Busque OBRIGATORIAMENTE nestas fontes antes de qualquer estimativa:
1. **Receita Federal / Portais de consulta CNPJ** - Dados cadastrais básicos
2. **LinkedIn da empresa** - Funcionários listados (ATENÇÃO: geralmente representa apenas 30-50% do real)
3. **Site oficial da empresa** - Página "Sobre", "Equipe", "Carreiras"
4. **Google Meu Negócio** - Categoria, avaliações
5. **Redes sociais** (Instagram, Facebook, YouTube)
6. **Glassdoor / Indeed / Catho / Gupy** - Vagas abertas, avaliações
7. **Reclame Aqui** - Volume de reclamações
8. **Notícias, releases e entrevistas** - Menções a tamanho da equipe, crescimento
9. **Crunchbase / Econodata / Speedio** (se disponível)

---

### FASE 2: METODOLOGIA DE ESTIMATIVA DE FUNCIONÁRIOS

#### REGRA FUNDAMENTAL:
LinkedIn NUNCA deve ser usado como número final. Em empresas brasileiras, tipicamente apenas 30-50% dos funcionários estão registrados no LinkedIn.

#### MÉTODO DE CÁLCULO CRUZADO (usar TODOS os indicadores disponíveis):

**INDICADOR 1 - LinkedIn Ajustado:**
- Funcionários no LinkedIn × Fator de correção por setor:
  - Tecnologia/Startups: multiplicar por 1.5 a 2.0
  - Agências/Marketing: multiplicar por 2.0 a 2.5
  - Indústria/Varejo: multiplicar por 2.5 a 3.5
  - Serviços gerais: multiplicar por 2.0 a 3.0
- Exemplo: 42 no LinkedIn (agência) → 42 × 2.3 = ~97 estimados

**INDICADOR 2 - Vagas abertas:**
- Empresas tipicamente têm 5-15% de turnover anual
- Se há X vagas abertas constantemente → estimar que empresa tem X × 10 a X × 15 funcionários
- Exemplo: 8 vagas abertas → 80-120 funcionários

**INDICADOR 3 - Avaliações Glassdoor/Indeed:**
- Número de avaliações × 3 a 5 = estimativa de funcionários que já passaram
- Ajustar para funcionários atuais considerando tempo de empresa

**INDICADOR 4 - Capital Social + Setor:**
- Microempresa (até R$ 360k): 1-9 funcionários
- Pequena empresa (até R$ 4,8M): 10-49 funcionários
- Média empresa (até R$ 300M): 50-249 funcionários
- Grande empresa (acima R$ 300M): 250+ funcionários

**INDICADOR 5 - Estrutura física:**
- Buscar informações sobre escritórios, filiais, unidades
- Fotos do Google Maps / Street View do endereço
- Menções em notícias sobre expansão, mudança de sede

**INDICADOR 6 - Volume de clientes/projetos:**
- Buscar cases no site, portfólio
- Estimar capacidade operacional necessária

**INDICADOR 7 - Faturamento estimado ÷ Receita por funcionário do setor:**
- Agências digitais: R$ 80k-150k/funcionário/ano
- Tecnologia: R$ 100k-200k/funcionário/ano
- Varejo: R$ 150k-300k/funcionário/ano
- Indústria: R$ 200k-400k/funcionário/ano

#### CÁLCULO FINAL:
1. Calcule CADA indicador separadamente
2. Descarte outliers (valores muito fora da média)
3. Calcule a MEDIANA dos indicadores restantes
4. Range final = Mediana - 20 até Mediana + 20

**REGRA DE RANGE**: Variação MÁXIMA de 40 unidades.
- Exemplos corretos: "85-125", "95-135", "100-140"
- Exemplos INCORRETOS: "50-150", "80-200"

---

### FASE 3: ESTIMATIVA DE FATURAMENTO

**Método 1 - Por funcionário:**
- Funcionários estimados × Receita média por funcionário do setor

**Método 2 - Por capital social:**
- Capital social × Multiplicador do setor (geralmente 3x a 10x)

**Método 3 - Por volume de atividade:**
- Clientes ativos estimados × Ticket médio do setor

Apresente SEMPRE em faixa: "R$ X milhões - R$ Y milhões/ano"

**Classificação de Porte BNDES** (usar para validação):
- Microempresa: Receita bruta anual ≤ R$ 360 mil
- Pequena empresa: > R$ 360 mil e ≤ R$ 4,8 milhões
- Média empresa: > R$ 4,8 milhões e ≤ R$ 300 milhões
- Grande empresa: > R$ 300 milhões

---

### FASE 4: NÍVEL DE ATIVIDADE DIGITAL
Classifique de 1 a 5:
- **5 (Muito Alto)**: Posts diários, site atualizado, múltiplas redes ativas, blog ativo, mais de 10k seguidores
- **4 (Alto)**: Posts semanais, site funcional, 2-3 redes ativas, 5k-10k seguidores
- **3 (Médio)**: Posts quinzenais/mensais, site básico, 1-2 redes, 1k-5k seguidores
- **2 (Baixo)**: Posts esporádicos, site desatualizado, menos de 1k seguidores
- **1 (Muito Baixo)**: Sem presença digital relevante

---

### FASE 5: FORMATO DE SAÍDA OBRIGATÓRIO
```json
{
  "cnpj": "XX.XXX.XXX/XXXX-XX",
  "razao_social": "",
  "nome_fantasia": "",
  "segmento": "",
  "cnae_principal": {
    "codigo": "",
    "descricao": ""
  },
  "porte_bndes": "",
  "nivel_atividade_digital": {
    "score": "X/5",
    "justificativa": ""
  },
  "estimativa_funcionarios": {
    "range": "X-Y",
    "confianca": "Alta/Média/Baixa",
    "calculo_detalhado": {
      "linkedin_ajustado": "X funcionários no LinkedIn × fator Y = Z",
      "vagas_abertas": "X vagas → estimativa Y-Z",
      "capital_social": "indica porte X → faixa Y-Z funcionários",
      "outros_indicadores": "",
      "mediana_calculada": "X",
      "range_final": "X-Y"
    },
    "fontes_utilizadas": []
  },
  "estimativa_faturamento": {
    "range": "R$ X - R$ Y",
    "confianca": "Alta/Média/Baixa",
    "metodologia": ""
  },
  "capital_social": "",
  "data_fundacao": "",
  "contatos": {
    "telefone": [],
    "email": [],
    "endereco": ""
  },
  "presenca_digital": {
    "site": "",
    "linkedin": "",
    "instagram": "",
    "facebook": "",
    "youtube": "",
    "outros": []
  },
  "fontes_consultadas": [],
  "data_pesquisa": ""
}
```

---

### REGRAS CRÍTICAS:

1. **NUNCA** use o número do LinkedIn diretamente - SEMPRE aplique fator de correção
2. **SEMPRE** cruze NO MÍNIMO 3 indicadores diferentes para estimar funcionários
3. **NUNCA** retorne ranges maiores que 40 unidades para funcionários
4. **SEMPRE** mostre o cálculo detalhado de como chegou na estimativa
5. **SEMPRE** liste as fontes consultadas para cada dado
6. **SEMPRE** indique nível de confiança (Alta/Média/Baixa)
7. Se encontrar dado oficial (ex: entrevista do CEO dizendo "temos 100 funcionários"), USE como âncora principal
8. Se um dado não for encontrado, marque como "Não disponível - requer verificação manual"

---

### EXEMPLO DE RESPOSTA BEM CALIBRADA:

Para uma agência com 42 funcionários no LinkedIn:
```json
"estimativa_funcionarios": {
  "range": "90-130",
  "confianca": "Média",
  "calculo_detalhado": {
    "linkedin_ajustado": "42 funcionários × 2.3 (fator agência) = 97",
    "vagas_abertas": "6 vagas ativas → estimativa 60-90 funcionários",
    "avaliacoes_glassdoor": "28 avaliações × 4 = 112 (já passaram), ~85-100 atuais",
    "capital_social": "R$ 500k indica empresa pequena/média = 50-150",
    "mediana_calculada": "110",
    "range_final": "90-130"
  },
  "fontes_utilizadas": [
    "LinkedIn (42 registrados)",
    "Glassdoor (28 avaliações)",
    "Indeed (6 vagas abertas)",
    "Receita Federal (capital social)",
    "Site institucional (menciona 8 departamentos)"
  ]
}
IMPORTANTE: Retorne o relatório COMPLETO diretamente no texto da sua resposta, não crie arquivos separados.`;

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ obrigatório' });
    }

    const prompt = `${PROMPT}\n\nCNPJ: ${cnpj}${nome ? `\nNome da empresa: ${nome}` : ''}`;

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
