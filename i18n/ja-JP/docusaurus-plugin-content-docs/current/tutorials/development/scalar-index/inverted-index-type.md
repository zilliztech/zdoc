---
title: "INVERTED | Cloud"
slug: /inverted-index-type
sidebar_label: "INVERTED"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データに対して頻繁にフィルタクエリを実行する必要がある場合、`INVERTED` インデックスはクエリ性能を大幅に向上させます。すべてのドキュメントをスキャンする代わりに、Zilliz Cloud は転置インデックスを使用して、フィルタ条件に一致する正確なレコードをすばやく特定します。 | Cloud"
type: origin
token: YNczwtWpFiN0CckMvDVcn0pvnEb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# INVERTED

データに対して頻繁にフィルタクエリを実行する必要がある場合、`INVERTED` インデックスはクエリ性能を大幅に向上させます。すべてのドキュメントをスキャンする代わりに、Zilliz Cloud は転置インデックスを使用して、フィルタ条件に一致する正確なレコードをすばやく特定します。

## INVERTED インデックスを使用する場面\{#when-to-use-inverted-indexes}

次のような場合は INVERTED インデックスを使用します。

- **特定の値でフィルタする**: フィールドが特定の値に等しいすべてのレコードを見つける（例: `category == "electronics"`）

- **テキスト内容をフィルタする**: `VARCHAR` フィールドに対して効率的な検索を実行する

- **JSON フィールドの値をクエリする**: JSON 構造内の特定のキーでフィルタする

**性能上のメリット**: INVERTED インデックスは、コレクション全体のスキャンの必要をなくすことで、大規模データセットにおけるクエリ時間を秒単位からミリ秒単位へ短縮できます。

## INVERTED インデックスの仕組み\{#how-inverted-indexes-work}

Zilliz Cloud の **INVERTED インデックス** は、各一意のフィールド値（term）を、その値が出現するドキュメント ID の集合にマッピングします。この構造により、繰り返し現れる値やカテゴリ値を持つフィールドに対して高速なルックアップが可能になります。

図に示すように、この処理は 2 つのステップで動作します。

1. **順方向マッピング（ID → Term）:** 各ドキュメント ID は、それが保持するフィールド値を指します。

1. **逆方向マッピング（Term → IDs）:** Zilliz Cloud は一意の term を収集し、各 term からそれを含むすべての ID への逆マッピングを構築します。

たとえば、値 **"electronics"** は ID **1** および **3** にマッピングされ、**"books"** は ID **2** および **5** にマッピングされます。

![A19NwPlGIh1YrGbSBZKcNKz0nhd](https://zdoc-images.s3.us-west-2.amazonaws.com/A19NwPlGIh1YrGbSBZKcNKz0nhd.png)

特定の値でフィルタする場合（例: `category == "electronics"`）、Zilliz Cloud はインデックス内でその term を参照し、一致する ID を直接取得するだけです。これにより、データセット全体をスキャンする必要がなくなり、特にカテゴリ値や繰り返し値に対して高速なフィルタリングが可能になります。

INVERTED インデックスは、**BOOL**、**INT8**、**INT16**、**INT32**、**INT64**、**FLOAT**、**DOUBLE**、**VARCHAR**、**JSON**、**ARRAY** など、すべてのスカラーフィールド型をサポートします。ただし、JSON フィールドをインデックス化する際のインデックスパラメータは、通常のスカラーフィールドとは少し異なります。

## JSON 以外のフィールドにインデックスを作成する\{#create-indexes-on-non-json-fields}

JSON 以外のフィールドにインデックスを作成するには、次の手順に従います。

1. インデックスパラメータを準備します。

    ```python
    from pymilvus import MilvusClient
    
    client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address
    
    # Create an empty index parameter object
    index_params = client.prepare_index_params()
    ```

1. `INVERTED` インデックスを追加します。

    ```python
    index_params.add_index(
        field_name="category",           # Name of the field to index
        # highlight-next-line
        index_type="INVERTED",          # Specify INVERTED index type
        index_name="category_index"     # Give your index a name
    )
    ```

1. インデックスを作成します。

    ```python
    client.create_index(
        collection_name="my_collection", # Replace with your collection name
        index_params=index_params
    )
    ```

## JSON フィールドにインデックスを作成する\{#create-indexes-on-json-fields}

JSON フィールド内の特定のパスに対して INVERTED インデックスを作成することもできます。これには、JSON パスとデータ型を指定する追加パラメータが必要です。

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

サポートされるパス、データ型、制限事項など、JSON フィールドのインデックス化に関する詳細は、[JSON Indexing](./json-indexing) を参照してください。

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" icon="📘" title="注意">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。先にコレクションをリリースする必要はありません。

</Admonition>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_index" # Name of the index to drop
)
```

## ベストプラクティス\{#best-practices}

- **データのロード後にインデックスを作成する**: より良い性能のために、すでにデータを含んでいるコレクション上でインデックスを構築する

- **わかりやすいインデックス名を使う**: フィールドと用途が明確にわかる名前を選ぶ

- **インデックス性能を監視する**: インデックス作成前後でクエリ性能を確認する

- **クエリパターンを考慮する**: 頻繁にフィルタするフィールドにインデックスを作成する

## 次のステップ\{#next-steps}

- [AUTOINDEX](./autoindex-explained) について学ぶ

- 高度な JSON インデックス化シナリオについては [JSON Indexing](./json-indexing) を参照する

