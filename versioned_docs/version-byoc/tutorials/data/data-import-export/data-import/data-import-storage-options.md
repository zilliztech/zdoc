---
title: "Storage Options | BYOC"
slug: /data-import-storage-options
sidebar_label: "Storage Options"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Before importing data, it's important to understand the supported cloud storage options and their corresponding URL formats. This ensures that your requests can be properly processed without undergoing validation errors. | BYOC"
type: origin
token: TjxAw7lx6iNluBkR4a6czoHpn0f
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - storage options
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';


# Storage Options

Before importing data, it's important to understand the supported cloud storage options and their corresponding URL formats. This ensures that your requests can be properly processed without undergoing validation errors.

## Amazon Simple Storage Service (S3){#amazon-simple-storage-service-s3}

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, virtual-hosted–style</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;object_name&gt;</p></li><li><p><strong>Folder</strong>: <i>http</i>s://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, path-style</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>Folder</strong>: <i>http</i>s://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: s3://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>Folder</strong>: s3://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
    </table>

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- **Required permissions**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

    - `kms:Decrypt`

        <Admonition type="info" icon="📘" title="Notes">

        <p>If your bucket or specific items in the bucket are encrypted with a custom KMS ID, you must provide decryption permissions for that KMS ID along with the authentication credentials.</p>

        </Admonition>

- **Credential acquisition**

    Based on your data security requirements, you can use either long-term credentials or session tokens during data import:

    - If you prefer to authenticate with long-term credentials, read [Authenticate using long-term credentials](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html) for details.

    - If you prefer to authenticate with short-term credentials, refer to [this FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service).

## Google Cloud Storage{#google-cloud-storage}

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSC public URL</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://storage.cloud.google.com/&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>Folder</strong>: <i>http</i>s://storage.cloud.google.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: gs://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>Folder</strong>: gs://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
    </table>

    For more details, see [Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object).

- **Required permissions**

    - `storage.objects.get`

    - `storage.objects.list`

- **Credential acquisition**

    Based on your data security requirements, you can use either long-term credentials or session tokens during data import:

    - If you prefer to authenticate with long-term credentials, read [Manage HMAC keys for service accounts](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) for details.

    - If you prefer to authenticate with short-term credentials, refer to [this FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service).

## Azure Blob Storage{#azure-blob-storage}

- **Object access URIs**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Azure storage blob URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://&lt;storage_account&gt;.blob.core.windows.net/&lt;container&gt;/&lt;blob&gt;</p></li><li><p><strong>Folder</strong>: <i>http</i>s://&lt;storage_account&gt;.blob.core.windows.net/&lt;container&gt;/&lt;folder&gt;/</p></li></ul></td>
       </tr>
    </table>

    For more details, see [Resource URI Syntax](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax).

- **Credential acquisition**

    Based on your data security requirements, you can use either long-term credentials or session tokens during data import:

    - If you prefer to authenticate with long-term credentials, read [View account access keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) for details

    - If you prefer to authenticate with short-term credentials, refer to [this FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service).

