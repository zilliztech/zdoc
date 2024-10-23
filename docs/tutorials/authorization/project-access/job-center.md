---
title: "Manage Project Jobs | Cloud"
slug: /job-center
sidebar_label: "Manage Project Jobs"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud offers an intuitive Jobs page that integrates all historical and asynchronous data tasks within the same project. | Cloud"
type: origin
token: D8Y0whjSYi7hqRkE1qLcX7w0nDe
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - project jobs

---

import Admonition from '@theme/Admonition';


# Manage Project Jobs

Zilliz Cloud offers an intuitive Jobs page that integrates all historical and asynchronous data tasks within the same project.

## View project jobs{#view-project-jobs}

Select a project. In the left navigation pane, choose **Jobs**. On the displayed page, you can see a list of all asynchronous jobs that are being executed or have been executed.

The following job information is displayed:

- Description and Type: The purpose and information of the data job. There are certain types of job on this page.

    <table>
       <tr>
         <th><p><strong>Type</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p>Backup</p></td>
         <td><p>Create a backup file for a cluster.</p></td>
       </tr>
       <tr>
         <td><p>Create a backup file for a collection.</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p>Restore</p></td>
         <td><p>Restore a cluster from a backup file.</p></td>
       </tr>
       <tr>
         <td><p>Restore a collection from a backup file.</p></td>
       </tr>
       <tr>
         <td><p>Migration</p></td>
         <td><p>Migrate data to a cluster.</p><ul><li><p>External Data Migration: </p><ul><li><p>From Elasticsearch</p></li><li><p>From Milvus</p></li></ul></li><li><p>Cross-cluster migration:</p><ul><li><p>From Serverless or Dedicated cluster to a new Dedicated cluster</p></li><li><p>From Dedicated cluster to an existing Dedicated cluster</p></li></ul></li></ul></td>
       </tr>
       <tr>
         <td><p>Import</p></td>
         <td><p>Import data to a collection.</p></td>
       </tr>
       <tr>
         <td><p>Clone Collection</p></td>
         <td><p>Make a full copy of the collection with both its schema and data.</p></td>
       </tr>
    </table>

- Status: Job status, which can be Successful, In Progress, Pending, Failed, Canceled.

- ID: The ID of the data job.  For any troubles with data jobs, please [create a support ticket](http://support.zilliz.com) and provide the relevant Job ID.

- Start Time & End Time

- Created By: The user who initiated the data job.

## View job details{#view-job-details}

To view the details of a job, click **...** in the **Actions** column and then select **View Details**. Alternatively, you can use the [Describe Job](/reference/restful/describe-job-v2) API to get the details programmatically.

![view_job_details](/img/view_job_details.png)

## Cancel job{#cancel-job}

You can cancel a job that is **Pending** or **In Progress**. To cancel a job, click **...** in the **Actions** column and then select **Cancel**.

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, you can only cancel migration and backup jobs. </p>

</Admonition>

![cancel_job](/img/cancel_job.png)

## Retry failed job{#retry-failed-job}

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, you can only retry failed import jobs.</p>

</Admonition>

For failed import jobs, you can click on the info icon next to its status and check the reason to understand why this job has failed.

If you have made adjustments to the files that are failed to be imported, you can retry the job.

![retry_failed_job](/img/retry_failed_job.png)

