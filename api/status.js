module.exports = async function handler(req, res) {
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
      let allTexts = [];

      // Percorre TODAS as mensagens e coleta tudo
      for (let i = 0; i < outputs.length; i++) {
        const msg = outputs[i];

        if (msg.role === 'assistant' && msg.content && msg.content.length > 0) {
          for (const c of msg.content) {
            if (c.type === 'output_file' && c.fileUrl && !fileUrl) {
              fileUrl = c.fileUrl;
            }
            if (c.type === 'output_text' && c.text) {
              allTexts.push(c.text);
            }
          }
        }
      }

      // PRIORIDADE 1: Arquivo (contém o JSON completo)
      if (fileUrl) {
        try {
          const fileRes = await fetch(fileUrl);
          if (fileRes.ok) {
            const fileText = await fileRes.text();
            if (fileText && fileText.length > 50) {
              resultado = fileText;
            }
          }
        } catch (e) {
          console.log('Erro ao baixar arquivo:', e.message);
        }
      }

      // PRIORIDADE 2: Texto que contém JSON (procura { e } em todos os textos)
      if (!resultado) {
        // Primeiro tenta encontrar um texto individual que contenha JSON
        for (const txt of allTexts) {
          const firstBrace = txt.indexOf('{');
          const lastBrace = txt.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace && (lastBrace - firstBrace) > 100) {
            resultado = txt;
            break;
          }
        }
      }

      // PRIORIDADE 3: Combina todos os textos e tenta extrair JSON
      if (!resultado && allTexts.length > 0) {
        const combined = allTexts.join('\n');
        const firstBrace = combined.indexOf('{');
        const lastBrace = combined.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace && (lastBrace - firstBrace) > 100) {
          resultado = combined.substring(firstBrace, lastBrace + 1);
        } else {
          // Último recurso: pega o texto mais longo
          resultado = allTexts.reduce((a, b) => a.length >= b.length ? a : b, '');
        }
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
