---
title: "Export Backup Files | Cloud"
slug: /export-backup-files
sidebar_label: "Export Backup Files"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
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
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';


# Export Backup Files

You can export backup files to object storage using the Zilliz Cloud console.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is in <strong>Private Preview</strong> for <strong>Dedicated</strong> clusters in <strong>Enterprise</strong> projects. To enable this feature or learn about the associated costs, contact <a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud support</a>.</p>

</Admonition>

## Before you start\{#before-you-start}

- You have integrated Zilliz Cloud with your object storage. For detailed steps, refer to [Integrate with AWS S3](./integrate-with-aws-s3), [Integrate with Azure Blob Storage](./integrate-with-azure-blob-storage), or [Integrate with Google Cloud Storage](./integrate-with-gcp).

- You have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

## Procedure\{#procedure}

You can export backup files from Zilliz Cloud either via the Zilliz Cloud console or through the RESTful API. 

### Export via Zilliz Cloud console\{#export-via-zilliz-cloud-console}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the left-side navigation pane, choose **Backups**.

1. On the page that appears, find the target backup file, click **...** in the **Actions** column, and then select **Export**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Only backup files in the <strong>Available</strong> status can be exported.</p>

    </Admonition>

1. In the **Export Backup File** dialog box, configure backup settings:

    - **Cloud Region of Cluster in Backup File**: Displays the cloud region where the backup file was created.

    - **Integration**: Select the object storage provider integrated with Zilliz Cloud.

    - **Integration Configuration**: Choose the specific bucket you configured for the backup export.

    - **Directory**: Enter the directory path in your object storage bucket where the exported backup file will be stored.

1. Then, click **Export**.

![export-backup-file](https://zdoc-images.s3.us-west-2.amazonaws.com/export-backup-file.png "export-backup-file")

### Export through RESTful API\{#export-through-restful-api}

Before you can export backup files from Zilliz Cloud via the [Export Backup Files](/reference/restful/export-backup-files-v2) RESTful API endpoint, you have to integrate one of your AWS S3 buckets with Zilliz Cloud and obtain its integration ID. For details, refer to [Obtain the integration ID](./integrate-with-aws-s3#obtain-the-integration-id).

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxx"
export BACKUP_ID="backup-xxxxxxxxxxxxxxx"

curl --request POST \
--url "${BASE_URL}/v2/clusters/${CLUSTER_ID}/backups/${BACKUP_ID}/export" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "integrationId": "inter-xxxxxxx",
    "directory": "destdir/"
}'
```

The response to the above request would be a Job ID as follows:

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-0396450098cglufig6afm9"
    }
}
```

## Monitor export progress\{#monitor-export-progress}

Once you click **Export**, an export job is generated automatically:

1. Go to the [Jobs](https://docs.cloud-uat3.zilliz.com/docs/job-center) page in the left-side navigation pane.

1. Monitor the job's **Status**:

    - **IN PROGRESS**: The file is being exported.

    - **SUCCESSFUL**: The backup file has been successfully exported. You can access it in your specified S3 bucket.

    - **ERROR**: The job failed. This can occur if a resource used by the export process, such as the Role ARN or the backup file, is deleted during the job execution.

![monitor-export-job](https://zdoc-images.s3.us-west-2.amazonaws.com/monitor-export-job.png "monitor-export-job")

## Cancel export job\{#cancel-export-job}

If your job remains in the **IN PROGRESS** status and you decide not to proceed, you can cancel the job by clicking **Cancel** in the **Actions** column.

<Admonition type="info" icon="📘" title="Notes">

<p>Canceling midway will not remove data already uploaded to your bucket.</p>

</Admonition>

