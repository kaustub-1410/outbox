import { esClient, EMAIL_INDEX_NAME } from '../config/elasticsearch';
import { prisma } from '../config/prisma';

export class SearchService {
  static async indexEmailJob(emailJob: {
    id: string;
    campaignId: string;
    leadId: string;
    recipient: string;
    subject: string;
    body: string;
    status: string;
    sender: string;
    scheduledAt: Date | string;
    sentAt?: Date | string | null;
    createdAt: Date | string;
  }): Promise<void> {
    try {
      await esClient.index({
        index: EMAIL_INDEX_NAME,
        id: emailJob.id,
        document: {
          id: emailJob.id,
          campaignId: emailJob.campaignId,
          leadId: emailJob.leadId,
          recipient: emailJob.recipient,
          subject: emailJob.subject,
          body: emailJob.body,
          status: emailJob.status,
          sender: emailJob.sender,
          scheduledAt: new Date(emailJob.scheduledAt).toISOString(),
          sentAt: emailJob.sentAt ? new Date(emailJob.sentAt).toISOString() : null,
          createdAt: new Date(emailJob.createdAt).toISOString(),
        },
      });
      console.log(`[SearchService] Indexed email job ${emailJob.id} in Elasticsearch.`);
    } catch (error: any) {
      console.warn(`[SearchService] Failed to index email in Elasticsearch (${error.message}).`);
    }
  }

  static async searchEmails(q: string, status?: string, page: number = 1, limit: number = 20) {
    try {
      const from = (page - 1) * limit;
      const mustClauses: any[] = [];

      if (q && q.trim().length > 0) {
        mustClauses.push({
          multi_match: {
            query: q.trim(),
            fields: ['subject^3', 'recipient^2', 'body', 'sender^2'],
            fuzziness: 'AUTO',
          },
        });
      } else {
        mustClauses.push({ match_all: {} });
      }

      if (status) {
        mustClauses.push({ term: { status: status.toUpperCase() } });
      }

      const result = await esClient.search({
        index: EMAIL_INDEX_NAME,
        from,
        size: limit,
        query: {
          bool: {
            must: mustClauses,
          },
        },
        sort: [{ scheduledAt: { order: 'desc' } }],
      });

      const totalHits = typeof result.hits.total === 'number' ? result.hits.total : result.hits.total?.value || 0;
      const items = result.hits.hits.map((hit: any) => hit._source);

      return {
        source: 'elasticsearch',
        total: totalHits,
        page,
        limit,
        items,
      };
    } catch (error: any) {
      console.warn(`[SearchService] Elasticsearch query failed (${error.message}). Falling back to PostgreSQL search.`);

      // PostgreSQL fallback search
      const whereCondition: any = {};
      if (status) {
        whereCondition.status = status.toUpperCase();
      }
      if (q && q.trim().length > 0) {
        const queryTerm = q.trim();
        whereCondition.OR = [
          { subject: { contains: queryTerm, mode: 'insensitive' } },
          { body: { contains: queryTerm, mode: 'insensitive' } },
          { lead: { email: { contains: queryTerm, mode: 'insensitive' } } },
          { sender: { senderEmail: { contains: queryTerm, mode: 'insensitive' } } },
        ];
      }

      const [total, dbJobs] = await Promise.all([
        prisma.emailJob.count({ where: whereCondition }),
        prisma.emailJob.findMany({
          where: whereCondition,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { scheduledAt: 'desc' },
          include: {
            lead: true,
            sender: true,
            campaign: true,
          },
        }),
      ]);

      const items = dbJobs.map((job: any) => ({
        id: job.id,
        campaignId: job.campaignId,
        leadId: job.leadId,
        recipient: job.lead.email,
        subject: job.subject,
        body: job.body,
        status: job.status,
        sender: job.sender.senderEmail,
        scheduledAt: job.scheduledAt.toISOString(),
        sentAt: job.sentAt ? job.sentAt.toISOString() : null,
        createdAt: job.createdAt.toISOString(),
        previewUrl: job.previewUrl,
      }));

      return {
        source: 'postgresql_fallback',
        total,
        page,
        limit,
        items,
      };
    }
  }
}
