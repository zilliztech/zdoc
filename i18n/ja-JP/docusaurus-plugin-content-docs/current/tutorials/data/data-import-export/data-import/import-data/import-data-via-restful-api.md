---
title: "データのインポート (RESTful API) | Cloud"
slug: /import-data-via-restful-api
sidebar_key: import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud RESTful API を使用して準備したデータをインポートする方法を紹介します。"
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
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# データのインポート (RESTful API)

このページでは、Zilliz Cloud RESTful API を使用して準備したデータをインポートする方法を紹介します。

## 開始前の準備\{#before-you-start}

以下の条件が満たされていることを確認してください：

- クラスター用の APIキー を取得していること。詳細については、[APIキー](./manage-api-keys) を参照してください。

- サポートされている形式のいずれかでデータを準備していること。

    データの準備方法の詳細については、[ストレージオプション](./data-import-storage-options) および [形式オプション](./data-import-format-options) を参照してください。また、エンドツーエンドのノートブック [データインポート Hands-On](./data-import-zero-to-hero) も参考にしてください。

- サンプルデータセットと一致するスキーマでコレクションを作成していること。

     コレクションの作成の詳細については、[コレクションの管理 (コンソール)](./manage-collections-console) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud では、クラスタをホストしているクラウドプロバイダに関係なく、任意のオブジェクトストレージサービスから任意の Zilliz Cloud クラスタにデータをインポートできるようになりました。たとえば、AWS S3 バケットから GCP にデプロイされた Zilliz Cloud クラスタにデータをインポートできます。</p>
<p>低レイテンシで安定したエクスペリエンスを確保するために、ターゲットクラスタと同じプロバイダ、同じリージョンのバケットまたは BLOB コンテナを使用することをお勧めします。</p>

</Admonition>

## ボリュームからデータをインポート\{#import-data-from-volumes}

ボリュームからクラスターにデータをインポートするには、まず [マネージドボリュームまたは外部ボリューム](./managed-volume) を作成します。マネージドボリュームの場合は、データファイルをボリュームにアップロードします。外部ボリュームの場合は、データファイルがマッピングされたクラウドストレージバケットに存在することを確認します。その後、以下のようにデータをインポートします：

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

<TabItem value='java'>

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

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。このジョブ ID を使用して、以下のコマンドでインポートの進捗状況を監視します。

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

## 外部ストレージからデータをインポート\{#import-data-from-external-storage}

外部ストレージ経由でファイルからデータをインポートするには、まずファイルをオブジェクトストレージバケット（AWS S3 や Google Cloud Storage (GCS) など）にアップロードする必要があります。アップロード後、リモートバケット内のファイルへのパスと、Zilliz Cloud がバケットからデータをプルするためのバケット認証情報を取得します。サポートされているオブジェクトパスの詳細については、[ストレージオプション](./data-import-storage-options) を参照してください。

データセキュリティ要件に応じて、データインポート時に長期認証情報または短期認証情報のいずれかを使用できます。

認証情報の取得についての詳細は、以下を参照してください。

- Amazon S3: [長期認証情報を使用した認証](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [サービスアカウントの HMAC キーの管理](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [アカウントアクセスキーの表示](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

セッショントークンの使用についての詳細は、[この FAQ](/docs/faq-data-import#can-i-use-short-term-credentials-when-importing-data-from-an-object-storage-service) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

<p>データインポートを成功させるには、対象コレクションの実行中または保留中のインポートジョブが 10,000 件未満であることを確認してください。</p>

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

<TabItem value='java'>

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

Zilliz Cloud が上記のリクエストを処理すると、ジョブ ID が返されます。このジョブ ID を使用して、以下のコマンドでインポートの進捗状況を監視します。

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

<TabItem value='java'>

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

詳細については、[インポート](/reference/restful/create-import-jobs-v2) と [インポート進捗の取得](/reference/restful/get-import-job-progress-v2) を参照してください。

## 結果の確認\{#verify-the-result}

コマンドの出力が以下のようであれば、インポートジョブは正常に送信されています。

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

RESTful API を呼び出して、[現在のインポートジョブの進捗状況を取得](/reference/restful/get-import-job-progress-v2)したり、[すべてのインポートジョブを一覧表示](/reference/restful/list-import-jobs-v2)したりすることもできます。または、Zilliz Cloud コンソールの [ジョブセンター](./job-center) にアクセスして、結果とジョブの詳細を確認することもできます。

## FAQ\{#faq}

**外部ボリュームと外部ストレージからの直接インポートの違いは何ですか？**

どちらも独自の S3 または GCS バケットからデータをインポートできます。主な違いは以下の通りです：

- 外部ボリュームでは、[AWS S3 バケット](./integrate-with-aws-s3)、[Google Cloud Storage バケット](./integrate-with-gcp)、または [Microsoft Azure BLOB ストレージ コンテナー](./integrate-with-azure-blob-storage) を Zilliz Cloud と統合して、認証情報を管理する必要があります。認証情報は一度設定すれば、複数のボリュームや操作で再利用できます。データエンジニアはクラウドストレージのキーに直接アクセスする必要はありません。

- [外部ストレージからの直接インポート](./import-data-on-web-ui#remote-files-from-an-object-storage-bucket) では、各インポートリクエストごとに認証情報（アクセスキー、シークレットキー）をインラインで指定する必要があります。これは一度きりのインポートにはシンプルですが、認証情報の分離や再利用はできません。
