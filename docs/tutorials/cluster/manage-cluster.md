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

## Free cluster{#free-cluster}

After creating a free cluster, you will see the following in the console.

![free-cluster-lifecycle](/img/free-cluster-lifecycle.png)

<Admonition type="info" icon="📘" title="Notes">

<p>You have the option to create one free cluster without charge. In addition, you can create up to two collections within the cluster.</p>

</Admonition>

### Connect to cluster{#connect-to-cluster}

In the **Connect** section, you can find the **Public Endpoint** and **Token** used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster).

### Upgrade plan{#upgrade-plan}

By upgrading your cluster, you can unlock a wide range of enterprise features, manage larger datasets, and enjoy enhanced performance. You can switch to a paid cluster plan when any of these conditions are met:

- Your account has sufficient credits;

- You have added a valid payment method;

- Your account has a positive balance

To upgrade your plan, follow these steps:

1. In the **Actions** drop-down button, select **Upgrade Plan**.

1. On the page that opens, complete the following:

    - Select the subscription plan and **Target Project**,

    - Enter the **Cluster Name** and password,

    - Specify the **Cloud Provider** and **Cloud Region**, and

    - Determine the **CU settings**. Note that this step is only available when the subscription plan is Dedicated.

    - Set up your **Payment Method**.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After you complete the form and click **Upgrade**, Zilliz Cloud will create a new paid cluster with your specified settings. Your data will be migrated from the original free cluster, and the free cluster will remain unchanged and available.

The cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Once this is complete, you can connect to the new paid cluster and manipulate the restored data.

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

    In the **Migrations** tab, you can create data migration tasks by selecting **Migrate**. For details, refer to [Migrate Between Clusters](./migrate-between-clusters#from-dedicated-to-another-dedicated-cluster).

### Users and access control{#users-and-access-control}

Each serverless cluster comes with a single default user. You can't add or drop users, but you can reset the default user's password.

![manage-users](/img/manage-users.png)

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster).

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

    For details, refer to [Manage Cluster Credentials](./cluster-credentials-console).

    ![manage-users](/img/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.</p>

    </Admonition>

- **Whitelist**

    In the **Summary** section, click on the IP address in **Network Address** to add IP address segments to the whitelist. Once an IP address segment, other than a full-zero one (**0.0.0.0/0**), is added to the whitelist, Zilliz Cloud only permits access from IP addresses within the listed IP address segments.

    By default, a full-zero IP address segment is added, indicating that your cluster can be accessed from anywhere.

    For details on how to set up the whitelist, refer to [Set up Whitelist](./setup-whitelist).

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

        ![configure_autoscaling](/img/configure_autoscaling.png)

        Auto-scaling is triggered primarily based on the **CU Capacity Threshold**. Zilliz Cloud checks the cluster [CU capacity](./metrics-alerts-reference#cluster-metrics) every 1 minute. If it has exceeded the specified threshold (currently set at 70%) for the past 2 minutes, a scaling process is automatically initiated. For more information about the increment increase of the CU sizes during auto-scaling, refer to [Pricing Calculator](./pricing-calculator#considerations).

- **Upgrade service plan**

    For Dedicated (Standard) cluster, click **Upgrade** right to the service **Plan** in the **Summary** section to upgrade your plan to **Dedicated (Enterprise)**. Zilliz Cloud upgrades your service plan only after you confirm this operation in the **Upgrade Cluster Plan** dialog box.

    For the differences between all the available subscription plans, refer to [Select Service Tiers](./select-zilliz-cloud-service-plans).

- **Suspend & resume cluster**

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
    </table>

    To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully based on your CU settings and service plan.

    You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster) and [Resume Cluster](/reference/restful/resume-cluster).

- **Drop cluster**

    In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

    In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster).

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Set up a Private Link](./setup-a-private-link)

- [Migrate Between Clusters](./migrate-between-clusters)

- [Select Service Tiers](./select-zilliz-cloud-service-plans)

- [Set up Whitelist](./setup-whitelist)

- [Backup & Restore](./backup-and-restore)

- [Select the Right CU](./cu-types-explained)

