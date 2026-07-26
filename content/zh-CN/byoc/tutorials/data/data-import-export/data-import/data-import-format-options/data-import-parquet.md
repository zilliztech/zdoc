---
title: "从 Parquet 文件中导入（推荐） | BYOC"
slug: /data-import-parquet
sidebar_label: "从 Parquet 文件中导入（推荐）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet 是一个开源的，基于列的数据文件格式。用来优化数据存储和检索效率。它提供了高性能的数据压缩和编码方案来管理复杂的打包数据，并提供多种编程语言和分析工具支持。 | BYOC"
type: origin
token: Fi1DwQyUXiPVIvk4GNocAB51nNf
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 数据导入
  - parquet
  - apache parquet
  - 从 parquet 文件导入
  - import from parquet 文件

---

import Admonition from '@theme/Admonition';


# 从 Parquet 文件中导入（推荐）

[Apache Parquet](https://parquet.apache.org/docs/overview/) 是一个开源的，基于列的数据文件格式。用来优化数据存储和检索效率。它提供了高性能的数据压缩和编码方案来管理复杂的打包数据，并提供多种编程语言和分析工具支持。

建议您[使用 BulkWriter](./use-bulkwriter) 工具将您的原始数据转换为 Parquet 文件。下图演示了您的原始数据如何映射到 Parquet 文件中。

![parquet_file_structure_zh](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/parquet_file_structure_zh.png "parquet_file_structure_zh")

<Admonition type="info" icon="📘" title="说明">

<ul>
<li><strong>是否启用 AutoID</strong></li>
</ul>
<p>Collection 中的 id 字段作为主键区分 Entity。如果需要 Zilliz Cloud 为插入的数据自动生成主键，可以启用 AutoID。在这种情况下，批量导入数据时需要排队主键列。</p>
<ul>
<li><strong>是否启用 Dynamic Field</strong></li>
</ul>
<p>当目标 Collection 启用了 Dynamic Field 并且您希望导入 Schema 中未定义的字段时，您可以在导入数据中纳入一个名为 <strong>&#36;meta</strong> 的字段，并将所有未在 Schema 中定义的字段以键值对的方式存放到 <strong>&#36;meta</strong> 字段中。</p>
<ul>
<li><strong>大小写</strong></li>
</ul>
<p>字典键名和 Collection 的字段名是大小写敏感的。您需要确保待导入字典的键名和目标 Collection 的字段名是完全对应的。比如，目标 Collection 中有个字段名为 <strong>id</strong>，那么待导入字典的键名也应该为 <strong>id</strong>。使用 <strong>ID</strong> 或 <strong>Id</strong> 会导致报错。</p>

</Admonition>

## 目录结构\{#directory-structure}

如果您希望将您的原始数据转换为 Parquet 文件，请将所有 Parquet 文件直接放到源文件夹内，如下方所示。

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## 导入数据\{#import-data}

在准备好待导入数据后，您可以使用如下任意一种方式将它们导入到您在 Zilliz Cloud 上创建的 Collection 中。

- [从多路径导入（推荐）](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [从源文件夹导入](./data-import-parquet#import-files-from-a-folder)

- [从单个文件导入](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="说明">

<p>如果您的文件体积较小，建议您使用多路径或源文件夹的方式将所有文件一次性导入。Zilliz Cloud 针对这两种方式做了内部优化，可以降低后续资源消耗。</p>

</Admonition>

您也可以使用 Zilliz Cloud 控制台或使用 Milvus SDK。具体操作，可以参考 [通过 Web 控制台导入](./import-data-on-web-ui)以及[通过 SDK 导入](./import-data-via-sdks)。

### 从多路径导入（推荐）\{#import-files-from-multiple-paths-recommended}

当您有多个文件需要同时导入时，可以使用这种方式。在导入时，需要将每个需要导入的 Parquet 文件的路径包含在一个子列表中，并将这些子列表包含在一个外层列表中，如下方代码所示。

```python
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
            ["s3://bucket-name/parquet-folder-1/1.parquet"],
            ["s3://bucket-name/parquet-folder-2/1.parquet"],
            ["s3://bucket-name/parquet-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### 从源文件夹导入\{#import-files-from-a-folder}

如果源文件夹中仅包含需要导入的所有 Parquet 文件，您可以将这个源文件夹的路径放在一个子列表中，然后将这个子列表放在一个外层列表中，如下方代码所示。

```python
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
            ["s3://bucket-name/parquet-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

<Admonition type="info" icon="📘" title="说明">

<p>如果文件夹路径下包含多种格式文件，请求会失败。</p>

</Admonition>

### 从单个文件导入\{#import-a-single-file}

如果您希望单独导入一个 Parquet 文件，可以将这个 Parquet 文件的路径放在一个子列表中，然后将这个子列表放在一个外层列表中，如下方代码所示。

```python
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrls": [
            ["s3://bucket-name/parquet-folder/1.parquet"]
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
     <td><p><code><i>http</i>s://bucket-name.oss-cn-hangzhou.aliyuncs.com/parquet-folder/</code></p><p><code>https://bucket-name.oss-cn-hangzhou.aliyuncs.com/parquet-folder/data.parquet</code></p></td>
   </tr>
   <tr>
     <td><p>腾讯云 COS</p></td>
     <td><p><code><i>http</i>s://&lt;BucketName-APPID&gt;.cos.ap-beijing.myqcloud.com/parquet-folder/</code></p><p><code>https://&lt;BucketName-APPID&gt;.cos.ap-beijing.myqcloud.com/parquet-folder/data.parquet</code></p></td>
   </tr>
   <tr>
     <td><p>亚马逊云科技 S3</p></td>
     <td><p><code>s3://bucket-name/parquet-folder/</code></p><p><code>s3://bucket-name/parquet-folder/data.parquet</code></p></td>
   </tr>
</table>

## 相关限制\{#limits}

Zilliz Cloud 针对导入 Parquet 格式的文件时设置了如下限制。

当您从本地 Parquet 文件或对象存储桶中的 Parquet 文件导入数据时，需要遵守以下限制：

<table>
   <tr>
     <th><p><strong>导入方式</strong></p></th>
     <th><p><strong>单次导入最大文件数</strong></p></th>
     <th><p><strong>单个文件最大大小上限</strong></p></th>
     <th><p><strong>单次导入总文件大小</strong></p></th>
   </tr>
   <tr>
     <td><p>本地文件导入</p></td>
     <td><p>1 个文件</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>对象存储桶导入</p></td>
     <td><p>1,000 个文件</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

建议您[使用 BulkWriter](./use-bulkwriter) 工具将您的原始数据转换成 Parquet 文件。我们按照本文示意图中的 Schema 准备了一个示例数据供您参考。[单击此处](https://assets.zilliz.com/prepared_parquet_data.parquet)下载该示例文件。

