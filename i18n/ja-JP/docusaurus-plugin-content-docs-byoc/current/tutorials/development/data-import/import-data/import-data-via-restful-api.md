---
title: "データのインポート（RESTful API） | BYOC"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、準備したデータを Zilliz Cloud RESTful API 経由でインポートする方法を紹介します。 | BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データのインポート（RESTful API）

このページでは、準備したデータを Zilliz Cloud RESTful API 経由でインポートする方法を紹介します。

## 事前準備\{#before-you-start}

以下の条件を満たしていることを確認してください。

- クラスターの API キーを取得していること。詳細については、[API キー](./manage-api-keys) を参照してください。

- サポートされているいずれかの形式でデータを準備していること。 

    データを準備する方法の詳細については、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。さらに理解を深めるには、エンドツーエンドのノートブック [Data Import Hands-On](./data-import-zero-to-hero) も参照してください。

- サンプルデータセットに一致するスキーマを持つコレクションを作成していること。

     コレクションの作成方法の詳細については、[コレクションの管理（コンソール）](./manage-collections-console) を参照してください。

<Admonition type="info" title="Notes">

Zilliz Cloud では、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできるようになりました。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定したエクスペリエンスを確保するには、ターゲットクラスターと同じプロバイダーかつ同じリージョンのバケットまたは BLOB コンテナーを使用することをお勧めします。

</Admonition>

## データのインポート\{#import-data}

外部ストレージを介してファイルからデータをインポートするには、まずファイルをオブジェクトストレージバケットにアップロードする必要があります。アップロードしたら、Zilliz Cloud がバケットからデータを取得できるように、リモートバケット内のファイルのパスとバケット認証情報を取得します。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options) を参照してください。

データのセキュリティ要件に応じて、データのインポート時に長期認証情報または短期認証情報のいずれかを使用できます。 

認証情報の取得方法の詳細については、以下を参照してください。

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用の詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" title="Notes">

データのインポートを成功させるには、ターゲットコレクションの実行中または保留中のインポートジョブが 10,000 件未満であることを確認してください。

</Admonition>

オブジェクトパスとバケット認証情報を取得したら、次のように API を呼び出します。

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

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID を受け取ります。このジョブ ID を使用して、次のコマンドでインポートの進行状況を監視します。

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

## 結果の確認\{#verify-the-result}

コマンドの出力が以下の通りであれば、インポートジョブは正常に送信されています。

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

RESTful API を呼び出して[現在のインポートジョブの進行状況を取得](/reference/restful/get-import-job-progress-v2)したり、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2)したりすることもできます。その代わりに、Zilliz Cloud コンソールの[ジョブセンター](./job-center)に移動して、結果とジョブの詳細を確認することもできます。
