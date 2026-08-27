---
title: "Upsert() | Cloud"
slug: /cpp/cpp/Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションのエンティティをアップサートします。列ベースまたは行ベースのデータを入力できます。 | Cloud"
type: docx
token: ZOzKddUzaoED8mxB0znc6njxngR
sidebar_position: 10
keywords: 
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - zilliz
  - zilliz cloud
  - cloud
  - Upsert()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Upsert()

コレクションのエンティティをアップサートします。列ベースまたは行ベースのデータを指定できます。

```c++
Status Upsert(const UpsertRequest& request, UpsertResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = UpsertRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithColumnsData(columns_data)
    .AddColumnData(column_data)
    .WithRowsData(rows_data)
    .AddRowData(row_data)
    .WithPartialUpdate(partial_update)
    .WithFieldOps(field_ops)
    .AddFieldOp(field_op);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。データベース名が空の場合、デフォルトデータベースのコレクションを一覧表示します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。空の場合は、デフォルトパーティションにデータが挿入されます。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    Fluent インターフェースでフィールドデータを設定します。ColumnsData と RowsData を同時に設定することはできません。

- `AddColumnData(const FieldDataPtr& column_data)`

    Fluent インターフェースで単一フィールドのデータを設定します。ColumnsData と RowsData を同時に設定することはできません。

- `WithRowsData(EntityRows&& rows_data)`

    Fluent インターフェースでエンティティ行を設定します。ColumnsData と RowsData を同時に設定することはできません。

- `AddRowData(EntityRow&& row_data)`

    Fluent インターフェースでエンティティ行を追加します。ColumnsData と RowsData を同時に設定することはできません。

- `WithPartialUpdate(bool partial_update)`

    データベース名を設定します。True の場合、指定されたフィールドのみが更新され、他のフィールドは変更されません。デフォルトは False です。

- `WithFieldOps(std::vector<FieldPartialUpdateOp>&& field_ops)`

    Fluent インターフェースでフィールドごとの部分更新操作を設定します。

- `AddFieldOp(FieldPartialUpdateOp field_op)`

    フィールドごとの部分更新操作を追加します。

### 列ペイロード型\{#column-payload-types}

コレクションスキーマでは、[DataType](./Collections-DataType) を使用して各フィールドの論理型を宣言します。`Insert()` および `Upsert()` の場合は、共通の `FieldDataPtr` ベースポインター経由で対応する列コンテナーを渡します。

| スキーマ DataType | 列ペイロード型 | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| `BOOL` | `BoolFieldData` | `bool` | ブールスカラー値。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 対応する `Int*FieldData` | 対応する固定幅整数型 | スキーマ型に対応するコンテナーを選択します。 |
| `FLOAT`, `DOUBLE` | `FloatFieldData`, `DoubleFieldData` | `float`, `double` | 浮動小数点スカラー値。 |
| `VARCHAR`, `JSON`, `GEOMETRY`, `TIMESTAMPTZ` | `VarCharFieldData` または `JSONFieldData` | `std::string` または `nlohmann::json` | Geometry および timestamptz は文字列ペイロードエイリアス経由で転送されます。 |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | 対応する密ベクトル `FieldData` クラス | `std::vector<float>`, `std::vector<uint16_t>`, または `std::vector<int8_t>` | ベクトルエンコーディングに対応するコンテナーを選択します。 |
| `SPARSE_FLOAT_VECTOR`, `BINARY_VECTOR` | `SparseFloatVecFieldData`, `BinaryVecFieldData` | `std::map<uint32_t, float>` または専用バイナリストレージ | バイナリベクトルには専用クラスを使用します。 |
| `ARRAY`, `STRUCT` | 特殊化された `Array*FieldData` または `StructFieldData` | 要素固有のコンテナー、または配列形式の `nlohmann::json` ストレージ | 配列は要素型を宣言し、構造体は `DataType::STRUCT` を持つ配列テンプレートを使用します。 |
| `UNKNOWN` | なし | なし | 挿入ペイロードはありません。 |

具象コンテナー `XxxFieldData` のポインターエイリアスは `XxxFieldDataPtr`（`std::shared_ptr<XxxFieldData>`）です。DML リクエストでは、これらの値を `FieldDataPtr` 経由で受け取ります。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドの列ベースデータを表すテンプレートクラスです。サポート対象のすべてのデータ型に対して具象エイリアスが用意されています。`InsertRequest::WithRowsData()` によるデータ挿入や、`QueryResults::OutputField()` および `SingleResult::OutputField()` によるクエリ/search結果の取得時に、この具象型のインスタンスを使用します。

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

### DmlResults\{#dmlresults}

データ変更操作（挿入、アップサート、削除）の結果を保持するクラスです。`InsertResponse`、`UpsertResponse`、または `DeleteResponse` の `Results()` からアクセスできます。

```c++
const DmlResults& results = response.Results();
```

**メソッド:**

- `const IDArray& IdArray() const`

    挿入、アップサート、または削除されたエンティティの ID です。自動 ID コレクションの場合、挿入後にサーバーによって値が設定されます。整数または文字列 ID の読み取り方法については、IDArray を参照してください。

- `uint64_t Timestamp() const`

    サーバー側の操作タイムスタンプです。後続の検索やクエリ呼び出しで `guarantee_timestamp` として渡すことで、Read-your-writes 整合性を確保できます。

- `uint64_t InsertCount() const`

    挿入された行数です。`InsertResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t DeleteCount() const`

    削除された行数です。`DeleteResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t UpsertCount() const`

    アップサートされた行数（新規挿入または既存データの置換）です。`UpsertResponse` で値が設定されます。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、またはレスポンス処理に失敗した場合にスローされます。詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した Upsert() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpsertRequest();
milvus::UpsertResponse response;
util::CheckStatus(client->Upsert(request, response));
```
