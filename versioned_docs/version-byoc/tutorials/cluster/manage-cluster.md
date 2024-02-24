---
slug: /manage-cluster
beta: FALSE
notebook: FALSE
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

### View cluster details{#view-cluster-details}

After setting up your Zilliz Cloud cluster, here’s what you’ll find in each section for cluster details:

![byoc-cluster-lifecycle](/byoc/byoc-cluster-lifecycle.png)

- __Connect__: This section provides the necessary details to begin interacting with your cluster, including the public endpoint for connections, and a token for secure access.

- __Summary__: This offers a snapshot of your cluster's essentials. You can find the cluster's ID, hosting region, type, and size. Details on the creator, as well as the creation date and time, are also presented.

- __Topology__: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

    - __Proxy__: Stateless nodes that manage user connections and streamline service addresses with load balancers.

    - __Query Node__: Responsible for hybrid vector and scalar searches and incremental data updates.

    - __Coordinator__: The orchestration center, distributing tasks across worker nodes.

    - __Data Node__: Handles data mutations and log-to-snapshot conversions for persistence.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Clusters with <strong>1-8 CUs</strong> typically use a single-node setup suitable for smaller datasets. Clusters with more than <strong>8 CUs</strong> adopt a distributed multi-server node architecture to improve performance and scalability.</p>

    </Admonition>

### Establish connection{#establish-connection}

- __Connect to cluster__

    In the __Connect__ section, you can find the __Public Endpoint__ and __Token__ that are used to connect to the cluster. The token can bea [cluster credential](./cluster-credentials) that consists of a username and password pair.

    For more information, refer to [Connect to Cluster](./connect-to-cluster).

### Manage collections and data{#manage-collections-and-data}

- __Collections__

    On the __Collections__ tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](/docs/data-import).

    ![manage-collections](/byoc/manage-collections.png)

- __Backups__

    In the __Actions__ drop-down button, you can create backups of your cluster by selecting __Create Snapshot__. You can find all snapshots on the __Backups__ tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- __Data migrations__

    In the __Actions__ drop-down button, you can create data migration tasks by selecting __Migrate__ to migrate your data from Milvus.

### Users and access control{#users-and-access-control}

- __Users__

    On the __Users__ tab, you can add users, reset their passwords, and drop them.

    For details, refer to [Manage Cluster Credentials](./cluster-credentials-console).

    ![manage-users](/byoc/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

### Manage and configure clusters{#manage-and-configure-clusters}

- __Scale-up cluster__

    In the __Summary__ section, click __Scale__ right to the CU __Size__ to open the __Scale Cluster__ dialog box. You can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. You can scale the size of a cluster up to 24 CUs in the dialog box. Contact us if you need a larger CU.

    For details on CU types and how to select an appropriate one, refer to [Select the Right CU](./cu-types-explained).

    In addition to the web UI, you can also make an API request to scale up a cluster. For details, refer to [Modify Cluster](/reference/modify-cluster).

    <Admonition type="caution" icon="🚧" title="Warning">

    <p>Scaling up a cluster may cause several minutes of downtime. Please exercise caution.</p>

    </Admonition>

- __Scale down cluster__

    To scale down the cluster CU size, please [submit a request](https://support.zilliz.com/hc/en-us).

- __Suspend & resume cluster__

    In the __Actions__ drop-down button, select __Suspend__ to stop the cluster. Once you confirm this operation in the __Suspend Cluster__ dialog box, the cluster status changes from __RUNNING__ to __SUSPENDING__, during which you cannot perform other actions to the cluster.

    Once the status changes to __SUSPENDED__, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

    To resume a suspended cluster, click on __Actions__ and select __Resume__ from the drop-down menu. Upon confirming this action in the __Resume Cluster__ dialog box, the cluster's status will change from __SUSPENDED__ to __RESUMING__, and then to __RUNNING__. At this point, you will be charged fully based on your CU settings and service plan.

    You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/suspend-cluster) and [Resume Cluster](/reference/resume-cluster).

- __Drop cluster__

    In the __Actions__ drop-down button, select __Drop__ to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the __Drop Cluster__ dialog box.

    In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/drop-cluster).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

