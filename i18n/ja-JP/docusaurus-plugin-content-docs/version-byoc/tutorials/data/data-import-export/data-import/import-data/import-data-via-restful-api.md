---
title: "データのインポート (RESTful API) | BYOC"
slug: /import-data-via-restful-api
sidebar_key: import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud RESTful API を使用して準備済みのデータをインポートする方法について説明します。| BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データインポート
  - restful

---

import Admonition from '@theme/Admonition';


# データのインポート (RESTful API)

このページでは、Zilliz Cloud RESTful API を使用して準備済みのデータをインポートする方法について説明します。

## 開始前に\{#before-you-start}

以下の条件が満たされていることを確認してください：

- クラスターの API キーを取得済みであること。詳細については、[API キー](./manage-api-keys) を参照してください。

- サポートされている形式のいずれかでデータを準備済みであること。

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。また、エンドツーエンドのノートブック [データインポートハンズオン](./data-import-zero-to-hero) も参考にして、さらに詳しく学ぶことができます。

- サンプルデータセットに一致するスキーマを持つコレクションを作成済みであること。

     コレクションの作成方法の詳細については、[コレクションの管理 (コンソール)](./manage-collections-console) を参照してください。

## データのインポート\{#import-data}

外部ストレージからファイルをインポートするには、まずファイルをオブジェクトストレージバケットにアップロードする必要があります。アップロード後、リモートバケット内のファイルへのパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を取得してください。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options) を参照してください。

データのセキュリティ要件に基づき、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。

認証情報の取得方法の詳細については、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用方法の詳細については、[こちらの FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>データのインポートを成功させるには、対象コレクションで実行中または保留中のインポートジョブが 10,000 未満であることを確認してください。</p>

</Admonition>

オブジェクトパスとバケット認証情報を取得したら、以下のように API を呼び出します：

```bash
# replace url and token with your own
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrl": "https://assets.zilliz.com/docs/example-data-import.json",
        "accessKey": "",
        "secretKey": ""
    }'
```

特定のパーティションにデータをインポートするには、リクエストに `partitionName` を含める必要があります。

Zilliz Cloud が上記のリクエストを処理した後、ジョブ ID が返されます。このジョブ ID を使用して、次のコマンドでインポートの進捗状況を監視できます。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

詳細については、[インポート](/reference/restful/create-import-jobs-v2) および [インポート進捗の取得](/reference/restful/get-import-job-progress-v2) を参照してください。

## 結果の確認\{#verify-the-result}

コマンドの出力が以下と同様の場合、インポートジョブは正常に送信されています:

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

RESTful API を呼び出して、[現在のインポートジョブの進捗を取得](/reference/restful/get-import-job-progress-v2)したり、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2)して詳細情報を取得することもできます。別の方法として、Zilliz Cloud コンソールの [ジョブセンター](./job-center) にアクセスして、結果やジョブの詳細を確認することも可能です。

