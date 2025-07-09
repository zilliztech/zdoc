---
title: "ストレージオプション | BYOC"
slug: /data-import-storage-options
sidebar_label: "ストレージオプション"
beta: FALSE
notebook: FALSE
description: "データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、検証エラーを起こすことなくリクエストを適切に処理できます。 | BYOC"
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
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss

---

import Admonition from '@theme/Admonition';


# ストレージオプション

データをインポートする前に、サポートされているクラウドストレージオプションとそれに対応するURL形式を理解することが重要です。これにより、検証エラーを起こすことなくリクエストを適切に処理できます。

## AWS簡易ストレージサービス(S 3){#aws-simple-storage-service-s3}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWSオブジェクトのURL、仮想ホスト形式</strong></p></td>
         <td><p><em>https://www. google.co.jp/<bucket_name></em>. s 3.<em><region-code></em>.amazonaws.com/<em><object_name></em></object_name></region-code></bucket_name></p></td>
       </tr>
       <tr>
         <td><p><strong>AWSオブジェクトのURL、パス形式</strong></p></td>
         <td><p><em>https://</em>s 3. com<em><region-code></em>。amazonaws.co<em>m</em>/<em><bucket_name></em>/<em><object_name></em></object_name></bucket_name></region-code></p></td>
       </tr>
       <tr>
         <td><p>AWS S 3のURI</p></td>
         <td><p>s 3://<em><bucket_name></em>/<em><object_name></em></object_name></bucket_name></p></td>
       </tr>
    </table>

    詳細については、[バケットへのアクセス方法](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html)を参照してください。

- **必要な権限**

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

        <Admonition type="info" icon="📘" title="ノート">

        <p>バケットまたはバケット内の特定のアイテムがカスタムKMS IDで暗号化されている場合は、認証資格情報とともにそのKMS IDの復号化権限を提供する必要があります。</p>

        </Admonition>

- **資格の取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期的な資格情報で認証する場合は、詳細については[長期的な資格情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)を参照してください。

    - 短期間の資格情報で認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

## Google Cloudストレージ{#google-cloud-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSCの公開URL</strong></p></td>
         <td><p><em>https://</em>storage.cloud.google.co<em>m</em>/<em><bucket_name></em>/<em><object_name></em></object_name></bucket_name></p></td>
       </tr>
       <tr>
         <td><p><strong>GSCのgsutil URI</strong></p></td>
         <td><p>gs://<em>の設定<bucket_name></em>/<em><object_name></em></object_name></bucket_name></p></td>
       </tr>
    </table>

    詳細については、[オブジェクトを共有する](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object)を参照してください。

- **必要な権限**

    - インラインコードプレースホルダー0

    - インラインコードプレースホルダー0

- **資格の取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期的な資格情報で認証する場合は、詳細については[サービスアカウントのHMACキーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)を参照してください。

    - 短期間の資格情報で認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

## Azure Blobストレージ{#azure-blob-storage}

- **オブジェクトアクセスURI**

    <table>
       <tr>
         <th><p><strong>URIスタイル</strong></p></th>
         <th><p><strong>URIフォーマット</strong></p></th>
       </tr>
       <tr>
         <td><p>Azure Storage BlobのURI</p></td>
         <td><p><em>https://www. google.co.jp/<storage_account></em>.blob.core.windows.net/<em><container></em>/<em><blob></em></blob></container></storage_account></p></td>
       </tr>
    </table>

    詳細については、[リソースURIの構文](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax)を参照してください。

- **資格の取得**

    データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

    - 長期間の資格情報で認証する場合は、詳細については[アカウントのアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)を参照してください。

    - 短期間の資格情報で認証する場合は、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

