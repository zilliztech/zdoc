---
title: "Insert() | Cloud"
slug: /cpp/cpp/Vector-Insert
sidebar_label: "Insert()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "コレクションにデータを挿入します。列ベースまたは行ベースのデータを入力できます。 | Cloud"
type: docx
token: MI1HdCRUbo7J60xbMsic3P9qnIb
sidebar_position: 4
keywords: 
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - ベクトルデータベースのチュートリアル
  - zilliz
  - zilliz cloud
  - クラウド
  - Insert()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Insert()

コレクションにデータを挿入します。列ベースまたは行ベースのデータを入力できます。

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

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースを使用します。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPartitionName(const std::string& partition_name)`

    パーティション名を設定します。パーティション名が空の場合は、デフォルトのパーティションを使用します。

- `WithColumnsData(std::vector<FieldDataPtr>&& columns_data)`

    フルエントインターフェースを使用してフィールドデータを設定します。ColumnsData と RowsData は同時に設定できません。

- `AddColumnData(const FieldDataPtr& column_data)`

    フルエントインターフェースを使用してフィールドデータを設定します。ColumnsData と RowsData は同時に設定できません。

- `WithRowsData(EntityRows&& rows_data)`

    フルエントインターフェースを使用してエンティティ行を設定します。ColumnsData と RowsData は同時に設定できません。

- `AddRowData(EntityRow&& row_data)`

    フルエントインターフェースを使用してエンティティ行を追加します。ColumnsData と RowsData は同時に設定できません。

### 列ペイロード型\{#column-payload-types}

コレクションのスキーマでは、[DataType](./Collections-DataType) を使用して各フィールドの論理型を宣言します。`Insert()` および `Upsert()` の場合は、共通の `FieldDataPtr` ベースポインターを介して対応する列コンテナーを渡します。

| スキーマ DataType | 列ペイロード型 | C++ での表現 | 備考 |
| --- | --- | --- | --- |
| BOOL | BoolFieldData | bool | ブール型のスカラー値です。 |
| INT8, INT16, INT32, INT64 | 一致する Int&ast;FieldData | 一致する固定幅整数 | スキーマの型に一致するコンテナーを選択してください。 |
| FLOAT, DOUBLE | FloatFieldData, DoubleFieldData | float, double | 浮動小数点スカラー値です。 |
| VARCHAR, JSON, GEOMETRY, TIMESTAMPTZ | VarCharFieldData または JSONFieldData | std::string または nlohmann::json | Geometry と timestamptz は、文字列ペイロードのエイリアスを介して転送されます。 |
| FLOAT_VECTOR, FLOAT16_VECTOR, BFLOAT16_VECTOR, INT8_VECTOR | 一致する密ベクトル FieldData クラス | std::ベクトル&lt;float&gt;、std::ベクトル&lt;uint16_t&gt;、または std::ベクトル&lt;int8_t&gt; | ベクトルのエンコーディングに一致するコンテナーを選択してください。 |
| SPARSE_FLOAT_VECTOR, BINARY_VECTOR | SparseFloatVecFieldData、BinaryVecFieldData | std::map\<uint32_t, float> または専用のバイナリストレージ | バイナリベクトルには専用クラスを使用します。 |
| ARRAY, STRUCT | 専用の Array&ast;FieldData または StructFieldData | 要素固有のコンテナー、または配列形式の nlohmann::json ストレージ | 配列は要素型を宣言します。構造体は、DataType::STRUCT を指定した配列テンプレートを使用します。 |
| UNKNOWN | None | None | 挿入用のペイロードはありません。 |

具象コンテナー `XxxFieldData` のポインターエイリアス `XxxFieldDataPtr` は `std::shared_ptr<XxxFieldData>` です。DML リクエストでは、これらの値を `FieldDataPtr` を介して受け取ります。

**戻り値:**

*Status*

操作が成功したかどうかを示すステータスを返します。

### FieldData\{#fielddata}

これは、単一フィールドの列ベースデータを表すテンプレートクラスです。具象エイリアスは、サポートされているすべてのデータ型に対応しています。具象型のインスタンスは、`InsertRequest::WithRowsData()` を介してデータを挿入する場合や、`QueryResults::OutputField()` および `SingleResult::OutputField()` を介してクエリ/search 結果を読み取る場合に使用します。

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

このクラスは、データ変更操作（挿入、アップサート、削除）の結果を保持します。`InsertResponse`、`UpsertResponse`、または `DeleteResponse` の `Results()` を介してアクセスします。

```c++
const DmlResults& results = response.Results();
```

**メソッド:**

- `const IDArray& IdArray() const`

    挿入、アップサート、または削除されたエンティティの ID です。自動 ID コレクションの場合は、挿入後にサーバーがこの値を設定します。整数 ID または文字列 ID の読み取り方法については、IDArray を参照してください。

- `uint64_t Timestamp() const`

    サーバー側の操作タイムスタンプです。後続の検索またはクエリ呼び出しで `guarantee_timestamp` として渡すことで、read-your-writes 整合性を確保できます。

- `uint64_t InsertCount() const`

    挿入された行数です。`InsertResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t DeleteCount() const`

    削除された行数です。`DeleteResponse` および `UpsertResponse` で値が設定されます。

- `uint64_t UpsertCount() const`

    アップサートされた行数（新規挿入または既存データの置換）です。`UpsertResponse` で値が設定されます。

- `int64_t Cost() const`

    操作のコストをミリ秒単位で返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、通信、またはレスポンスの処理に失敗した場合にスローされます。障害の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

C++ SDK で Insert() を使用する例を示します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
util::CheckStatus(client->Connect(connect_param));

auto request = milvus::InsertRequest();
milvus::InsertResponse response;
util::CheckStatus(client->Insert(request, response));
```
