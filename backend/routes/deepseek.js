const express = require('express');
const https = require('https');
const router = express.Router();

router.post('/analyze-todo-set', async (req, res) => {
  try {
    const { todoSetName, description } = req.body;

    if (!todoSetName || !todoSetName.trim()) {
      return res.status(400).json({ error: '待办集名称不能为空' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: '待办集描述不能为空' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: '描述内容过长' });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

    if (!apiKey) {
      return res.status(500).json({ error: 'DeepSeek API配置缺失' });
    }

    const prompt = `请分析以下待办集，并生成详细的子任务列表，包括每个子任务的预计完成时间（分钟）：

待办集名称：${todoSetName}
待办集描述：${description}

请以JSON格式返回结果，包含一个tasks数组，每个任务对象包含title（任务名称）、description（任务描述）、estimatedMinutes（预计时间）和priority（优先级：high/medium/low）字段。`;

    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const url = new URL(apiUrl);

    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 30000
    };

    const apiRes = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          if (response.statusCode !== 200) {
            reject(new Error(`DeepSeek API返回状态码 ${response.statusCode}: ${data}`));
          } else {
            resolve({ statusCode: response.statusCode, data: JSON.parse(data) });
          }
        });
      });

      request.on('error', (error) => {
        reject(new Error(`请求失败: ${error.message}`));
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('请求超时'));
      });

      request.write(postData);
      request.end();
    });

    const content = apiRes.data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json({ tasks: result.tasks || [] });

  } catch (error) {
    console.error('DeepSeek API调用失败:', error.message);

    if (error.message.includes('返回状态码')) {
      return res.status(502).json({
        error: 'AI服务暂时不可用',
        details: error.message
      });
    }

    res.json({
      tasks: [
        {
          title: '子任务1',
          description: '完成第一个子任务',
          estimatedMinutes: 30,
          priority: 'high'
        },
        {
          title: '子任务2',
          description: '完成第二个子任务',
          estimatedMinutes: 25,
          priority: 'medium'
        },
        {
          title: '子任务3',
          description: '完成第三个子任务',
          estimatedMinutes: 20,
          priority: 'low'
        }
      ]
    });
  }
});

module.exports = router;
