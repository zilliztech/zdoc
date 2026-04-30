---
title: "データのインポート (RESTful API) | Cloud"
slug: /import-data-via-restful-api
sidebar_key: import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud RESTful API を使用して準備済みのデータをインポートする方法について説明します。 | Cloud"
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


# データインポート (RESTful API)

このページでは、Zilliz Cloud RESTful API を使用して準備済みのデータをインポートする方法について説明します。

## 開始前に\{#before-you-start}

以下の条件が満たされていることを確認してください：

- クラスターの API キーを取得済みであること。詳細については、[API キー](./manage-api-keys) を参照してください。

- サポートされている形式のいずれかでデータを準備済みであること。

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options) および [形式オプション](./data-import-format-options) を参照してください。また、エンドツーエンドのノートブック [データインポートハンズオン](./data-import-zero-to-hero) も参考にして、さらに詳しく学ぶことができます。

- 例題データセットに一致するスキーマを持つコレクションを作成済みであること。

     コレクションの作成方法の詳細については、[コレクションの管理 (コンソール)](./manage-collections-console) を参照してください。

## ボリュームからのデータインポート\{#import-data-from-volumes}

ボリュームからクラスターへデータをインポートするには、まず [マネージドまたは外部ボリューム](null) を作成してください。マネージドボリュームの場合、データファイルをボリュームにアップロードします。外部ボリュームの場合、データファイルがマッピングされたクラウドストレージバケット内にあることを確認してください。その後、以下の手順でデータをインポートします：

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "dbName": "default",
    "collectionName": "medium_articles",
    "partitionName": "",
    "volumeName": "my_volume",
    "dataPaths": [
        [
            "json-folder/1.json"
        ]
    ]
}'
```

特定のパーティションにデータをインポートするには、リクエストに `partitionName` を含めてください。

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。このジョブ ID を使用して、以下のコマンドでインポートの進捗状況を監視できます。

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

## 外部ストレージからデータをインポートする\{#import-data-from-external-storage}

外部ストレージ経由でファイルからデータをインポートするには、まずファイルを AWS S3 や Google Cloud Storage (GCS) などのオブジェクトストレージバケットにアップロードする必要があります。アップロード後、リモートバケット内のファイルへのパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を取得してください。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options) を参照してください。

データのセキュリティ要件に基づき、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。

認証情報の取得方法の詳細については、以下を参照してください：

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用に関する詳細については、[こちらの FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>データを正常にインポートするには、対象のコレクションで実行中または保留中のインポートジョブが 10,000 未満であることを確認してください。</p>

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

RESTful API を呼び出して、[現在のインポートジョブの進行状況を取得](/reference/restful/get-import-job-progress-v2) したり、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2) したりして、さらに詳細な情報を取得することもできます。別の方法として、Zilliz Cloud コンソールの [ジョブセンター](./job-center) にアクセスして、結果とジョブの詳細を確認することもできます。

## FAQ\{#faq}

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも、独自の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです。

- 外部ボリュームでは、認証情報の管理に [ストレージ統合](null) を使用します。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアはクラウドストレージキーに直接アクセスする必要がありません。

- 直接 [外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストとともに認証情報（アクセスキー、シークレットキー）をインラインで提供する必要があります。これはワンタイムのインポートには簡単ですが、認証情報の分離や再利用性は提供されません。

