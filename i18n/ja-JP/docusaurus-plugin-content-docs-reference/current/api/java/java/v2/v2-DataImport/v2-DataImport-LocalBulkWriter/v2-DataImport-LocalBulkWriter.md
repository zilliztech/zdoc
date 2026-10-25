---
title: "LocalBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LocalBulkWriter インスタンスは、生データを Milvus が認識できる形式でローカルに書き換えます。 | Java | v2"
type: docx
token: N9dldTSNMopDzfxXCTmcKSGynvd
sidebar_position: 5
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベース
  - マルチモーダルベクトルデータベース検索
  - 検索拡張生成
  - zilliz
  - zilliz cloud
  - クラウド
  - LocalBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

LocalBulkWriter インスタンスは、生データを Milvus が認識できる形式でローカルに書き換えます。

```java
io.milvus.bulkwriter.LocalBulkWriter
```

## コンストラクター\{#constructor}

LocalBulkWriter インスタンスを、スキーマ、出力パス、セグメントサイズ、ファイルタイプに基づいて構築します。

LocalBulkWriter オブジェクトは、生データを Milvus が認識できる形式でローカルに書き換えます。

```java
LocalBulkWriter(LocalBulkWriterParam bulkWriterParam)
```

**パラメーター:**

- **bulkWriterParam** (*LocalBulkWriterParam*) -

    LocalBulkWriterParam インスタンスです。

## LocalBulkWriterParam\{#localbulkwriterparam}

**LocalBulkWriterParam** を使用すると、**LocalBulkWriter** インスタンスのプロパティを 1 か所で設定できるため、**LocalBulkWriter** クラスをインスタンス化できます。

```java
LocalBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .build()
```

**ビルダーメソッド:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    **CreateCollectionReq.CollectionSchema** をインスタンス化して定義する、対象コレクションのスキーマです。

- `withLocalPath(String localPath)`

    書き換え後のデータを格納するディレクトリのパスです。

- `withChunkSize(long chunkSize)`

    ファイルセグメントの最大サイズです。Milvus は生データを書き換える際、データをセグメントに分割します。

    デフォルト値は 536,870,912 バイト（512 MB）です。

    BulkWriter によるデータの分割方法は、対象のファイルタイプによって異なります。生成されたファイルが指定したセグメントサイズを超える場合、BulkWriter は複数のファイルを作成し、それぞれセグメントサイズ以下になるよう連番を付けます。

- `withFileType(BulkFileType fileType)`

    出力ファイルのタイプです。使用可能なオプションは BulkFileType に一覧表示されています。

- `withConfig(String key, Object val)`

    CSV ファイルを処理するためのオプション設定を指定するディクショナリです。このパラメーターは、`withFileType()` で `fileType` を `CSV` に設定した場合にのみ適用されます。ディクショナリには次のフィールドが含まれます。

    - **sep** (*string*) -

        CSV ファイルの区切り文字です。値は長さ 1 の文字列である必要があり、デフォルトは "," です。次の文字列は使用できません: "\0"、"\n"、"\r"、""".

    - **nullkey** (*string*) -

        null 値を表す特別な文字列です。デフォルト値は空文字列（""）です。

## 例\{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.LocalBulkWriter;
import io.milvus.bulkwriter.LocalBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import java.util.List;

private static void localWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws Exception {
    LocalBulkWriterParam bulkWriterParam = LocalBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withLocalPath("/tmp/bulk_writer")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(128 * 1024 * 1024)
            .build();

    try (LocalBulkWriter localBulkWriter = new LocalBulkWriter(bulkWriterParam)) {
        // append rows
        Gson GSON_INSTANCE = new Gson();
        for (int i = 0; i < 10000; i++) {
            JsonObject row = new JsonObject();
            row.addProperty("path", "path_" + i);
            row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
            row.addProperty("label", "label_" + i);

            localBulkWriter.appendRow(row);
        }

        localBulkWriter.commit(false);
        List<List<String>> batchFiles = localBulkWriter.getBatchFiles();
        System.out.printf("Local writer done! output local files: %s%n", batchFiles);
    } catch (Exception e) {
        System.out.println("Local writer catch exception: " + e);
        throw e;
    }
}
```
