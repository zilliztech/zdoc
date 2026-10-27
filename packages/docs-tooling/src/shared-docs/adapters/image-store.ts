import type { ImageStore } from './types'
import { SharedImageUploader } from '../../lark/sharedImageUploader.js'

/** An accepted image manifest binds the WP0 digest-only interface to immutable keys. */
export class AcceptedImageStore implements ImageStore {
  constructor(private readonly group: string, private readonly key: string, private readonly uploader: SharedImageUploader) {}
  upload(sha256: string, bytes: Uint8Array): Promise<string> {
    return this.uploader.upload({group: this.group, key: this.key, sha256, bytes})
  }
}
