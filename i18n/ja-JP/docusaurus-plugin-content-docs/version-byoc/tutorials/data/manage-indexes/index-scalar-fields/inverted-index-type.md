---
title: "転置インデックス | BYOC"
slug: /inverted-index-type
sidebar_key: inverted-index-type
sidebar_label: "転置インデックス"
beta: FALSE
notebook: FALSE
description: "データに対して頻繁にフィルタークエリを実行する必要がある場合、`INVERTED` インデックスを使用することでクエリパフォーマンスを劇的に向上させることができます。すべてのドキュメントをスキャンする代わりに、Zilliz Cloud は転置インデックスを使用して、フィルター条件に一致する正確なレコードを迅速に特定します。| BYOC"
type: origin
token: YNczwtWpFiN0CckMvDVcn0pvnEb
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - スカラーフィールド
  - float
  - double
  - varchar
  - string
  - array
  - json
  - 転置インデックス

---

import Admonition from '@theme/Admonition';


# INVERTED

データに対して頻繁にフィルタークエリを実行する必要がある場合、`INVERTED` インデックスはクエリのパフォーマンスを劇的に向上させることができます。すべてのドキュメントをスキャンする代わりに、Zilliz Cloud は転置インデックスを使用して、フィルター条件に一致する正確なレコードを迅速に特定します。

## INVERTED インデックスを使用する時期\{#when-to-use-inverted-indexes}

以下の必要がある場合に、INVERTED インデックスを使用してください：

- **特定の値によるフィルター**: フィールドが特定の値と等しいすべてのレコードを検索します（例：`category == "electronics"`）

- **テキストコンテンツのフィルター**: `VARCHAR` フィールドに対して効率的な検索を実行します

- **JSON フィールド値のクエリ**: JSON 構造内の特定のキーに対してフィルターをかけます

**パフォーマンス上の利点**: INVERTED インデックスを使用すると、大規模なデータセットにおいてコレクション全体のスキャンが不要になるため、クエリ時間を数秒から数ミリ秒に短縮できます。

## INVERTED インデックスの仕組み\{#how-inverted-indexes-work}

Zilliz Cloud における**INVERTED インデックス**は、それぞれの固有のフィールド値（項）を、その値が含まれるドキュメント ID のセットに対応付けます。この構造により、繰り返し出現する値やカテゴリカルな値を持つフィールドに対する高速なルックアップが可能になります。

図に示すように、このプロセスは 2 つのステップで動作します：

1. **順方向マッピング（ID → 項）**: 各ドキュメント ID が、それが含むフィールド値を指します。

1. **逆方向マッピング（項 → IDs）**: Zilliz Cloud は固有の項を集め、各項をそれを含むすべての ID に逆対応付けるマッピングを構築します。

例えば、値 **"electronics"** は ID **1** と **3** に対応し、**"books"** は ID **2** と **5** に対応します。

![A19NwPlGIh1YrGbSBZKcNKz0nhd](https://zdoc-images.s3.us-west-2.amazonaws.com/A19NwPlGIh1YrGbSBZKcNKz0nhd.png)

特定の値でフィルターする場合（例：`category == "electronics"`）、Zilliz Cloud は単にインデックス内でその項をルックアップし、一致する ID を直接取得します。これにより、データセット全体のスキャンを回避し、特にカテゴリカルな値や繰り返し出現する値に対して高速なフィルター処理を実現します。

INVERTED インデックスは、**BOOL**、**INT8**、**INT16**、**INT32**、**INT64**、**FLOAT**、**DOUBLE**、**VARCHAR**、**JSON**、および**ARRAY** など、すべてのスカラーフィールドタイプをサポートしています。ただし、JSON フィールドをインデックス化するためのインデックスパラメータは、通常のスカラーフィールドとは若干異なります。

## JSON 以外のフィールドへのインデックス作成\{#create-indexes-on-non-json-fields}

JSON 以外のフィールドにインデックスを作成するには、以下の手順に従ってください：

1. インデックスパラメータを準備します：

    ```python
    from pymilvus import MilvusClient
    
    client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address
    
    # Create an empty index parameter object
    index_params = client.prepare_index_params()
    ```

1. `INVERTED` インデックスを追加します：

    ```python
    index_params.add_index(
        field_name="category",           # Name of the field to index
        # highlight-next-line
        index_type="INVERTED",          # Specify INVERTED index type
        index_name="category_index"     # Give your index a name
    )
    ```

1. インデックスを作成します：

    ```python
    client.create_index(
        collection_name="my_collection", # Replace with your collection name
        index_params=index_params
    )
    ```

## JSON フィールドにインデックスを作成する\{#create-indexes-on-json-fields}

JSON フィールド内の特定のパスに対して INVERTED インデックスを作成することもできます。これには、JSON パスとデータ型を指定するための追加パラメータが必要です：

```python
# Build index params
index_params.add_index(
    field_name="metadata",                    # JSON field name
    # highlight-next-line
    index_type="INVERTED",
    index_name="metadata_category_index",
    # highlight-start
    params={
        "json_path": "metadata[\"category\"]",    # Path to the JSON key
        "json_cast_type": "varchar"              # Data type to cast to during indexing
    }
    # highlight-end
)

# Create index
client.create_index(
    collection_name="my_collection", # Replace with your collection name
    index_params=index_params
)
```

JSON フィールドのインデックス作成（サポートされるパス、データ型、制限事項を含む）の詳細については、[JSON インデックス作成](./json-indexing) を参照してください。

## インデックスの削除\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>Milvus v2.6.x</strong> と互換性のあるクラスターでは、不要になったスカラーインデックスを、コレクションを解放せずに直接削除できます。</p>

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_index" # Name of the index to drop
)
```

## ベストプラクティス\{#best-practices}

- **データ読み込み後にインデックスを作成する**: より良いパフォーマンスを得るために、すでにデータが含まれているコレクションに対してインデックスの構築を行います

- **説明的なインデックス名を使用する**: フィールドと目的が明確に示される名前を選択します

- **インデックスのパフォーマンスを監視する**: インデックス作成前後のクエリパフォーマンスを確認します

- **クエリパターンを考慮する**: 頻繁にフィルタリングを行うフィールドに対してインデックスを作成します

## 次のステップ\{#next-steps}

- [AUTOINDEX](./autoindex-explained) について学びます。

- 高度な JSON インデックス作成のシナリオについては、[JSON インデックス](./json-indexing) を参照してください

