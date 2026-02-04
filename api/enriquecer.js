export default async function handler(req, res) {
  // CORS
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

  const PROMPT = `Gostaria que você atuasse como uma plataforma de inteligência e prospecção de dados para vendas. Para o CNPJ que vou enviar, quero que você enriqueça ele com:
- Nome da empresa
- Segmento (pode ser baseado no google meu negócio)
- CNAE principal
- Porte (baseado em classificação do BNDES)
- Nivel de atividade (baseado em atividade em redes sociais e site)
- Estimativa de funcionários
- Estimativa de faturamento
- Capital social
- Fundação
- Contatos (telefone, email, whatsapp)
- Link de site e redes sociais

Retorne os dados de forma organizada e clara, em formato de texto simples para copiar em um CRM.`;

  try {
    const { cnpj, nome } = req.body;

    if (!cnpj) {
      return res.status(400).json({ error: 'CNPJ obrigatório' });
    }

    const prompt = `${PROMPT}\n\nCNPJ: ${cnpj}${nome ? `\nNome da empresa: ${nome}` : ''}`;

    // Criar task no Manus
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

    // Aguardar resultado (polling)
    for (let i = 0; i < 60; i++) {
      await new Promise(r => setTimeout(r, 5000));

      const checkRes = await fetch(`${MANUS_API_URL}/tasks/${task.id}`, {
        headers: { 'API_KEY': MANUS_API_KEY }
      });

      if (!checkRes.ok) continue;

      const taskStatus = await checkRes.json();

      if (taskStatus.status === 'completed') {
        const resultado = taskStatus.output || taskStatus.result || taskStatus.response || JSON.stringify(taskStatus, null, 2);
        return res.status(200).json({ resultado });
      }

      if (taskStatus.status === 'failed') {
        return res.status(500).json({ error: 'Task falhou no Manus' });
      }
    }

    return res.status(500).json({ error: 'Timeout aguardando Manus' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
