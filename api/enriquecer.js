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

  const PROMPT = `Gostaria que você atuasse como uma plataforma de inteligência e prospecção de dados para vendas. Para cada CNPJ que eu enviar para você, quero que você enriqueça ele com:
-Nome da empresa
-Segmento (pode ser baseado no google meu negócio)
-CNAE principal
-Porte (baseado em classificação do BNDES - https://www.bndes.gov.br/wps/portal/site/home/financiamento/guia/porte-de-empresa)
-Nivel de atividade (baseado em atividade em redes sociais e site)
-Estimativa de funcionários
-Estimativa de faturamento
-Capital social
-Fundação
-Contatos
-Link de site e redes sociais

ESTIMATIVA DE FUNCIONÁRIOS - NÃO USE APENAS O LINKEDIN:
O LinkedIn geralmente mostra números desatualizados ou incorretos. Estime o número de funcionários cruzando:
1. Capital Social (empresas com capital maior tendem a ter mais funcionários)
2. Tempo de mercado (empresas mais antigas tendem a ter crescido)
3. Número de filiais/unidades
4. Porte da empresa (BNDES)
5. Setor de atuação (indústria/mineração tem mais funcionários que comércio)
6. Estrutura operacional visível (fábrica, frota, etc.)

Use o LinkedIn apenas como referência, não como fonte única.

Para o FATURAMENTO ANUAL, use esta fórmula:
Faturamento = (Funcionários × Ticket do setor) × Fator
- Funcionários: use o número que você ESTIMOU
- Ticket: faturamento médio por funcionário do setor (pesquise)
- Fator: ajuste entre 0.8 e 1.2

Mostre o cálculo do faturamento.

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
