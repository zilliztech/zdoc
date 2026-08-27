---
title: "Insert() | Cloud"
slug: /cpp/cpp/Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションにデータを挿入します。列ベースまたは行ベースのデータを指定できます。 | Cloud"
type: docx
token: MI1HdCRUbo7J60xbMsic3P9qnIb
sidebar_position: 4
keywords: 
  - ベクトル Dimension
  - ANN Search
  - What are ベクトル embeddings
  - ベクトル データベース tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - Insert()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Insert()

コレクションにデータを挿入します。列ベースまたは行ベースのデータを指定できます。

```c++
Status Insert(const InsertRequest& request, InsertResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = InsertRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionName(partition_name)
    .WithColumnsData(columns_data)
    .AddColumnData(column_data)
    .WithRowsData(rows_data)
    .AddRowData(row_data);
```

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。パーティション名が空の場合は、デフォルトのパーティションが使用されます。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    フルエント インターフェースを使用してフィールド データを設定します。ColumnsData と RowsData を同時に設定することはできません。

- `AddColumnData(const FieldDataPtr& column_data)`

    フルエント インターフェースを使用してフィールド データを設定します。ColumnsData と RowsData を同時に設定することはできません。

- `WithRowsData(EntityRows&& rows_data)`

    フルエント インターフェースを使用してエンティティ行を設定します。ColumnsData と RowsData を同時に設定することはできません。

- `AddRowData(EntityRow&& row_data)`

    フルエント インターフェースを使用してエンティティ行を追加します。ColumnsData と RowsData を同時に設定することはできません。

### 列ペイロード型\{#column-payload-types}

コレクションのスキーマでは、[DataType](./Collections-DataType) を使用して各フィールドの論理型を宣言します。`Insert()` および `Upsert()` の場合は、共通の `FieldDataPtr` ベース ポインター経由で対応する列コンテナーを渡します。

| スキーマ DataType | 列ペイロード型 | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| `BOOL` | `BoolFieldData` | `bool` | ブール型スカラー値。 |
| `INT8`, `INT16`, `INT32`, `INT64` | 対応する `Int*FieldData` | 対応する固定幅整数型 | スキーマの型に一致するコンテナーを選択してください。 |
| `FLOAT`, `DOUBLE` | `FloatFieldData`, `DoubleFieldData` | `float`, `double` | 浮動小数点スカラー値。 |
| `VARCHAR`, `JSON`, `GEOMETRY`, `TIMESTAMPTZ` | `VarCharFieldData` または `JSONFieldData` | `std::string` または `nlohmann::json` | Geometry および timestamptz は、文字列ペイロードのエイリアスを通じて転送されます。 |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | 対応する密ベクトル用 `FieldData` クラス | `std::vector<float>`, `std::vector<uint16_t>`, または `std::vector<int8_t>` | ベクトルのエンコーディング形式に一致するコンテナーを選択してください。 |
| `SPARSE_FLOAT_VECTOR`, `BINARY_VECTOR` | `SparseFloatVecFieldData`, `BinaryVecFieldData` | `std::map<uint32_t, float>` または専用のバイナリ ストレージ | バイナリ ベクトルには専用クラスを使用します。 |
| `ARRAY`, `STRUCT` | 専用の `Array*FieldData` または `StructFieldData` | 要素固有のコンテナー、または配列形式の `nlohmann::json` ストレージ | 配列は要素型を宣言します。構造体では `DataType::STRUCT` を指定した配列テンプレートを使用します。 |
| `UNKNOWN` | なし | なし | 挿入用のペイロードはありません。 |

具象コンテナー `XxxFieldData` のポインター エイリアスは `XxxFieldDataPtr` であり、その型は `std::shared_ptr<XxxFieldData>` です。DML リクエストでは、これらの値を `FieldDataPtr` 経由で受け取ります。

**戻り値:**

*Status*

操作の成否を示すステータスを返します。

### FieldData\{#fielddata}

単一フィールドの列ベース データを表すテンプレート クラスです。サポートされているすべてのデータ型に対応する具象エイリアスが用意されています。`InsertRequest::WithRowsData()` を使ったデータ挿入や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を使ったクエリ/search結果の取得時に、この具象型のインスタンスを使用します。

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

データ変更操作（挿入、アップサート、削除）の結果を保持するクラスです。`InsertResponse`、`UpsertResponse`、または `DeleteResponse` に対して `Results()` を呼び出すことでアクセスできます。

```c++
const DmlResults& results = response.Results();
```

**メソッド:**

- `const IDArray& IdArray() const`

    挿入、アップサート、または削除されたエンティティの ID です。自動 ID コレクションの場合、挿入後にサーバーによって値が設定されます。整数 ID または文字列 ID の読み取り方法については、IDArray を参照してください。

- `uint64_t Timestamp() const`

    サーバー側の操作タイムスタンプです。後続の検索やクエリ呼び出しで `guarantee_timestamp` として渡すことで、read-your-writes 整合性を確保できます。

- `uint64_t InsertCount() const`

    挿入された行数です。`InsertResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t DeleteCount() const`

    削除された行数です。`DeleteResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t UpsertCount() const`

    アップサートされた行数（新規挿入または既存データの置換）です。`UpsertResponse` で値が設定されます。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンス処理に失敗した場合にスローされます。障害の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK を使用した Insert() の使用例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::InsertRequest();
milvus::InsertResponse response;
util::CheckStatus(client->Insert(request, response));
```
