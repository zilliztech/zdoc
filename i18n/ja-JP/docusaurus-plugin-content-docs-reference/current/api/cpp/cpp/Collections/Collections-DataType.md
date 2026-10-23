---
title: "DataType | Cloud"
slug: /cpp/cpp/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この Enum は、コレクションのフィールドのデータ型を指定します。`FieldSchema` を構築するとき、または `FieldSchema:WithDataType()` を呼び出すときに、`DataType` の値を渡します。 | Cloud"
type: docx
token: JzFlderJdofWMTxKLpOcTyfon6d
sidebar_position: 16
keywords: 
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k 最近傍アルゴリズム
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

この Enum は、コレクションのフィールドのデータ型を指定します。`FieldSchema` を構築するとき、または `FieldSchema::WithDataType()` を呼び出すときに、`DataType` の値を渡します。

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
    TEXT = 25,
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

**値：**

*スカラー型：*

- **BOOL** (1) - ブール値（`true` / `false`）。

- **INT8** (2) - 8 ビット符号付き整数（−128～127）。

- **INT16** (3) - 16 ビット符号付き整数。

- **INT32** (4) - 32 ビット符号付き整数。

- **INT64** (5) - 64 ビット符号付き整数。主キーとしてサポートされる唯一のスカラー型です。

- **FLOAT** (10) - 32 ビット単精度浮動小数点数。

- **DOUBLE** (11) - 64 ビット倍精度浮動小数点数。

- **VARCHAR** (21) - 可変長 UTF-8 文字列。`WithMaxLength()` が必要です（最大 65535 バイト）。

- **ARRAY** (22) - 単一型のスカラー要素の配列。`WithElementType()` と `WithMaxCapacity()` が必要です。

- **JSON** (23) - 非構造化 JSON ドキュメント。ネストされた任意のキーパスに対する動的フィルタリングをサポートします。

- **GEOMETRY** (24) - Well-Known Binary（WKB）形式で格納される Geometric/spatial データ。

- **TEXT** (25) - 全文検索用のテキストデータ型。トークン化のためにテキスト分析インデックスでインデックス化されます。

- **TIMESTAMPTZ** (26) - タイムゾーン付きタイムスタンプ（RFC 3339 文字列）。

*ベクトル型：*

- **BINARY_VECTOR** (100) - ビットパックされたバイナリベクトル。次元は 8 の倍数である必要があります。`WithDimension()` が必要です。通常、`MetricType::HAMMING` または `MetricType::JACCARD` と組み合わせて使用します。

- **FLOAT_VECTOR** (101) - 32 ビット浮動小数点数の密ベクトル。`WithDimension()` が必要です。最も一般的なベクトル型です。

- **FLOAT16_VECTOR** (102) - 16 ビット半精度（FP16）浮動小数点ベクトル。`WithDimension()` が必要です。再現率の低下を最小限に抑えながら、`FLOAT_VECTOR` の半分のメモリを使用します。

- **BFLOAT16_VECTOR** (103) - Brain Float 16（BF16）ベクトル。`WithDimension()` が必要です。FP16 より数値範囲が広く、ML モデルの出力によく使用されます。

- **SPARSE_FLOAT_VECTOR** (104) - ほとんどの次元がゼロであるスパース浮動小数点ベクトル。固定次元はありません。`MetricType::BM25` によるキーワード検索に使用されます。

- **INT8_VECTOR** (105) - INT8 量子化された密ベクトル。`WithDimension()` が必要です。密ベクトル型の中でメモリ使用量が最小です。

*マルチベクトル型：*

- **STRUCT** (201) - 複数の名前付きサブベクトルを含むマルチベクトル構造体フィールド。`StructFieldSchema` とともに使用します。

*内部型：*

- **UNKNOWN** (0) - 未初期化または認識されない型。直接使用しないでください。

### スキーマ型とカラムペイロード\{#schema-type-and-column-payloads}

`DataType` は、コレクションのスキーマに格納される論理型を識別します。これは `Insert()` と `Upsert()` で共有されますが、DML リクエストで渡される C++ コンテナーではありません。これらのメソッドは、各スキーマ型を具体的な `XxxFieldData` コンテナーにマッピングし、`FieldDataPtr` を介してそれを受け取ります。

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
