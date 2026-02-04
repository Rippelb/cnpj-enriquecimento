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

    const PROMPT = `Você é uma plataforma de inteligência de dados para prospecção B2B. Para o CNPJ informado, busque dados em FONTES OFICIAIS e retorne    
  informações PRECISAS.

  IMPORTANTE - BUSQUE DADOS OFICIAIS:
  1. Acesse sites como: cnpj.biz, casadosdados.com.br, consultacnpj.com, econodata.com.br, speedio.com.br para dados cadastrais oficiais da Receita Federal 
  2. Para contatos, busque no site oficial da empresa e Google Meu Negócio
  3. Para redes sociais, busque diretamente no LinkedIn, Instagram, Facebook
  4. Para número de funcionários, use o LinkedIn da empresa

  DADOS OBRIGATÓRIOS (busque em fontes oficiais):
  - Razão Social (oficial da Receita)
  - Nome Fantasia
  - CNPJ formatado
  - CNAE principal com código e descrição
  - Capital Social (valor exato da Receita Federal)
  - Data de Abertura (data exata)
  - Natureza Jurídica
  - Porte (MEI, ME, EPP, Demais)
  - Situação Cadastral (Ativa, Baixada, etc)
  - Endereço completo (logradouro, número, bairro, cidade, UF, CEP)

  DADOS DE CONTATO (busque no site e Google):
  - Telefones (todos que encontrar)
  - WhatsApp (se disponível)
  - E-mail
  - Site oficial

  REDES SOCIAIS (busque os links reais):
  - LinkedIn
  - Instagram
  - Facebook
  - YouTube (se houver)

  DADOS COMPLEMENTARES:
  - Número de funcionários (do LinkedIn ou estimativa)
  - Quadro societário (nomes dos sócios)
  - Segmento/Ramo de atuação

  FORMATO DE SAÍDA:
  Retorne em texto simples e organizado, pronto para copiar em um CRM.
  NÃO use tabelas markdown. Use apenas texto com quebras de linha.
  Indique "Não encontrado" se não achar algum dado.
  Seja PRECISO - não invente dados, busque nas fontes.`;

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
