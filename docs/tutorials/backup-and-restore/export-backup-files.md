---
title: "Export Backup Files | Cloud"
slug: /export-backup-files
sidebar_label: "Export Backup Files"
beta: PRIVATE
notebook: FALSE
description: "You can export backup files to object storage using the Zilliz Cloud console. | Cloud"
type: origin
token: QUTDwkbTTiA2UlkWYDlc796ensf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - export
  - integrate
  - object
  - storage
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';


# Export Backup Files

You can export backup files to object storage using the Zilliz Cloud console.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is in <strong>Private Preview</strong> for clusters on the <strong>Dedicated-Enterprise</strong> plan. To enable this feature or learn about the associated costs, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Before you start{#before-you-start}

- You have integrated Zilliz Cloud with your object storage. For detailed steps, refer to [Integrate with AWS S3](./integrate-with-aws-s3).

- You have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

## Procedure{#procedure}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane, choose **Backups**.

1. On the page that appears, find the target backup file, click **...** in the **Actions** column, and then select **Export**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Only backup files in the <strong>Available</strong> status can be exported.</p>

    </Admonition>

1. In the **Export Backup File** dialog box, configure backup settings:

    - **Cloud Region of Cluster in Backup File**: Displays the cloud region where the backup file was created.

    - **Integration**: Select the object storage provider integrated with Zilliz Cloud. Currently, AWS S3 is supported. For more information, refer to [Integrate with AWS S3](./integrate-with-aws-s3).

    - **Integration Configuration**: Choose the specific bucket you configured for the backup export.

    - **Directory**: Enter the directory path in your object storage bucket where the exported backup file will be stored.

1. Then, click **Export**.

![export-backup-file](/img/export-backup-file.png)

## Monitor export progress{#monitor-export-progress}

Once you click **Export**, an export job is generated automatically:

1. Go to the [Jobs](https://docs.cloud-uat3.zilliz.com/docs/job-center) page in the left-side navigation pane.

1. Monitor the job's **Status**:

    - **IN PROGRESS**: The file is being exported.

    - **SUCCESSFUL**: The backup file has been successfully exported. You can access it in your specified S3 bucket.

    - **ERROR**: The job failed. This can occur if a resource used by the export process, such as the Role ARN or the backup file, is deleted during the job execution.

![monitor-export-job](/img/monitor-export-job.png)

## Cancel export job{#cancel-export-job}

If your job remains in the **IN PROGRESS** status and you decide not to proceed, you can cancel the job by clicking **Cancel** in the **Actions** column.

<Admonition type="info" icon="📘" title="Notes">

<p>Canceling midway will not remove data already uploaded to your bucket.</p>

</Admonition>

