---
title: "从 JSON/JSON Lines 文件中导入 | Cloud"
slug: /data-import-json
sidebar_key: data-import-json
sidebar_label: "从 JSON/JSON Lines 文件中导入"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "JSON 文件是一个轻量化的，对人和机器都友好的数据格式。因为它的语言无关特性，并遵循类 C 语言程序员熟悉的规范，JSON 是一个非常理想的数据交换格式。 | Cloud"
type: origin
token: RYZAw68ioikyLpktFZFcyhKcn2f
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据导入
  - json
  - json file
  - import from json
  - 从 json 文件导入

---

import Admonition from '@theme/Admonition';


# 从 JSON/JSON Lines 文件中导入

[JSON](https://www.json.org/json-en.html) 文件是一个轻量化的，对人和机器都友好的数据格式。因为它的语言无关特性，并遵循类 C 语言程序员熟悉的规范，JSON 是一个非常理想的数据交换格式。

JSON Lines 是一种文本格式，每一行都是一个完整且合法的 JSON 对象，因此可以使用标准文本工具对数据流进行增量处理。

下表展示了 JSON 或 JSON Lines 文件中的数据示例。

<table>
   <tr>
     <th><p><strong>文件格式</strong></p></th>
     <th><p><strong>示例</strong></p></th>
     <th></th>
   </tr>
   <tr>
     <td><p>JSON (.json)</p></td>
     <td><pre><code class="json language-json"> [     \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\},     \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\},     \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\} ]</code></pre></td>
     <td></td>
   </tr>
   <tr>
     <td><p>JSON Lines (.ndjson, .jsonl)</p></td>
     <td><pre><code class="json language-json"> \{"primary_key":89,"vector":[0.7857309327639853,0.6185684289533679]\} \{"primary_key":-22,"vector":[0.7227987733802379,0.6910585598920134]\} \{"primary_key":85,"vector":[0.7948503430666686,0.6068055142521362]\}</code></pre></td>
     <td></td>
   </tr>
</table>

建议您[使用 BulkWriter](./use-bulkwriter) 工具将您的原始数据转换为 JSON 文件。下图演示了您的原始数据如何映射到 JSON 文件中。

![json_data_structure](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/json_data_structure.png "json_data_structure")

<Admonition type="info" icon="📘" title="说明">

- **是否启用 AutoID**

    Collection 中的 id 字段作为主键区分 Entity。如果需要 Zilliz Cloud 为插入的数据自动生成主键，可以启用 AutoID。在这种情况下，批量导入数据时需要排队主键列。

- **是否启用 Dynamic Field**

    当目标 Collection 启用了 Dynamic Field 并且您希望导入 Schema 中未定义的字段时，您可以在导入数据中纳入一个名为 **&#36;meta** 的字段，并将所有未在 Schema 中定义的字段以键值对的方式存放到 **&#36;meta** 字段中。

- **大小写**

    字典键名和 Collection 的字段名是大小写敏感的。您需要确保待导入字典的键名和目标 Collection 的字段名是完全对应的。比如，目标 Collection 中有个字段名为 **id**，那么待导入字典的键名也应该为 **id**。使用 **ID** 或 **Id** 会导致报错。

</Admonition>

## 目录结构\{#directory-structure}

如果您希望将您的原始数据转换为 JSON 或 JSON Lines 文件，请将所有文件直接放到源文件夹内，如下方所示。

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## 导入数据\{#import-data}

在准备好待导入数据后，您可以使用如下任意一种方式将它们导入到您在 Zilliz Cloud 上创建的 Collection 中。

- [从多路径导入（推荐）](./data-import-json#import-files-from-multiple-paths-recommended)

- [从源文件夹导入](./data-import-json#import-files-from-a-folder)

- [从单个文件导入](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="说明">

如果您的文件体积较小，建议您使用多路径或源文件夹的方式将所有文件一次性导入。Zilliz Cloud 针对这两种方式做了内部优化，可以降低后续资源消耗。

</Admonition>

您也可以使用 Zilliz Cloud 控制台或使用 Milvus SDK。具体操作，可以参考 [通过 Web 控制台导入](./import-data-on-web-ui)以及[通过 SDK 导入](./import-data-via-sdks)。

### 从多路径导入（推荐）\{#import-files-from-multiple-paths-recommended}

当您有多个文件需要同时导入时，可以使用这种方式。在导入时，需要将每个需要导入的 JSON 文件的路径包含在一个子列表中，并将这些子列表包含在一个外层列表中，如下方代码所示。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/json-folder-1/1.json"],
            ["s3://bucket-name/json-folder-2/1.json"],
            ["s3://bucket-name/json-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### 从源文件夹导入\{#import-files-from-a-folder}

如果源文件夹中仅包含需要导入的所有文件，您可以将这个源文件夹的路径放在一个子列表中，然后将这个子列表放在一个外层列表中，如下方代码所示。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/json-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

<Admonition type="info" icon="📘" title="说明">

如果文件夹路径下包含多种格式文件，请求会失败。

</Admonition>

### 从单个文件导入\{#import-a-single-file}

如果您希望单独导入一个 JSON 文件，可以将这个 JSON 文件的路径放在一个子列表中，然后将这个子列表放在一个外层列表中，如下方代码所示。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/json-folder/1.json"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

## 存储路径\{#storage-paths}

Zilliz Cloud 支持从您的云存储中导入数据。下表罗列了 Zilliz Cloud 支持的数据文件路径格式。

<table>
   <tr>
     <th><p>云服务提供商</p></th>
     <th><p>相关示例</p></th>
   </tr>
   <tr>
     <td><p>阿里云 OSS</p></td>
     <td><p><code>https://bucket-name.oss-cn-hangzhou.aliyuncs.com/json-folder/</code></p><p><code>https://bucket-name.oss-cn-hangzhou.aliyuncs.com/json-folder/data.json</code></p></td>
   </tr>
   <tr>
     <td><p>腾讯云 COS</p></td>
     <td><p><code>https://&lt;BucketName-APPID&gt;.cos.ap-beijing.myqcloud.com/json-folder/</code></p><p><code>https://&lt;BucketName-APPID&gt;.cos.ap-beijing.myqcloud.com/json-folder/data.json</code></p></td>
   </tr>
   <tr>
     <td><p>亚马逊云科技 S3</p></td>
     <td><p><code>s3://bucket-name/json-folder/</code></p><p><code>s3://bucket-name/json-folder/data.json</code></p></td>
   </tr>
</table>

## 相关限制\{#limits}

当您从本地 JSON 文件或对象存储桶中的 JSON 文件导入数据时，需要遵守以下限制：

<Admonition type="info" icon="📘" title="说明">

需要注意的是，一个合法的 JSON 文件中有一个名为 **rows** 的根键，其值为一个字典列表，每个字典列表代表一个需要插入的 Entity 对象。

</Admonition>

<table>
   <tr>
     <th><p><strong>导入方式</strong></p></th>
     <th><p><strong>集群版本</strong></p></th>
     <th><p><strong>单次导入最大文件数</strong></p></th>
     <th><p><strong>单个文件最大大小上限</strong></p></th>
     <th><p><strong>单次导入总文件大小</strong></p></th>
   </tr>
   <tr>
     <td><p>本地文件导入</p></td>
     <td><p>所有版本</p></td>
     <td><p>1 个文件</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>对象存储桶导入</p></td>
     <td><p>Free</p></td>
     <td><p>1,000 个文件</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Serverless & Dedicated</p></td>
     <td><p>1,000 个文件</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

建议您[使用 BulkWriter](./use-bulkwriter) 工具将您的原始数据转换成 JSON 文件。我们按照本文示意图中的 Schema 准备了一个示例数据供您参考。[单击此处](https://assets.zilliz.com/prepared_json_data.json)下载该示例文件。