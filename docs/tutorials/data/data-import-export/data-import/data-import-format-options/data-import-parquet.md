---
title: "Import from a Parquet File | Cloud"
slug: /data-import-parquet
sidebar_label: "Parquet (Recommended)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Parquet is an open-source, column-oriented data file format designed for efficient data storage and retrieval. It offers high-performance compression and encoding schemes to manage complex data in bulk and is supported in various programming languages and analytics tools tools. | Cloud"
type: origin
token: WtkSwXgDdiB0eTkEkorcDCFlnme
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - parquet
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms

---

import Admonition from '@theme/Admonition';


# Import from a Parquet File

[Apache Parquet](https://parquet.apache.org/docs/overview/) is an open-source, column-oriented data file format designed for efficient data storage and retrieval. It offers high-performance compression and encoding schemes to manage complex data in bulk and is supported in various programming languages and analytics tools tools.

You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into Parquet files. The following figure demonstrates how your raw data can be mapped into a Parquet file.

![parquet_file_structure_en](https://zdoc-images.s3.us-west-2.amazonaws.com/parquet_file_structure_en.png "parquet_file_structure_en")

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>Whether to enable AutoID</strong></li>
</ul>
<p>The <strong>id</strong> field serves as the primary field of the collection. To make the primary field automatically increment, you can enable <strong>AutoID</strong> in the schema. In this case, you should exclude the <strong>id</strong> field from each row in the source data.</p>
<ul>
<li><strong>Whether to enable dynamic fields</strong></li>
</ul>
<p>When the target collection enables dynamic fields, if you need to store fields that are not included in the pre-defined schema, you can specify the <strong>&#36;meta</strong> column during the write operation and provide the corresponding key-value data.</p>
<ul>
<li><strong>Case-sensitive</strong></li>
</ul>
<p>Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, each entity dictionary should have a key named <strong>id.</strong> Using <strong>ID</strong> or <strong>Id</strong> results in errors. </p>

</Admonition>

## Directory structure\{#directory-structure}

If you prefer to prepare your data into Parquet files, place all Parquet files directly into the source data folder as shown in the tree diagram below.

```plaintext
├── parquet-folder
│       ├── 1.parquet
│       └── 2.parquet 
```

## Import data\{#import-data}

Once your data is ready, you can use either of the following methods to import them into your Zilliz Cloud collection.

- [Import files from multiple paths (recommended)](./data-import-parquet#import-files-from-multiple-paths-recommended)

- [Import files from the source folder ](./data-import-parquet#import-files-from-a-folder)

- [Import a single file](./data-import-parquet#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

<p>If your files are relatively small, it is recommended to use the folder or multiple-path method to import them all at once. This approach allows for internal optimizations during the import process, which helps reduce resource consumption later.</p>

</Admonition>

You can also import your data on the Zilliz Cloud console using Milvus SDKs. For details, refer to [Import Data (Console)](./import-data-on-web-ui) and [Import Data (SDK)](./import-data-via-sdks).

### Import files from multiple paths (Recommended)\{#import-files-from-multiple-paths-recommended}

When importing files from multiple paths, include each Parquet file path in a separate list, then group all the lists into a higher-level list as in the following code example.

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
            ["s3://bucket-name/parquet-folder-1/1.parquet"],
            ["s3://bucket-name/parquet-folder-2/1.parquet"],
            ["s3://bucket-name/parquet-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### Import files from a folder\{#import-files-from-a-folder}

If the source folder contains only the Parquet files to import, you can simply include the source folder in the request as follows:

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
            ["s3://bucket-name/parquet-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### Import a single file\{#import-a-single-file}

If your prepared data file is a single Parquet file, import it as demonstrated in the following code example.

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

## Storage paths\{#storage-paths}

Zilliz Cloud supports data import from your cloud storage. The table below lists the possible storage paths for your data files.

<table>
   <tr>
     <th><p><strong>Cloud</strong></p></th>
     <th><p><strong>Quick Examples</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p>s3://<em>bucket-name</em>/<em>parquet-folder</em>/</p><p>s3://<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>parquet-folder</em>/</p><p>gs://<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/</p><p><em>https:</em>//myaccount.blob.core.windows.net/<em>bucket-name</em>/<em>parquet-folder</em>/<em>data.parquet</em></p></td>
   </tr>
</table>

## Limits\{#limits}

There are some limits you need to observe when you import data in a local Parquet file or Parquet files from your cloud storage.

<table>
   <tr>
     <th><p><strong>Import Method</strong></p></th>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Max Files per Import</strong></p></th>
     <th><p><strong>Max File Size</strong></p></th>
     <th><p><strong>Max Total Import Size</strong></p></th>
   </tr>
   <tr>
     <td><p>From local file</p></td>
     <td><p>All Plans</p></td>
     <td><p>1 File</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>From object storage</p></td>
     <td><p>Free</p></td>
     <td><p>1,000 Files</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Serverless &amp; Dedicated</p></td>
     <td><p>1,000 Files</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into parquet files. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_parquet_data.parquet).