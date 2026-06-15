---
title: "Import from a JSON/JSON Lines File | Cloud"
slug: /data-import-json
sidebar_label: "JSON/JSON Line"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON is a lightweight, human-readable data format that machines can parse and generate easily. Language-independent, it follows conventions familiar to C-family language programmers, making it an ideal data interchange format. | Cloud"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Import from a JSON/JSON Lines File

[JSON](https://www.json.org/json-en.html) (JavaScript Object Notation) is a lightweight, human-readable data format that machines can parse and generate easily. Language-independent, it follows conventions familiar to C-family language programmers, making it an ideal data interchange format.

A JSON Line is a text format where each line is a complete, valid JSON object, making it easy to process data streams incrementally with standard text tools.

The following table provides an example of data in a JSON or JSON Line file.

<table>
   <tr>
     <th><p><strong>File Format</strong></p></th>
     <th><p><strong>Example</strong></p></th>
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

You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into JSON files. The following figure demonstrates how your raw data can be mapped into a JSON file.

![json_data_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/json_data_structure.png "json_data_structure")

<Admonition type="info" icon="📘" title="Notes">

- **Whether to enable AutoID**

    The **id** field serves as the primary field of the collection. To make the primary field automatically increment, you can enable **AutoID** in the schema. In this case, you should exclude the **id** field from each row in the source data.

- **Whether to enable dynamic fields**

    When the target collection enables dynamic fields, if you need to store fields that are not included in the pre-defined schema, you can specify the **&#36;meta** column during the write operation and provide the corresponding key-value data.

- **Case-sensitive**

    Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named **id** in the target collection, each entity dictionary should have a key named **id.** Using **ID** or **Id** results in errors. 

</Admonition>

## Directory structure\{#directory-structure}

If you prefer to prepare your data into JSON or JSON Lines files, place all files directly into the source data folder as shown in the tree diagram below.

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## Import data\{#import-data}

Once your data is ready, you can use either of the following methods to import them into your Zilliz Cloud collection.

- [Import files from multiple paths (recommended)](./data-import-json#import-files-from-multiple-paths-recommended)

- [Import files from a folder](./data-import-json#import-files-from-a-folder)

- [Import a single file](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

If your files are relatively small, it is recommended to use the folder or multiple-path method to import them all at once. This approach allows for internal optimizations during the import process, which helps reduce resource consumption later.

</Admonition>

You can also import your data on the Zilliz Cloud console using Milvus SDKs. For details, refer to [Import Data (Console)](./import-data-on-web-ui) and [Import Data (SDK)](./import-data-via-sdks).

### Import files from multiple paths (Recommended)\{#import-files-from-multiple-paths-recommended}

When importing files from multiple paths, include each JSON file path in a separate list, then group all the lists into a higher-level list as in the following code example.

```bash
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
            ["s3://bucket-name/json-folder-1/1.json"],
            ["s3://bucket-name/json-folder-2/1.json"],
            ["s3://bucket-name/json-folder-3/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### Import files from a folder\{#import-files-from-a-folder}

If the source folder contains the files to import, you can include the source folder in the request as follows:

```bash
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
            ["s3://bucket-name/json-folder/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

<Admonition type="info" icon="📘" title="Notes">

If the folder contains multiple formats of files, the request will fail.

</Admonition>

### Import a single file\{#import-a-single-file}

If your prepared data file is a single JSON file, import it as demonstrated in the following code example.

```bash
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
            ["s3://bucket-name/json-folder/1.json"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

## Storage paths\{#storage-paths}

Zilliz Cloud supports data import from your cloud storage. The table below lists the possible storage paths for your data files.

| **Cloud** | **Quick Examples** |
| --- | --- |
| **AWS S3** | s3://*bucket-name*/*json-folder*/<br/>s3://*bucket-name*/*json-folder*/*data.json* |
| **Google Cloud Storage** | gs://*bucket-name*/*json-folder*/<br/>gs://*bucket-name*/*json-folder*/*data.json* |
| **Azure Bolb** | *https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/<br/>*https:*//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json |

## Limits\{#limits}

There are some limits you need to observe when you import data in a local JSON file or JSON files from your cloud storage. 

<Admonition type="info" icon="📘" title="Notes">

A valid JSON file has a root key named **rows**, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

</Admonition>

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
     <td><p>Serverless & Dedicated</p></td>
     <td><p>1,000 Files</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the BulkWriter tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_json_data.json).

