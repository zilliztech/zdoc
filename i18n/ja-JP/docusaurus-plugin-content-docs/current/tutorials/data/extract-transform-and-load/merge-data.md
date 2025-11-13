---
title: "データのマージ | Cloud"
slug: /merge-data
sidebar_label: "データのマージ"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "既存のZilliz Cloudコレクションのデータとローカルファイルまたは外部オブジェクトストレージバケットのデータをマージして、両方のソースからデータを結合したコレクションを作成できます。これはデータマージ操作と呼ばれており、既存のコレクションにデータを持つフィールドを追加するための回避策として使用できます。 | Cloud"
type: origin
token: Q2qwwliDki25vRkZrYxc7Rnnn4e
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - ETL
  - extract
  - transform
  - load
  - data merging
  - merge data
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';


# データのマージ

既存のZilliz Cloudコレクションのデータとローカルファイルまたは外部オブジェクトストレージバケットのデータをマージして、両方のソースからデータを結合したコレクションを作成できます。これはデータマージ操作と呼ばれており、既存のコレクションにデータを持つフィールドを追加するための回避策として使用できます。

<Admonition type="info" icon="📘" title="注意">

<ul>
<li>この機能は現在<strong>プライベートプレビュー</strong>中です。この機能に興味があり、試してみたい場合は、<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloudサポート</a>までお気軽にお問い合わせください。</li>
</ul>

</Admonition>

## 概要\{#overview}

データマージ操作は、リレーショナルデータベースのLEFT JOIN操作に似ており、コレクションのデータと指定されたデータソースからのすべての一致するレコードを結合し、マージされたデータを新しいコレクションに格納します。

データソースは、Zilliz Cloudステージまたはオブジェクトストレージバケットに格納されたPARQUETファイルのセットである必要があります。

次の図に示すように、3つのフィールドを含むコレクションがあり、`id`フィールドが主キーとして機能します。さらに、`id`と`date`という2つのフィールドを持つPARQUETファイルがあります。`id`フィールドはマージキーとして機能し、その値はソースコレクションの値と一致する必要があります。`date`フィールドは追加されるフィールドです。

![Gfduwu9hGh8CGkbcJ1JccREunRf](/img/Gfduwu9hGh8CGkbcJ1JccREunRf.png)

PARQUETファイルをZilliz Cloudステージまたはオブジェクトストレージバケットにアップロードすると、[マージデータAPI](/reference/restful/merge-data-v2)を使用して、両方のソースからデータを格納するターゲットコレクションを作成できます。

データソースはオプションです。データソースを指定せずにマージデータAPIを使用して、既存のコレクションにフィールドを追加する回避策として使用することもできます。

このガイドでは、データあり・データなしでフィールドを追加する方法について説明します。

## データのあるフィールドを追加\{#add-fields-with-data}

データのあるフィールドを追加するには、ソースコレクション、データソース、およびターゲットコレクションに追加する新しいフィールドを指定する必要があります。

データソースは、Zilliz CloudステージまたはAWS S3バケットのいずれかにあるPARQUETファイルのセットである必要があります。

### ステージの使用\{#use-stage}

ステージを使用してデータマージ操作を実行するには、まずステージを作成し、ローカルファイルシステムからデータをアップロードします。その後、データマージ操作を実行して、既存のコレクションとステージのデータを組み合わせた新しいコレクションを作成できます。

次のコードスニペットは、ステージを使用してデータマージ操作を実行する方法を示しています。ステージの作成方法とデータのアップロード方法の詳細については、[ステージの管理](./manage-stages)を参照してください。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/etl/merge" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "in00-xxxxxxxxxxxxxxx",
    "dbName": "my_database",
    "collectionName": "my_collection",
    "destDbName": "my_database",
    "destCollectionName": "my_merged_collection",
    "dataSource": {
        "type": "stage",
        "stageName": "my_stage",
        "dataPath": "path/to/your/parquet.parquet"
    },
    "mergeField": "id",
    "newFields": [
        {
            "fieldName": "date",
            "dataType": "VARCHAR",
            "params": {
                "maxLength": 10
            }
        }
    ]
}'
```

上記のコマンドを実行する前に、注意が必要なフィールドがいくつかあります。

- `dbName` と `collectionName`

    これら2つのパラメータは、データマージ操作のソースコレクションを決定します。

- `destDbName` と `destCollectionName`

    これら2つのパラメータは、データマージ操作後に生成されるターゲットコレクションを決定します。ターゲットコレクションは、ソースコレクションと同じクラスターに属している必要があります。

- `dataSource`

    このパラメータはオプションで、データソースタイプやソースコレクションからのデータとマージされ、ターゲットコレクションに保存される列方向データを含むParquetファイルのパスなどのデータソース設定を含みます。

    中間ストレージとしてステージを使用する場合は、`type`を`stage`に設定した後に`stageName`と`dataPath`を設定する必要があります。

    <Admonition type="info" icon="📘" title="注意">

    <ul>
    <li><code>dataPath</code>パラメータの値は、ステージのルートに対するファイルの絶対パス、または複数のParquetファイルを格納するステージ内のフォルダにすることができます。値がフォルダを指す場合は、フォルダ内のParquetファイルが同じデータ構造を持っていることを確認してください。</li>
    </ul>
    <p>たとえば、値は<code>path/to/your/file.parquet</code>（ファイル）または<code>path/to/your/folder/</code>（フォルダ）にすることができます。</p>
    <ul>
    <li>データのないフィールドを追加する場合は、このパラメータを指定しないままにできます。</li>
    </ul>

    </Admonition>

- `mergeField`

    データマージ操作は、リレーショナルデータベースシステムのLEFT JOIN操作に似ており、マージフィールドはソースコレクションと列方向データを含むParquetファイル間の共有キーとして機能します。

- `newFields`

    これは、データマージ操作後にターゲットコレクションに追加するフィールドのスキーマのリストです。サポートされているデータ型はVACHAR、INT8、INT16、INT32、INT64、FLOAT、DOUBLE、およびBOOLです。

上記のコマンドはデータマージジョブを作成し、そのIDを返します。

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

### オブジェクトストレージの使用\{#use-object-storage}

オブジェクトストレージバケットを使用してデータマージ操作を実行するには、まずオブジェクトストレージバケットを作成し、データをアップロードします。その後、データマージ操作を実行して、既存のコレクションとバケットのデータを組み合わせた新しいコレクションを作成できます。

次のコードスニペットは、オブジェクトストレージバケットを使用してデータマージ操作を実行する方法を示しています。ブロックストレージサービスプロバイダのドキュメントを参照して、バケットの作成方法とデータのアップロード方法を確認できます。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/etl/merge" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "in00-xxxxxxxxxxxxxxx",
    "dbName": "my_database",
    "collectionName": "my_collection",
    "destDbName": "my_database",
    "destCollectionName": "my_merged_collection",
    "dataSource": {
        "type": "s3",
        "dataPath": "s3://my_bucket/path/to/your/parquet.parquet",
        "credential": {
            "accessKey": "xxxx",
            "secretKey": "xxxx"
        }
    },
    "mergeField": "id",
    "newFields": [
        {
            "fieldName": "date",
            "dataType": "VARCHAR",
            "params": {
                "maxLength": 10
            }
        }
    ]
}'
```

上記のコマンドを実行する前に、注意が必要なフィールドがいくつかあります。

- `dbName` と `collectionName`

    これら2つのパラメータは、データマージ操作のソースコレクションを決定します。

- `destDbName` と `destCollectionName`

    これら2つのパラメータは、データマージ操作後に生成されるターゲットコレクションを決定します。ターゲットコレクションは、ソースコレクションと同じクラスターに属していることに注意してください。

- `dataSource`

    このパラメータはオプションで、データソースタイプやソースコレクションからのデータとマージされ、ターゲットコレクションに保存される列方向データを含むParquetファイルのパスなどのデータソース設定を含みます。

    中間ストレージとしてS3互換のオブジェクトストレージバケットを使用する場合は、`type`を`s3`に設定した後に`dataPath`と`credential`を設定する必要があります。

    <Admonition type="info" icon="📘" title="注意">

    <ul>
    <li><code>dataPath</code>パラメータの値は、バケットのルートに対するファイルの絶対パス、または複数のParquetファイルを格納するバケット内のフォルダにすることができます。値がフォルダを指す場合は、フォルダ内のParquetファイルが同じデータ構造を持っていることを確認してください。</li>
    </ul>
    <p>たとえば、値は<code>s3://path/to/your/file.parquet</code>（ファイル）または<code>s3://path/to/your/folder/</code>（フォルダ）にすることができます。</p>
    <ul>
    <li>データのないフィールドを追加する場合は、このパラメータを指定しないままにできます。</li>
    </ul>

    </Admonition>

- `mergeField`

    データマージ操作は、リレーショナルデータベースシステムのLEFT JOIN操作に似ており、マージフィールドはソースコレクションと列方向データを含むParquetファイル間の共有キーとして機能します。

- `newFields`

    これは、データマージ操作後にターゲットコレクションに追加するフィールドのスキーマのリストです。サポートされているデータ型はVACHAR、INT8、INT16、INT32、INT64、FLOAT、DOUBLE、およびBOOLです。

上記のコマンドはデータマージジョブを作成し、そのIDを返します。

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

## データのないフィールドを追加\{#add-fields-without-data}

マージデータAPIを使用して、既存のコレクションにフィールドを追加する回避策として使用することもできます。この場合、データソースを設定する必要はありません。

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/etl/merge" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "in00-xxxxxxxxxxxxxxx",
    "dbName": "my_database",
    "collectionName": "my_collection",
    "destDbName": "my_database",
    "destCollectionName": "my_merged_collection",
    "mergeField": "id",
    "newFields": [
        {
            "fieldName": "date",
            "dataType": "VARCHAR",
            "params": {
                "maxLength": 10
            }
        }
    ]
}'
```

上記のコマンドはデータマージジョブを作成し、そのIDを返します。

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

## 結果の確認\{#verify-the-results}

データマージジョブのIDを取得した後、[ジョブの詳細](/reference/restful/describe-job-v2)または[プロジェクトジョブの管理](./job-center)に記載されている手順を使用して、そのステータスを詳細に確認できます。

データマージジョブが完了すると、ターゲットコレクションのスキーマとターゲットコレクション内のエンティティ数が期待通りであるかどうかを確認できます。

## トラブルシューティング\{#troubleshooting}

1. **Parquetファイルの行にソースコレクションのエンティティと一致しないマージキーがある場合、どのように対処すればよいですか？**

    リレーショナルデータベースシステムのLEFT JOIN操作と同様に、データマージ操作はソースコレクションからのすべての行と、指定されたParquetファイルからの一致する行を結合します。これにより、ソースからのすべてのフィールド、newFieldsで定義されたフィールド、および結合されたデータを含む新しい宛先コレクションが作成されます。

    ソースコレクションのマージキーと一致するマージキーを持つParquetファイルからの行のみがマージされます。ソースコレクションのエンティティと一致しないマージキーを持つ行はスキップされます。Parquetファイルの行がいずれもエンティティと一致しない場合、構成されている場合は`newFields`で指定されたフィールドのみがnull値で作成されます。