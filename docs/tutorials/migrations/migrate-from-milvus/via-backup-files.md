---
title: "Migrate from Milvus to Zilliz Cloud Via Backup Files | Cloud"
slug: /via-backup-files
sidebar_label: "Via Backup Files"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud in these ways - connecting to source Milvus via database endpoint or uploading backup files directly. | Cloud"
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
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - Video similarity search

---

import Admonition from '@theme/Admonition';


# Migrate from Milvus to Zilliz Cloud Via Backup Files

Zilliz Cloud offers Milvus as a fully managed, cloud-hosted solution for users who want to use the Milvus vector database without the need to manage the infrastructure themselves. To enable smooth migration, you can migrate data from Milvus to Zilliz Cloud in these ways - connecting to source Milvus via database endpoint or uploading backup files directly.

This topic describes how to migrate from Milvus by uploading backup files directly. For information on how to migrate data via database endpoint, refer to [Via Endpoint](./via-endpoint).

## Before you start{#before-you-start}

Make sure the following prerequisites are met:

- You have made necessary preparations for migration based on the migration method:

    - **From Local File**: Prepare local backup files in advance. For information on how to prepare backup files, refer to [Prepare backup files for migration](./via-backup-files#prepare-backup-files-for-migration).

    - **From Object Storage**: The public URL and access credentials for the Milvus object storage. You can choose long-term or temporary credentials.

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Prepare backup files for migration{#prepare-backup-files-for-migration}

To prepare migration data for Milvus 2.x,

1. Download **[milvus-backup](https://github.com/zilliztech/milvus-backup/releases)**. Always use the latest release.

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

    - `milvus.address`

    - `mivlus.port`

    - `minio.address`

    - `minio.port`

    - `minio.bucketName`

    - `minio.backupBucketName`

    - `rootPath`

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

## Migrate data to Zilliz Cloud{#migrate-data-to-zilliz-cloud}

With backup files ready, you can migrate the data from local files directly or from object storage.

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project and select **Migrations** > **Milvus** > **Via Backup Files**.

1. On the **Migrate From Milvus** page,

    - If your data is on a local file:

        - Select **From Local File**, upload the folder containing your data, and choose the target cluster.

    - If your data is in object storage:

        - Select **From Object Storage**, choose the service (e.g., S3, Azure Blob, GCP), enter the object URL or S3 URI of your data, provide the necessary credentials, and choose the target cluster.

        - Provide the necessary credentials by specifying the appropriate **Credential Type**:

            - **Long-term**: Use this option for persistent access to resources without frequent re-authentication.

            - **Session**: Choose this for temporary credentials that are valid for a limited duration, ideal for short-lived access during a specific user session.

1. Click **Migrate**.

![migrate_from_milvus_via_backup_file](/img/migrate_from_milvus_via_backup_file.png)

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

Note that Zilliz Cloud exclusively supports [AUTOINDEX](./autoindex-explained) for optimized indexing, and will automatically index your migrated collection using this algorithm.

Once the collections are loaded, you are free to interact with them using your preferred method.

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

