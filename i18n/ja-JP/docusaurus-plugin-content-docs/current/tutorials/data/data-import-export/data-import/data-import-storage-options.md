---
title: "ストレージオプション | Cloud"
slug: /data-import-storage-options
sidebar_label: "ストレージオプション"
beta: FALSE
notebook: FALSE
description: "データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、検証エラーを起こすことなくリクエストを適切に処理できます。 | Cloud"
type: origin
token: LlsEwBCeZiMSFIkXJdpcaJKSneb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - storage options
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN

---

import Admonition from '@theme/Admonition';


# ストレージオプション

データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、検証エラーを起こすことなくリクエストを適切に処理できます。

## AWS簡易ストレージサービス(S3){#aws-simple-storage-service-s3}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, virtual-hosted–style</strong></p></td>
         <td><p><code>https://bucket-name.s3.region-code.amazonaws.com/object-name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, path-style</strong></p></td>
         <td><p><code>https://s3.region-code.amazonaws.com/bucket-name/object-name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><p><code>s3://bucket-name/object-name</code></p></td>
       </tr>
    </table>

    詳細については、[バケットへのアクセス方法を](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html)参照してください。

- **必要な権限**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

- **クレデンシャル取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期的な資格情報を使用して認証する場合は、詳細については、[長期的な資格情報を使用](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)した認証を参照してください。

    - セッショントークンで認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)を参照してください。

## Google Cloudストレージ{#google-cloud-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSC public URL</strong></p></td>
         <td><p><code>https://storage.googleapis.com/bucket_name/object_name</code></p></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><p><code>gs://bucket_name/object_name</code></p></td>
       </tr>
    </table>

    詳細については、[オブジェクトの共有を](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object)参照してください。

- **必要な権限**

    - `storage.objects.get`

    - `storage.objects.list`

- **クレデンシャル取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期的な資格情報で認証する場合は、[サービスアカウントのHMACキーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を参照してください。

    - セッショントークンで認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)を参照してください。

## Azure Blobストレージ{#azure-blob-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Azure storage blob URI</strong></p></td>
         <td><p><code>https://myaccount.blob.core.windows.net/bucket-name/object_name</code></p></td>
       </tr>
    </table>

    詳細については、[リソースURI構文](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax)を参照してください。

- **クレデンシャル取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期的な認証情報で認証する場合は、詳細については「[アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)」を参照してください

    - セッショントークンで認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)を参照してください。

