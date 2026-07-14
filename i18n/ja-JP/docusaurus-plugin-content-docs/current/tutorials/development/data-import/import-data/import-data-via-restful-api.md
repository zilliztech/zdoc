---
title: "データのインポート（RESTful API） | Cloud"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、準備したデータを Zilliz Cloud RESTful API を介してインポートする方法を紹介します。 | Cloud"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート（RESTful API）

このページでは、準備したデータを Zilliz Cloud RESTful API を介してインポートする方法を紹介します。

## 始める前に\{#before-you-start}

以下の条件を満たしていることを確認してください。

- クラスターの API キーを取得していること。詳細については、[API Keys](./manage-api-keys) を参照してください。

- サポートされているいずれかの形式でデータを準備していること。 

    データの準備方法の詳細については、[Storage Options](./data-import-storage-options) および [Format Options](./data-import-format-options) を参照してください。エンドツーエンドのノートブック [Data Import Hands-On](./data-import-zero-to-hero) も参考にできます。

- サンプルデータセットに一致するスキーマでコレクションを作成していること。

     コレクションの作成の詳細については、[Manage Collections (Console)](./manage-collections-console) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud では現在、クラスターをホストしているクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできます。たとえば、AWS S3 バケットから GCP 上にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定した体験を確保するために、ターゲットクラスターと同じプロバイダーかつ同じリージョンのバケットまたは BLOB コンテナーを使用することを推奨します。

</Admonition>

## ボリュームからデータをインポートする\{#import-data-from-volumes}

ボリュームからクラスターにデータをインポートするには、まず [マネージドボリュームまたは外部ボリューム](./managed-volume) を作成します。マネージドボリュームの場合は、データファイルをボリュームにアップロードします。外部ボリュームの場合は、データファイルがマッピングされたクラウドストレージバケット内にあることを確認します。その後、以下のようにデータをインポートします。

<Tabs groupId="create-import">

<TabItem value="serving" label="Serving Cluster">

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

</TabItem>

<TabItem value="on-demand" label="On-Demand Compute">

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${API_KEY}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
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

</TabItem>

</Tabs>

特定のパーティションにデータをインポートするには、リクエストに `partitionName` を含めます。

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。以下のコマンドを使用して、このジョブ ID でインポートの進行状況を監視します。

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

外部ストレージ経由でファイルからデータをインポートするには、まず AWS S3 や Google Cloud Storage (GCS) などのオブジェクトストレージバケットにファイルをアップロードする必要があります。アップロード後、リモートバケット内のファイルパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を取得します。サポートされているオブジェクトパスの詳細については、[Storage Options](./data-import-storage-options) を参照してください。

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。 

認証情報の取得方法の詳細については、以下を参照してください。

- Amazon S3: [長期認証情報を使用して認証する](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーを管理する](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーを表示する](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用に関する詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="📘 Notes">

データインポートを正常に行うには、ターゲットコレクションの実行中または保留中のインポートジョブが 10,000 未満であることを確認してください。

</Admonition>

オブジェクトパスとバケット認証情報を取得したら、以下のように API を呼び出します。

<Tabs groupId="create-import">

<TabItem value="serving" label="Serving Cluster">

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

</TabItem>

<TabItem value="on-demand" label="On-Demand Compute">

```bash
# replace url and token with your own
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "projectId": "proj-xxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrl": "https://assets.zilliz.com/docs/example-data-import.json",
        "accessKey": "",
        "secretKey": ""
    }'
```

</TabItem>

</Tabs>

特定のパーティションにデータをインポートするには、リクエストに `partitionName` を含める必要があります。

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。以下のコマンドを使用して、このジョブ ID でインポートの進行状況を監視します。

<Tabs groupId="create-import">

<TabItem value="serving" label="Serving Cluster">

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

</TabItem>

<TabItem value="on-demand" label="On-Demand Compute">

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/get_progress" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2"
    }'
```

</TabItem>

</Tabs>

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

RESTful API を呼び出して、[現在のインポートジョブの進行状況を取得する](/reference/restful/get-import-job-progress-v2) ことや、[すべてのインポートジョブを一覧表示する](/reference/restful/list-import-jobs-v2) こともできます。別の方法として、Zilliz Cloud コンソールの [ジョブセンター](./job-center) に移動して結果やジョブの詳細を確認することもできます。

## FAQ\{#faq}

**外部ボリュームと外部ストレージから直接インポートする方法の違いは何ですか？**

どちらも、自身の S3 または GCS バケットからデータをインポートできます。主な違いは以下のとおりです。

- 外部ボリュームでは、認証情報管理のために [AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure BLOB ストレージコンテナー](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合する必要があります。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアはクラウドストレージキーへ直接アクセスする必要がありません。

- 直接の [外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストごとに認証情報（アクセスキーとシークレットキー）を指定する必要があります。これは単発のインポートにはより簡単ですが、認証情報の分離や再利用性は提供されません。

