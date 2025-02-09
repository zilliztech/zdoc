---
title: "データのインポート(RESTful API) | Cloud"
slug: /import-data-via-restful-api
sidebar_label: "データのインポート(RESTful API)"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud RESTfulAPIを使用して、準備したデータをインポートする方法を紹介します。 | Cloud"
type: origin
token: ZavUwSvj4iFsREkJGFAcOBdbn5d
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - restful
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# データのインポート(RESTful API)

このページでは、Zilliz Cloud RESTfulAPIを使用して、準備したデータをインポートする方法を紹介します。

## 始める前に{#before-you-start}

以下の条件が満たされていることを確認してください。

- クラスターのAPIキーを取得しました。詳細については、「[APIキー](./manage-api-keys)」を参照してください。

- サポートされている形式のいずれかでデータを準備していること。

    データの準備方法の詳細については、「[ストレージオプション](./data-import-storage-options)」と「[書式オプション](./data-import-format-options)」を参照してください。詳細については、エンドツーエンドのノートブック「[データインポートハンズオン](./data-import-zero-to-hero)」を参照することもできます。

- サンプルデータセットに一致するスキーマを持つコレクションを作成し、既にインデックスを作成して読み込んでいます。コレクションの作成の詳細については、「[コレクションの管理(コンソール)](./drop-collection)」を参照してください。

## RESTful APIを使用したデータのインポート{#import-data-using-the-restful-api}

RESTfulAPIを使用してファイルからデータをインポートするには、まずファイルをオブジェクトストレージバケット(paas)にアップロードする必要があります。例えば、AWS S 3やGoogle Cloud Storage(GCS)などです。アップロードが完了したら、リモートバケット内のファイルへのパスと、Zilliz Cloudがバケットからデータを取得するためのバケットの認証情報を取得してください。サポートされているオブジェクトパスの詳細については、「[ストレージオプション](./data-import-storage-options)」を参照してください。

データのセキュリティ要件に基づいて、データのインポート中に長期的な資格情報またはセッショントークンを使用できます。

資格情報の取得に関する詳細については、次を参照してください:

- Amazon S3:[長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage:[サービスアカウントのHMACキーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage:[アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用方法については、[FAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)を参照してください。

<Admonition type="info" icon="Notes" title="undefined">

<p>データのインポートを成功させるには、ターゲットコレクションに10,000件小なりの実行中または保留中のインポートジョブがあることを確認します。</p>

</Admonition>

オブジェクトパスとバケットの認証情報を取得したら、次のようにAPIを呼び出します。

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
        "objectUrl": "https://s3.us-west-2.amazonaws.com/publicdataset.zillizcloud.com/medium_articles_2020_dpr/medium_articles_2020_dpr.json",
        "accessKey": "",
        "secretKey": ""
    }'
```

特定のパーティションにデータをインポートするには、リクエストにpartitionNameを含め`る`必要があります。

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

詳細については、「[インポート](/reference/restful/create-import-jobs-v2)」と「[インポート進捗の取得](/reference/restful/get-import-job-progress-v2)」を参照してください。

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

RESTful APIを呼び出して、[現在のインポートジョブの進行状況を取得](/reference/restful/get-import-job-progress-v2)し、[すべてのインポートジョブ](/reference/restful/list-import-jobs-v2)を一覧表示してさらに取得することもできます。代わりに、Zilliz Cloudコンソールに移動して、結果とジョブの詳細を表示することもできます。

![data_import_complete_restful](/img/ja-JP/data_import_complete_restful.png)

