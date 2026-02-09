export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MANUS_API_KEY = process.env.MANUS_API_KEY || 'sk-XX1MREgcCgnZzOduoy96fNHckUBbquN6xWjObtI_ms5GSmPNhz1IxHsY0ZCpbEPqEqhmf1xsYBfNsy7Xz4iV1_VvA_qB';
  const MANUS_API_URL = 'https://api.manus.ai/v1';

  try {
    const taskId = req.query.id;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID obrigatório' });
    }

    const checkRes = await fetch(`${MANUS_API_URL}/tasks/${taskId}`, {
      headers: { 'API_KEY': MANUS_API_KEY }
    });

    if (!checkRes.ok) {
      const err = await checkRes.text();
      return res.status(500).json({ error: `Erro ao checar task: ${err}` });
    }

    const taskData = await checkRes.json();

    if (taskData.status === 'completed') {
      const outputs = taskData.output || [];
      let resultado = '';
      let fileUrl = null;
      let longText = '';
      let shortText = '';

      // Percorre as mensagens de trás para frente
      for (let i = outputs.length - 1; i >= 0; i--) {
        const msg = outputs[i];

        if (msg.role === 'assistant' && msg.content && msg.content.length > 0) {
          // Coleta fileUrl se existir
          for (const c of msg.content) {
            if (c.type === 'output_file' && c.fileUrl && !fileUrl) {
              fileUrl = c.fileUrl;
            }
            if (c.type === 'output_text' && c.text) {
              if (c.text.length > 500 && !longText) {
                longText = c.text;
              } else if (!shortText) {
                shortText = c.text;
              }
            }
          }
        }
      }

      // PRIORIDADE 1: Sempre tenta baixar o arquivo primeiro (contém o JSON completo)
      if (fileUrl) {
        try {
          const fileRes = await fetch(fileUrl);
          if (fileRes.ok) {
            const fileText = await fileRes.text();
            // Só usa se tiver conteúdo substancial
            if (fileText && fileText.length > 50) {
              resultado = fileText;
            }
          }
        } catch (e) {
          console.log('Erro ao baixar arquivo:', e.message);
        }
      }

      // PRIORIDADE 2: Texto longo (>500 chars) — provavelmente o relatório inline
      if (!resultado && longText) {
        resultado = longText;
      }

      // PRIORIDADE 3: Texto curto como último recurso
      if (!resultado && shortText) {
        resultado = shortText;
      }

      return res.status(200).json({ status: 'completed', resultado });
    }

    if (taskData.status === 'failed') {
      return res.status(200).json({ status: 'failed', error: 'Task falhou no Manus' });
    }

    return res.status(200).json({ status: 'pending' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
