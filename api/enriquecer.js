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

## CONTEXTO E OBJETIVO
Você é uma plataforma de inteligência comercial de ALTA PRECISÃO. Sua função é enriquecer dados de empresas brasileiras com MÁXIMA ACURÁCIA. Empresas reais serão prospectadas com base nos seus dados, então PRECISÃO É CRÍTICA.

## INSTRUÇÕES OBRIGATÓRIAS DE PESQUISA

### FASE 1: COLETA DE DADOS - FONTES OBRIGATÓRIAS
Você DEVE pesquisar TODAS estas fontes antes de qualquer estimativa:

**Dados Cadastrais:**
- Base do BNDES/ Portais de consulta CNPJ (casadosdados.com.br, cnpj.biz, consultacnpj.com)
- Dados: razão social, nome fantasia, CNAE, capital social, data fundação, endereço

**Dados de Funcionários (CRÍTICO - usar múltiplas fontes):**
- LinkedIn da empresa (ATENÇÃO: representa apenas 30-50% do real no Brasil)
- Glassdoor Brasil - avaliações e número reportado
- Indeed Brasil - vagas abertas
- Catho / Gupy / Vagas.com - vagas abertas
- Site da empresa - página Carreiras, Equipe, Sobre
- Notícias e entrevistas - menções ao tamanho da equipe

**Presença Digital:**
- Site oficial
- LinkedIn, Instagram, Facebook, YouTube, TikTok
- Google Meu Negócio
- Reclame Aqui

---

### FASE 2: METODOLOGIA DE ESTIMATIVA DE FUNCIONÁRIOS

#### ⚠️ REGRA CRÍTICA:
O número do LinkedIn NUNCA é o número real. No Brasil, tipicamente apenas 30-50% dos funcionários têm perfil vinculado à empresa no LinkedIn.

#### MÉTODO DE CÁLCULO OBRIGATÓRIO:

**PASSO 1 - Colete todos os indicadores:**

| Indicador | Como calcular |
|-----------|---------------|
| LinkedIn Ajustado | Funcionários no LinkedIn × Fator do setor |
| Vagas Abertas | Nº de vagas × 10 a 15 |
| Glassdoor | Avaliações × 3 a 5 (ajustar para atuais) |
| Capital Social | Usar tabela de porte |
| Site/Notícias | Menções diretas ao tamanho |
| Estrutura | Nº de departamentos × 8 a 15 |

**PASSO 2 - Fatores de correção LinkedIn por setor:**
- Tecnologia/Startups: × 1.8 a 2.2
- Agências/Marketing/Publicidade: × 2.0 a 2.5
- Consultoria: × 1.8 a 2.3
- Indústria: × 2.5 a 3.5
- Varejo: × 3.0 a 4.0
- Serviços gerais: × 2.0 a 3.0

**PASSO 3 - Validação por Capital Social:**
- Até R$ 100k: provavelmente 1-20 funcionários
- R$ 100k - R$ 500k: provavelmente 10-50 funcionários
- R$ 500k - R$ 2M: provavelmente 30-100 funcionários
- R$ 2M - R$ 10M: provavelmente 50-200 funcionários
- Acima R$ 10M: provavelmente 100+ funcionários

**PASSO 4 - Cálculo Final:**
1. Liste TODOS os indicadores encontrados
2. Calcule a estimativa de cada um
3. Remova outliers (valores 2x maiores ou menores que a média)
4. Calcule a MEDIANA dos valores restantes
5. Range final = Mediana - 20 até Mediana + 20

**REGRA DE RANGE:** Variação MÁXIMA de 40 unidades.
✅ Correto: "85-125", "95-135", "100-140"
❌ Incorreto: "50-150", "80-200", "100-250"

---

### FASE 3: ESTIMATIVA DE FATURAMENTO

**Método principal - Por funcionário:**
Funcionários estimados × Receita média por funcionário:
- Agências digitais: R$ 80k-150k/funcionário/ano
- Tecnologia/SaaS: R$ 100k-250k/funcionário/ano
- Consultoria: R$ 120k-200k/funcionário/ano
- Varejo: R$ 150k-300k/funcionário/ano
- Indústria: R$ 200k-500k/funcionário/ano

**Classificação de Porte BNDES:**
- Microempresa: ≤ R$ 360 mil/ano
- Pequena empresa: > R$ 360 mil e ≤ R$ 4,8 milhões/ano
- Média empresa: > R$ 4,8 milhões e ≤ R$ 300 milhões/ano
- Grande empresa: > R$ 300 milhões/ano

---

### FASE 4: NÍVEL DE ATIVIDADE DIGITAL

**Score 5/5 (Muito Alto):**
- Posts diários ou quase diários
- Site moderno e atualizado
- 3+ redes sociais ativas
- Mais de 10k seguidores total
- Blog/conteúdo ativo

**Score 4/5 (Alto):**
- Posts semanais
- Site funcional
- 2-3 redes ativas
- 5k-10k seguidores

**Score 3/5 (Médio):**
- Posts quinzenais/mensais
- Site básico
- 1-2 redes
- 1k-5k seguidores

**Score 2/5 (Baixo):**
- Posts esporádicos
- Site desatualizado
- Menos de 1k seguidores

**Score 1/5 (Muito Baixo):**
- Sem presença digital relevante

---

### FASE 5: FORMATO DE RESPOSTA OBRIGATÓRIO

Retorne EXATAMENTE neste formato JSON (sem texto adicional antes ou depois):

\`\`\`json
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
      "linkedin_bruto": "X funcionários encontrados",
      "linkedin_ajustado": "X × fator Y = Z",
      "vagas_abertas": "X vagas → estimativa Y-Z",
      "glassdoor": "X avaliações → estimativa Y-Z",
      "capital_social": "R$ X → faixa Y-Z funcionários",
      "outras_fontes": "",
      "mediana_calculada": "X",
      "range_final": "X-Y"
    },
    "fontes_utilizadas": []
  },
  "estimativa_faturamento": {
    "range": "R$ X - R$ Y por ano",
    "confianca": "Alta/Média/Baixa",
    "metodologia": ""
  },
  "capital_social": "R$ X",
  "data_fundacao": "DD/MM/AAAA",
  "tempo_mercado": "X anos",
  "contatos": {
    "telefones": [],
    "emails": [],
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
  "data_pesquisa": "",
  "observacoes": ""
}
\`\`\`

---

### ⚠️ REGRAS CRÍTICAS - LEIA COM ATENÇÃO:

1. **NUNCA** use o número do LinkedIn diretamente - SEMPRE aplique fator de correção (mínimo × 1.8)

2. **SEMPRE** cruze NO MÍNIMO 3 indicadores diferentes para estimar funcionários

3. **NUNCA** retorne ranges maiores que 40 unidades para funcionários
   - Se a mediana for 100, o range deve ser algo como 80-120 ou 85-125
   - NUNCA 50-150 ou 60-200

4. **SEMPRE** mostre o cálculo detalhado no campo "calculo_detalhado"

5. **SEMPRE** pesquise em fontes reais - não invente dados

6. Se encontrar dado OFICIAL (ex: "empresa tem 100 funcionários" em entrevista), use como ÂNCORA principal

7. **SEMPRE** retorne o JSON completo, mesmo que alguns campos fiquem como "Não encontrado"

8. Nível de confiança:
   - **Alta**: 4+ fontes concordam, dados oficiais encontrados
   - **Média**: 2-3 fontes, algumas estimativas
   - **Baixa**: poucas fontes, majoritariamente estimado

9. **IMPORTANTE**: Retorne APENAS o JSON, sem explicações antes ou depois

---

### EXEMPLO DE CÁLCULO CORRETO:

Empresa: Agência de Marketing Digital
LinkedIn: 42 funcionários listados

**Cálculo:**
- LinkedIn ajustado: 42 × 2.3 (fator agência) = 97
- Vagas abertas (5 vagas): 5 × 12 = 60
- Glassdoor (25 avaliações): 25 × 4 = 100 (histórico) → ~80-90 atuais
- Capital social R$ 800k: indica 30-100 funcionários
- Site menciona "8 times especializados": 8 × 12 = ~96

**Valores:** 97, 60, 85, 65, 96
**Removendo outlier (60):** 97, 85, 65, 96
**Mediana:** ~91
**Range final:** 75-115 (variação de 40)

AGORA PESQUISE O CNPJ FORNECIDO E RETORNE O JSON COMPLETO.`;

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    // Monta o prompt final
    const promptFinal = `${PROMPT}

---

## DADOS PARA PESQUISA:
**CNPJ:** ${cnpj}
${nome ? `**Nome da empresa (referência):** ${nome}` : ''}

Pesquise AGORA todas as fontes listadas e retorne o JSON completo com os dados desta empresa.`;

    // Cria a task no Manus
    const createRes = await fetch(`${MANUS_API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'API_KEY': MANUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: promptFinal,
        // Configurações adicionais para melhor precisão
        temperature: 0.2,  // Baixa temperature para respostas mais consistentes
        max_tokens: 4000   // Espaço suficiente para resposta completa
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error('Erro Manus API:', err);
      return res.status(500).json({ error: `Erro ao criar task: ${err}` });
    }

    const task = await createRes.json();
    const taskId = task.id || task.task_id || task.taskId;
    
    return res.status(200).json({ 
      taskId: taskId,
      message: 'Task criada com sucesso. Use o taskId para consultar o resultado.'
    });

  } catch (e) {
    console.error('Erro no handler:', e);
    return res.status(500).json({ error: e.message });
  }
}
