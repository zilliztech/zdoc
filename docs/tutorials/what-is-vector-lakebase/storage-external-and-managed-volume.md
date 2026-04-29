---
title: "Storage: External & Managed Volumes | Cloud"
slug: /storage-external-and-managed-volume
sidebar_key: storage-external-and-managed-volume
sidebar_label: "Storage: External & Managed Volumes"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "A volume is a layer of storage abstraction in Zilliz Cloud. It is an object store that holds data files — structured formats like Parquet or unstructured files like images and PDFs. From a volume, you can import or migrate data directly into collections, or run ETL pipelines to transform unstructured data into embeddings and load them into collections. Volumes belong to a project, not to a single cluster, so any cluster in the same project can access them. | Cloud"
type: origin
token: NsVXwIAC4ihZbpkcvVscoUI7n9b
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - storage
  - external volume
  - managed volume
  - volume

---

import Admonition from '@theme/Admonition';


# Storage: External & Managed Volumes

A volume is a layer of storage abstraction in Zilliz Cloud. It is an object store that holds data files — structured formats like Parquet or unstructured files like images and PDFs. From a volume, you can import or migrate data directly into collections, or run ETL pipelines to transform unstructured data into embeddings and load them into collections. Volumes belong to a project, not to a single cluster, so any cluster in the same project can access them.

In Zilliz Cloud, a volume comes in two types: 

- **Managed volume**: a platform-provisioned storage space where data is physically stored and managed by Zilliz Cloud.

- **External volume:** a pointer to a location in your own cloud object storage, where data remains in your cloud object storage and is accessed remotely.

Both types of volumes are format-agnostic and carry no schema information — format and schema are defined at the collection layer, not the volume layer.

## Why volumes\{#why-volumes}

Many AI and data workflows involve unstructured data — documents, images, audio files — that needs to be transformed into embeddings before it can be searched. Without a volume layer, this requires stitching together separate infrastructure: an object store for raw files, a compute environment for ETL, and a vector database for serving. Each piece has its own credentials, its own access management, and its own lifecycle.

Volumes bring storage into the same platform where your collections, indexes, and search queries live. Raw files, intermediate outputs, and prepared datasets all reside in volumes that any cluster in the project can access. The entire pipeline — from unstructured data to searchable embeddings — runs within Zilliz Cloud without requiring separate storage infrastructure.

For data that already lives in your own cloud storage, external volumes let you connect it to Zilliz Cloud without copying or moving files. A storage integration handles credentials centrally, so data engineers reference volumes by name rather than managing access keys in every script.

## Two types of volumes\{#two-types-of-volumes}

Zilliz Cloud supports two volume types that serve different roles in the data lifecycle.

![EX9ewYFIQhHXAibLjVVcuM0pnvg](https://zdoc-images.s3.us-west-2.amazonaws.com/EX9ewYFIQhHXAibLjVVcuM0pnvg.png)

- **Managed volumes:** store data in Zilliz Cloud-managed storage. No external credentials or storage paths are needed — the platform allocates storage automatically. You upload files or folders from your local file system, then import, migrate, or run ETL pipelines to load the data into collections. Deleting a managed volume deletes the stored data alongside it. Best for users who do not maintain their own cloud object storage.

- **External volumes:** map to a path in your own cloud object storage (Amazon S3 or Google Cloud Storage). They reference a storage integration for credential access. Zilliz Cloud reads data directly from the specified path without copying or moving it — your data stays in your bucket. You can import or migrate data into managed collections, or create external collections that reference the data directly without importing. Deleting an external volume removes only the volume metadata from Zilliz Cloud; your data remains intact in your cloud object storage. Best for users who want to keep data in their own storage while using it with Zilliz Cloud.

The following table compares the two types of volumes.

<table>
   <tr>
     <th></th>
     <th><p><strong>Managed Volume</strong></p></th>
     <th><p><strong>External Volume</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Data location</strong></p></td>
     <td><p>Zilliz Cloud-managed storage</p></td>
     <td><p>Your own S3 or GCS bucket</p></td>
   </tr>
   <tr>
     <td><p><strong>Best for</strong></p></td>
     <td><p>Users who do not maintain their own cloud object storage.</p></td>
     <td><p>Users who want to keep data in their own storage while using it with Zilliz Cloud.</p></td>
   </tr>
   <tr>
     <td><p><strong>Access control</strong></p></td>
     <td><p>Zilliz Cloud RBAC, authenticated via API key</p></td>
     <td><p>Cloud provider IAM, authenticated via <a href="null">storage integration</a></p></td>
   </tr>
   <tr>
     <td><p><strong>Data File operations</strong></p></td>
     <td><p>Read, write, delete</p></td>
     <td><p>Read-only</p><Admonition type="info" icon="📘" title="Notes"> <p>For external volumes, data stays in your bucket. You manage files (create, update, delete) directly in your cloud object storage. Zilliz Cloud only reads from the path.</p> </Admonition></td>
   </tr>
   <tr>
     <td><p><strong>Use cases</strong></p></td>
     <td><p>Import, migration, data ETL</p></td>
     <td><p>Import, migration,  data ETL, and external collections</p></td>
   </tr>
</table>

## Architecture\{#architecture}

A volume belongs to a project, not to a single cluster. Any cluster in the same project can access the volume. 

```plaintext
Organization  
  └─ Project
     ├─ Serving Clusters                                                                                                                                                                                    
     │   └─ Cluster Databases
     │       └─ Collections                                                                                                                                                                                 
     ├─  Databases in on-demand compute                                         
     │   └─ Collections
     ├─ Volumes                                                                                                                                                                                             
     │   ├─ Managed Volumes → Data files (Zilliz-hosted)
     │   └─ External Volumes → Maps to your cloud storage bucket (via Storage Integration)                                                                                                                  
     └─ Storage Integrations      
```

The three resource types each handle a distinct layer of responsibility:  

<table>
   <tr>
     <th><p><strong>Layer</strong></p></th>
     <th><p><strong>Resource</strong></p></th>
     <th><p><strong>Responsibility</strong></p></th>
   </tr>
   <tr>
     <td><p>Credential</p></td>
     <td><p>Storage Integration</p></td>
     <td><p>How to access external storage (IAM role, cloud provider)</p></td>
   </tr>
   <tr>
     <td><p>Storage</p></td>
     <td><p>Volume</p></td>
     <td><p>Where the data is (storage path + hosting type)</p></td>
   </tr>
   <tr>
     <td><p>Data</p></td>
     <td><p>Collection</p></td>
     <td><p>What the data means (schema, format, index, refresh strategy)</p></td>
   </tr>
</table>

Each layer is independent. Changing the IAM role in a storage integration does not require changes to the volumes that reference it. Adding a new collection against an existing volume does not require changes to the volume or the storage integration. This independence is what makes the system manageable at scale.

## Resource relationships\{#resource-relationships}

Storage integrations, volumes, and collections form a layered one-to-many chain. Understanding these relationships helps explain how the system scales without repeating configuration at each level.

### One storage integration, many external volumes\{#one-storage-integration-many-external-volumes}

A storage integration wraps an IAM role for your cloud account and can be referenced by any number of external volumes. Administrators configure credentials once in the storage integration; data engineers create volumes by selecting it and specifying a path, without handling credentials directly. Zilliz Cloud never stores your cloud credentials; it obtains temporary STS credentials via `AssumeRole` on each operation and discards them after use.    

```plaintext
Storage Integration: "s3_access"
    │
    ├── External Volume: "product_docs"     → s3://docs/product-manuals/
    ├── External Volume: "partner_kb"       → s3://docs/partner-articles/
    └── External Volume: "changelog"        → s3://docs/changelog/
```

### One volume, many collections\{#one-volume-many-collections}

A volume carries no format or schema information — it knows where files are but not what they contain. Format interpretation happens at the collection layer. This means multiple collections can reference the same volume, each applying a different schema or serving a different purpose.

```plaintext
External Volume: "product_docs"
    │
    ├── Collection "product_search"
    │   format: parquet
    │   fields: doc_id, chunk_text, embedding FLOAT_VECTOR[1536]
    │
    └── Collection "product_metadata"
        format: parquet
        fields: doc_id, title, last_updated, author
```

## Use cases\{#use-cases}

You can use volumes for data import, data migration, and external collections. 

- **Data import**

    Upload or reference prepared datasets in a volume and import them into a Zilliz Cloud collection. Both managed and external volumes can be used as an import source. For details, refer to [Import Data (Console)](./import-data-on-web-ui#from-a-volume), [Import Data (RESTful API)](./import-data-via-restful-api) and [Import Data (SDK)](./import-data-via-sdks).

- **Data migration**

    Upload backup files of your Milvus instance into a volume and restore them as a Zilliz Cloud cluster. Both managed and external volumes can be used. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Backup Files](./via-backup-files).

- **External collections** 

    Create [external collections](./data-external-and-managed-collections) that map to data in an external volume, enabling you to query files in your own bucket directly from Zilliz Cloud without importing them first.