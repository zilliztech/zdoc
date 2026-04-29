---
title: "データのマージ | Cloud"
slug: /merge-data
sidebar_key: merge-data
sidebar_label: "データのマージ"
beta: NEAR DEPRECATE
notebook: FALSE
description: "既存の Zilliz Cloud コレクションのデータと、ローカルファイルまたは外部オブジェクトストレージバケットのデータをマージして、両方のソースからのデータを結合したコレクションを作成できます。これはデータマージ操作と呼ばれ、既存のコレクションにデータ付きのフィールドを追加するための回避策として利用できます。 | Cloud"
type: origin
token: Q2qwwliDki25vRkZrYxc7Rnnn4e
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - ETL
  - 抽出
  - 変換
  - ロード
  - データマージ
  - データのマージ

---

import Admonition from '@theme/Admonition';


# データのマージ

既存の Zilliz Cloud コレクションのデータと、ローカルファイルまたは外部オブジェクトストレージバケットのデータをマージして、両方のソースからのデータを結合したコレクションを作成できます。これをデータマージ操作と呼び、既存のコレクションにデータ付きのフィールドを追加するための回避策として利用できます。

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>この機能は現在<strong>プライベートプレビュー</strong>段階です。この機能に関心があり、試してみたい場合は、お気軽に<a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud サポート</a>までお問い合わせください。</li>
</ul>

</Admonition>

## 概要\{#overview}

データマージ操作は、リレーショナルデータベースにおける LEFT JOIN 操作に類似しており、コレクションのデータと指定されたデータソースから一致するすべてのレコードを結合し、マージされたデータを新しいコレクションに保存します。

データソースは、Zilliz Cloud ボリュームまたはオブジェクトストレージバケットに保存された PARQUET ファイルのセットである必要があります。

以下の図に示すように、3 つのフィールドを含むコレクションがあり、`id` フィールドが主キーとして機能しています。また、`id` と `date` という 2 つのフィールドを持つ PARQUET ファイルがあります。`id` フィールドはマージキーとして機能し、その値はソースコレクション内の値と一致する必要があります。`date` フィールドは追加されるフィールドです。

![Gfduwu9hGh8CGkbcJ1JccREunRf](https://zdoc-images.s3.us-west-2.amazonaws.com/Gfduwu9hGh8CGkbcJ1JccREunRf.png)

PARQUET ファイルを Zilliz Cloud ボリュームまたはオブジェクトストレージバケットにアップロードした後、[Merge データ API](/reference/restful/merge-data-v2) を使用して、両方のソースからのデータを保存するターゲットコレクションを作成できます。

データソースはオプションです。データソースを指定せずに Merge データ API を使用し、既存のコレクションにフィールドを追加する回避策としても利用できます。

本ガイドでは、Merge データ API を使用して、データ付きおよびデータなしでフィールドを追加する方法を示します。

## データ付きでフィールドを追加する\{#add-fields-with-data}

データ付きでフィールドを追加するには、ソースコレクション、データソース、およびターゲットコレクションに追加する新しいフィールドを指定する必要があります。

データソースは、Zilliz Cloud ボリュームまたは AWS S3 バケットにある PARQUET ファイルのセットである必要があります。

### ボリュームを使用する\{#use-volume}

ボリュームを使用してデータマージ操作を実行するには、まずボリュームを作成し、ローカルファイルシステムからデータをアップロードします。完了後、データマージ操作を実行して、既存のコレクションとボリュームからのデータを結合した新しいコレクションを作成できます。

以下のコードスニペットは、ボリュームを使用してデータマージ操作を実行する方法を示しています。ボリュームの作成方法とデータのアップロード方法の詳細については、「ステージの管理」を参照してください。

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
        "type": "volume",
        "volumeName": "my_volume",
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

上記のコマンドを実行する前に、以下のフィールドに注意が必要です。

- `dbName` および `collectionName`

    この2つのパラメータは、データマージ操作のソースコレクションを決定します。

- `destDbName` および `destCollectionName`

    この2つのパラメータは、データマージ操作後に生成されるターゲットコレクションを決定します。ターゲットコレクションは、ソースコレクションと同じクラスター内にある必要があります。

- `dataSource`

    このパラメータはオプションで、データソースの設定（データソースのタイプや、列指向データを含むParquetファイルへのパスなど）を指定します。このデータはソースコレクションのデータとマージされ、ターゲットコレクションに格納されます。

    中間ストレージとしてボリュームを使用する場合、`type` を `volume` に設定した後、`volumeName` および `dataPath` を設定する必要があります。

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><code>dataPath</code> パラメータの値は、ボリュームのルートからの相対パスで指定するファイルの絶対パス、またはボリューム内の複数のParquetファイルを含むフォルダーのいずれかになります。フォルダーを指定する場合は、そのフォルダー内のParquetファイルがすべて同じデータ構造を持っていることを確認してください。</li>
    </ul>
    <p>たとえば、値は <code>path/to/your/file.parquet</code>（ファイル）または <code>path/to/your/folder/</code>（フォルダー）となります。</p>
    <ul>
    <li>データを追加せずに単にフィールドを追加したいだけの場合は、このパラメータを指定しないままにしておくことができます。</li>
    </ul>

    </Admonition>

- `mergeField`

    データマージ操作はリレーショナルデータベースシステムにおける LEFT JOIN 操作と類似しており、マージフィールドがソースコレクションと列指向データを含むParquetファイル間の共通キーとして機能します。

- `newFields`

    これは、データマージ操作後にターゲットコレクションに追加するフィールドのスキーマのリストです。サポートされているデータ型は、VARCHAR、INT8、INT16、INT32、INT64、FLOAT、DOUBLE、および BOOL です。

上記のコマンドはデータマージジョブを作成し、そのジョブIDを返します。 

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

### オブジェクトストレージの使用\{#use-object-storage}

オブジェクトストレージバケットを使用してデータマージ操作を実行するには、まずオブジェクトストレージバケットを作成し、そのバケットにデータをアップロードします。それが完了したら、既存のコレクションとバケットの両方からデータを結合した新しいコレクションを作成するデータマージ操作を実行できます。

次のコードスニペットは、オブジェクトストレージバケットを使用してデータマージ操作を実行する方法を示しています。バケットの作成方法やデータのアップロード方法については、ご利用のブロックストレージサービスプロバイダーのドキュメントをご参照ください。

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

- `dbName` および `collectionName`

    この2つのパラメータは、データマージ操作のソースコレクションを決定します。

- `destDbName` および `destCollectionName`

    この2つのパラメータは、データマージ操作後に生成されるターゲットコレクションを決定します。ターゲットコレクションは、ソースコレクションと同じクラスター内に存在する必要があります。

- `dataSource`

    このパラメータはオプションであり、データソースの設定（データソースのタイプや、ソースコレクションのデータとマージされターゲットコレクションに格納される列指向データを含むParquetファイルのパスなど）を含みます。

    S3互換のオブジェクトストレージバケットを中間ストレージとして使用する場合、`type` を `s3` に設定した後、`dataPath` および `credential` を設定する必要があります。

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><code>dataPath</code> パラメータの値は、バケットのルートを基準としたファイルへの絶対パス、または複数のParquetファイルを含むバケット内のフォルダを指定できます。フォルダを指定する場合、そのフォルダ内のParquetファイルがすべて同じデータ構造を持っていることを確認してください。</li>
    </ul>
    <p>例えば、値は <code>s3://path/to/your/file.parquet</code>（ファイル）または <code>s3://path/to/your/folder/</code>（フォルダ）のようになります。</p>
    <ul>
    <li>データなしで単にフィールドを追加したい場合は、このパラメータを指定しないままにしておくことができます。</li>
    </ul>

    </Admonition>

- `mergeField`

    データマージ操作はリレーショナルデータベースシステムにおける LEFT JOIN 操作に類似しており、マージフィールドはソースコレクションと列指向データを含むParquetファイルとの間で共有キーとして機能します。

- `newFields`

    これは、データマージ操作後にターゲットコレクションに追加されるフィールドのスキーマのリストです。サポートされているデータ型は、VARCHAR、INT8、INT16、INT32、INT64、FLOAT、DOUBLE、および BOOL です。

上記のコマンドはデータマージジョブを作成し、そのジョブIDを返します。 

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

## データなしでフィールドを追加する\{#add-fields-without-data}

既存のコレクションにフィールドを追加するための回避策として、Merge データ API を使用することもできます。この場合、データソースを設定する必要はありません。

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

## 結果の検証\{#verify-the-results}

データマージジョブの ID を取得した後、[Describe Job](/reference/restful/describe-job-v2) または [Manage Project ジョブ](./job-center) に記載されている手順を使用して、そのステータスを詳細に確認できます。

データマージジョブが完了したら、ターゲットコレクションのスキーマおよびターゲットコレクション内のエンティティ数が期待通りであるかを確認してください。

## トラブルシューティング\{#troubleshooting}

1. **Parquet ファイル内の行に、ソースコレクション内のどのエンティティとも一致しないマージキーが含まれている場合、どのように対処すればよいですか？**

    リレーショナルデータベースシステムにおける左外部結合（left join）操作と同様に、データマージ操作ではソースコレクションのすべての行と、指定された Parquet ファイル内で一致する行を結合します。これにより、ソースのすべてのフィールド、`newFields` で定義されたフィールド、および結合されたデータを含む新しい宛先コレクションが生成されます。

    Parquet ファイル内の行のうち、ソースコレクション内にマージキーが一致するものを持つ行のみがマージされます。マージキーがソースコレクション内のどのエンティティとも一致しない行はスキップされます。Parquet ファイル内のすべての行がソースコレクション内のどのエンティティとも一致しない場合、`newFields` で指定されたフィールドのみが（設定されていれば）null 値で作成されます。