---
slug: /migrate-from-milvus
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Migrate from Milvus

Zilliz Cloud provides a cutting-edge data infrastructure for optimized search across vector embeddings, making it easy to bring your AI applications to life. If you are using Milvus and wish to leverage this advanced infrastructure, migrating your data to Zilliz Cloud is a recommended step.

This guide will walk you through the process of preparing the migration data, performing the migration, and verifying the results.

## Prepare migration data{#prepare-migration-data}

<Tabs defaultValue="1x" values={[{"label":"From Milvus 1.x","value":"1x"},{"label":"From Milvus 2.x","value":"2x"}]}>

<TabItem value="1x">

Zilliz Cloud enables data migration from Milvus 1.x (including 0.9.x and above) and later versions. As a promising vector database, there are often significant changes between its releases.

To prepare migration data for Milvus 0.9.x through 1.x, you need to

1. Download the migration tool [milvus-migration](https://assets.zilliz.com/tools/milvus-migration). We recommend using the latest release of this tool. Please note that it is only applicable to CentOS 7.5 or higher, or Ubuntu LTS 18.04 or higher. For more information about installation prerequisites, refer to [milvus-migration](https://github.com/zilliztech/milvus-migration#prerequisites).

1. Stop the Milvus installation or at least stop performing any DML operations in it.

1. Export the metadata of the installation to `meta.json`.
    - For those installations using MySQL as the backend, run

    ```bash
    ./milvus-migration export -m "user:password@tcp(adderss)/milvus?charset=utf8mb4&parseTime=True&loc=Local" -o outputDir
    ```

    - For those installations using SQLite as the backend, run

    ```bash
    ./milvus-migration export -s /milvus/db/meta.sqlite -o outputDir
    ```

1. Copy the `tables` folder of your Milvus installation, then move both `meta.json` and the `tables` folder to an empty folder.
    Once this step is done, the structure of the empty folder should look like this:

    ```bash
    migration_data
    ├── meta.json
    └── tables
    ```

1. Upload the folder prepared in the preceding step to an S3 block storage bucket or directly use this local folder in the next section.

</TabItem>

<TabItem value="2x">

Zilliz Cloud allows data migration from Milvus 0.9.x and later versions. As a promising vector database, there are usually drastic changes between its releases.

To prepare migration data for Milvus 2.x, do as follows:

1. Download [**milvus-backup**](https://github.com/zilliztech/milvus-backup/releases). Always use the latest release.

1. Create a **configs** folder side by side with the downloaded binary, and download [**backup.yaml**](https://raw.githubusercontent.com/zilliztech/milvus-backup/master/configs/backup.yaml) into the **configs** folder.
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
    
    
    - For a Milvus instance installed using Docker Compose, `minio.bucketName` defaults to `a-bucket` and `rootPath` defaults to `files`.    
    
    - For a Milvus instance installed on Kubernetes, `minio.bucketName` defaults to `milvus-bucket` and `rootPath` defaults to `file`.    

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

        - If you prefer [the ](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)[**mc**](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install)[ client](https://min.io/docs/minio/linux/reference/minio-mc.html#mc-install), do as follows:
            ```plaintext
            # configure a Minio host
            mc alias set my_minio https://<minio_endpoint> <accessKey> <secretKey>
            
            # List the available buckets
            mc ls my_minio
            
            # Download a file from the bucket
            mc cp --recursive my_minio/<your-bucket-path> <local_dir_path>
            ```

1. Decompress the downloaded archive and upload only the content of the **backup** folder to Zilliz Cloud.

</TabItem>

</Tabs>

## Migrate data to Zilliz Cloud{#migrate-data-to-zilliz-cloud}

Once the migration data is ready, upload it to Zilliz Cloud.

![migration_procedure](/img/migration_procedure.png)

If you have uploaded the prepared migration data to a personal S3 block storage bucket, select **Import a folder from S3** and fill in the folder path and authentication credentials.

To upload a local folder to Zilliz Cloud, select **Import a local folder** and drag the folder to the drop zone. Note that you can upload a local folder of no more than 1 GB to Zilliz Cloud.

## Verify the migration results{#verify-the-migration-results}

Once the migration job status switches from **MIGRATING** to **SUCCESSFUL**, the migration is complete.

![verify_collection](/img/verify_collection.png)

Note that Zilliz Cloud exclusively supports [AUTOINDEX](./autoindex-explained) for optimized indexing, and will automatically index your migrated collection using this algorithm.

Once the collections are loaded, you are free to interact with them using your preferred method.

## Related topics{#related-topics}

- [AUTOINDEX Explained](./autoindex-explained) 

- [Select the Right CU](./cu-types-explained)

- [API Comparison](./api-comparison) 
