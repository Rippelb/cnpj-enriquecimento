module.exports = async function handler(req, res) {
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

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ é obrigatório' });
    }

    // ========== STEP 1: Fetch real data from BrasilAPI ==========
    const cnpjClean = cnpj.replace(/\D/g, '');
    let dadosReais = null;

    try {
      const brasilApiRes = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`);
      if (brasilApiRes.ok) {
        dadosReais = await brasilApiRes.json();
      }
    } catch (e) {
      console.log('BrasilAPI falhou, continuando sem dados reais:', e.message);
    }

    // ========== STEP 2: Format real data for the prompt ==========
    let dadosReaisTexto = '';
    let capitalFormatado = '';
    if (dadosReais) {
      capitalFormatado = dadosReais.capital_social
        ? 'R$ ' + Number(dadosReais.capital_social).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : 'Não informado';

      const endereco = [
        dadosReais.descricao_tipo_de_logradouro,
        dadosReais.logradouro,
        dadosReais.numero,
        dadosReais.complemento,
        dadosReais.bairro,
        dadosReais.municipio,
        dadosReais.uf,
        dadosReais.cep ? ('CEP ' + dadosReais.cep) : ''
      ].filter(Boolean).join(', ');

      const telefone1 = dadosReais.ddd_telefone_1 || '';
      const telefone2 = dadosReais.ddd_telefone_2 || '';
      const telefones = [telefone1, telefone2].filter(Boolean).join(' / ');

      // QSA (Quadro Societário)
      let qsaTexto = '';
      if (dadosReais.qsa && dadosReais.qsa.length > 0) {
        qsaTexto = dadosReais.qsa.map(s =>
          `  - ${s.nome_socio} (${s.qualificacao_socio || 'Sócio'})`
        ).join('\n');
      }

      // CNAEs secundários
      let cnaesSecTexto = '';
      if (dadosReais.cnaes_secundarios && dadosReais.cnaes_secundarios.length > 0) {
        const top5 = dadosReais.cnaes_secundarios.slice(0, 5);
        cnaesSecTexto = top5.map(c => `  - ${c.codigo}: ${c.descricao}`).join('\n');
      }

      dadosReaisTexto = `
## DADOS OFICIAIS DA RECEITA FEDERAL (NÃO ALTERE ESTES DADOS)
Estes dados são REAIS e CONFIRMADOS. Use-os EXATAMENTE como estão no JSON de resposta.

- **Razão Social:** ${dadosReais.razao_social || 'N/A'}
- **Nome Fantasia:** ${dadosReais.nome_fantasia || 'Não informado'}
- **CNPJ:** ${cnpj}
- **Situação Cadastral:** ${dadosReais.descricao_situacao_cadastral || 'N/A'}
- **Data de Início de Atividade:** ${dadosReais.data_inicio_atividade || 'N/A'}
- **Capital Social:** ${capitalFormatado}
- **Porte (Receita Federal):** ${dadosReais.descricao_porte || 'N/A'}
- **Natureza Jurídica:** ${dadosReais.descricao_natureza_juridica || dadosReais.natureza_juridica || 'N/A'}
- **Optante pelo Simples Nacional:** ${dadosReais.opcao_pelo_simples === true ? 'Sim' : dadosReais.opcao_pelo_simples === false ? 'Não' : 'Não informado'}
- **Optante pelo MEI:** ${dadosReais.opcao_pelo_mei === true ? 'Sim' : dadosReais.opcao_pelo_mei === false ? 'Não' : 'Não informado'}
- **CNAE Principal:** ${dadosReais.cnae_fiscal || ''} - ${dadosReais.cnae_fiscal_descricao || 'N/A'}
${cnaesSecTexto ? '- **CNAEs Secundários:**\n' + cnaesSecTexto : ''}
- **Endereço:** ${endereco || 'N/A'}
- **Telefone(s):** ${telefones || 'Não informado'}
- **E-mail:** ${dadosReais.email || 'Não informado'}
${qsaTexto ? '- **Quadro Societário:**\n' + qsaTexto : ''}
`;
    }

    // ========== STEP 3: Build the prompt ==========
    const nomeEmpresa = nome || (dadosReais ? (dadosReais.nome_fantasia || dadosReais.razao_social) : '');

    const PROMPT = `# SISTEMA DE INTELIGÊNCIA E PROSPECÇÃO DE DADOS EMPRESARIAIS

## CONTEXTO
Você é uma plataforma de inteligência comercial. Sua função é COMPLEMENTAR dados cadastrais oficiais com informações de presença digital, reputação e estimativas de porte.

${dadosReais ? dadosReaisTexto : `## DADOS PARA PESQUISA
**CNPJ:** ${cnpj}
${nomeEmpresa ? `**Nome da empresa:** ${nomeEmpresa}` : ''}
IMPORTANTE: Pesquise os dados cadastrais desta empresa em portais como cnpj.biz, casadosdados.com.br, cnpja.com.`}

---

## SUA TAREFA: PESQUISAR E COMPLEMENTAR

Usando o nome "${nomeEmpresa || cnpj}" da empresa, pesquise ATIVAMENTE nas seguintes fontes:

### 1. PRESENÇA DIGITAL (pesquise CADA uma)
- **Site oficial:** Busque o site real da empresa
- **LinkedIn:** Pesquise a página da empresa no LinkedIn. Registre: URL, número de seguidores, número de funcionários registrados
- **Instagram:** Pesquise o perfil. Registre: @handle e URL
- **Facebook:** Pesquise a página. Registre: nome e URL
- **YouTube:** Pesquise o canal. Registre: nome e URL

### 2. REPUTAÇÃO (pesquise CADA uma)
- **Glassdoor:** Pesquise em glassdoor.com.br — nota e número de avaliações
- **Reclame Aqui:** Pesquise em reclameaqui.com.br — status de reputação e nota
- **GPTW:** Pesquise se tem selo Great Place to Work

### 3. SEGMENTO E NICHO
Com base no CNAE (${dadosReais ? dadosReais.cnae_fiscal_descricao || '' : 'a pesquisar'}), no site e no LinkedIn:
- Identifique o **segmento principal** (ex: Tecnologia, Saúde, Varejo, Indústria, Serviços)
- Identifique o **nicho de mercado** específico (ex: "SaaS para RH", "E-commerce de moda", "Consultoria tributária para PMEs")

### 4. ESTIMATIVA DE FUNCIONÁRIOS
${dadosReais && dadosReais.capital_social ? `O capital social REAL é ${capitalFormatado}.` : ''}

**Método OBRIGATÓRIO — cruze NO MÍNIMO 3 indicadores:**

| Indicador | Como usar |
|-----------|-----------|
| LinkedIn | Funcionários registrados × fator do setor (Tech: ×2.0, Indústria: ×3.0, Varejo: ×3.5, Serviços: ×2.5) |
| Vagas abertas | Nº de vagas × 10 a 15 |
| Glassdoor | Avaliações × 3 a 5 |
| Capital Social | Até R$100k→1-20, R$100k-500k→10-50, R$500k-2M→30-100, R$2M-10M→50-200, >R$10M→100+ |
| Site/Notícias | Menções diretas ao tamanho da equipe |

Calcule a MEDIANA dos indicadores, remova outliers.
Range MÁXIMO de 40 unidades. Retorne um valor final único.

### 5. ESTIMATIVA DE FATURAMENTO
Com base nos funcionários estimados e no setor:
- Agências: R$ 80k-150k/funcionário/ano
- Tecnologia/SaaS: R$ 100k-250k/funcionário/ano
- Consultoria: R$ 120k-200k/funcionário/ano
- Varejo: R$ 150k-300k/funcionário/ano
- Indústria: R$ 200k-500k/funcionário/ano

**Classificação BNDES:**
- Microempresa: ≤ R$ 360 mil/ano
- Pequena empresa: > R$ 360 mil e ≤ R$ 4,8 milhões/ano
- Média empresa: > R$ 4,8 milhões e ≤ R$ 300 milhões/ano
- Grande empresa: > R$ 300 milhões/ano

### 6. GOOGLE MAPS E PONTO DE VENDA
- Pesquise o estabelecimento no Google Maps usando nome e endereço
- Retorne o link direto do Google Maps para o local
- Analise as fotos do Google Maps e/ou site: o estabelecimento tem PRODUTOS EXPOSTOS em prateleiras/gôndolas visíveis? (Sim/Não/Não identificado)
- Se for loja física, descreva brevemente o que é possível ver (fachada, tamanho aparente, produtos expostos)

### 7. ANÁLISE DE FIT COM ICP MAVE
A MAVE (mavebr.com) vende: cintas de amarração, catracas para caminhão, cintas de elevação, extensores elásticos, ganchos, toldos de lona, redes de contenção e acessórios para transporte de cargas.

Classifique esta empresa em um dos perfis abaixo:

**PERFIL A — REVENDA (lojas que revendem produtos Mave):**
Ferragens, materiais de construção, acessórios para caminhão, lojas agrícolas ou similares. Critérios: ter produtos expostos, equipe de vendas, e atender clientes que usem o material (transportadoras, indústrias, prestadores de serviço, construção civil).

**PERFIL B — CONSUMIDOR FINAL (transportadoras):**
Transportadoras com mais de 10 caminhões que usem cintas na amarração. Tipos de carroceria que indicam uso: grade baixa, grade alta, sider, florestal, graneleiro, cegonheiro.

**PERFIL C — FORA DO ICP:**
Não se enquadra nos perfis acima.

Retorne: qual perfil (A, B ou C), nível de fit (Alto/Médio/Baixo), e uma justificativa curta.

### 8. RESUMO PARA CRM (TEXTO CORRIDO)
Gere um parágrafo corrido de 4 a 6 linhas, em linguagem profissional e direta, que o closer possa colar no CRM. O texto deve conter:
- Nome fantasia (ou razão social se não houver fantasia)
- Segmento e nicho de atuação
- Porte da empresa (classificação BNDES)
- Estimativa de funcionários e faturamento
- Presença digital resumida (se tem site, LinkedIn ativo, redes sociais)
- Reputação (Glassdoor e/ou Reclame Aqui, se disponíveis)
- Qualquer dado relevante que ajude o closer a abordar a empresa

NÃO use bullet points, listas ou quebras de linha. Escreva tudo como um TEXTO CORRIDO em um único parágrafo. Seja objetivo mas completo.

### 9. INSIGHTS PARA ABORDAGEM
Gere de 3 a 5 insights curtos e inteligentes para ajudar o vendedor na abordagem. Cada insight deve ser uma frase que conecte um dado da empresa com uma vantagem comercial. Exemplos:
- Se empresa tem +10 anos: "Empresa consolidada = valoriza qualidade e parceria de longo prazo"
- Se score digital >= 4: "Alta atividade digital = pesquisa fornecedores online"
- Se Glassdoor >= 4.0: "Boa reputação interna = cultura de qualidade"
- Se faturamento alto: "Capacidade de investimento em novos fornecedores"
- Se LinkedIn forte: "Decisores provavelmente ativos no LinkedIn"
Retorne como array de strings.

### 10. RELATÓRIO PARA O VENDEDOR
Gere um texto corrido de 5 a 8 linhas, focado em AJUDAR O VENDEDOR DA MAVE na abordagem e negociação. O texto deve:
- Dizer se a empresa se encaixa no ICP e por quê
- Indicar que tipos de produtos Mave seriam mais úteis para essa empresa (cintas, catracas, toldos, redes, etc.)
- Se for REVENDA: mencionar se tem produtos expostos, se tem equipe de venda, e que tipo de cliente final ela atende
- Se for TRANSPORTADORA: mencionar tipo de carroceria, quantidade estimada de veículos e demanda potencial
- Sugerir um gancho de abordagem (ex: "pode abordar mencionando a linha de cintas para grade alta")
- Alertar sobre qualquer risco ou objeção provável

NÃO use bullet points. Escreva como TEXTO CORRIDO, direto e prático. O vendedor precisa ler rápido e ir para a ligação.

### 10. SCORE DE ATIVIDADE DIGITAL (1-5)
- 5/5: Posts diários, site moderno, 3+ redes ativas, 10k+ seguidores
- 4/5: Posts semanais, site funcional, 2-3 redes, 5k-10k seguidores
- 3/5: Posts mensais, site básico, 1-2 redes, 1k-5k seguidores
- 2/5: Posts esporádicos, site desatualizado, <1k seguidores
- 1/5: Sem presença digital relevante

---

## FORMATO DE RESPOSTA — JSON OBRIGATÓRIO

Retorne APENAS este JSON, sem texto antes ou depois.
${dadosReais ? 'Os campos de dados cadastrais JÁ ESTÃO preenchidos com dados reais — NÃO ALTERE.' : 'Preencha todos os campos.'}

\`\`\`json
{
  "razao_social": "${dadosReais ? (dadosReais.razao_social || '') : ''}",
  "nome_fantasia": "${dadosReais ? (dadosReais.nome_fantasia || '') : ''}",
  "cnpj": "${cnpj}",
  "data_fundacao": "${dadosReais ? (dadosReais.data_inicio_atividade || '') : ''}",
  "capital_social": "${dadosReais && dadosReais.capital_social ? 'R$ ' + Number(dadosReais.capital_social).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}",
  "situacao_cadastral": "${dadosReais ? (dadosReais.descricao_situacao_cadastral || '') : ''}",
  "optante_simples_nacional": "${dadosReais ? (dadosReais.opcao_pelo_simples === true ? 'Sim' : dadosReais.opcao_pelo_simples === false ? 'Não' : 'Não informado') : 'PESQUISAR'}",
  "optante_mei": "${dadosReais ? (dadosReais.opcao_pelo_mei === true ? 'Sim' : dadosReais.opcao_pelo_mei === false ? 'Não' : 'Não informado') : 'PESQUISAR'}",
  "segmento_principal": "PESQUISAR",
  "nicho_de_mercado": "PESQUISAR",
  "cnae_principal": {
    "codigo": "${dadosReais ? (dadosReais.cnae_fiscal || '') : ''}",
    "descricao": "${dadosReais ? (dadosReais.cnae_fiscal_descricao || '') : ''}"
  },
  "classificacao_porte_bndes": "CALCULAR",
  "faixa_receita_bndes": "CALCULAR",
  "faixa_estimada_funcionarios": "CALCULAR (ex: 80-120)",
  "estimativa_final_funcionarios": "CALCULAR (ex: 95)",
  "estimativa_faturamento_anual": "CALCULAR (ex: R$ 8M - R$ 12M por ano)",
  "estimativa_final_faturamento": "CALCULAR (ex: R$ 10M por ano)",
  "nivel_atividade_digital": {
    "score": "CALCULAR/5",
    "classificacao": "CALCULAR",
    "justificativa": "PESQUISAR"
  },
  "telefone": "${dadosReais ? (dadosReais.ddd_telefone_1 || '') : ''}",
  "email": "${dadosReais ? (dadosReais.email || '') : ''}",
  "site_oficial": "PESQUISAR",
  "instagram": {
    "perfil": "PESQUISAR",
    "url": "PESQUISAR"
  },
  "linkedin": {
    "pagina": "PESQUISAR",
    "url": "PESQUISAR",
    "seguidores": "PESQUISAR",
    "funcionarios_registrados": "PESQUISAR"
  },
  "facebook": {
    "pagina": "PESQUISAR",
    "url": "PESQUISAR"
  },
  "youtube": {
    "canal": "PESQUISAR",
    "url": "PESQUISAR"
  },
  "certificacoes": {
    "gptw": "PESQUISAR (Sim / Não / Não encontrado)",
    "outras": []
  },
  "glassdoor": {
    "classificacao": "PESQUISAR",
    "numero_avaliacoes": "PESQUISAR",
    "url": "PESQUISAR"
  },
  "reclame_aqui": {
    "status": "PESQUISAR",
    "nota": "PESQUISAR",
    "url": "PESQUISAR"
  },
  "endereco": "${dadosReais ? [dadosReais.descricao_tipo_de_logradouro, dadosReais.logradouro, dadosReais.numero, dadosReais.complemento, dadosReais.bairro, dadosReais.municipio, dadosReais.uf, dadosReais.cep ? 'CEP ' + dadosReais.cep : ''].filter(Boolean).join(', ') : ''}",
  "calculo_detalhado_funcionarios": {
    "linkedin_bruto": "PESQUISAR",
    "linkedin_ajustado": "CALCULAR",
    "vagas_abertas": "PESQUISAR",
    "glassdoor": "PESQUISAR",
    "capital_social": "${dadosReais && dadosReais.capital_social ? 'R$ ' + Number(dadosReais.capital_social).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' → faixa a calcular' : 'PESQUISAR'}",
    "outras_fontes": "PESQUISAR",
    "mediana_calculada": "CALCULAR",
    "range_final": "CALCULAR"
  },
  "google_maps": {
    "link": "PESQUISAR — URL do Google Maps do estabelecimento",
    "tem_produtos_expostos": "PESQUISAR (Sim / Não / Não identificado)",
    "observacao_local": "PESQUISAR — breve descrição do que é visível (fachada, tamanho, produtos)"
  },
  "analise_icp_mave": {
    "perfil": "CLASSIFICAR (A - Revenda / B - Transportadora / C - Fora do ICP)",
    "nivel_fit": "CLASSIFICAR (Alto / Médio / Baixo)",
    "justificativa": "EXPLICAR por que se encaixa ou não no ICP"
  },
  "resumo_para_crm": "GERAR texto corrido de 4-6 linhas com as informações mais relevantes para o closer colar no CRM",
  "relatorio_vendedor": "GERAR texto corrido de 5-8 linhas com inteligência comercial para o vendedor Mave abordar esta empresa",
  "insights_abordagem": ["GERAR 3-5 insights curtos para abordagem comercial"],
  "metodologia_faturamento": "DESCREVER cálculo usado",
  "nivel_confianca_geral": "Alta / Média / Baixa",
  "fontes_consultadas": [],
  "data_pesquisa": "${new Date().toLocaleDateString('pt-BR')}",
  "observacoes": ""
}
\`\`\`

## REGRAS CRÍTICAS:
1. ${dadosReais ? 'NÃO ALTERE os dados cadastrais oficiais (razão social, CNPJ, capital social, endereço, telefone, email, CNAE, data fundação)' : 'Pesquise dados cadastrais em portais de CNPJ'}
2. Onde está "PESQUISAR" — você DEVE pesquisar ativamente na web
3. Onde está "CALCULAR" — use a metodologia descrita acima
4. NUNCA invente URLs — só retorne URLs que existem de verdade
5. Se não encontrar um dado após pesquisar, use "Não encontrado"
6. Retorne APENAS o JSON, sem texto adicional
7. Para funcionários: SEMPRE mostre o cálculo detalhado
8. LinkedIn NUNCA é o número real — SEMPRE aplique fator de correção (mínimo ×1.8)`;

    // ========== STEP 4: Create Manus task ==========
    const createRes = await fetch(`${MANUS_API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'API_KEY': MANUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: PROMPT,
        temperature: 0.1,
        max_tokens: 5000
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
      message: 'Task criada com sucesso. Use o taskId para consultar o resultado.',
      dadosReaisEncontrados: !!dadosReais
    });

  } catch (e) {
    console.error('Erro no handler:', e);
    return res.status(500).json({ error: e.message });
  }
}
