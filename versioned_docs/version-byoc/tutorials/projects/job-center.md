---
title: "Manage Project Jobs | BYOC"
slug: /job-center
sidebar_label: "Project Jobs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud offers an intuitive Jobs page that integrates all historical and asynchronous data tasks within the same project. | BYOC"
type: origin
token: RY8ww0NDQi8yU9kNpjicHP7Gn4b
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - project jobs
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# Manage Project Jobs

Zilliz Cloud offers an intuitive Jobs page that integrates all historical and asynchronous data tasks within the same project.

## View project jobs\{#view-project-jobs}

Select a project. In the left navigation pane, choose **Jobs**. On the displayed page, you can see a list of all asynchronous jobs that are being executed or have been executed.

The following job information is displayed:

- Type and Description: The purpose and information of the job. There are certain types of job on this page.

    <table>
       <tr>
         <th><p><strong>Type</strong></p></th>
         <th><p><strong>Explanation</strong></p></th>
       </tr>
       <tr>
         <td rowspan="3"><p><a href="./create-snapshot">Backup</a></p></td>
         <td><p>Create a backup file for a cluster</p></td>
       </tr>
       <tr>
         <td><p>Create a backup file for a collection or specified colletions</p></td>
       </tr>
       <tr>
         <td><p>Copy backups to specified cloud regions</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><a href="./restore-from-snapshot">Restore</a></p></td>
         <td><p>Restore a cluster from a backup file</p></td>
       </tr>
       <tr>
         <td><p>Restore a collection or several collections from a backup file</p></td>
       </tr>
       <tr>
         <td><p><a href="./export-backup-files">Export Backup File</a></p></td>
         <td><p>Export a backup file to the specified object storage service</p></td>
       </tr>
       <tr>
         <td><p><a href="./migrations">Migration</a></p></td>
         <td><p>Migrate data to a cluster.</p><ul><li><p>External Data Migration: </p><ul><li><p>From Milvus</p></li><li><p>From Pinecone</p></li><li><p>From Qdrant</p></li><li><p>From Elasticsearch</p></li><li><p>From OpenSearch</p></li><li><p>From PostgreSQL</p></li><li><p>From Tencent Cloud VectorDB</p></li></ul></li><li><p>Zilliz Cloud Cross-cluster migration:</p><ul><li><p>Cross-cluster migration within the same organization</p></li><li><p>Migration between clusters across organizations</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p><a href="./data-import">Import</a></p></td>
         <td><p>Import data to a collection</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">Clone Collection</a></p></td>
         <td><p>Make a full copy of the collection with both its schema and data</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-collections-console#create-collection">Create Sample Collection</a></p></td>
         <td><p>Create a collection loaded with a sample dataset</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#suspend-cluster">Suspend Cluster</a></p></td>
         <td><p>Manually suspend a cluster</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-cluster#resume-cluster">Resume Cluster</a></p></td>
         <td><p>Manually resume a cluster</p></td>
       </tr>
       <tr>
         <td><p><a href="./scale-cluster">Scale Query CU</a></p></td>
         <td><p>Increase or decrease the number of query CUs of a cluster.</p></td>
       </tr>
       <tr>
         <td><p><a href="./manage-replica">Scale Replica</a></p></td>
         <td><p>Increase or decrease the number of replicas of a cluster.</p></td>
       </tr>
    </table>

- Status: Job status, which can be Successful, In Progress, Pending, Failed, Canceled.

- ID: The ID of the data job.  For any troubles with data jobs, please [create a support ticket](http://support.zilliz.com) and provide the relevant Job ID.

- Start Time & End Time

- Created By: The user who initiated the data job.

## View job details\{#view-job-details}

To view the details of a job, click **...** in the **Actions** column and then select **View Details**. Alternatively, you can use the [Describe Job](/reference/restful/describe-job-v2) API to get the details programmatically.

![view_job_details](https://zdoc-images.s3.us-west-2.amazonaws.com/view_job_details.png "view_job_details")

## Cancel job\{#cancel-job}

Currently, you can only cancel the following types of jobs that  are in the state of **Pending** or **In Progress**:

- Create backup jobs (excluding copy backups to other cloud regions)

- Migration jobs (excluding zero downtime migration)

- Export backup file jobs

<Admonition type="info" icon="📘" title="Notes">

<p>To cancel a job, you must be an <strong>Organization Owner</strong> or a <strong>Project Admin</strong>.</p>

</Admonition>

![cancel_job](https://zdoc-images.s3.us-west-2.amazonaws.com/cancel_job.png "cancel_job")

## Retry failed job\{#retry-failed-job}

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, you can only retry failed import jobs.</p>
<p>To retry a failed job, you must be an <strong>Organization Owner</strong> or a <strong>Project Admin</strong>.</p>

</Admonition>

For failed import jobs, you can click on the info icon next to its status and check the reason to understand why this job has failed.

If you have made adjustments to the files that are failed to be imported, you can retry the job.

![retry_failed_job](https://zdoc-images.s3.us-west-2.amazonaws.com/retry_failed_job.png "retry_failed_job")

