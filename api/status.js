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

      // Percorre as mensagens de trás para frente procurando o conteúdo
      for (let i = outputs.length - 1; i >= 0; i--) {
        const msg = outputs[i];

        if (msg.role === 'assistant' && msg.content && msg.content.length > 0) {
          // Procura primeiro por arquivo (documento gerado)
          const fileContent = msg.content.find(c => c.type === 'output_file');
          if (fileContent && fileContent.fileUrl) {
            fileUrl = fileContent.fileUrl;
          }

          // Procura o texto mais longo (que é o relatório, não as mensagens curtas)
          const textContent = msg.content.find(c => c.type === 'output_text');
          if (textContent && textContent.text) {
            // Se o texto tem mais de 500 caracteres, provavelmente é o relatório
            if (textContent.text.length > 500) {
              resultado = textContent.text;
              break;
            }
            // Se ainda não temos resultado, guarda esse
            if (!resultado) {
              resultado = textContent.text;
            }
          }
        }
      }

      // Se encontrou arquivo, tenta baixar o conteúdo dele
      if (fileUrl && !resultado) {
        try {
          const fileRes = await fetch(fileUrl);
          if (fileRes.ok) {
            resultado = await fileRes.text();
          }
        } catch (e) {
          console.log('Erro ao baixar arquivo:', e);
        }
      }

      // Se ainda não tem resultado, pega qualquer texto disponível
      if (!resultado) {
        for (let i = outputs.length - 1; i >= 0; i--) {
          const msg = outputs[i];
          if (msg.role === 'assistant' && msg.content) {
            const textContent = msg.content.find(c => c.type === 'output_text' && c.text);
            if (textContent) {
              resultado = textContent.text;
              break;
            }
          }
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
