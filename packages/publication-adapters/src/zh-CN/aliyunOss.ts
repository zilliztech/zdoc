import type {PublicationAdapter, PublicationContext} from '../types.ts';

export const ZH_CN_ALIYUN_OSS_ID = 'zh-CN.aliyun-oss';

export interface AliyunOssValidator {
  validatePublication(root: string, context: PublicationContext): Promise<void>;
}

export function createZhCnAliyunOssAdapter(validator: AliyunOssValidator): PublicationAdapter {
  if (!validator || typeof validator.validatePublication !== 'function') {
    throw new Error('zh-CN Aliyun OSS validator injection is required');
  }
  return Object.freeze({
    id: ZH_CN_ALIYUN_OSS_ID,
    transformDocument: document => document,
    async validatePublication(root, context) {
      if (context.site === 'zh-CN') await validator.validatePublication(root, context);
    },
  });
}
