---
title: "Manage Cluster | Cloud"
slug: /manage-cluster
sidebar_label: "Manage Cluster"
beta: FALSE
notebook: FALSE
description: "This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals. | Cloud"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension

---

import Admonition from '@theme/Admonition';


# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

## Free cluster{#free-cluster}

After creating a free cluster, you will see the following in the console.

![free-cluster-lifecycle](/img/free-cluster-lifecycle.png)

<Admonition type="info" icon="📘" title="Notes">

<p>You have the option to create one free cluster without charge. In addition, you can create up to five collections within the cluster.</p>

</Admonition>

### Connect to cluster{#connect-to-cluster}

In the **Connect** section, you can find the **Public Endpoint** and **Token** used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Upgrade plan{#upgrade-plan}

By upgrading your cluster, you can unlock a wide range of enterprise features, manage larger datasets, and enjoy enhanced performance. You can switch to a paid cluster plan when any of these conditions are met:

- Your account has sufficient credits;

- You have added a valid payment method;

- Your account has a positive balance

To upgrade your plan, follow these steps:

1. On the Cluster Details page, click the **Upgrade** button next to **Cluster Plan**.

1. Select **Upgrade to Serverless Cluster** or **Upgrade to New Dedicated Cluster**.

    - **Upgrade to Severless cluster:**

        In the dialog box that opens, review the plan information and pricing. Click **Upgrade**. When the upgrade is completed, your Free cluster will be replaced with the Serverless cluster. 

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>During the upgrade, read and write operations to this cluster is not supported.</p></li>
        <li><p>The upgrade will result in a change to the cluster endpoint. Thus, please ensure to update the cluster endpoint information in your application code. </p></li>
        </ul>

        </Admonition>

        ![upgrade-to-serverless](/img/upgrade-to-serverless.png)

    - **Upgrade to New Dedicated cluster:**

        On the page that opens, complete the following:

        During the upgrade, the original Free cluster will still be retained and keep running. When the upgrade is completed, a new Dedicated cluster will be created and data from the original Free cluster will be automatically migrated to the new Dedicated cluster. 

        <Admonition type="info" icon="📘" title="Notes">

        <p>To connect to the new Dedicated cluster, please modify your application code and use the appropriate endpoint and token of the new cluster.</p>

        </Admonition>

        ![upgrade-to-dedicated](/img/upgrade-to-dedicated.png)

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

## Serverless cluster{#serverless-cluster}

After creating a Serverless cluster, you will see the following in the console.

![serverless-cluster-lifecycle](/img/serverless-cluster-lifecycle.png)

- **Connect**: This section provides the necessary details to begin interacting with your cluster, including the cluster ID, cluster cloud region, public endpoint for connections, and a token for secure access.

- **Summary**: This offers a snapshot of your cluster's essentials. You can find the cluster plan and compatible Milvus version. Details on the creator, as well as the creation date and time, are also presented.

### Connect to cluster{#connect-to-cluster}

In the **Connect** section, you can find the **Public Endpoint** and **Token** used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Manage collections and data{#manage-collections-and-data}

- **Collections**

    On the **Collections** tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](/docs/data-import).

    ![manage-collections](/img/manage-collections.png)

- **Backups**

    In the **Backups** tab, you can create backups of your cluster by selecting **Create Snapshot**. You can find all snapshots on the **Backups** tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- **Data migrations**

    In the **Migrations** tab, you can create data migration tasks by selecting **Migrate**. For details, refer to [Migrate Between Clusters](./migrate-between-clusters).

### Migrate to Dedicated cluster{#migrate-to-dedicated-cluster}

For more enterprise-grade features and custom configurations, you are recommended to migrate your Serverless cluster to a Dedicated cluster. For more information, refer to [Cross-Cluster Migrations](./migrate-between-clusters).

### Users and access control{#users-and-access-control}

Each serverless cluster comes with a single default user. You can't add or drop users, but you can reset the default user's password.

![manage-users](/img/manage-users.png)

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

## Dedicated cluster{#dedicated-cluster}

### View cluster details{#view-cluster-details}

After setting up your Zilliz Cloud Dedicated cluster, here’s what you’ll find in each section for cluster details:

![dedicated-cluster-lifecycle](/img/dedicated-cluster-lifecycle.png)

- **Connect**: This section provides the necessary details to begin interacting with your cluster, including the cluster ID, cluster cloud region, public endpoint for connections, a private link,, IP address whitelist, and a token for secure access.

- **Summary**: This offers a snapshot of your cluster's essentials. You can find the cluster plan, CU type, and CU size, compatible Milvus version. Details on the creator, as well as the creation date and time, are also presented.

### Establish connection{#establish-connection}

- **Connect to cluster**

    In the **Connect** section, you can find the **Public Endpoint** and **Token** that are used to connect to the cluster. The token can be an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) that consists of a username and password pair.

    For more information, refer to [Connect to Cluster](./connect-to-cluster).

- **Set up private link**

    To establish a more secure connection to your cluster, you can create a private link instead of using the public endpoint provided. Refer to [Set up a Private Link](./setup-a-private-link) for further details.

### Manage collections and data{#manage-collections-and-data}

- **Collections**

    On the **Collections** tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](/docs/data-import).

    ![manage-collections](/img/manage-collections.png)

- **Backups**

    In the **Backups** tab, you can create backups of your cluster by selecting **Create Snapshot**. You can find all snapshots on the **Backups** tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- **Migrations**

    In the **Migrations** tab, you can create data migration tasks by selecting **Migrate**. For details, refer to [Migrate Between Clusters](./migrate-between-clusters).

### Users and access control{#users-and-access-control}

- **Users**

    On the **Users** tab, you can add users, reset their passwords, and drop them.

    For details, refer to [Cluster Credentials (Console)](./cluster-credentials-console).

    ![manage-users](/img/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

- **Whitelist**

    In the **Summary** section, click on the IP address in **Network Address** to add IP address segments to the whitelist. Once an IP address segment, other than a full-zero one (**0.0.0.0/0**), is added to the whitelist, Zilliz Cloud only permits access from IP addresses within the listed IP address segments.

    By default, a full-zero IP address segment is added, indicating that your cluster can be accessed from anywhere.

    For details on how to set up the whitelist, refer to [Set up Whitelist](./setup-whitelist).

### Upgrade cluster plan{#upgrade-cluster-plan}

For Dedicated (Standard) cluster, click **Upgrade** right to the service **Plan** in the **Summary** section to upgrade your plan to **Dedicated (Enterprise)**. Zilliz Cloud upgrades your service plan only after you confirm this operation in the **Upgrade Cluster Plan** dialog box.

For the differences between all the available subscription plans, refer to [Select Service Tiers](./select-zilliz-cloud-service-plans).

### Suspend & resume cluster{#suspend-and-resume-cluster}

In the **Actions** drop-down button, select **Suspend** to stop the cluster. Once you confirm this operation in the **Suspend Cluster** dialog box, the cluster status changes from **RUNNING** to **SUSPENDING**, during which you cannot perform other actions to the cluster.

Once the status changes to **SUSPENDED**, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

<table>
   <tr>
     <th><p><strong>Cloud Provider</strong></p></th>
     <th><p><strong>Storage Pricing</strong></p></th>
   </tr>
   <tr>
     <td><p>AWS storage</p></td>
     <td><p>$0.025 / GB per month</p></td>
   </tr>
   <tr>
     <td><p>GCP storage</p></td>
     <td><p>$0.020 / GB per month</p></td>
   </tr>
   <tr>
     <td><p>Azure storage</p></td>
     <td><p>$0.025 / GB per month</p></td>
   </tr>
</table>

To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully based on your CU settings and service plan.

You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster) and [Resume Cluster](/reference/restful/resume-cluster).

### **Drop cluster**{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Set up a Private Link](./setup-a-private-link)

- [Migrate Between Clusters](./migrate-between-clusters)

- [Detailed Plan Comparison](./select-zilliz-cloud-service-plans)

- [Set up Whitelist](./setup-whitelist)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

