---
title: "Upsert() | Cloud"
slug: /cpp/cpp/Vector-Upsert
sidebar_label: "Upsert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションのエンティティを upsert します。列ベースのデータまたは行ベースのデータを入力できます。 | Cloud"
type: docx
token: ZOzKddUzaoED8mxB0znc6njxngR
sidebar_position: 10
keywords: 
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - Upsert()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Upsert()

コレクションのエンティティを upsert します。列ベースのデータまたは行ベースのデータを入力できます。

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

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    データベース名を設定します。データベース名が空の場合、デフォルトデータベースのコレクションが一覧表示されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクションの名前を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティションの新しい名前を設定します。パーティション名が空の場合、デフォルトパーティションにデータが挿入されます。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    fluent インターフェースを使用してフィールドデータを設定します。ColumnsData と RowsData の両方は設定できません。

- `AddColumnData(const FieldDataPtr& column_data)`

    fluent インターフェースを使用してフィールドデータを設定します。ColumnsData と RowsData の両方は設定できません。

- `WithRowsData(EntityRows&& rows_data)`

    fluent インターフェースを使用してエンティティ行を設定します。ColumnsData と RowsData の両方は設定できません。

- `AddRowData(EntityRow&& row_data)`

    fluent インターフェースを使用してエンティティ行を追加します。ColumnsData と RowsData の両方は設定できません。

- `WithPartialUpdate(bool partial_update)`

    データベース名を設定します。True の場合、指定したフィールドのみが更新され、その他のフィールドは変更されません。デフォルトは False です。

- `WithFieldOps(std::vector<FieldPartialUpdateOp>&& field_ops)`

    fluent インターフェースを使用して、フィールドごとの部分更新操作を設定します。

- `AddFieldOp(FieldPartialUpdateOp field_op)`

    フィールドごとの部分更新操作を追加します。

### 列ペイロード型\{#column-payload-types}

コレクションのスキーマでは、[DataType](./Collections-DataType) を使用して各フィールドの論理型を宣言します。`Insert()` および `Upsert()` では、共通の `FieldDataPtr` ベースポインターを介して対応する列コンテナを指定します。

| スキーマの DataType | 列ペイロード型 | C++ 表現 | 注記 |
| --- | --- | --- | --- |
| BOOL | BoolFieldData | bool | ブールスカラー値です。 |
| INT8, INT16, INT32, INT64 | Matching Int&ast;FieldData | Matching fixed-width integer | スキーマ型に一致するコンテナを選択してください。 |
| FLOAT, DOUBLE | FloatFieldData, DoubleFieldData | float, double | 浮動小数点スカラー値です。 |
| VARCHAR, JSON, GEOMETRY, TIMESTAMPTZ | VarCharFieldData or JSONFieldData | std::string or nlohmann::json | Geometry と timestamptz は文字列ペイロードのエイリアスを介して転送されます。 |
| FLOAT_VECTOR, FLOAT16_VECTOR, BFLOAT16_VECTOR, INT8_VECTOR | Matching dense-ベクトル FieldData class | std::ベクトル&lt;float&gt;, std::ベクトル&lt;uint16_t&gt;, or std::ベクトル&lt;int8_t&gt; | ベクトルエンコーディングに一致するコンテナを選択してください。 |
| SPARSE_FLOAT_VECTOR, BINARY_VECTOR | SparseFloatVecFieldData, BinaryVecFieldData | std::map\<uint32_t, float> or dedicated binary storage | バイナリベクトルは専用のクラスを使用します。 |
| ARRAY, STRUCT | Specialized Array&ast;FieldData or StructFieldData | Element-specific container or array-style nlohmann::json storage | 配列は要素型を宣言します。構造体は DataType::STRUCT を指定した配列テンプレートを使用します。 |
| UNKNOWN | None | None | 挿入ペイロードはありません。 |

具象コンテナ `XxxFieldData` の場合、ポインターエイリアス `XxxFieldDataPtr` は `std::shared_ptr<XxxFieldData>` です。DML リクエストは、これらの値を `FieldDataPtr` を介して受け取ります。

**戻り値：**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

これは、単一フィールドの列ベースのデータを表すテンプレートクラスです。具象エイリアスは、サポートされるすべてのデータ型に対応しています。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入する場合、または `QueryResults::OutputField()` と `SingleResult::OutputField()` を介してクエリ/search 結果を読み取る場合に使用されます。

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

このクラスは、データ変更操作（挿入、upsert、または削除）の結果を保持します。`InsertResponse`、`UpsertResponse`、または `DeleteResponse` の `Results()` を介してアクセスします。

```c++
const DmlResults& results = response.Results();
```

**メソッド：**

- `const IDArray& IdArray() const`

    挿入、upsert、または削除されたエンティティの ID です。自動 ID のコレクションでは、挿入後にサーバーがこの値を設定します。整数または文字列の ID を読み取る方法については、IDArray を参照してください。

- `uint64_t Timestamp() const`

    サーバー側の操作タイムスタンプです。後続の検索またはクエリ呼び出しで `guarantee_timestamp` として渡すことで、read-your-writes 整合性を確保できます。

- `uint64_t InsertCount() const`

    挿入された行の数です。`InsertResponse` および `UpsertResponse` に設定されます。

- `uint64_t DeleteCount() const`

    削除された行の数です。`DeleteResponse` および `UpsertResponse` に設定されます。

- `uint64_t UpsertCount() const`

    upsert された（新規として挿入されたか、既存の行が置き換えられた）行の数です。`UpsertResponse` に設定されます。

- `int64_t Cost() const`

    操作のコストをミリ秒単位で返します。

**エラーハンドリング：**

- **std::exception**

    リクエストの構築、転送、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で Upsert() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::UpsertRequest();
milvus::UpsertResponse response;
util::CheckStatus(client->Upsert(request, response));
```
