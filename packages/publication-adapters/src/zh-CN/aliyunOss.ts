import type {PublicationAdapter, PublicationContext} from '../types.ts';

export const ZH_CN_ALIYUN_OSS_ID = 'zh-CN.aliyun-oss';

export interface AliyunOssStorage {
  validateOrPublish(root: string, context: PublicationContext): Promise<void>;
}

export function createZhCnAliyunOssAdapter(storage: AliyunOssStorage): PublicationAdapter {
  if (!storage || typeof storage.validateOrPublish !== 'function') {
    throw new Error('zh-CN Aliyun OSS storage injection is required');
  }
  return Object.freeze({
    id: ZH_CN_ALIYUN_OSS_ID,
    transformDocument: document => document,
    async validatePublication(root, context) {
      if (context.site === 'zh-CN') await storage.validateOrPublish(root, context);
    },
  });
}
