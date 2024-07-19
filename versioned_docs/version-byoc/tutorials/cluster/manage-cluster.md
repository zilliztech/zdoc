---
slug: /manage-cluster
beta: FALSE
notebook: FALSE
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage

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

    For details, refer to [Manage Cluster Credentials](./cluster-credentials-console).

    ![manage-users](/byoc/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

### Manage and configure clusters{#manage-and-configure-clusters}

- **Scale cluster**

    Scaling a cluster involves adjusting the number of [CUs](./cu-types-explained) to match workload fluctuations or storage requirements. You can enhance your cluster's performance by scaling up CUs in response to increased CPU or memory usage, and scale down to conserve expenses during periods of low demand.

    Methods for scaling your cluster:

    - **Scaling on web UI**

        To manually scale up a cluster, navigate to the **Summary** area of the [Zilliz Cloud console](https://cloud.zilliz.com/signup) and click **Scale** next to the **CU** **Size** to access the scaling options. Here, you can adjust the CU count within the same type and cloud region. For Dedicated-Standard clusters, you can scale up the size of a cluster up to 32 CUs. For Dedicated-Enterprise clusters, you can scale up the size of a cluster up to 256 CUs. If you require a larger scale, please [reach out](https://support.zilliz.com/hc/en-us) to our team.

        <Admonition type="caution" icon="🚧" title="Warning">

        <p>The scaling may lead to slight service jitter. Please exercise caution.</p>

        </Admonition>

        To scale down the cluster CU size, please [submit a support ticket](https://support.zilliz.com/hc/en-us).

    - **Scaling via API requests**

        Make an API request to scale your cluster. For more information, refer to [Modify Cluster](/reference/restful/modify-cluster).

    - **[Private Preview] Auto-scaling**

        <Admonition type="info" icon="📘" title="Notes">

        <p>Auto-scaling is currently in private preview and is only available to Dedicated (Enterprise) clusters. To enable this feature, please <a href="https://zilliz.com/contact-sales">contact us</a>.</p>

        </Admonition>

        Auto-scaling is designed for businesses with rapidly changing needs. It can prevent restrictions on user write access caused by insufficient cluster CU sizes and can reduce operational burden, thereby minimizing disruption to business operations.

        You can specify the maximum CU size that a cluster can automatically scale up to. Downward auto-scaling is currently not supported.

        After enabling this feature, you can configure auto-scaling options when a cluster is successfully created.

        ![configure_autoscaling](/byoc/configure_autoscaling.png)

        Auto-scaling is triggered primarily based on the **CU Capacity Threshold**. Zilliz Cloud checks the cluster [CU capacity](./metrics-alerts-reference#cluster-metrics) every 1 minute. If it has exceeded the specified threshold (currently set at 70%) for the past 2 minutes, a scaling process is automatically initiated. For more information about the increment increase of the CU sizes during auto-scaling, refer to [Pricing Calculator](./pricing-calculator#considerations).

    <Admonition type="caution" icon="🚧" title="Warning">

    <ul>
    <li><p><strong>Operational Continuity</strong>: Even during scaling, your cluster's read/write operations will persist without disruption. A brief service fluctuation is possible, but rest assured of sustained high availability.</p></li>
    <li><p><strong>Sizing Caution</strong>: When scaling down, consider if a smaller CU size can handle your data volume. Use our <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate the minimum CU size necessary for your workload.</p></li>
    </ul>

    </Admonition>

- **Scale up cluster**

    In the **Summary** section, click **Scale** right to the **CU** **Size** to open the **Scale Cluster** dialog box. You can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. For Dedicated (Standard) clusters, you can scale up the size of a cluster up to 32 CUs. For Dedicated (Enterprise) clusters, you can scale up the size of a cluster up to 256 CUs. [Contact us](https://zilliz.com/contact-sales) if you need a larger CU size.

    For details on CU types and how to select an appropriate one, refer to [Select the Right CU](./cu-types-explained).

    In addition to the web UI, you can also make an API request to scale up a cluster. For details, refer to [Modify Cluster](/reference/restful/modify-cluster).

    <Admonition type="caution" icon="🚧" title="Warning">

    <p>The scaling may lead to slight service jitter. Please exercise caution.</p>

    </Admonition>

- **Scale down cluster**

    To scale down the cluster CU size, please navigate to the overview page of the target cluster and click **Scale** next to the CU size. Select the desired CU size in the dialog window. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>Please use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate the minimum CU size needed for your data. Otherwise, scaling may fail.</p>

    </Admonition>

- **Suspend & resume cluster**

    In the **Actions** drop-down button, select **Suspend** to stop the cluster. Once you confirm this operation in the **Suspend Cluster** dialog box, the cluster status changes from **RUNNING** to **SUSPENDING**, during which you cannot perform other actions to the cluster.

    Once the status changes to **SUSPENDED**, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

    To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully based on your CU settings and service plan.

    You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster) and [Resume Cluster](/reference/restful/resume-cluster).

- **Drop cluster**

    In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

    In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

