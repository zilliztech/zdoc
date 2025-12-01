---
title: "ストレージオプション | BYOC"
slug: /data-import-storage-options
sidebar_label: "ストレージオプション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、リクエストが検証エラーを経ずに適切に処理されることが保証されます。| BYOC"
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
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG

---

import Admonition from '@theme/Admonition';


# ストレージオプション

データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、リクエストが検証エラーを経ずに適切に処理されることが保証されます。

## Amazon Simple Storage Service (S3)\{#amazon-simple-storage-service-s3}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URI形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWSオブジェクトURL、バーチャルホスト形式</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: <i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<object_name></p></li><li><p><strong>フォルダ</strong>: <i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWSオブジェクトURL、パス形式</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: <i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<object_name></p></li><li><p><strong>フォルダ</strong>: <i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: s3://\<bucket_name>/\<object_name></p></li><li><p><strong>フォルダ</strong>: s3://\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[バケットへのアクセス方法](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html)を参照してください。

- **必要な権限**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

    - `kms:Decrypt`

        <Admonition type="info" icon="📘" title="注意">

        <p>バケットまたはバケット内の特定のアイテムがカスタムKMS IDで暗号化されている場合は、認証資格情報とともにそのKMS IDの復号化権限を提供する必要があります。</p>

        </Admonition>

- **資格情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期資格情報またはセッショントークンのいずれかを使用できます。

    - 長期資格情報を使用して認証する場合は、詳細については[長期資格情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)を参照してください。

    - 短期資格情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

## Google Cloud Storage\{#google-cloud-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URI形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSCパブリックURL</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: <i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<object_name></p></li><li><p><strong>フォルダ</strong>: <i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: gs://\<bucket_name>/\<object_name></p></li><li><p><strong>フォルダ</strong>: gs://\<bucket_name>/\<folder_name>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[オブジェクトの共有](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object)を参照してください。

- **必要な権限**

    - `storage.objects.get`

    - `storage.objects.list`

- **資格情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期資格情報またはセッショントークンのいずれかを使用できます。

    - 長期資格情報を使用して認証する場合は、詳細については[サービスアカウントのHMACキーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を参照してください。

    - 短期資格情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

## Azure Blob Storage\{#azure-blob-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URI形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AzureストレージBlob URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: <i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<blob></p></li><li><p><strong>フォルダ</strong>: <i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<folder>/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[リソースURI構文](https://learn.microsoft.com/ja-jp/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax)を参照してください。

- **資格情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期資格情報またはセッショントークンのいずれかを使用できます。

    - 長期資格情報を使用して認証する場合は、詳細については[アカウントアクセスキーの表示](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)を参照してください。

    - 短期資格情報を使用して認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。
