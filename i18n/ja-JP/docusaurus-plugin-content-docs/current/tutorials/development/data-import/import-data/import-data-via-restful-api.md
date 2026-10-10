---
title: "データのインポート（RESTful API） | Cloud"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、用意したデータを Zilliz Cloud RESTful API でインポートする方法を説明します。 | Cloud"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート（RESTful API）

このページでは、用意したデータを Zilliz Cloud RESTful API でインポートする方法を説明します。

## 事前準備\{#before-you-start}

以下を満たしていることを確認してください。

- クラスターの API キーを取得していること。詳細は、[API キー](./manage-api-keys) を参照してください。

- サポートされているいずれかの形式でデータを用意していること。 

    サポートされている形式の詳細については、[ストレージオプション](./data-import-storage-options) および [フォーマットオプション](./data-import-format-options) を参照してください。さらに詳しく知りたい場合は、エンドツーエンドのノートブック [データインポートのハンズオン](./data-import-zero-to-hero) も参照してください。

- サンプルデータセットに一致するスキーマを持つコレクションを作成していること。

     コレクションの作成方法の詳細については、[コレクションの管理（コンソール）](./manage-collections-console) を参照してください。

<Admonition type="info" title="Notes">

Zilliz Cloud では、クラスターをホストするクラウドプロバイダーに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスターにデータをインポートできるようになりました。たとえば、AWS S3 バケットから GCP にデプロイされた Zilliz Cloud クラスターにデータをインポートできます。

低レイテンシで安定したエクスペリエンスを確保するには、ターゲットクラスターと同じプロバイダーかつ同じリージョンのバケットまたは BLOB コンテナーを使用することをお勧めします。

</Admonition>

## ボリュームからデータをインポートする\{#import-data-from-volumes}

ボリュームからクラスターにデータをインポートするには、まず [マネージドボリュームまたは外部ボリューム](./managed-volume) を作成します。マネージドボリュームの場合は、データファイルをボリュームにアップロードします。外部ボリュームの場合は、データファイルがマッピングされたクラウドストレージバケットにあることを確認します。その後、次のようにしてデータをインポートします。

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

## 外部ストレージからデータをインポートする\{#import-data-from-external-storage}

外部ストレージ経由でファイルからデータをインポートするには、まず AWS S3 や Google Cloud Storage（GCS）などのオブジェクトストレージバケットにファイルをアップロードする必要があります。アップロードしたら、リモートバケット内のファイルのパスと、Zilliz Cloud がバケットからデータを取得するためのバケット認証情報を取得します。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options) を参照してください。

データセキュリティの要件に応じて、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。 

認証情報の取得方法の詳細については、以下を参照してください。

- Amazon S3: [長期的な認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用の詳細については、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" title="Notes">

データインポートを成功させるには、ターゲットコレクションの実行中または保留中のインポートジョブが 10,000 件未満であることを確認してください。

</Admonition>

オブジェクトパスとバケット認証情報を取得したら、次のように API を呼び出します。

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

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID を受け取ります。このジョブ ID を使用して、次のコマンドでインポートの進行状況を監視します。

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
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2"
    }'
```

</TabItem>

</Tabs>

詳細は、[Import](/reference/restful/create-import-jobs-v2) および [Get Import Progress](/reference/restful/get-import-job-progress-v2) を参照してください。

## 結果を確認する\{#verify-the-result}

コマンドの出力が以下のようであれば、インポートジョブは正常に送信されています。

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

また、RESTful API を呼び出して [現在のインポートジョブの進行状況の取得](/reference/restful/get-import-job-progress-v2) や [すべてのインポートジョブの一覧表示](/reference/restful/list-import-jobs-v2) を行うこともできます。あるいは、Zilliz Cloud コンソールの [ジョブセンター](./job-center) にアクセスして、結果とジョブの詳細を確認することもできます。

## FAQ\{#faq}

**外部ボリュームと、外部ストレージから直接インポートすることの違いは何ですか？**

どちらも、独自の S3 または GCS バケットからデータをインポートできます。主な違いは次のとおりです。

- 外部ボリュームでは、認証情報を管理するために、[AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure Blob Storage コンテナー](./integrate-with-azure-blob-storage) を Zilliz Cloud と連携する必要があります。認証情報は一度設定すると、複数のボリュームと操作で再利用されます。データエンジニアがクラウドストレージのキーに直接アクセスする必要はありません。

- 直接的な [外部ストレージインポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、インポートリクエストごとに認証情報（アクセスキーとシークレットキー）を指定する必要があります。これは 1 回限りのインポートには簡単ですが、認証情報の分離や再利用はできません。
