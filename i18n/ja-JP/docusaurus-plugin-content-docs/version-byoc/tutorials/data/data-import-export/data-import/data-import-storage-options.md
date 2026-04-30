---
title: "ストレージオプション | BYOC"
slug: /data-import-storage-options
sidebar_key: data-import-storage-options
sidebar_label: "ストレージオプション"
beta: FALSE
notebook: FALSE
description: "データをインポートする前に、サポートされているクラウドストレージのオプションとそれに対応する URL 形式を理解することが重要です。これにより、検証エラーが発生することなく、リクエストを適切に処理できます。| BYOC"
type: origin
token: TjxAw7lx6iNluBkR4a6czoHpn0f
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - データインポート
  - milvus
  - ストレージオプション

---

import Admonition from '@theme/Admonition';


# ストレージオプション

データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解しておくことが重要です。これにより、リクエストが検証エラーなく正常に処理されるようになります。

## Amazon Simple Storage Service (S3)\{#amazon-simple-storage-service-s3}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, virtual-hosted–style</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<object_name></p></li><li><p><strong>Folder</strong>: <i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, path-style</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<object_name></p></li><li><p><strong>Folder</strong>: <i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: s3://\<bucket_name>/\<object_name></p></li><li><p><strong>Folder</strong>: s3://\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[方法s for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html) を参照してください。

- **必要な権限**

    - `s3:GetObject`

    - `s3:Listバケット`

    - `s3:GetバケットLocation`

    - `kms:Decrypt`

        <Admonition type="info" icon="📘" title="Notes">

        <p>バケットまたはバケット内の特定のアイテムがカスタムKMS IDで暗号化されている場合、認証情報とともにそのKMS IDに対する復号権限を提供する必要があります。</p>

        </Admonition>

- **認証情報の取得**

    データセキュリティ要件に基づき、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます：

    - 長期認証情報を使用して認証する場合は、詳細について [Authenticate using long-term credentials](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html) を参照してください。

    - 短期認証情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

## Google Cloud Storage\{#google-cloud-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSC public URL</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<object_name></p></li><li><p><strong>Folder</strong>: <i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: gs://\<bucket_name>/\<object_name></p></li><li><p><strong>Folder</strong>: gs://\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[Share the object](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object) を参照してください。

- **必要な権限**

    - `storage.objects.get`

    - `storage.objects.list`

- **認証情報の取得**

    データセキュリティ要件に基づき、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます：

    - 長期認証情報を使用して認証する場合は、詳細について [Manage HMAC keys for service accounts](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) を参照してください。

    - 短期認証情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

## Azure Blob Storage\{#azure-blob-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URI Style</strong></p></th>
         <th><p><strong>URI Format</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Azure storage blob URI</strong></p></td>
         <td><ul><li><p><strong>File</strong>: <i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<blob></p></li><li><p><strong>Folder</strong>: <i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<folder>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[Resource URI Syntax](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax) を参照してください。

- **認証情報の取得**

    データセキュリティ要件に基づき、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます：

    - 長期認証情報を使用して認証する場合は、詳細について [View account access keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) を参照してください。

    - 短期認証情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

