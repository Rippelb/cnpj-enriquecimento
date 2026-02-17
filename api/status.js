module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const MANUS_API_KEY = process.env.MANUS_API_KEY || 'sk-XX1MREgcCgnZzOduoy96fNHckUBbquN6xWjObtI_ms5GSmPNhz1IxHsY0ZCpbEPqEqhmf1xsYBfNsy7Xz4iV1_VvA_qB';
  const MANUS_API_URL = 'https://api.manus.ai/v1';

  // Extrai JSON válido de qualquer texto
  function cleanJSON(text) {
    if (!text || typeof text !== 'string') return null;

    // 1) code fence ```json ... ```
    const fenceMatch = text.match(/```json\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try { JSON.parse(fenceMatch[1].trim()); return fenceMatch[1].trim(); } catch (e) {}
    }

    // 2) parse direto
    try { JSON.parse(text.trim()); return text.trim(); } catch (e) {}

    // 3) extrair de { até }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try { JSON.parse(candidate); return candidate; } catch (e) {}

      // 4) limpa trailing commas e tenta de novo
      const cleaned = candidate
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      try { JSON.parse(cleaned); return cleaned; } catch (e) {}
    }

    return null;
  }

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
            const jsonFromFile = cleanJSON(fileText);
            if (jsonFromFile) {
              resultado = jsonFromFile;
            } else if (fileText && fileText.length > 50) {
              resultado = fileText;
            }
          }
        } catch (e) {
          console.log('Erro ao baixar arquivo:', e.message);
        }
      }

      // PRIORIDADE 2: Tenta extrair JSON válido de cada texto individual
      if (!resultado) {
        for (const txt of allTexts) {
          const jsonFromTxt = cleanJSON(txt);
          if (jsonFromTxt && jsonFromTxt.length > 100) {
            resultado = jsonFromTxt;
            break;
          }
        }
      }

      // PRIORIDADE 3: Combina todos os textos e tenta extrair JSON
      if (!resultado && allTexts.length > 0) {
        const combined = allTexts.join('\n');
        const jsonFromCombined = cleanJSON(combined);
        if (jsonFromCombined && jsonFromCombined.length > 100) {
          resultado = jsonFromCombined;
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
