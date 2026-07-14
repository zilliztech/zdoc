---
title: "VolumeBulkWriter | Java | v2"
slug: /java/java/v2-DataImport-VolumeBulkWriter
sidebar_label: "VolumeBulkWriter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "VolumeBulkWriter インスタンスは、生データを Milvus が理解できる形式で Zilliz Cloud Volume に書き換えます。 | Java | v2"
type: docx
token: NtxedWgOpof2Qtx8BU2ckktunWc
sidebar_position: 7
keywords: 
  - ベクトル検索
  - knn algorithm
  - HNSW
  - 非構造化データとは
  - zilliz
  - zilliz cloud
  - cloud
  - VolumeBulkWriter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# VolumeBulkWriter

**VolumeBulkWriter** インスタンスは、生データを Milvus が理解できる形式で Zilliz Cloud Volume に書き換えます。

```java
io.milvus.bulkwriter.VolumeBulkWriter
```

## Constructor\{#constructor}

スキーマ、出力パス、セグメントサイズ、およびファイルタイプによって **VolumeBulkWriter** インスタンスを構築します。

<Admonition type="info" icon="📘" title="Notes">

**VolumeBulkWriter** オブジェクトは、生データを Milvus が理解できる形式で Zilliz Cloud Volume に書き換えることを目的としています。

</Admonition>

```java
VolumeBulkWriter(VolumeBulkWriterParam bulkWriterParam)
```

**PARAMETERS:**

- **bulkWriterParam** (*VolumeBulkWriterParam*) -

    [VolumeBulkWriterParam](./v2-DataImport-VolumeBulkWriter#volumebulkwriterparam) インスタンス。

## VolumeBulkWriterParam\{#volumebulkwriterparam}

**VolumeBulkWriterParam** を使用すると、**VolumeBulkWriter** クラスをインスタンス化できるように、**VolumeBulkWriter** インスタンスのプロパティを 1 か所で設定できます。

```java
VolumeBulkWriterParam.newBuilder()
    .withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)
    .withLocalPath(String localPath)
    .withChunkSize(long chunkSize)
    .withFileType(BulkFileType fileType)
    .withConfig(String key, Object val)
    .withCloudEndpoint(string cloudEndpoint)
    .withApiKey(string apiKey)
    .withVolumeName(string volumeName)
    .build()
```

**BUILDER METHODS:**

- `withCollectionSchema(CreateCollectionReq.CollectionSchema collectionSchema)`

    **CreateCollectionReq.CollectionSchema** をインスタンス化して定義された、対象コレクションのスキーマです。

- `withLocalPath(String localPath)`

    書き換えられたデータを保持するディレクトリへのパスです。

- `withChunkSize(long chunkSize)`

    ファイルセグメントの最大サイズです。生データの書き換え中、Milvus はそれをセグメントに分割します。

    デフォルト値はバイト単位で **536,870,912**、つまり **512 MB** です。

    <Admonition type="info" icon="📘" title="**BulkWriter はどのようにデータをセグメント化しますか？**">

    BulkWriter がデータをセグメント化する方法は、対象のファイルタイプによって異なります。
    
    生成されたファイルが指定されたセグメントサイズを超える場合、BulkWriter は複数のファイルを作成し、それぞれがセグメントサイズを超えないように連番で名前を付けます。

    </Admonition>

- `withFileType(BulkFileType fileType)`

    出力ファイルのタイプです。使用可能なオプションは [BulkFileType](./v2-DataImport-BulkFileType) に記載されています。

- `withConfig(String key, Object val)`

    CSV ファイルを処理するためのオプション設定を指定するディクショナリです。このパラメータは、`withFileType()` で `fileType` を `CSV` に設定した場合にのみ適用されます。ディクショナリには以下のフィールドが含まれます。

    - **sep** (*string*) -

        CSV ファイルの区切り文字です。値は長さ 1 の文字列である必要があり、デフォルトは `","` です。次の文字列は使用できません: `"\0"`, `"\n"`, `"\r"`, `"""`.

    - **nullkey** (*string*) -

        null 値を表す特別な文字列です。デフォルト値は空文字列です: `""`.

- `withCloudEndpoint(string cloudEndpoint)`

    Zilliz Cloud のパブリックエンドポイントは常に `https:*//*api.cloud.zilliz.com` です。

- `withApiKey(string apiKey)`

    この操作に関連するリソースを操作するための十分な権限を持つ、有効な Zilliz Cloud API キーです。

- `withVolumeName(string volumeName)`

    有効なボリューム名です。指定した名前のボリュームが存在することを確認してください。

## Example\{#example}

```java
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.VolumeBulkWriter;
import io.milvus.bulkwriter.VolumeBulkWriterParam;
import io.milvus.bulkwriter.common.clientenum.BulkFileType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

private static void volumeWriter(CreateCollectionReq.CollectionSchema collectionSchema) throws Exception {
    VolumeBulkWriterParam bulkWriterParam = VolumeBulkWriterParam.newBuilder()
            .withCollectionSchema(collectionSchema)
            .withRemotePath("/tmp/bulk_writer")
            .withFileType(BulkFileType.PARQUET)
            .withChunkSize(128 * 1024 * 1024)
            .withCloudEndpoint("https://api.cloud.zilliz.com")
            .withApiKey("YOUR_API_KEY")
            .withVolumeName("my_volume")
            .build();

    try (VolumeBulkWriter volumeBulkWriter = new VolumeBulkWriter(bulkWriterParam)) {
        // append rows
        Gson GSON_INSTANCE = new Gson();
        for (int i = 0; i < 10000; i++) {
            JsonObject row = new JsonObject();
            row.addProperty("path", "path_" + i);
            row.add("vector", GSON_INSTANCE.toJsonTree(GeneratorUtils.genFloatVector(DIM)));
            row.addProperty("label", "label_" + i);

            volumeBulkWriter.appendRow(row);
        }

        volumeBulkWriter.commit(false);
        UploadFilesResult uploadResult = volumeBulkWriter.getVolumeUploadResult();
        System.out.printf("Data files have been uploaded: %s%n", uploadResult);
    } catch (Exception e) {
        System.out.println("Local writer catch exception: " + e);
        throw e;
    }
}
```

