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

  const PROMPT = `Atue como uma plataforma de inteligência de vendas. Para o(s) CNPJ(s) que fornecerei abaixo, realize um enriquecimento completo seguindo estes critérios:

Dados Cadastrais: Nome da empresa, CNAE principal, Capital Social e Data de Fundação.

Segmento e Nicho: Identifique o setor de atuação com base no Google Meu Negócio e site oficial.

Classificação de Porte: Utilize a régua do BNDES (Micro, Pequena, Média ou Grande).

Nível de Atividade: Analise a presença digital (frequência de posts no Instagram/Facebook e atualizações no site) para classificar como Baixo, Médio ou Alto.

Estimativas (Cálculo Próprio): Estime o número de funcionários e o faturamento anual cruzando Capital Social, CNAE, tempo de mercado e robustez da presença digital.

Canais de Contato: Extraia e-mails (comercial e contábil), WhatsApp e links de redes sociais.

Formato de Saída: Apresente os dados em uma tabela organizada, seguida de uma breve nota explicativa sobre a lógica usada para as estimativas financeiras.

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
