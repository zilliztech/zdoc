---
title: "DataType | Cloud"
slug: /cpp/cpp/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この列挙型は、コレクションのフィールドのデータ型を指定します。`DataType` の構築時や `FieldSchema` の呼び出し時に、`FieldSchema:WithDataType()` 値を渡します。 | Cloud"
type: docx
token: SGYTdh0fJo6O1uxW3yjcET9Nnpf
sidebar_position: 16
keywords: 
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
  - k近傍法
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# DataType

この列挙型は、コレクションのフィールドのデータ型を指定します。`DataType` の構築時や `FieldSchema` の呼び出し時に、`FieldSchema::WithDataType()` 値を渡します。

```c++
enum class DataType {
    UNKNOWN = 0,
    BOOL = 1,
    INT8 = 2,
    INT16 = 3,
    INT32 = 4,
    INT64 = 5,
    FLOAT = 10,
    DOUBLE = 11,
    VARCHAR = 21,
    ARRAY = 22,
    JSON = 23,
    GEOMETRY = 24,
    TIMESTAMPTZ = 26,
    BINARY_VECTOR = 100,
    FLOAT_VECTOR = 101,
    FLOAT16_VECTOR = 102,
    BFLOAT16_VECTOR = 103,
    SPARSE_FLOAT_VECTOR = 104,
    INT8_VECTOR = 105,
    STRUCT = 201,
};
```

**値:**

*スカラー型:*

- **BOOL** (1) - ブール値 (`true` / `false`)。

- **INT8** (2) - 8ビット符号付き整数 (−128 〜 127)。

- **INT16** (3) - 16ビット符号付き整数。

- **INT32** (4) - 32ビット符号付き整数。

- **INT64** (5) - 64ビット符号付き整数。主キーとしてサポートされる唯一のスカラー型です。

- **FLOAT** (10) - 32ビット単精度浮動小数点数。

- **DOUBLE** (11) - 64ビット倍精度浮動小数点数。

- **VARCHAR** (21) - 可変長UTF-8文字列。`WithMaxLength()` の指定が必要です（最大65,535バイト）。

- **ARRAY** (22) - 単一型のスカラー要素からなる配列。`WithElementType()` と `WithMaxCapacity()` の指定が必要です。

- **JSON** (23) - 非構造化JSONドキュメント。任意のネストされたキーパスに対する動的フィルタリングをサポートします。

- **GEOMETRY** (24) - Well-Known Binary (WKB) 形式で格納されるジオメトリ/spatialデータ。

- **TIMESTAMPTZ** (26) - タイムゾーン付きタイムスタンプ（RFC 3339文字列）。

*ベクトル型:*

- **BINARY_VECTOR** (100) - ビットパックされたバイナリベクトル。次元数は8の倍数である必要があります。`WithDimension()` の指定が必要です。通常は `MetricType::HAMMING` または `MetricType::JACCARD` と組み合わせて使用します。

- **FLOAT_VECTOR** (101) - 32ビット浮動小数点の密ベクトル。`WithDimension()` の指定が必要です。最も一般的なベクトル型です。

- **FLOAT16_VECTOR** (102) - 16ビット半精度 (FP16) 浮動小数点ベクトル。`WithDimension()` の指定が必要です。`FLOAT_VECTOR` の半分のメモリ消費量で、リコールの低下も最小限に抑えられます。

- **BFLOAT16_VECTOR** (103) - Brain Float 16 (BF16) ベクトル。`WithDimension()` の指定が必要です。FP16よりも数値範囲が広く、MLモデルの出力などでよく利用されます。

- **SPARSE_FLOAT_VECTOR** (104) - ほとんどの次元がゼロであるスパース浮動小数点ベクトル。固定次元はありません。`MetricType::BM25` を用いたキーワード検索に使用されます。

- **INT8_VECTOR** (105) - INT8量子化された密ベクトル。`WithDimension()` の指定が必要です。密ベクトル型の中で最もメモリフットプリントが小さくなります。

*マルチベクトル型:*

- **STRUCT** (201) - 複数の名前付きサブベクトルを含むマルチベクトル構造体フィールド。`StructFieldSchema` と併用します。

*内部用:*

- **UNKNOWN** (0) - 未初期化または認識できない型です。直接使用しないでください。

### スキーマ型とカラムペイロード\{#schema-type-and-column-payloads}

`DataType` は、コレクションのスキーマに格納される論理型を示します。これは `Insert()` および `Upsert()` で共通ですが、DMLリクエストで渡されるC++コンテナそのものではありません。これらのメソッドでは、各スキーマ型が具体的な `XxxFieldData` コンテナにマッピングされ、`FieldDataPtr` を通じて受け付けられます。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/DataType.h>
using namespace milvus;

CollectionSchemaPtr schema = std::make_shared<CollectionSchema>();

// Scalar fields
schema->AddField(FieldSchema("id",   DataType::INT64,   "primary key").WithPrimaryKey(true));
schema->AddField(FieldSchema("name", DataType::VARCHAR, "user name").WithMaxLength(200));
schema->AddField(FieldSchema("age",  DataType::INT8,    "user age"));
schema->AddField(FieldSchema("tags", DataType::ARRAY,   "tag list")
                    .WithElementType(DataType::VARCHAR).WithMaxCapacity(10));
schema->AddField(FieldSchema("meta", DataType::JSON,    "extra metadata"));

// Vector field
schema->AddField(FieldSchema("vec", DataType::FLOAT_VECTOR, "embedding").WithDimension(128));

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
client->CreateCollection(
    CreateCollectionRequest()
        .WithCollectionName("my_collection")
        .WithCollectionSchema(schema));
```
