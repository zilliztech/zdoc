---
slug: /manage-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Cluster

This guide describes the lifecycle of a cluster so that you can make full use of your Zilliz Cloud console to achieve your goals.

## Serverless cluster{#serverless-cluster}

After creating a serverless cluster, you will see the following in the console.

![serverless-cluster-lifecycle](/img/serverless-cluster-lifecycle.png)

<Admonition type="info" icon="📘" title="Notes">

You have the option to create one serverless cluster without charge. In addition, you can create up to two collections within the cluster.

</Admonition>

### Connect to cluster{#connect-to-cluster}

In the **Connect** section, you can find the **Public Endpoint** and **Token** used to connect to the cluster.

For details, refer to [Connect to Cluster](./connect-to-cluster).

### Drop cluster{#drop-cluster}

In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

### Migrate to dedicated cluster{#migrate-to-dedicated-cluster}

In the **Actions** drop-down button, select **Migrate to Dedicated Cluster.**

On the page that opens,

- Select the subscription plan and **Target Project**,

- Enter the **Cluster Name** and password,

- Specify the **Cloud Provider** and **Cloud Region**, and

- Determine the **CU settings**.

![migrate-to-dedicated](/img/migrate-to-dedicated.png)

After you complete the form and click on **Migrate Cluster**, Zilliz Cloud creates a dedicated cluster based on the specified settings and migrates data from the serverless cluster to the dedicated one.

The dedicated cluster status will switch from **CREATING** to **RESTORING**, and finally to **RUNNING**. Once this is complete, you can connect to the dedicated cluster and manipulate the restored data.

<Admonition type="info" icon="📘" title="Notes">

This feature is available once you set up your payment method.

</Admonition>

## Dedicated cluster{#dedicated-cluster}

Once you have created a dedicated cluster, you will see the following in the console.

![dedicated-cluster-lifecycle](/img/dedicated-cluster-lifecycle.png)

### Establish Connection{#establish-connection}

- **Connect to cluster**
    In the **Connect** section, you can find the **Public Endpoint** and **Token** that are used to connect to the cluster. The token can either be an [API key](./manage-api-keys) or a [cluster credential](./manage-cluster-credentials) that consists of a username and password pair.

    For more information, refer to [Connect to Cluster](./connect-to-cluster).

- **Set up private link**
    To establish a more secure connection to your cluster, you can create a private link instead of using the public endpoint provided. Refer to [Set up a Private Link](./set-up-a-private-link) for further details.

### Manage collections and data{#manage-collections-and-data}

- **Collections**
    On the **Collections** tab, you can manage the collections in the cluster. You can create collections, import data into them, load or release them, rename them, and drop them.

    For details on data import, refer to [Data Import](https://docs.zilliz.com/docs/data-import).

    ![manage-collections](/img/manage-collections.png)

- **Backups**
    In the **Actions** drop-down button, you can create backups of your cluster by selecting **Create Snapshot**. You can find all snapshots on the **Backups** tab. For details on backups and restores, refer to [Backup & Restore](https://docs.zilliz.com/docs/backup-and-restore).

- **Data migrations**
    In the **Actions** drop-down button, you can create data migration tasks by selecting **Migrate** to migrate your data from Milvus. For details, refer to [Migrate Between Clusters](./migrate-beween-clusters#from-dedicated-to-another-dedicated-cluster).

### Users and access control{#users-and-access-control}

- **Users**
    On the **Users** tab, you can add users, reset their passwords, and drop them.

    For details, refer to [Manage Cluster Credentials](./manage-cluster-credentials).

    ![manage-users](/img/manage-users.png)

    <Admonition type="info" icon="📘" title="Notes">    
    
    
    You cannot drop <b>db_admin</b>. Zilliz Cloud grants access permissions to all collections in the cluster to any added users.

    </Admonition>

- **Whitelist**
    In the **Summary** section, click on the IP address in **Network Address** to add IP address segments to the whitelist. Once an IP address segment, other than a full-zero one (**0.0.0.0/0**), is added to the whitelist, Zilliz Cloud only permits access from IP addresses within the listed IP address segments.

    By default, a full-zero IP address segment is added, indicating that your cluster can be accessed from anywhere.

    For details on how to set up the whitelist, refer to [Set up Whitelist](./set-up-whitelist).

### Manage and configure clusters{#manage-and-configure-clusters}

- **Scale-up cluster**
    In the **Summary** section, click **Scale** right to the CU **Size** to open the **Scale Cluster** dialog box. You can scale up the size allocated to the cluster of the same type in the same cloud region as the original one. You can scale the size of a cluster up to 24 CUs in the dialog box. Contact us if you need a larger CU.

    For details on CU types and how to select an appropriate one, refer to [CU Types](https://zilliverse.feishu.cn/wiki/RkNSwoi5AiD2DBkgptxcbz3anGc).

    <Admonition type="caution" icon="🚧" title="Warning">    
    
    
    Scaling up a cluster may cause several minutes of downtime. Please exercise caution.

    </Admonition>

- **Upgrade service plan**
    For standard users, click **Upgrade** right to the service **Plan** in the **Summary** section to upgrade your plan to **Enterprise**. Zilliz Cloud upgrades your service plan only after you confirm this operation in the **Upgrade to Enterprise Plan** dialog box.

    For the differences between all the available subscription plans, refer to [Select Service Tiers](./select-zilliz-cloud-service-plans).

- **Suspend & resume cluster**
    In the **Actions** drop-down button, select **Suspend** to stop the cluster. Once you confirm this operation in the **Suspend Cluster** dialog box, the cluster status changes from **RUNNING** to **SUSPENDING**, during which you cannot perform other actions to the cluster.

    Once the status changes to **SUSPENDED**, you will only be charged for storage. Wisely suspending some of your clusters can save you money.

    |  **Cloud Provider** |  **Storage Pricing**   |
    | ------------------- | ---------------------- |
    |  AWS storage        |  $0.025 / GB per month |
    |  GCP storage        |  $0.020 / GB per month |

    To resume a suspended cluster, click on **Actions** and select **Resume** from the drop-down menu. Upon confirming this action in the **Resume Cluster** dialog box, the cluster's status will change from **SUSPENDED** to **RESUMING**, and then to **RUNNING**. At this point, you will be charged fully based on your CU settings and service plan.

    You can also use RESTful APIs to perform these actions. For details, refer to [Suspend Cluster](https://docs.zilliz.com/reference/suspend-cluster) and [Resume Cluster](https://docs.zilliz.com/reference/resume-cluster).

- **Drop cluster**
    In the **Actions** drop-down button, select **Drop** to drop the cluster. Zilliz Cloud drops your cluster only after you confirm this operation in the **Drop Cluster** dialog box.

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [Set up a Private Link](./set-up-a-private-link)

- [Backup & Restore](https://docs.zilliz.com/docs/backup-and-restore)

- [Migrate Between Clusters](./migrate-beween-clusters#from-dedicated-to-another-dedicated-cluster)

- [Select the Right CU](./cu-types-explained-1)

- [Select Service Tiers](./select-zilliz-cloud-service-plans)

- [Set up Whitelist](./set-up-whitelist)
