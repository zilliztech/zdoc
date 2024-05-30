---
slug: /manage-cluster
beta: FALSE
notebook: FALSE
type: origin
token: PharwAysCiBzvgkuqqecmNzunQf
sidebar_position: 3

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

When the used CU capacity of your serverless cluster hits 100%, Zilliz Cloud disables data writing and triggers SDK errors. To restore normal functionality, you can upgrade your cluster plan to Serverless or Dedicated.

In the **Actions** drop-down button, select **Upgrade Plan**.

On the page that opens,

- Select the subscription plan and **Target Project**,

- Enter the **Cluster Name** and password,

- Specify the **Cloud Provider** and **Cloud Region**, and

- Determine the **CU settings**. Note that this step is only available when the subscription plan is Dedicated.

- Set up your **Payment Method**.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After you complete the form and click on **Upgrade**, Zilliz Cloud creates a new paid cluster based on the specified settings and migrates data from the original free cluster.

The cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Once this is complete, you can connect to the new paid cluster and manipulate the restored data.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available once you set up your payment method.</p>

</Admonition>

## Serverless cluster{#serverless-cluster}

### Connect to cluster{#connect-to-cluster}

In the **Connect** section, you can find the **Public Endpoint** and **Token** used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Suspend & resume cluster{#suspend-and-resume-cluster}

In the **Actions** drop-down button, select **Suspend** to stop the cluster. Once you confirm this operation in the **Suspend Cluster** dialog box, the cluster status changes from **RUNNING** to **SUSPENDING**, during which you cannot perform other actions to the cluster.

Once the status changes to **SUSPENDED**, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

<table>
   <tr>
     <th><p><strong>Cloud Provider</strong></p></th>
     <th><p><strong>Storage Pricing</strong></p></th>
   </tr>
   <tr>
     <td><p>GCP storage</p></td>
     <td><p>$0.020 / GB per month</p></td>
   </tr>
</table>

To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully.

You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](/reference/restful/suspend-cluster) and [Resume Cluster](/reference/restful/resume-cluster).

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

In addition to the web UI, you can also make an API request to drop a cluster. For details, refer to [Drop Cluster](/reference/restful/drop-cluster).

## Dedicated cluster{#dedicated-cluster}

### View cluster details{#view-cluster-details}

After setting up your Zilliz Cloud cluster, here’s what you’ll find in each section for cluster details:

![dedicated-cluster-lifecycle](/img/dedicated-cluster-lifecycle.png)

- **Connect**: This section provides the necessary details to begin interacting with your cluster, including the public endpoint for connections, a private link, and a token for secure access.

- **Summary**: This offers a snapshot of your cluster's essentials. You can find the cluster's ID, hosting region, type, and size. Details on the creator, as well as the creation date and time, are also presented.

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

    In the **Actions** drop-down button, you can create backups of your cluster by selecting **Create Snapshot**. You can find all snapshots on the **Backups** tab. For details on backups and restores, refer to [Backup & Restore](/docs/backup-and-restore).

- **Data migrations**

    In the **Actions** drop-down button, you can create data migration tasks by selecting **Migrate** to migrate your data from Milvus. For details, refer to [Migrate Between Clusters](./migrate-between-clusters#from-dedicated-to-another-dedicated-cluster).

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

- **Scale-up cluster**

    In the **Summary** section, click **Scale** right to the CU **Size** to open the **Scale Cluster** dialog box. You can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. You can scale the size of a cluster up to 256 CUs in the dialog box. Contact us if you need a larger CU.

    For details on CU types and how to select an appropriate one, refer to [Select the Right CU](./cu-types-explained).

    In addition to the web UI, you can also make an API request to scale up a cluster. For details, refer to [Modify Cluster](/reference/restful/modify-cluster).

    <Admonition type="caution" icon="🚧" title="Warning">

    <p>Scaling up a cluster may cause several minutes of downtime. Please exercise caution.</p>

    </Admonition>

- **Scale down cluster**

    To scale down the cluster CU size, please navigate to the overview page of the target cluster and click **Scale** next to the CU size. Select the desired CU size in the dialog window. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>Please use the <a href="https://zilliz.com/pricing#calculator">CU calculator</a> to estimate the minimum CU size needed for your data. Otherwise, scaling may fail.</p>

    </Admonition>

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

