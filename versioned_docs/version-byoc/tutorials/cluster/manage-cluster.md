---
title: "Manage Cluster | BYOC"
slug: /manage-cluster
sidebar_label: "Manage Cluster"
beta: FALSE
notebook: FALSE
description: "This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals. | BYOC"
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';


# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

### View cluster details{#view-cluster-details}

After setting up your Zilliz Cloud Dedicated cluster, here’s what you’ll find in each section for cluster details:

![byoc-cluster-lifecycle](/byoc/byoc-cluster-lifecycle.png)

- **Connect**: This section provides the necessary details to begin interacting with your cluster, including the cluster ID, cluster cloud region, public endpoint for connections,, IP address whitelist, and a token for secure access.

- **Summary**: This offers a snapshot of your cluster's essentials. You can find the cluster plan, CU type, and CU size, compatible Milvus version. Details on the creator, as well as the creation date and time, are also presented.

- **Topology**: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

    - **Proxy**: Stateless nodes that manage user connections and streamline service addresses with load balancers.

    - **Query Node**: Responsible for hybrid vector and scalar searches and incremental data updates.

    - **Coordinator**: The orchestration center, distributing tasks across worker nodes.

    - **Data Node**: Handles data mutations and log-to-snapshot conversions for persistence.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Clusters with <strong>1-8 CUs</strong> typically use a single-node setup suitable for smaller datasets. Clusters with more than <strong>8 CUs</strong> adopt a distributed multi-server node architecture to improve performance and scalability.</p>

    </Admonition>

### Establish connection{#establish-connection}

- **Connect to cluster**

    In the **Connect** section, you can find the **Public Endpoint** and **Token** that are used to connect to the cluster. The token can bea [cluster credential](./cluster-credentials) that consists of a username and password pair.

    For more information, refer to [Connect to Cluster](./connect-to-cluster).

### Manage collections and data{#manage-collections-and-data}

- **Collections**

    On the **Collections** tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](/docs/data-import).

    ![manage-collections](/byoc/manage-collections.png)

- **Backups**

    In the **Backups** tab, you can create backups of your cluster by selecting **Create Snapshot**. You can find all snapshots on the **Backups** tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- **Migrations**

    In the **Migrations** tab, you can create data migration tasks by selecting **Migrate**.

### Users and access control{#users-and-access-control}

- **Users**

    On the **Users** tab, you can add users, reset their passwords, and drop them.

    For details, refer to [Cluster Credentials (Console)](./cluster-credentials-console).

    ![manage-users](/byoc/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

### Suspend & resume cluster{#suspend-and-resume-cluster}

In the **Actions** drop-down button, select **Suspend** to stop the cluster. Once you confirm this operation in the **Suspend Cluster** dialog box, the cluster status changes from **RUNNING** to **SUSPENDING**, during which you cannot perform other actions to the cluster.

Once the status changes to **SUSPENDED**, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully based on your CU settings and service plan.

You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster) and [Resume Cluster](/reference/restful/resume-cluster).

### **Drop cluster**{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster-v2).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

