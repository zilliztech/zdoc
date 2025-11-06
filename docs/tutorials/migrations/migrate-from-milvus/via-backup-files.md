---
title: "Migrate from Milvus to Zilliz Cloud Via Backup Files | Cloud"
slug: /via-backup-files
sidebar_label: "Via Backup Files"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. This topic describes how to migrate from Milvus by uploading backup files directly. | Cloud"
type: origin
token: IO4fwm5fJiroaoktKeIcbdkDnRb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - milvus
  - backup files
  - milvus vector db
  - Zilliz Cloud
  - what is milvus
  - milvus database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Migrate from Milvus to Zilliz Cloud Via Backup Files

Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. This topic describes how to migrate from Milvus by uploading backup files directly.

## Before you start\{#before-you-start}

Make sure the following prerequisites are met:

- You have made necessary preparations for migration based on the migration method:

    - **From Local File**: Prepare local backup files in advance. For information on how to prepare backup files, refer to [Prepare backup files for migration](./via-backup-files#prepare-backup-files-for-migration).

    - **From Object Storage**: The public URL and access credentials for the Milvus object storage. You can choose long-term or temporary credentials. For detailed examples of an object storage URL, see [FAQ](./via-backup-files#faq).

- You have been granted the **Organization Owner** or **Project Admin** role. If you do not have the necessary permissions, contact your Zilliz Cloud Organization Owner.

- Make sure the CU size of the target cluster can accommodate your source data. To estimate the required CU size, use the [calculator](https://zilliz.com/pricing?_gl=1*qro801*_ga*MzkzNTY1NDM0LjE3Mjk1MDExNzQ.*_ga_Q1F8R2NWDP*MTc0NTQ4MzY1Ni4zMDEuMS4xNzQ1NDg0MTEzLjAuMC4w*_ga_KKMVYG8YF2*MTc0NTQ4MzY1Ni4yNTIuMS4xNzQ1NDg0MTEzLjAuMC4w#calculator).

## Prepare backup files for migration\{#prepare-backup-files-for-migration}

To prepare migration data for Milvus 2.x,

1. Download **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)**. Always use the latest release.

    Currently, you can migrate data from Milvus 2.2 and later versions to Zilliz Cloud clusters. For details on compatible source and target Milvus versions, refer to [Milvus Backup Overview](https://milvus.io/docs/milvus_backup_overview.md).

1. Create a **configs** folder side by side with the downloaded binary, and download **[backup.yaml](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml)** into the **configs** folder.

    Once the step is done, the structure of your workspace folder should look like this:

    ```plaintext
    workspace
    ├── milvus-backup
    └── configs
         └── backup.yaml
    ```

1. Customize **backup.yaml**.

    In normal cases, you do not need to customize this file. But before going on, check whether the following configuration items are correct:

    ```yaml
    ...
    # milvus proxy address, compatible to milvus.yaml
    milvus:
      address: localhost
      port: 19530
      ...
      
    # Related configuration of minio, which is responsible for data persistence for Milvus.
    minio:
      # Milvus storage configs, make them the same with milvus config
      storageType: "minio" # support storage type: local, minio, s3, aws, gcp, ali(aliyun), azure, tc(tencent), gcpnative
      # You can use "gcpnative" for the Google Cloud Platform provider. Uses service account credentials for authentication.
      address: localhost # Address of MinIO/S3
      port: 9000   # Port of MinIO/S3
      bucketName: "a-bucket" # Milvus Bucket name in MinIO/S3, make it the same as your milvus instance
      backupBucketName: "a-bucket" # Bucket name to store backup data. Backup data will store to backupBucketName/backupRootPath
      rootPath: "files" # Milvus storage root path in MinIO/S3, make it the same as your milvus instance
      ...
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>For a Milvus instance installed using Docker Compose, <code>minio.bucketName</code> defaults to <code>a-bucket</code> and <code>rootPath</code> defaults to <code>files</code>.</p></li>
    <li><p>For a Milvus instance installed on Kubernetes, <code>minio.bucketName</code> defaults to <code>milvus-bucket</code> and <code>rootPath</code> defaults to <code>file</code>.</p></li>
    </ul>

    </Admonition>

1. Create a backup of your Milvus installation.

    ```plaintext
    ./milvus-backup --config backup.yaml create -n my_backup
    ```

1. Get the backup file.

    ```plaintext
    ./milvus-backup --config backup.yaml get -n my_backup
    ```

1. Check the backup files.

    - If you set `minio.address` and `minio.port` to an S3 bucket, your backup file are already in the S3 bucket.

    - If you set `minio.address` and `minio.port` to a Minio bucket, you can download them using Minio Console or the **mc** client. 

        - To download from [Minio Console](https://min.io/docs/minio/kubernetes/upstream/administration/minio-console.html), log into Minio Console, locate the bucket specified in `minio.address`, select the files in the bucket, and click **Download** to download them.

        - If you prefer [the ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[mc](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)**[ client](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install), do as follows:

            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. Decompress the downloaded archive and upload only the content of the **backup** folder to Zilliz Cloud.

## Migrate data to Zilliz Cloud\{#migrate-data-to-zilliz-cloud}

With backup files ready, you can migrate the data from local files directly or from object storage.

<Supademo id="cmbhd2wj85jktsn1rnjmi4t5o" title="Zilliz Cloud - Migrate from Milvus via Backup File Demo" />

<Admonition type="info" icon="📘" title="Notes">

<p>If full text search is already enabled for the source collection, Zilliz Cloud will preserve its Function settings in the target collection after migration. These inherited settings cannot be modified.</p>

</Admonition>

## Monitor the migration process\{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **In Progress** to **Successful**, the migration is complete.

<Supademo id="cme9my2nn4b64h3pyiyvsakqb" title="Zilliz Cloud - Monitor the Migration Process" />

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

## Post-migration\{#post-migration}

After the migration job is completed, note the following:

- **Index Creation**: The migration process automatically creates [AUTOINDEX](./autoindex-explained) for the migrated collections.

- **Manual Loading Required**: Despite automatic indexing, the migrated collections are not immediately available for search or query operations. You must manually load the collections in Zilliz Cloud to enable search and query functionalities. For details, refer to [Load & Release](./load-release-collections).

## Cancel migration job\{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

## FAQ\{#faq}

1. **What format of URL should I follow when migrating from a backup file stored in an object storage bucket?**

    The following table provides an example of the URLs of different object storage services. Note that when migrating from a backup file, you can only choose a backup folder.

    <table>
       <tr>
         <th colspan="2"><p><strong>Cloud Object Storage</strong></p></th>
         <th><p><strong>URL Format</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><strong>Amazon S3</strong></p></td>
         <td><p>AWS Object URL, virtual-hosted–style</p></td>
         <td><p><i>http</i>s://\<bucket_name>.s3.\<region-code>.amazonaws.com/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>AWS Object URL, path-style</p></td>
         <td><p><i>http</i>s://s3.\<region-code>.amazonaws.com/\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>Amazon S3 URI</p></td>
         <td><p>s3://\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Google Cloud Storage</strong></p></td>
         <td><p>GSC public URL</p></td>
         <td><p><i>http</i>s://storage.cloud.google.com/\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td><p>GSC gsutil URI</p></td>
         <td><p>gs://\<bucket_name>/\<folder_name>/</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Azure Blob Storage</strong></p></td>
         <td><p><i>http</i>s://\<storage_account>.blob.core.windows.net/\<container>/\<folder>/</p></td>
       </tr>
    </table>
