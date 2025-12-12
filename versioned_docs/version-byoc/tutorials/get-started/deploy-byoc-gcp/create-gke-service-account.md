---
title: "Create GKE Service Account | BYOC"
slug: /create-gke-service-account
sidebar_label: "Create GKE Service Account"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes how to create and configure a service account for Zilliz Cloud to deploy a Google Kubernetes Engine (GKE) cluster for your Zilliz Cloud project. | BYOC"
type: origin
token: JkXDwmB2QijMfvkLoWEclz9Nnbe
sidebar_position: 2
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create GKE Service Account

This page describes how to create and configure a service account for Zilliz Cloud to deploy a Google Kubernetes Engine (GKE) cluster for your Zilliz Cloud project.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Procedure\{#procedure}

You can use the Google Cloud Platform (GCP) dashboard to create the EKS role. Alternatively, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on GCP. For details, refer to [Terraform Provider](./terraform-provider).

<Supademo id="cmc1oadayjm7fsn1rqyu2h33u" title=""  />

The steps for creating a service account are as follows:

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** on the left navigation pane.

1. Click **Create service account**.

1. Set a proper name for the service account to create.

    In this demo, you can set it to `your-org-gke-node-sa`. The service account ID should be the first 18 characters of the service account name. You can manually set it to a proper value.

1. Click **Create and continue**.

1. In the **Permissions** section, select **Kubernetes Engine Default Node Service Account** from the **Select a role** drop-down list.

1. Click **Add IAM condition**, set the condition title, and enter the condition expression into the **Condition editor**. The condition is as follows:

    ```json
    resource.name.startsWith("projects/PROJECT_ID/locations/REGION/clusters/CLUSTER_NAME")
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>You need to replace the three placeholders in the above expression with actual values:</p>
    <ul>
    <li><code>PROJECT_ID</code></li>
    </ul>
    <p>This should be your GCP project ID.</p>
    <ul>
    <li><code>REGION</code></li>
    </ul>
    <p>This should be the cloud region of your BYOC project.</p>
    <ul>
    <li><code>CLUSTER_NAME</code></li>
    </ul>
    <p>This should be the name of the GKE cluster that Zilliz Cloud will create on your behalf.</p>

    </Admonition>

1. Click **Save**.

1. Cilck **Save** again to grant the configured permissions.

