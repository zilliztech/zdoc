---
title: "LocalBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-LocalBulkWriter
sidebar_label: "LocalBulkWriter"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "LocalBulkWriter インスタンスは、生データをローカルで Milvus が理解できる形式に書き換えます。 | Java | v2"
type: docx
token: G7F9dQ8DwoZsaVxExdnc7K6an3g
sidebar_position: 5
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - クラウド
  - LocalBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# LocalBulkWriter

**LocalBulkWriter** インスタンスは、生データをローカルで Milvus が理解できる形式に書き換えます。

```java
io.milvus.bulkwriter.LocalBulkWriter
```

## Constructor\{#constructor}

スキーマ、出力パス、セグメントサイズ、およびファイルタイプによって **LocalBulkWriter** インスタンスを構築します。

<Admonition type="info" icon="📘" title="Notes">

**LocalBulkWriter** オブジェクトは、生データをローカルで Milvus が理解できる形式に書き換えることを目的としています。

</Admonition>

```java
LocalBulkWriter(LocalBulkWriterParam bulkWriterParam)
```

**PARAMETERS:**

- **bulkWriterParam** (*LocalBulkWriterParam*) -

    [LocalBulkWriterParam](./v2-DataImport-LocalBulkWriter#localbulkwriterparam) インスタンス。

## LocalBulkWriterParam\{#localbulkwriterparam}

**LocalBulkWriterParam** を使用すると、**LocalBulkWriter** クラスをインスタンス化できるように、**LocalBulkWriter** インスタンスのプロパティを 1 か所で設定できます。

```java
LocalBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .build()
```

**BUILDER METHODS:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    **CreateCollectionReq.CollectionSchema** をインスタンス化して定義する、対象コレクションのスキーマ。

- `withLocalPath(String localPath)`

    書き換えられたデータを格納するディレクトリへのパス。

- `withChunkSize(long chunkSize)`

    ファイルセグメントの最大サイズ。生データの書き換え中に、Milvus はそれを複数のセグメントに分割します。

    デフォルト値は **536,870,912** バイトで、**512 MB** です。

    <Admonition type="info" icon="📘" title="**BulkWriter はどのようにデータをセグメント化しますか？**">

    BulkWriter がデータをセグメント化する方法は、対象のファイルタイプによって異なります。
    
    生成されたファイルが指定されたセグメントサイズを超える場合、BulkWriter は複数のファイルを作成し、それぞれがセグメントサイズを超えないように連番で名前を付けます。

    </Admonition>

- `withFileType(BulkFileType fileType)`

    出力ファイルのタイプ。使用可能なオプションは [BulkFileType](./v2-DataImport-BulkFileType) に一覧表示されています。

- `withConfig(String key, Object val)`

    CSV ファイルを処理するためのオプション設定を指定する辞書。このパラメータは、`withFileType()` で `fileType` を `CSV` に設定した場合にのみ適用されます。辞書には次のフィールドが含まれます。

    - **sep** (*string*) -

        CSV ファイルの区切り文字。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*) -

        null 値を表す特別な文字列。デフォルト値は空文字列 `""` です。

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.LocalBulkWriter;
import io.milvus.bulkwriter.LocalBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

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

