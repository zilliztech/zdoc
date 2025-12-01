---
title: "データインポート（RESTful API） | BYOC"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz CloudのRESTful APIを介して準備したデータをインポートする方法を紹介します。| BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - data import
  - restful
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db

---

import Admonition from '@theme/Admonition';


# データインポート（RESTful API）

このページでは、Zilliz CloudのRESTful APIを介して準備したデータをインポートする方法を紹介します。

## 事前準備\{#before-you-start}

以下の条件が満たされていることを確認してください。

- クラスターのAPIキーを取得しています。詳細については、[APIキー](./manage-api-keys)を参照してください。

- サポートされている形式のいずれかでデータを準備しています。

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options)および[フォーマットオプション](./data-import-format-options)を参照してください。また、エンドツーエンドのノートブックである[データインポートハンズオン](./data-import-zero-to-hero)も参照できます。

- サンプルデータセットに一致するスキーマを持つコレクションを作成しています。

    コレクション作成の詳細については、[コレクションの管理（コンソール）](./manage-collections-console)を参照してください。

## データのインポート\{#import-data}

外部ストレージからファイルのデータをインポートするには、最初にファイルをオブジェクトストレージバケットにアップロードする必要があります。アップロード後、リモートバケット内のファイルへのパスとバケットの認証情報を取得し、Zilliz Cloudがバケットからデータを取得できるようにします。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options)を参照してください。

データセキュリティ要件に基づき、データインポート中に長期または短期の認証情報のいずれかを使用できます。

認証情報の取得方法については、以下を参照してください。

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントのHMACキーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/ja-jp/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用方法については、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="📘" title="注意">

<p>データインポートが成功するように、ターゲットコレクションに実行中または保留中のインポートジョブが10,000個未満であることを確認してください。</p>

</Admonition>

オブジェクトパスとバケットの認証情報を取得したら、以下のようにAPIを呼び出します。

```bash
# urlとtokenを自分のものに置き換えてください
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
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

特定のパーティションにデータをインポートするには、リクエストに`partitionName`を含める必要があります。

上記のリクエストをZilliz Cloudが処理すると、ジョブIDが返されます。以下のコマンドでこのジョブIDを使用してインポートの進行状況を監視できます。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

詳細については、[インポート](/reference/restful/create-import-jobs-v2)および[インポートジョブの進行状況の取得](/reference/restful/get-import-job-progress-v2)を参照してください。

## 結果の確認\{#verify-the-result}

コマンド出力が以下に似ている場合、インポートジョブは正常に送信されています。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

RESTful APIを呼び出して[現在のインポートジョブの進行状況を取得](/reference/restful/get-import-job-progress-v2)したり、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2)することもできます。または、Zilliz Cloudコンソールの[ジョブセンター](./job-center)に移動して結果とジョブの詳細を表示することもできます。
