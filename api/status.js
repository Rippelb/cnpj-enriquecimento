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

      const taskStatus = await checkRes.json();

      if (taskStatus.status === 'completed') {
        const resultado = taskStatus.output || taskStatus.result || taskStatus.response || JSON.stringify(taskStatus, null, 2);
        return res.status(200).json({ status: 'completed', resultado });
      }

      if (taskStatus.status === 'failed') {
        return res.status(200).json({ status: 'failed', error: 'Task falhou no Manus' });
      }

      return res.status(200).json({ status: 'pending' });

    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
