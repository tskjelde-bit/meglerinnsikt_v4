import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Dev-only plugin: API endpoint to save posts.json from admin panel
function savePostsPlugin(): Plugin {
  return {
    name: 'save-posts-api',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.originalUrl || req.url || '');
        if (!url.includes('api/save-posts')) {
          return next();
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const posts = JSON.parse(body);
            const filePath = path.resolve(__dirname, 'public/blog/posts.json');
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(posts, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, count: posts.length }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// Plugin: Forward chat messages to Telegram Bot API
function telegramChatPlugin(): Plugin {
  return {
    name: 'telegram-chat-api',
    configureServer(server) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = (req.originalUrl || req.url || '');
        if (!url.includes('api/send-telegram')) {
          return next();
        }
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Load env inside handler to get fresh values
        const tEnv = loadEnv('development', '.', '');
        const botToken = tEnv.TELEGRAM_BOT_TOKEN;
        const chatId = tEnv.TELEGRAM_CHAT_ID;

        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { name, message, phone } = JSON.parse(body);
            if (!message || !message.trim()) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Message is required' }));
              return;
            }

            const lines = [
              'Ny melding fra Meglerinnsikt',
              '',
              'Navn: ' + (name || 'Anonym'),
              'Telefon: ' + (phone || 'Ikke oppgitt'),
              '',
              'Melding:',
              message
            ];
            const text = lines.join('\n');

            const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'HTML'
              })
            });

            const result = await telegramRes.json();

            if (result.ok) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } else {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Telegram API error', details: result }));
            }
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/meglerinnsikt_v4/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [tailwindcss(), react(), savePostsPlugin(), telegramChatPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
