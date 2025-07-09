---
title: "データのインポート(RESTful API) | BYOC"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud RESTful APIを使用して、準備したデータをインポートする方法を紹介します。 | BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - restful
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database

---

import Admonition from '@theme/Admonition';


# データのインポート(RESTful API)

このページでは、Zilliz Cloud RESTful APIを使用して、準備したデータをインポートする方法を紹介します。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- クラスタのAPIキーを取得しました。詳細については、[APIキー](./manage-api-keys)を参照してください。

- サポートされている形式のいずれかでデータを準備していること。 

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options)と[書式オプション](./data-import-format-options)を参照してください。詳細については、エンドツーエンドのノートブック[データインポートハンズオン](./data-import-zero-to-hero)を参照してください。

- サンプルデータセットに一致するスキーマを持つコレクションを作成しました。

     コレクションの作成の詳細については、[コレクションの管理(コンソール)](./manage-collections-console)を参照してください。

## RESTful APIを使用してデータをインポートする{#import-data-using-the-restful-api}

RESTful APIを使用してファイルからデータをインポートするには、まずファイルをオブジェクトストレージバケットにアップロードする必要がありますアップロードが完了したら、リモートバケット内のファイルへのパスと、Zilliz Cloudがバケットからデータを取得するためのバケットの認証情報を取得します。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options)を参照してください。

データのセキュリティ要件に基づいて、データのインポート中に長期または短期の資格情報を使用できます。 

資格情報の取得に関する詳細については、次を参照してください:

- タグ: Amazon S 3:[長期的な資格情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- タグ: Google Cloud Storage

- Azure Blob Storage: [アカウントのアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys) Azureブログまとめ

セッショントークンの使用方法の詳細については、[このFAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>データのインポートを成功させるには、ターゲットコレクションに10,000件小なりの実行中または保留中のインポートジョブがあることを確認します。</p>

</Admonition>

オブジェクトパスとバケットの資格情報を取得したら、次のようにAPIを呼び出します。

```bash
# replace url and token with your own
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

特定のパーティションにデータをインポートするには、要求に`partitionName`を含める必要があります。

Zilliz Cloudが上記のリクエストを処理した後、ジョブIDを受け取ります。このジョブIDを使用して、次のコマンドでインポートの進捗状況を監視します。

```bash
curl --request GET \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

詳細については、[インポート](/reference/restful/create-import-jobs-v2)と[インポートの進捗を取得する](/reference/restful/get-import-job-progress-v2)を参照してください。

## 結果を確認する{#verify-the-result}

コマンドの出力が次のようになる場合、インポートジョブは正常に送信されます。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

[現在のインポートジョブの進捗を取得する](/reference/restful/get-import-job-progress-v2)と[インポートジョブの一覧](/reference/restful/list-import-jobs-v2)にRESTful APIを呼び出すことで、より多くの情報を取得することもできます。代わりに、Zilliz Cloudコンソールの[ジョブセンター](./job-center)に移動して、結果とジョブの詳細を表示することもできます。

