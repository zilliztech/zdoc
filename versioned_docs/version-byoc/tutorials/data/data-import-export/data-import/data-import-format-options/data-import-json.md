---
title: "Import from a JSON File | BYOC"
slug: /data-import-json
sidebar_label: "JSON"
beta: FALSE
notebook: FALSE
description: "JSON is a lightweight, human-readable data format that machines can parse and generate easily. Language-independent, it follows conventions familiar to C-family language programmers, making it an ideal data interchange format. | BYOC"
type: origin
token: EHmOwLz5qi3tPDkb0gZcb5ExnJb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - json
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance

---

import Admonition from '@theme/Admonition';


# Import from a JSON File

[JSON](https://www.json.org/json-en.html) (JavaScript Object Notation) is a lightweight, human-readable data format that machines can parse and generate easily. Language-independent, it follows conventions familiar to C-family language programmers, making it an ideal data interchange format.

You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into JSON files. The following figure demonstrates how your raw data can be mapped into a JSON file.

![json_data_structure](/img/json_data_structure.png)

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><strong>Whether to enable AutoID</strong></li>
</ul>
<p>The <strong>id</strong> field serves as the primary field of the collection. To make the primary field automatically increment, you can enable <strong>AutoID</strong> in the schema. In this case, you should exclude the <strong>id</strong> field from each row in the source data.</p>
<ul>
<li><strong>Whether to enable dynamic fields</strong></li>
</ul>
<p>When the target collection enables dynamic fields, if you need to store fields that are not included in the pre-defined schema, you can specify the <strong>$meta</strong> column during the write operation and provide the corresponding key-value data.</p>
<ul>
<li><strong>Case-sensitive</strong></li>
</ul>
<p>Dictionary keys and collection field names are case-sensitive. Ensure that the dictionary keys in your data exactly match the field names in the target collection. If there is a field named <strong>id</strong> in the target collection, each entity dictionary should have a key named <strong>id.</strong> Using <strong>ID</strong> or <strong>Id</strong> results in errors. </p>

</Admonition>

## Directory structure{#directory-structure}

If you prefer to prepare your data into JSON files, place all JSON files directly into the source data folder as shown in the tree diagram below.

```plaintext
├── json-folder
│       ├── 1.json
│       └── 2.json 
```

## Import data{#import-data}

Once your data is ready, you can use either of the following methods to import them into your Zilliz Cloud collection.

- [Import files from multiple paths (recommended)](./data-import-json#import-files-from-multiple-paths-recommended)

- [Import files from a folder](./data-import-json#import-files-from-a-folder)

- [Import a single file](./data-import-json#import-a-single-file)

<Admonition type="info" icon="📘" title="Notes">

<p>If your files are relatively small, it is recommended to use the folder or multiple-path method to import them all at once. This approach allows for internal optimizations during the import process, which helps reduce resource consumption later.</p>

</Admonition>

You can also import your data on the Zilliz Cloud console using Milvus SDKs. For details, refer to [Import Data (Console)](./import-data-on-web-ui) and [Import Data (SDK)](./import-data-via-sdks).

### Import files from multiple paths (Recommended){#import-files-from-multiple-paths-recommended}

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

### Import files from a folder{#import-files-from-a-folder}

If the source folder contains only the JSON files to import, you can simply include the source folder in the request as follows:

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

### Import a single file{#import-a-single-file}

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

## Storage paths{#storage-paths}

Zilliz Cloud supports data import from your cloud storage. The table below lists the possible storage paths for your data files.

<table>
   <tr>
     <th><p><strong>Cloud</strong></p></th>
     <th><p><strong>Quick Examples</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>AWS S3</strong></p></td>
     <td><p>s3://<em>bucket-name</em>/<em>json-folder</em>/</p><p>s3://<em>bucket-name</em>/<em>json-folder</em>/<em>data.json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>json-folder</em>/</p><p>gs://<em>bucket-name</em>/<em>json-folder</em>/<em>data.json</em></p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/</p><p><em>https:</em>//myaccount.blob.core.windows.net/bucket-name/json-folder/data.json</p></td>
   </tr>
</table>

## Limits{#limits}

There are some limits you need to observe when you import data in the JSON format from your cloud storage. Note that a valid JSON file has a root key named **rows**, the corresponding value of which is a list of dictionaries, each representing an entity that matches the schema of the target collection.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Multiple files per import</strong></p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Maximum file size per import</strong></p></td>
     <td><p>Free cluster: 512 MB in total</p><p>Serverless and Dedicated cluster:</p><ul><li><p>Individual file size: 10 GB</p></li><li><p>Total file size: 100 GB</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Applicable data file locations</strong></p></td>
     <td><p>Local and remote files</p></td>
   </tr>
</table>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the BulkWriter tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_json_data.json).