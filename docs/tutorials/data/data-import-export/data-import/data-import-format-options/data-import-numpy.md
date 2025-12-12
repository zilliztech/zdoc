---
title: "Import from NumPy Files | Cloud"
slug: /data-import-numpy
sidebar_label: "NumPy"
beta: NEAR DEPRECATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `.npy` format is NumPy's standard binary format](https//numpy.org/devdocs/reference/generated/numpy.lib.format.html) for saving a single array, including its shape and dtype information, ensuring it can be correctly reconstructed on different machines.  You are advised to use [the BulkWriter tool to prepare your raw data into Parquet files. The following figure demonstrates how your raw data can be mapped into a set of `.npy` file. | Cloud"
type: origin
token: FOwZwuxaWiuthnkZdedcGbJOnZf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - milvus
  - format options
  - numpy
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


# Import from NumPy Files

The `.npy` format is [NumPy's standard binary format](https://numpy.org/devdocs/reference/generated/numpy.lib.format.html) for saving a single array, including its shape and dtype information, ensuring it can be correctly reconstructed on different machines.  You are advised to use [the BulkWriter tool](./use-bulkwriter) to prepare your raw data into Parquet files. The following figure demonstrates how your raw data can be mapped into a set of `.npy` file.

<Admonition type="danger" icon="🚧" title="Caution">

<p>This feature has been deprecated. You are not recommended to use it in production.</p>

</Admonition>

![numpy_file_structure](https://zdoc-images.s3.us-west-2.amazonaws.com/numpy_file_structure.png "numpy_file_structure")

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

To prepare your data as NumPy files, place all files from the same subset into a folder, then group these folders within the source folder, as shown in the tree diagram below.

```bash
├── numpy-folders
│       ├── 1
│       │   ├── id.npy
│       │   ├── vector.npy
│       │   ├── scalar_1.npy
│       │   ├── scalar_2.npy
│       │   └── $meta.npy 
│       └── 2
│           ├── id.npy
│           ├── vector.npy
│           ├── scalar_1.npy
│           ├── scalar_2.npy
│           └── $meta.npy  
```

## Import data\{#import-data}

Once your data is ready, you can use either of the following methods to import them into your Zilliz Cloud collection.

- [Import files from a list of NumPy files folders (recommended)](./data-import-numpy#import-files-from-a-list-of-numpy-file-folders-recommended)

- [Import files from a NumPy file folder](./data-import-numpy#import-files-from-a-numpy-file-folder)

<Admonition type="info" icon="📘" title="Notes">

<p>If your files are relatively small, it is recommended to use the folder or multiple-path method to import them all at once. This approach allows for internal optimizations during the import process, which helps reduce resource consumption later.</p>

</Admonition>

You can also import your data on the Zilliz Cloud console using Milvus SDKs. For details, refer to [Import Data (Console)](./import-data-on-web-ui) and [Import Data (SDK)](./import-data-via-sdks).

### Import files from a list of NumPy file folders (Recommended)\{#import-files-from-a-list-of-numpy-file-folders-recommended}

When importing files from multiple paths, include each NumPy file folder path in a separate list, then group all the lists into a higher-level list as in the following code example.

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
            ["s3://bucket-name/numpy-folder-1/1/"],
            ["s3://bucket-name/numpy-folder-2/1/"],
            ["s3://bucket-name/numpy-folder-3/1/"]
         ],
        "accessKey": "",
        "secretKey": ""
    }'
```

### Import files from a NumPy file folder\{#import-files-from-a-numpy-file-folder}

If the source folder contains only the NumPy file folder to import, you can simply include the source folder in the request as follows:

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
            ["s3://bucket-name/numpy-folder/1/"]
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
     <td><p>s3://<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>Google Cloud Storage</strong></p></td>
     <td><p>gs://<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
   <tr>
     <td><p><strong>Azure Bolb</strong></p></td>
     <td><p><em>https:</em>//<em>myaccount</em>.blob.core.windows.net/<em>bucket-name</em>/<em>numpy-folder</em>/</p></td>
   </tr>
</table>

## Limits\{#limits}

There are some limits you need to observe when you import data in NumPy files from your cloud storage. 

<Admonition type="info" icon="📘" title="Notes">

<p>A valid set of NumPy files should be named after the fields in the schema of the target collection, and the data in them should match the corresponding field definitions.</p>

</Admonition>

<table>
   <tr>
     <th><p><strong>Import Method</strong></p></th>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Max Subdirectories per Import</strong></p></th>
     <th><p><strong>Max Size per Subdirectory</strong></p></th>
     <th><p><strong>Max Total Import Size</strong></p></th>
   </tr>
   <tr>
     <td><p>From local file</p></td>
     <td colspan="4"><p>Not supported</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>From object storage</p></td>
     <td><p>Free</p></td>
     <td><p>1,000 subdirectories</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Serverless &amp; Dedicated</p></td>
     <td><p>1,000 subdirectories</p></td>
     <td><p>10 GB</p></td>
     <td><p>1 TB</p></td>
   </tr>
</table>

You can either rebuild your data on your own by referring to [Prepare the data file](https://milvus.io/docs/bulk_insert.md#Prepare-the-data-file) or use [the BulkWriter tool](./use-bulkwriter) to generate the source data file. [Click here to download the prepared sample data based on the schema in the above diagram](https://assets.zilliz.com/prepared_numpy_data.zip).