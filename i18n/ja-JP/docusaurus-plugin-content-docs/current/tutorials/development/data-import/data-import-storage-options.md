---
title: "ストレージオプション | Cloud"
slug: /data-import-storage-options
sidebar_label: "ストレージオプション"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データをインポートする前に、サポートされているクラウドストレージのオプションと対応する URL 形式を理解しておくことが重要です。これにより、検証エラーが発生することなく、リクエストを適切に処理できます。 | Cloud"
type: origin
token: TjxAw7lx6iNluBkR4a6czoHpn0f
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ストレージオプション

データをインポートする前に、サポートされているクラウドストレージのオプションと対応する URL 形式を理解しておくことが重要です。これにより、検証エラーが発生することなく、リクエストを適切に処理できます。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定した体験を確保するため、ターゲットクラスターと同じプロバイダーかつ同じリージョンにあるバケットまたは blob container を使用することを推奨します。

</Admonition>

## Amazon Simple Storage Service (S3)\{#amazon-simple-storage-service-s3}

- **オブジェクトアクセス URI**

    <table>
       <tr>
         <th><p><strong>URI スタイル</strong></p></th>
         <th><p><strong>URI 形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, virtual-hosted–style</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: https://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;object_name&gt;</p></li><li><p><strong>フォルダ</strong>: https://&lt;bucket_name&gt;.s3.&lt;region-code&gt;.amazonaws.com/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS Object URL, path-style</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: https://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>フォルダ</strong>: https://s3.&lt;region-code&gt;.amazonaws.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>AWS S3 URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: s3://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>フォルダ</strong>: s3://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[バケットにアクセスする方法](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html) を参照してください。

- **必要な権限**

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

    - `kms:Decrypt`

        <Admonition type="info" icon="📘" title="注意">

        バケットまたはバケット内の特定の項目がカスタム KMS ID で暗号化されている場合は、認証情報とあわせて、その KMS ID に対する復号権限を提供する必要があります。

        </Admonition>

- **認証情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます。

    - 長期認証情報で認証したい場合は、詳細について [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html) を参照してください。

    - 短期認証情報で認証したい場合は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

## Google Cloud Storage\{#google-cloud-storage}

- **オブジェクトアクセス URI**

    <table>
       <tr>
         <th><p><strong>URI スタイル</strong></p></th>
         <th><p><strong>URI 形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>GSC public URL</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: https://storage.cloud.google.com/&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>フォルダ</strong>: https://storage.cloud.google.com/&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
       <tr>
         <td><p><strong>GSC gsutil URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: gs://&lt;bucket_name&gt;/&lt;object_name&gt;</p></li><li><p><strong>フォルダ</strong>: gs://&lt;bucket_name&gt;/&lt;folder_name&gt;/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[オブジェクトを共有する](https://cloud.google.com/storage/docs/discover-object-storage-console#share_the_object) を参照してください。

- **必要な権限**

    - `storage.objects.get`

    - `storage.objects.list`

- **認証情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます。

    - 長期認証情報で認証したい場合は、詳細について [サービスアカウントの HMAC キーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys) を参照してください。

    - 短期認証情報で認証したい場合は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

## Azure Blob Storage\{#azure-blob-storage}

- **オブジェクトアクセス URI**

    <table>
       <tr>
         <th><p><strong>URI スタイル</strong></p></th>
         <th><p><strong>URI 形式</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Azure storage blob URI</strong></p></td>
         <td><ul><li><p><strong>ファイル</strong>: https://&lt;storage_account&gt;.blob.core.windows.net/&lt;container&gt;/&lt;blob&gt;</p></li><li><p><strong>フォルダ</strong>: https://&lt;storage_account&gt;.blob.core.windows.net/&lt;container&gt;/&lt;folder&gt;/</p></li></ul></td>
       </tr>
    </table>

    詳細については、[リソース URI 構文](https://learn.microsoft.com/en-us/rest/api/storageservices/naming-and-referencing-containers--blobs--and-metadata#resource-uri-syntax) を参照してください。

- **認証情報の取得**

    データセキュリティ要件に応じて、データインポート時に長期認証情報またはセッショントークンのいずれかを使用できます。

    - 長期認証情報で認証したい場合は、詳細について [アカウントアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) を参照してください

    - 短期認証情報で認証したい場合は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

