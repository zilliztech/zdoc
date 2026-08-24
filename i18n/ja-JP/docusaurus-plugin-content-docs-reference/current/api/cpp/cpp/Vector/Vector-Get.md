---
title: "Get() | Cloud"
slug: /cpp/cpp/Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "主キーを指定してクエリを実行し、レコードのリストを返します。 | Cloud"
type: docx
token: Ve9xdWGNYobA52xfC7kcD4wMnkh
sidebar_position: 2
keywords: 
  - ビデオ検索
  - AIハルシネーション
  - AIエージェント
  - セマンティック検索
  - zilliz
  - zilliz cloud
  - cloud
  - Get()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Get()

主キーを指定してクエリを実行し、レコードのリストを返します。

```c++
Status Get(const GetRequest& request, GetResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
    .WithOutputFields(output_field_names)
    .WithConsistencyLevel(consistency_level)
    .WithIDs(id_array);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionNames(std::set<std::string>&& partition_names)`

    パーティション名を設定します。空の場合はデフォルトのパーティションが適用されます。

- `AddPartitionName(const std::string& partition_name)`

    パーティション名を追加します。

- `WithOutputFields(std::set<std::string>&& output_field_names)`

    出力フィールド名を設定します。

- `AddOutputField(const std::string& output_field)`

    出力フィールドを追加します。

- `WithConsistencyLevel(ConsistencyLevel consistency_level)`

    整合性レベルを設定します。

- `WithIDs(std::ベクトル<int64_t>&& id_array)`

    ID配列を設定します。

**戻り値:**

*Status* および *GetResponse*

`status.IsOk()` を確認して、成功したかどうかを判定します。

### FieldData\{#fielddata}

単一フィールドの列ベースデータを表すテンプレートクラスです。具象エイリアスはサポートされているすべてのデータ型を網羅しています。具象型のインスタンスは、`InsertRequest::WithRowsData()` によるデータの挿入や、/search クエリの結果を `QueryResults::OutputField()` および `SingleResult::OutputField()` で読み取る際に使用されます。

```c++
// Base abstract interface (not instantiated directly)
class Field {
    const std::string& Name() const;
    DataType Type() const;
    DataType ElementType() const;   // for ARRAY fields only
    virtual size_t Count() const = 0;
    virtual void Reserve(size_t count) = 0;
};

using FieldDataPtr = std::shared_ptr<Field>;

// Template class
template <typename T, DataType Dt>
class FieldData : public Field {
    explicit FieldData(std::string name);
    FieldData(std::string name, const std::vector<T>& data);
    FieldData(std::string name, const std::vector<T>& data, const std::vector<bool>& valid_data);

    StatusCode Add(const T& element);
    StatusCode AddNull();
    StatusCode Append(const std::vector<T>& elements);
    size_t Count() const;
    void Reserve(size_t count);
    virtual const std::vector<T>& Data() const;
    virtual T Value(size_t i) const;
    virtual bool IsNull(size_t i) const;
    virtual const std::vector<bool>& ValidData() const;
};
```

### QueryResults\{#queryresults}

このクラスは、`Query()` の呼び出しによって返される列ベースの結果データを保持します。`QueryResponse` オブジェクトに対して `Results()` を使用してアクセスします。

```c++
const QueryResults& results = response.Results();
```

**メソッド:**

- `FieldDataPtr OutputField(const std::string& name) const`

    指定された名前の出力フィールドを `FieldDataPtr` として返します。`std::dynamic_pointer_cast<Int64FieldData>(results.OutputField("id"))` を使用して具象型にキャストしてください。

- `const std::ベクトル<FieldDataPtr>& OutputFields() const`

    サーバーから返された順序で、すべての出力フィールドを返します。

- `const std::set<std::string>& OutputFieldNames() const`

    クエリで要求された出力フィールド名のセットを返します。

- `Status OutputRows(EntityRows& rows) const`

    すべての結果行をJSON形式の行マップのベクトルに変換し、`rows` に格納します。

- `Status OutputRow(int i, EntityRow& row) const`

    インデックス `i` の行をJSON形式の行マップに変換します。

- `uint64_t GetRowCount() const`

    返された行数です。クエリで `count(*)` が使用されている場合、集計カウントが返されます。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

## フィールドデータの型エイリアス\{#field-data-type-aliases}

| カテゴリ | 具象型 | 表現と備考 |
| --- | --- | --- |
| スカラー | `BoolFieldData`, `Int8FieldData`, `Int16FieldData`, `Int32FieldData`, `Int64FieldData`, `FloatFieldData`, `DoubleFieldData`, `VarCharFieldData`, `JSONFieldData`, `GeometryFieldData`, `TimestamptzFieldData` | `FieldData<T, DataType::...>` のエイリアスです。ジオメトリはWKT文字列、timestamptzはISO-8601文字列を使用します。 |
| ベクトル | `FloatVecFieldData`, `Float16VecFieldData`, `BFloat16VecFieldData`, `Int8VecFieldData`, `SparseFloatVecFieldData`, `BinaryVecFieldData` | 密ベクトルおよび疎ベクトルのコンテナです。`BinaryVecFieldData` は文字列変換ヘルパーを持つ派生クラスです。 |
| 配列と構造体 | `ArrayBoolFieldData`, `ArrayInt8FieldData`, `ArrayInt16FieldData`, `ArrayInt32FieldData`, `ArrayInt64FieldData`, `ArrayFloatFieldData`, `ArrayDoubleFieldData`, `ArrayVarCharFieldData`, `StructFieldData` | `ArrayFieldData<T, Et>` のエイリアスです。各エンティティ行はベクトルとなります。構造体の値はJSONストレージを使用します。 |
| 共有ポインタ | `XxxFieldDataPtr` | 各具象フィールドデータ型には、対応する `std::shared_ptr<XxxFieldData>` エイリアスが用意されています。 |

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<int64_t> ids = {5, 1, 10, 8};
auto request = milvus::GetRequest()
                   .WithCollectionName(collection_name)
                   .WithIDs(std::move(ids))
                   .AddOutputField(field_vector);

milvus::GetResponse response;
status = client->Get(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto query_results = response.Results();
milvus::EntityRows output_rows;
status = query_results.OutputRows(output_rows);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Get results:" << std::endl;
for (const auto& row : output_rows) {
    std::cout << "\t" << row << std::endl;
}
```
