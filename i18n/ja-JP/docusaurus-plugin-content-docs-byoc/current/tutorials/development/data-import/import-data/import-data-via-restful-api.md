---
title: "データのインポート（RESTful API） | BYOC"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、準備したデータを Zilliz Cloud RESTful API を使用してインポートする方法を紹介します。 | BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データのインポート（RESTful API）

このページでは、準備したデータを Zilliz Cloud RESTful API を使用してインポートする方法を紹介します。

## 始める前に\{#before-you-start}

以下の条件を満たしていることを確認してください。

- クラスターの API キーを取得していること。詳細については、[API Keys](./manage-api-keys) を参照してください。

- サポートされているいずれかの形式でデータを準備していること。 

    データの準備方法の詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。また、エンドツーエンドのノートブック [Data Import Hands-On](./data-import-zero-to-hero) も参照できます。

- サンプルデータセットに一致するスキーマでコレクションを作成していること。

     コレクションの作成の詳細については、[Manage Collections (Console)](./manage-collections-console) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定した体験を確保するため、対象クラスターと同じプロバイダーかつ同じリージョンのバケットまたは Blob コンテナーを使用することを推奨します。

</Admonition>

## データをインポートする\{#import-data}

外部ストレージ経由でファイルからデータをインポートするには、まずファイルをオブジェクトストレージバケットにアップロードする必要があります。アップロード後、リモートバケット内のファイルパスと、Zilliz Cloud がそのバケットからデータを取得するためのバケットの認証情報を取得してください。サポートされているオブジェクトパスの詳細については、[Storage Options](./data-import-storage-options) を参照してください。

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。 

認証情報の取得方法の詳細については、以下を参照してください。

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用の詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="📘 Notes">

データのインポートを正常に行うため、対象のコレクションにおける実行中または保留中のインポートジョブ数が 10,000 未満であることを確認してください。

</Admonition>

オブジェクトパスとバケットの認証情報を取得したら、以下のように API を呼び出します。

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

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。このジョブ ID を使用して、以下のコマンドでインポートの進行状況を監視します。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/get_progress" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

詳細については、[Import](/reference/restful/create-import-jobs-v2) および [Get Import Progress](/reference/restful/get-import-job-progress-v2) を参照してください。

## 結果を確認する\{#verify-the-result}

コマンドの出力が以下のようであれば、インポートジョブは正常に送信されています。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

さらに詳しく知るには、RESTful API を呼び出して[現在のインポートジョブの進行状況を取得](/reference/restful/get-import-job-progress-v2)し、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2)することもできます。別の方法として、Zilliz Cloud コンソールの [job center](./job-center) に移動して、結果やジョブの詳細を確認することもできます。

