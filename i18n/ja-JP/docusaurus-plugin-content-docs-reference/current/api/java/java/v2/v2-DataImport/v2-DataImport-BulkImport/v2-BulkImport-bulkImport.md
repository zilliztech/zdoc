---
title: "bulkImport() | Java | v2"
slug: /java/java/v2-BulkImport-bulkImport
sidebar_label: "bulkImport()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、準備済みのデータファイルを Zilliz Cloud にインポートします。データファイルの準備方法については、Prepare Data Import を参照してください。 | Java | v2"
type: docx
token: S0ITdsnpYoDpH9xKv9fcBhe5nWA
sidebar_position: 2
keywords: 
  - 情報検索
  - 次元削減
  - hnsw algorithm
  - ベクトル類似検索
  - zilliz
  - zilliz cloud
  - cloud
  - bulkImport()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# bulkImport()

この操作は、準備済みのデータファイルを Zilliz Cloud にインポートします。データファイルの準備方法については、[Prepare Data Import](/docs/prepare-data-import) を参照してください。

```java
public static String bulkImport(String url, BaseImportRequest request)
```

## Request Syntax\{#request-syntax}

```java
bulkImport.bulkImport(
    url, 
    request
)
```

**PARAMETERS:**

- **url** (*String*) -

    Zilliz Cloud の Control Plane API エンドポイント。エンドポイント URL は次の形式である必要があります。

    ```python
    https://api.cloud.zilliz.com
    ```

- **request** (*[BaseImportRequest](./v2-BulkImport-bulkImport#baseimportrequest)*) -  

    **BaseImportRequest** インスタンス。

**RETURN TYPE:**

*String*

**RETURNS:**

作成されたインポートジョブの ID。

## BaseImportRequest\{#baseimportrequest}

**BaseImportRequest** インスタンスは **CloudImportRequest** で実装されます。

### CloudImportRequest\{#cloudimportrequest}

```java
CloudImportRequest.builder()
    .apiKey(String apiKey)
    .objectUrl(String objectUrl)
    .accessKey(String accessKey)
    .secrectKey(String secrectKey)
    .clusterId(String clusterId)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
```

**BUILDER METHODS:**

- `apiKey(String apiKey)`

    クラスターを操作するための十分な権限を持つ、有効な Zilliz Cloud API キー。

- `objectUrl(String objectUrl)`

    ブロックストレージバケットのいずれかにあるデータファイルの URL。以下は、よく知られたブロックストレージサービスの例です。

    ```python
    # Google Cloud Storage
    gs://{bucket-name}/{object-path}/
    
    # AWS S3
    s3://{bucket-name}/{object-path}/
    ```

- `accessKey(String accessKey)`

    データファイルへのアクセスを認証するために使用されるアクセスキー。

- `secrectKey(String secrectKey)`

    データファイルへのアクセスを認証するために使用されるシークレットキー。

- `clusterId(String clusterId)`

    この操作の対象クラスターのインスタンス ID。

    Zilliz Cloud コンソールの詳細ページでクラスターのインスタンス ID を取得できます。

- `dbName(String dbName)`

    対象データベースの名前。このパラメータの値のデフォルトは `default` です。

- `collectionName(String collectionName)`

    この操作の対象クラスター内のコレクションの名前。

- `partitionName(String partitionName)`

    この操作の対象クラスター内のパーティションの名前。デフォルト値は `default` です。

## Example\{#example}

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.bulkwriter.request.import_.MilvusImportRequest;
import io.milvus.bulkwriter.restful.BulkImportUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

CloudImportRequest cloudImportRequest = CloudImportRequest.builder()
        .objectUrl(objectUrl).accessKey(accessKey).secretKey(secretKey)
        .clusterId(clusterId).collectionName(collectionName)
        .apiKey(apiKey)
        .build();
String bulkImportResult = BulkImportUtils.bulkImport(url, cloudImportRequest);

Gson GSON_INSTANCE = new Gson();
JsonObject result = GSON_INSTANCE.fromJson(bulkImportResult, JsonObject.class);
String jobId = result.getAsJsonObject("data").get("jobId").getAsString();
System.out.println("Create a bulkInert task, job id: " + jobId);
```

