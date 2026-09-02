import { Client } from '@elastic/elasticsearch';
import { env } from './env';

export const esClient = new Client({
  node: env.ELASTICSEARCH_URL,
  maxRetries: 3,
  requestTimeout: 5000,
});

export const EMAIL_INDEX_NAME = 'emails';

export async function initElasticsearch(): Promise<void> {
  try {
    const ping = await esClient.ping();
    console.log('[Elasticsearch] Ping response:', ping);

    const indexExists = await esClient.indices.exists({ index: EMAIL_INDEX_NAME });
    if (!indexExists) {
      await esClient.indices.create({
        index: EMAIL_INDEX_NAME,
        body: {
          mappings: {
            properties: {
              id: { type: 'keyword' },
              campaignId: { type: 'keyword' },
              leadId: { type: 'keyword' },
              recipient: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              subject: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              body: { type: 'text' },
              status: { type: 'keyword' },
              sender: { type: 'text', fields: { keyword: { type: 'keyword' } } },
              scheduledAt: { type: 'date' },
              sentAt: { type: 'date' },
              createdAt: { type: 'date' },
            },
          },
        },
      });
      console.log(`[Elasticsearch] Index '${EMAIL_INDEX_NAME}' created successfully.`);
    } else {
      console.log(`[Elasticsearch] Index '${EMAIL_INDEX_NAME}' already exists.`);
    }
  } catch (error: any) {
    console.warn('[Elasticsearch] Warning - Failed to initialize index:', error.message);
    console.warn('[Elasticsearch] Search features will fallback gracefully if service is unreachable.');
  }
}
